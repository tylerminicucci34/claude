"""Tools Jarvis can use. Each entry has a Claude-facing schema and a local executor.

Safety: shell commands matching a dangerous-pattern list are refused outright.
Everything else runs without confirmation by default — the user can change
JARVIS_CONFIRM_SHELL=true in .env to require keyboard approval for every shell command.
"""
from __future__ import annotations

import os
import re
import shlex
import shutil
import subprocess
import urllib.parse
from pathlib import Path
from typing import Any, Callable, Optional


DANGEROUS_PATTERNS = [
    r"\brm\s+-rf?\s+/",
    r"\brm\s+-rf?\s+~",
    r"\bdd\s+if=",
    r"\bmkfs",
    r"\bshred\b",
    r":\(\)\s*\{",   # fork bomb
    r">\s*/dev/sd[a-z]",
    r"\bchmod\s+-R\s+777\s+/",
    r"\bsudo\b",
]


TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "name": "open_path",
        "description": (
            "Open a file, folder, or URL with the system default application. "
            "Use this for opening documents, launching apps via files, or visiting URLs."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute path or URL"}
            },
            "required": ["path"],
        },
    },
    {
        "name": "web_search",
        "description": "Open a Google search for the query in the default browser.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
    {
        "name": "play_media",
        "description": (
            "Stream and play audio or video. Searches YouTube by default. "
            "Requires mpv + yt-dlp on the system."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search terms or a direct URL"}
            },
            "required": ["query"],
        },
    },
    {
        "name": "stop_media",
        "description": "Stop any media currently being played by Jarvis.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "run_shell",
        "description": (
            "Execute a shell command and return its stdout/stderr. "
            "Refuses obviously destructive commands. Use sparingly."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"},
                "timeout_seconds": {"type": "number", "default": 15},
            },
            "required": ["command"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a text file. Returns the first 8 KB.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
    {
        "name": "list_dir",
        "description": "List files in a directory.",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"],
        },
    },
    {
        "name": "remember",
        "description": (
            "Save a fact about the user to long-term memory so future sessions know it."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "key": {"type": "string"},
                "value": {"type": "string"},
            },
            "required": ["key", "value"],
        },
    },
]


class Toolbox:
    """Executes tool calls. Holds references to memory and a media-process handle."""

    def __init__(self, memory, confirm_shell: bool = False, on_event: Optional[Callable] = None):
        self.memory = memory
        self.confirm_shell = confirm_shell
        self.on_event = on_event or (lambda *a, **k: None)
        self.media_proc: Optional[subprocess.Popen] = None

    def execute(self, name: str, args: dict) -> str:
        self.on_event("tool", f"{name}({_short_args(args)})")
        try:
            fn = getattr(self, f"_t_{name}", None)
            if fn is None:
                return f"error: unknown tool '{name}'"
            return fn(**args)
        except Exception as e:
            return f"error: {type(e).__name__}: {e}"

    # ── individual tools ───────────────────────────────────────

    def _t_open_path(self, path: str) -> str:
        opener = shutil.which("xdg-open") or shutil.which("open")
        if opener is None:
            return "error: no opener (install xdg-utils)"
        subprocess.Popen([opener, path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return f"opened: {path}"

    def _t_web_search(self, query: str) -> str:
        url = "https://www.google.com/search?q=" + urllib.parse.quote_plus(query)
        return self._t_open_path(url)

    def _t_play_media(self, query: str) -> str:
        if not shutil.which("mpv"):
            return "error: mpv not installed (sudo apt install mpv)"
        if not shutil.which("yt-dlp") and not query.startswith(("http://", "https://")):
            return "error: yt-dlp not installed (pip install yt-dlp) for search"

        self._stop_media()
        if query.startswith(("http://", "https://")):
            target = query
        else:
            target = f"ytdl://ytsearch1:{query}"
        self.media_proc = subprocess.Popen(
            ["mpv", "--no-video", "--really-quiet", target],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return f"playing: {query}"

    def _t_stop_media(self) -> str:
        if self._stop_media():
            return "stopped"
        return "nothing playing"

    def _stop_media(self) -> bool:
        if self.media_proc is not None and self.media_proc.poll() is None:
            self.media_proc.terminate()
            try:
                self.media_proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                self.media_proc.kill()
            self.media_proc = None
            return True
        self.media_proc = None
        return False

    def _t_run_shell(self, command: str, timeout_seconds: float = 15) -> str:
        for pat in DANGEROUS_PATTERNS:
            if re.search(pat, command):
                return f"refused: command matches dangerous pattern /{pat}/"

        if self.confirm_shell:
            print(f"\n[jarvis wants to run] {command}")
            answer = input("approve? [y/N] ").strip().lower()
            if answer not in {"y", "yes"}:
                return "refused by user"

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=os.path.expanduser("~"),
            )
        except subprocess.TimeoutExpired:
            return f"error: timed out after {timeout_seconds}s"

        out = (result.stdout or "") + (result.stderr or "")
        if len(out) > 4000:
            out = out[:4000] + "\n…[truncated]"
        return f"exit={result.returncode}\n{out.strip()}"

    def _t_read_file(self, path: str) -> str:
        p = Path(path).expanduser()
        if not p.exists():
            return f"error: not found: {p}"
        if not p.is_file():
            return f"error: not a file: {p}"
        try:
            data = p.read_bytes()[:8192]
            return data.decode("utf-8", errors="replace")
        except OSError as e:
            return f"error: {e}"

    def _t_list_dir(self, path: str) -> str:
        p = Path(path).expanduser()
        if not p.exists():
            return f"error: not found: {p}"
        if not p.is_dir():
            return f"error: not a directory: {p}"
        entries = []
        for child in sorted(p.iterdir())[:200]:
            entries.append(f"{'d' if child.is_dir() else 'f'} {child.name}")
        return "\n".join(entries) or "(empty)"

    def _t_remember(self, key: str, value: str) -> str:
        self.memory.add_fact(key, value)
        return f"remembered: {key} = {value}"


def _short_args(args: dict) -> str:
    parts = []
    for k, v in args.items():
        s = str(v)
        if len(s) > 40:
            s = s[:40] + "…"
        parts.append(f"{k}={shlex.quote(s)}")
    return ", ".join(parts)
