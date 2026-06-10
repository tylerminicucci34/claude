"""Centralized configuration. Reads from environment + .env."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


ROOT = Path(__file__).resolve().parent.parent
PROMPTS_DIR = ROOT / "prompts"
MEMORY_DIR = ROOT / "memory"
LOGS_DIR = ROOT / "logs"

for d in (MEMORY_DIR, LOGS_DIR):
    d.mkdir(parents=True, exist_ok=True)


@dataclass
class Config:
    # Claude
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    claude_model: str = os.getenv("CLAUDE_MODEL", "claude-opus-4-7")
    max_tokens: int = int(os.getenv("CLAUDE_MAX_TOKENS", "1024"))

    # Whisper / STT
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    whisper_model: str = os.getenv("WHISPER_MODEL", "whisper-1")

    # Piper / TTS
    piper_voice_model: str = os.getenv(
        "PIPER_VOICE_MODEL",
        str(ROOT / "voices" / "en_GB-alan-medium.onnx"),
    )

    # User
    user_name: str = os.getenv("JARVIS_USER_NAME", "Sir")
    user_address: str = os.getenv("JARVIS_USER_ADDRESS", "Sir")

    # Audio
    sample_rate: int = int(os.getenv("JARVIS_SAMPLE_RATE", "16000"))
    silence_threshold: float = float(os.getenv("JARVIS_SILENCE_THRESHOLD", "0.02"))
    silence_duration: float = float(os.getenv("JARVIS_SILENCE_DURATION", "1.2"))

    # Screen
    capture_screen: bool = os.getenv("JARVIS_CAPTURE_SCREEN", "true").lower() == "true"
    screen_max_dim: int = int(os.getenv("JARVIS_SCREEN_MAX_DIM", "1568"))

    # Memory
    memory_file: Path = MEMORY_DIR / "memory.json"
    transcript_log: Path = LOGS_DIR / "transcript.jsonl"

    def validate(self) -> list[str]:
        missing = []
        if not self.anthropic_api_key:
            missing.append("ANTHROPIC_API_KEY")
        return missing


config = Config()
