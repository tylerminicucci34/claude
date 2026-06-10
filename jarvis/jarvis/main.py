"""Jarvis entry point. Wires brain, memory, screen, STT, and TTS into a loop.

Usage:
    python -m jarvis.main          # voice mode if mic+TTS available, else text
    python -m jarvis.main --text   # force text mode
    python -m jarvis.main --no-screen  # disable screen capture
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .brain import Brain
from .config import PROMPTS_DIR, config
from .memory import MemoryStore
from . import screen as screen_mod
from . import stt as stt_mod
from . import tts as tts_mod


def load_prompt() -> str:
    return (PROMPTS_DIR / "system.md").read_text()


def main() -> int:
    parser = argparse.ArgumentParser(prog="jarvis")
    parser.add_argument("--text", action="store_true", help="text-only mode")
    parser.add_argument("--no-screen", action="store_true", help="disable screen capture")
    parser.add_argument("--once", type=str, help="one-shot: send this message and exit")
    args = parser.parse_args()

    missing = config.validate()
    if missing:
        print(f"[jarvis] missing env vars: {', '.join(missing)}", file=sys.stderr)
        print(f"[jarvis] copy .env.example to .env and fill it in.", file=sys.stderr)
        return 1

    memory = MemoryStore(config.memory_file)
    brain = Brain(
        api_key=config.anthropic_api_key,
        model=config.claude_model,
        prompt_template=load_prompt(),
        max_tokens=config.max_tokens,
        transcript_log=config.transcript_log,
    )

    # Optional subsystems
    listener = None
    speaker = None
    if not args.text:
        try:
            listener = stt_mod.Listener(
                api_key=config.openai_api_key,
                sample_rate=config.sample_rate,
                silence_threshold=config.silence_threshold,
                silence_duration=config.silence_duration,
                model=config.whisper_model,
            )
        except stt_mod.STTUnavailable as e:
            print(f"[jarvis] voice input disabled: {e}")
        try:
            speaker = tts_mod.Speaker(
                voice_model_path=Path(config.piper_voice_model),
            )
        except tts_mod.TTSUnavailable as e:
            print(f"[jarvis] voice output disabled: {e}")

    capture_screen = config.capture_screen and not args.no_screen and screen_mod.is_available()
    if config.capture_screen and not args.no_screen and not screen_mod.is_available():
        print("[jarvis] screen capture unavailable — install mss + Pillow")

    print(f"[jarvis] online. model={config.claude_model} voice_in={'on' if listener else 'off'} "
          f"voice_out={'on' if speaker else 'off'} screen={'on' if capture_screen else 'off'}")

    if args.once:
        return _turn(brain, memory, capture_screen, listener=None, speaker=speaker, prompt=args.once)

    try:
        while True:
            rc = _turn(brain, memory, capture_screen, listener, speaker)
            if rc != 0:
                return rc
    except (KeyboardInterrupt, EOFError):
        print("\n[jarvis] standing down.")
        return 0


def _turn(brain, memory, capture_screen, listener, speaker, prompt=None) -> int:
    if prompt is None:
        if listener is not None:
            print("[jarvis] listening...")
            user_text = listener.listen()
            if not user_text:
                return 0
            print(f"> {user_text}")
        else:
            try:
                user_text = input("> ").strip()
            except EOFError:
                return 1
            if not user_text:
                return 0
    else:
        user_text = prompt

    if user_text.lower() in {"exit", "quit", "shutdown", "stand down"}:
        return 1

    screen_block = screen_mod.capture(max_dim=1568) if capture_screen else None

    reply = brain.respond(
        user_text=user_text,
        user_address=config.user_address,
        memory_text=memory.render(),
        screen_block=screen_block,
    )

    print(f"jarvis: {reply}")
    memory.remember(f"{config.user_address}: {user_text[:120]} | jarvis: {reply[:160]}")

    if speaker is not None:
        speaker.say(reply)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
