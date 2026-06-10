"""Live status bar using Rich. Single line at the bottom of the terminal
showing current state + recent activity log.
"""
from __future__ import annotations

from collections import deque
from datetime import datetime
from typing import Optional


try:
    from rich.console import Console, Group
    from rich.live import Live
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    _AVAILABLE = True
except ImportError:
    _AVAILABLE = False


STATE_STYLES = {
    "idle": ("○", "dim"),
    "waiting for wake": ("◌", "yellow"),
    "listening": ("●", "red bold"),
    "thinking": ("⚙", "cyan bold"),
    "tool": ("⚒", "magenta bold"),
    "speaking": ("▶", "green bold"),
    "error": ("✕", "red bold"),
}


class NullStatus:
    def set_state(self, state: str, detail: str = "") -> None:
        prefix = f"[{state}]" + (f" {detail}" if detail else "")
        print(prefix)

    def log(self, kind: str, message: str) -> None:
        print(f"  {kind}: {message}")

    def start(self) -> None: ...
    def stop(self) -> None: ...
    def __enter__(self): self.start(); return self
    def __exit__(self, *a): self.stop()


class StatusBar:
    def __init__(self, max_lines: int = 8):
        if not _AVAILABLE:
            raise RuntimeError("rich not installed")
        self.console = Console()
        self.state = "idle"
        self.detail = ""
        self.log_lines: deque[tuple[str, str, str]] = deque(maxlen=max_lines)
        self.live: Optional[Live] = None

    def _render(self):
        icon, style = STATE_STYLES.get(self.state, ("?", "white"))
        header = Text()
        header.append(f" {icon} ", style=style)
        header.append("JARVIS  ", style="bold white")
        header.append(self.state.upper(), style=style)
        if self.detail:
            header.append(f"  ·  {self.detail}", style="dim")

        log_table = Table.grid(padding=(0, 1))
        log_table.add_column(style="dim", width=8)
        log_table.add_column(style="cyan", width=8)
        log_table.add_column()
        for ts, kind, msg in self.log_lines:
            log_table.add_row(ts, kind, msg)

        return Panel(
            Group(header, Text(""), log_table),
            border_style="bright_black",
            padding=(0, 1),
        )

    def set_state(self, state: str, detail: str = "") -> None:
        self.state = state
        self.detail = detail
        self._refresh()

    def log(self, kind: str, message: str) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        if len(message) > 120:
            message = message[:120] + "…"
        self.log_lines.append((ts, kind, message))
        self._refresh()

    def _refresh(self) -> None:
        if self.live is not None:
            self.live.update(self._render())

    def start(self) -> None:
        self.live = Live(self._render(), console=self.console, refresh_per_second=8, transient=False)
        self.live.start()

    def stop(self) -> None:
        if self.live is not None:
            self.live.stop()
            self.live = None

    def __enter__(self): self.start(); return self
    def __exit__(self, *a): self.stop()


def make_status(enabled: bool = True):
    if enabled and _AVAILABLE:
        return StatusBar()
    return NullStatus()
