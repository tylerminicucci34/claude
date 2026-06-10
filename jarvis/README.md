# Jarvis

A voice-first, screen-aware AI assistant in the style of Tony Stark's Jarvis. Built on Claude (vision + reasoning + tools), with local TTS, optional Whisper STT, free wake-word detection, and a live status bar.

## What Jarvis can do

- **See your screen** — every turn includes a fresh screenshot, so he can comment on what you're working on
- **Listen for "hey Jarvis"** — wake-word activation, fully offline, no account needed
- **Speak with a British voice** — Piper local TTS, free and offline
- **Act on your machine** — open files, open URLs, search the web, play music/videos from YouTube, run shell commands, read & list files, remember facts about you
- **Remember you between sessions** — JSON-backed memory rendered into the prompt every turn
- **Show a live status bar** — current state, recent tool calls, what you said, what he said

## Architecture

```
                  ┌─────────── status bar (rich) ───────────┐
                  │                                          │
mic ─▶ wake word ─▶ Whisper (STT) ─┐                          │
                                   ├─▶ Claude (vision+tools) ─▶ Piper (TTS) ─▶ speakers
screen ─▶ mss + Pillow ────────────┤            │
                                   │            ▼
                            memory/memory.json   ─▶ tools (shell, files, web, media)
```

Required key: just **`ANTHROPIC_API_KEY`**. Voice input adds `OPENAI_API_KEY` (for Whisper). Everything else is free and offline.

## Setup (Linux)

```bash
cd jarvis
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# System libs for audio, mic, and media playback
sudo apt install alsa-utils portaudio19-dev xdg-utils mpv

# Download British Jarvis voice (~63 MB)
python -m jarvis.download_voice

# Configure
cp .env.example .env
# edit .env, paste ANTHROPIC_API_KEY
```

## Run

```bash
python -m jarvis.main                # full stack: wake word + voice + screen + tools
python -m jarvis.main --text         # text mode (no mic)
python -m jarvis.main --no-wake      # voice but no wake word (always listening)
python -m jarvis.main --no-screen    # disable vision
python -m jarvis.main --no-tools     # disable tool use
python -m jarvis.main --once "brief me"
```

Wake phrase is **"hey Jarvis"**. Say it, wait for the listening indicator to turn red, then speak your command. Say `exit` to stop.

## Tool examples

Once running, try saying:
- "Hey Jarvis... play Bohemian Rhapsody"
- "Hey Jarvis... open my downloads folder"
- "Hey Jarvis... search the web for the next SpaceX launch"
- "Hey Jarvis... what's in my home directory"
- "Hey Jarvis... read the file at /etc/hostname"
- "Hey Jarvis... remember that I'm building an AI assistant"
- "Hey Jarvis... stop the music"

Jarvis decides which tool to use. Destructive shell commands (`rm -rf /`, `dd if=`, fork bombs, etc.) are refused automatically. You can require keyboard approval for every shell command by setting `JARVIS_CONFIRM_SHELL=true` in `.env`.

## Voice options

Default voice is `en_GB-alan-medium`. Other British models:

```bash
python -m jarvis.download_voice --voice en_GB-northern_english_male-medium
python -m jarvis.download_voice --voice en_GB-southern_english_female-low
```

Then set `PIPER_VOICE_MODEL=/abs/path/to/voices/<name>.onnx` in `.env`.

## Why "hey Jarvis" and not "wake up Jarvis"

Custom wake phrases require hours of training audio. The wake-word library (openWakeWord) ships a pre-trained `hey_jarvis` model — that's what we use. After "hey Jarvis" fires, you can say literally anything as your command, including "wake up".

## Files

```
jarvis/
├── prompts/system.md       # persona prompt (templated)
├── memory/memory.json      # persistent facts + rolling recent log
├── voices/                 # downloaded Piper models (gitignored)
├── logs/transcript.jsonl   # every turn, append-only
├── jarvis/
│   ├── config.py           # env-driven settings
│   ├── memory.py           # JSON memory store
│   ├── screen.py           # mss screenshot → base64
│   ├── stt.py              # mic → Whisper
│   ├── tts.py              # Piper → aplay/paplay
│   ├── wake.py             # openWakeWord "hey jarvis"
│   ├── tools.py            # shell, files, web, media tools
│   ├── status.py           # Rich status bar
│   ├── brain.py            # Anthropic client + tool-use loop
│   ├── download_voice.py   # voice model downloader
│   └── main.py             # entry point + loop
└── requirements.txt
```

## Cost

- **Anthropic** (required): ~$0.01–0.05 per turn with vision. $5 of credit lasts weeks.
- **OpenAI** (optional, voice input): ~$0.006/min for Whisper. Or skip with `--text`.
- **Everything else**: free, local, offline.
