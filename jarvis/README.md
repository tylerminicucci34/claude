# Jarvis

A voice-first, screen-aware AI assistant in the style of Tony Stark's Jarvis. Built on Claude (vision + reasoning), OpenAI Whisper (STT), and ElevenLabs (TTS).

## Architecture

```
mic ──▶ Whisper (STT) ──┐
                        ├──▶ Claude (vision + chat) ──▶ ElevenLabs (TTS) ──▶ speakers
screen ──▶ mss + PIL ───┘                  ▲
                                           │
                                    memory/memory.json
```

Four moving parts:
1. **Screen capture** — `mss` grabs the primary monitor each turn, Pillow downsizes to <=1568px, base64 PNG goes into the Claude message as a vision block.
2. **STT** — `sounddevice` records until silence, ships WAV to Whisper.
3. **Brain** — Anthropic SDK call with system prompt + memory + history + (optional) screenshot.
4. **TTS** — ElevenLabs streams MP3, piped to `ffplay`/`mpg123`/`mpv` for playback.
5. **Memory** — JSON store with `facts` (stable) and `recent` (rolling). Rendered into the system prompt every turn.

Each piece degrades gracefully — missing keys or libs just disable that subsystem.

## Setup

```bash
cd jarvis
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys
```

Install a system audio player for TTS playback (one of):
- macOS: `brew install ffmpeg` (provides `ffplay`)
- Debian/Ubuntu: `sudo apt install ffmpeg`
- Windows: install ffmpeg from ffmpeg.org and put it on PATH

## Run

```bash
python -m jarvis.main              # full voice + screen
python -m jarvis.main --text       # text-only
python -m jarvis.main --no-screen  # disable vision
python -m jarvis.main --once "brief me"
```

Say `exit`, `quit`, `shutdown`, or `stand down` to stop.

## Customization

- Voice/persona: edit `prompts/system.md`
- Facts about you: edit `memory/memory.json` directly, or let Jarvis populate it over time
- Address ("Sir", "Ma'am", or your name): set `JARVIS_USER_ADDRESS` in `.env`

## Files

```
jarvis/
├── prompts/system.md      # the persona prompt (templated)
├── memory/memory.json     # persistent facts + rolling recent log
├── logs/transcript.jsonl  # every turn, append-only
├── jarvis/
│   ├── config.py          # env-driven settings
│   ├── memory.py          # JSON memory store
│   ├── screen.py          # mss screenshot -> base64
│   ├── stt.py             # mic record -> Whisper
│   ├── tts.py             # ElevenLabs -> system player
│   ├── brain.py           # Anthropic client + history
│   └── main.py            # entry point + loop
└── requirements.txt
```
