"""Speech-to-text. Records from the default mic until silence, then ships the
WAV to OpenAI Whisper for transcription.

If `openai` is missing or no API key is set, the listener raises a clear error
so the main loop can fall back to text input.
"""
from __future__ import annotations

import io
import wave
from typing import Optional

try:
    import numpy as np
    import sounddevice as sd
    _AUDIO_AVAILABLE = True
except ImportError:
    _AUDIO_AVAILABLE = False

try:
    from openai import OpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False


class STTUnavailable(RuntimeError):
    pass


class Listener:
    def __init__(
        self,
        api_key: str,
        sample_rate: int = 16000,
        silence_threshold: float = 0.02,
        silence_duration: float = 1.2,
        model: str = "whisper-1",
    ):
        if not _AUDIO_AVAILABLE:
            raise STTUnavailable("sounddevice/numpy not installed — pip install sounddevice numpy")
        if not _OPENAI_AVAILABLE:
            raise STTUnavailable("openai SDK not installed — pip install openai")
        if not api_key:
            raise STTUnavailable("OPENAI_API_KEY not set")

        self.client = OpenAI(api_key=api_key)
        self.sample_rate = sample_rate
        self.silence_threshold = silence_threshold
        self.silence_duration = silence_duration
        self.model = model

    def _record_until_silence(self, max_seconds: float = 60.0) -> bytes:
        block = int(self.sample_rate * 0.1)  # 100ms blocks
        silence_blocks_needed = int(self.silence_duration / 0.1)
        max_blocks = int(max_seconds / 0.1)

        frames: list[np.ndarray] = []
        silent_streak = 0
        spoken = False

        with sd.InputStream(
            samplerate=self.sample_rate, channels=1, dtype="float32", blocksize=block
        ) as stream:
            for _ in range(max_blocks):
                chunk, _ = stream.read(block)
                level = float(np.abs(chunk).mean())
                frames.append(chunk.copy())
                if level > self.silence_threshold:
                    spoken = True
                    silent_streak = 0
                elif spoken:
                    silent_streak += 1
                    if silent_streak >= silence_blocks_needed:
                        break

        audio = np.concatenate(frames, axis=0)
        # convert to 16-bit PCM WAV
        pcm = np.clip(audio * 32767.0, -32768, 32767).astype(np.int16)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(self.sample_rate)
            wf.writeframes(pcm.tobytes())
        return buf.getvalue()

    def listen(self) -> Optional[str]:
        """Record one utterance and return the transcription, or None on failure."""
        wav_bytes = self._record_until_silence()
        if len(wav_bytes) < 1024:
            return None

        file_tuple = ("speech.wav", io.BytesIO(wav_bytes), "audio/wav")
        try:
            resp = self.client.audio.transcriptions.create(
                model=self.model,
                file=file_tuple,
            )
            text = (resp.text or "").strip()
            return text or None
        except Exception as e:
            print(f"[stt] transcription failed: {e}")
            return None
