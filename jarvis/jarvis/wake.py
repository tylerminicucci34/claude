"""Wake-word detection via openWakeWord. Free, offline, no account.

Pre-trained phrase: "hey Jarvis". Listens continuously to the mic in 80ms frames
and returns from `wait_for_wake()` once activation confidence crosses threshold.
"""
from __future__ import annotations

from typing import Optional


class WakeUnavailable(RuntimeError):
    pass


class WakeWord:
    def __init__(
        self,
        phrase: str = "hey_jarvis",
        threshold: float = 0.5,
        sample_rate: int = 16000,
        on_state=None,
    ):
        try:
            from openwakeword.model import Model
            import sounddevice as sd  # noqa: F401
            import numpy as np  # noqa: F401
        except ImportError as e:
            raise WakeUnavailable(f"missing deps — pip install openwakeword sounddevice numpy ({e})")

        self.phrase = phrase
        self.threshold = threshold
        self.sample_rate = sample_rate
        self.on_state = on_state
        try:
            self.model = Model(wakeword_models=[phrase], inference_framework="onnx")
        except Exception as e:
            raise WakeUnavailable(f"failed to load wake model '{phrase}': {e}")

    def wait(self) -> None:
        import sounddevice as sd
        import numpy as np

        if self.on_state:
            self.on_state("listening for wake word…")

        chunk_size = 1280  # 80ms at 16kHz, openWakeWord's expected frame
        with sd.InputStream(
            samplerate=self.sample_rate,
            channels=1,
            dtype="int16",
            blocksize=chunk_size,
        ) as stream:
            while True:
                data, _ = stream.read(chunk_size)
                audio = np.frombuffer(data.tobytes(), dtype=np.int16)
                preds = self.model.predict(audio)
                score = preds.get(self.phrase, 0.0)
                if score > self.threshold:
                    self.model.reset()
                    return
