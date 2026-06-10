"""Text-to-speech via ElevenLabs streaming. Falls back to printing if unavailable."""
from __future__ import annotations

import io
import shutil
import subprocess
from typing import Optional

try:
    from elevenlabs.client import ElevenLabs
    _AVAILABLE = True
except ImportError:
    _AVAILABLE = False


class TTSUnavailable(RuntimeError):
    pass


class Speaker:
    def __init__(
        self,
        api_key: str,
        voice_id: str,
        model: str = "eleven_turbo_v2_5",
    ):
        if not _AVAILABLE:
            raise TTSUnavailable("elevenlabs SDK not installed — pip install elevenlabs")
        if not api_key:
            raise TTSUnavailable("ELEVENLABS_API_KEY not set")
        if not voice_id:
            raise TTSUnavailable("ELEVENLABS_VOICE_ID not set")

        self.client = ElevenLabs(api_key=api_key)
        self.voice_id = voice_id
        self.model = model
        self._player = _detect_player()

    def say(self, text: str) -> None:
        if not text.strip():
            return

        audio_iter = self.client.text_to_speech.convert(
            voice_id=self.voice_id,
            model_id=self.model,
            text=text,
            output_format="mp3_44100_128",
        )
        mp3 = b"".join(audio_iter) if hasattr(audio_iter, "__iter__") else audio_iter

        if self._player is None:
            print("[tts] no audio player found — install ffplay (ffmpeg) or mpg123")
            return

        proc = subprocess.Popen(
            self._player,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        proc.communicate(input=mp3)


def _detect_player() -> Optional[list[str]]:
    if shutil.which("ffplay"):
        return ["ffplay", "-autoexit", "-nodisp", "-loglevel", "quiet", "-"]
    if shutil.which("mpg123"):
        return ["mpg123", "-q", "-"]
    if shutil.which("mpv"):
        return ["mpv", "--no-video", "--really-quiet", "-"]
    return None
