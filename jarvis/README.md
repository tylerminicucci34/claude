# Jarvis

A voice-first, screen-aware AI assistant in the style of Tony Stark's Jarvis. Built on Claude (vision + reasoning), OpenAI Whisper (STT — optional), and Piper (local TTS — free, offline).

## Architecture

```
mic ──▶ Whisper (STT) ─────┐
                           ├──▶ Claude (vision + chat) ──▶ Piper (TTS) ──▶ speakers
screen ──▶ mss + Pillow ───┘                ▲
                                            │
                                     memory/memory.json
```

Five moving parts:
1. **Screen capture** — `mss` grabs your primary monitor each turn, Pillow downsizes to <=1568px, base64 PNG goes into the Claude message. Claude literally sees your screen.
2. **STT (optional)** — `sounddevice` records until silence, ships WAV to Whisper.
3. **Brain** — Anthropic SDK call with templated system prompt + memory + history + screenshot.
4. **TTS** — Piper synthesizes locally, piped to `aplay` or `paplay`. No accounts, no cost.
5. **Memory** — JSON store with `facts` (stable) and `recent` (rolling).

Each piece degrades gracefully — missing keys/libs just disable that piece.

## Setup (Linux)

```bash
cd jarvis
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Audio + mic system libs
sudo apt install alsa-utils portaudio19-dev

# Download the British Jarvis voice (~63 MB)
python -m jarvis.download_voice

# Configure
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY
```

Only **one required key**: `ANTHROPIC_API_KEY`. Everything else (voice in/out, screen) works without paid services.

## Run

```bash
python -m jarvis.main              # full voice + screen
python -m jarvis.main --text       # text-only (skip mic)
python -m jarvis.main --no-screen  # disable vision
python -m jarvis.main --once "brief me"
```

Say `exit`, `quit`, `shutdown`, or `stand down` to stop.

## Voice options

`download_voice.py` ships with these (pick one, then set `PIPER_VOICE_MODEL` in .env):
- `en_GB-alan-medium` — British male, sounds the most Jarvis-like (default)
- `en_GB-alan-low` — lighter/faster version of Alan
- `en_GB-northern_english_male-medium` — Northern English accent
- `en_GB-southern_english_female-low` — for a Friday-style assistant

```bash
python -m jarvis.download_voice --voice en_GB-northern_english_male-medium
```

## Customization

- Persona: edit `prompts/system.md`
- Address ("Sir", "Boss", your name): set `JARVIS_USER_ADDRESS` in `.env`
- Facts about you: edit `memory/memory.json` directly, or let Jarvis populate it over time

## Files

```
jarvis/
├── prompts/system.md      # the persona prompt (templated)
├── memory/memory.json     # persistent facts + rolling recent log
├── voices/                # downloaded Piper voice models (gitignored)
├── logs/transcript.jsonl  # every turn, append-only
├── jarvis/
│   ├── config.py          # env-driven settings
│   ├── memory.py          # JSON memory store
│   ├── screen.py          # mss screenshot → base64
│   ├── stt.py             # mic → Whisper
│   ├── tts.py             # Piper → aplay/paplay
│   ├── brain.py           # Anthropic client + history
│   ├── download_voice.py  # voice model downloader
│   └── main.py            # entry point + loop
└── requirements.txt
```

## Cost

- **Anthropic**: ~$0.01–0.05 per turn (with vision). $5 of credit lasts weeks of casual use.
- **OpenAI** (optional): ~$0.006/min of speech for Whisper. Skip with `--text`.
- **Piper**: free, offline, no account.

Total minimum: $5 of Anthropic credit.
