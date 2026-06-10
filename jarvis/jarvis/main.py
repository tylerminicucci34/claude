"""Jarvis entry point. Wires brain, memory, screen, STT, TTS, wake-word,
tools, and the status bar into a single loop.

Usage:
    python -m jarvis.main              # full stack
    python -m jarvis.main --text       # text mode, no mic
    python -m jarvis.main --no-wake    # voice mode but no wake word (always listening)
    python -m jarvis.main --no-screen  # disable vision
    python -m jarvis.main --no-tools   # disable tool use
    python -m jarvis.main --once "brief me"
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .brain import Brain
from .config import PROMPTS_DIR, config
from .memory import MemoryStore
from . import screen as screen_mod
from . import status as status_mod
from . import stt as stt_mod
from . import tts as tts_mod
from . import tools as tools_mod
from . import wake as wake_mod


def load_prompt() -> str:
    return (PROMPTS_DIR / "system.md").read_text()


def main() -> int:
    parser = argparse.ArgumentParser(prog="jarvis")
    parser.add_argument("--text", action="store_true")
    parser.add_argument("--no-screen", action="store_true")
    parser.add_argument("--no-wake", action="store_true")
    parser.add_argument("--no-tools", action="store_true")
    parser.add_argument("--no-status", action="store_true")
    parser.add_argument("--once", type=str)
    args = parser.parse_args()

    missing = config.validate()
    if missing:
        print(f"[jarvis] missing env vars: {', '.join(missing)}", file=sys.stderr)
        return 1

    memory = MemoryStore(config.memory_file)
    status = status_mod.make_status(enabled=config.status_bar and not args.no_status)

    # Subsystems
    listener = None
    speaker = None
    waker = None
    toolbox = None

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
            status.log("warn", f"voice input off: {e}")

        try:
            speaker = tts_mod.Speaker(voice_model_path=Path(config.piper_voice_model))
        except tts_mod.TTSUnavailable as e:
            status.log("warn", f"voice output off: {e}")

    if not args.text and not args.no_wake and config.wake_enabled and listener is not None:
        try:
            waker = wake_mod.WakeWord(
                phrase=config.wake_phrase,
                threshold=config.wake_threshold,
                sample_rate=config.sample_rate,
            )
        except wake_mod.WakeUnavailable as e:
            status.log("warn", f"wake word off: {e}")

    capture_screen = (
        config.capture_screen
        and not args.no_screen
        and screen_mod.is_available()
    )

    # Tools
    def on_tool_event(kind, msg):
        status.log(kind, msg)

    if config.tools_enabled and not args.no_tools:
        toolbox = tools_mod.Toolbox(
            memory=memory,
            confirm_shell=config.confirm_shell,
            on_event=on_tool_event,
        )

    brain = Brain(
        api_key=config.anthropic_api_key,
        model=config.claude_model,
        prompt_template=load_prompt(),
        max_tokens=config.max_tokens,
        transcript_log=config.transcript_log,
        tools=tools_mod.TOOL_SCHEMAS if toolbox else None,
        tool_executor=toolbox.execute if toolbox else None,
        on_event=on_tool_event,
    )

    with status:
        status.log("boot", f"model={config.claude_model}")
        status.log("boot", f"voice_in={'on' if listener else 'off'}  voice_out={'on' if speaker else 'off'}")
        status.log("boot", f"wake={'on' if waker else 'off'}  screen={'on' if capture_screen else 'off'}  tools={'on' if toolbox else 'off'}")
        status.set_state("idle")

        if args.once:
            return _turn(
                args.once, brain, memory, capture_screen,
                listener=None, speaker=speaker, status=status,
            )

        try:
            while True:
                # Wake gate (only when voice in is enabled)
                if waker is not None:
                    status.set_state("waiting for wake", f'"hey jarvis"')
                    waker.wait()
                    status.log("wake", "activation detected")

                user_text = _capture_input(listener, status)
                if user_text is None:
                    continue
                if user_text.lower() in {"exit", "quit", "shutdown", "stand down"}:
                    status.log("exit", "standing down")
                    return 0

                _process(user_text, brain, memory, capture_screen, speaker, status)
        except (KeyboardInterrupt, EOFError):
            status.log("exit", "interrupted")
            return 0


def _capture_input(listener, status) -> str | None:
    if listener is not None:
        status.set_state("listening")
        text = listener.listen()
        if not text:
            return None
        status.log("you", text)
        return text
    try:
        status.set_state("idle", "type your message")
        text = input("> ").strip()
        if not text:
            return None
        status.log("you", text)
        return text
    except EOFError:
        return None


def _turn(prompt, brain, memory, capture_screen, listener, speaker, status) -> int:
    _process(prompt, brain, memory, capture_screen, speaker, status)
    return 0


def _process(user_text, brain, memory, capture_screen, speaker, status) -> None:
    screen_block = None
    if capture_screen:
        status.set_state("thinking", "capturing screen")
        screen_block = screen_mod.capture(max_dim=config.screen_max_dim)

    status.set_state("thinking")
    reply = brain.respond(
        user_text=user_text,
        user_address=config.user_address,
        memory_text=memory.render(),
        screen_block=screen_block,
    )

    status.log("jarvis", reply)
    memory.remember(f"{config.user_address}: {user_text[:120]} | jarvis: {reply[:160]}")

    if speaker is not None and reply:
        status.set_state("speaking")
        speaker.say(reply)

    status.set_state("idle")


if __name__ == "__main__":
    raise SystemExit(main())
