"""Text-to-speech via piper (local, offline, free). Falls back to printing."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Optional


class TTSUnavailable(RuntimeError):
    pass


class Speaker:
    def __init__(self, voice_model_path: Path):
        if not shutil.which("piper"):
            raise TTSUnavailable("piper not installed — pip install piper-tts")
        if not voice_model_path.exists():
            raise TTSUnavailable(
                f"voice model not found: {voice_model_path}\n"
                f"run: python -m jarvis.download_voice"
            )

        self.voice_model_path = voice_model_path
        self.sample_rate = _read_sample_rate(voice_model_path) or 22050
        self._player = _detect_player(self.sample_rate)
        if self._player is None:
            raise TTSUnavailable(
                "no audio player found — install one of: aplay (alsa-utils), paplay (pulseaudio-utils)"
            )

    def say(self, text: str) -> None:
        if not text.strip():
            return

        piper = subprocess.Popen(
            ["piper", "--model", str(self.voice_model_path), "--output_raw"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        player = subprocess.Popen(
            self._player,
            stdin=piper.stdout,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        assert piper.stdin is not None
        piper.stdin.write(text.encode("utf-8"))
        piper.stdin.close()
        if piper.stdout is not None:
            piper.stdout.close()
        player.wait()
        piper.wait()


def _read_sample_rate(model_path: Path) -> Optional[int]:
    cfg = model_path.with_suffix(model_path.suffix + ".json")
    if not cfg.exists():
        cfg = Path(str(model_path) + ".json")
    if not cfg.exists():
        return None
    try:
        data = json.loads(cfg.read_text())
        return int(data.get("audio", {}).get("sample_rate", 22050))
    except (json.JSONDecodeError, OSError, ValueError):
        return None


def _detect_player(sample_rate: int) -> Optional[list[str]]:
    if shutil.which("aplay"):
        return ["aplay", "-r", str(sample_rate), "-f", "S16_LE", "-t", "raw", "-c", "1", "-q"]
    if shutil.which("paplay"):
        return [
            "paplay",
            "--raw",
            f"--rate={sample_rate}",
            "--format=s16le",
            "--channels=1",
        ]
    return None
