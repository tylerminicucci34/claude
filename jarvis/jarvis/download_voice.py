"""Download a Piper voice model. Defaults to a British male voice that suits Jarvis.

Usage:
    python -m jarvis.download_voice
    python -m jarvis.download_voice --voice en_GB-northern_english_male-medium
"""
from __future__ import annotations

import argparse
import sys
import urllib.request
from pathlib import Path

from .config import ROOT

DEFAULT_VOICE = "en_GB-alan-medium"

VOICES = {
    "en_GB-alan-medium": {
        "onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx",
        "json": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx.json",
    },
    "en_GB-alan-low": {
        "onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/low/en_GB-alan-low.onnx",
        "json": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/low/en_GB-alan-low.onnx.json",
    },
    "en_GB-northern_english_male-medium": {
        "onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx",
        "json": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx.json",
    },
    "en_GB-southern_english_female-low": {
        "onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx",
        "json": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx.json",
    },
}


def download(url: str, dest: Path) -> None:
    print(f"  downloading {url}")
    print(f"  -> {dest}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url) as resp, dest.open("wb") as out:
        total = int(resp.headers.get("Content-Length", 0))
        read = 0
        chunk = 1 << 15
        while True:
            data = resp.read(chunk)
            if not data:
                break
            out.write(data)
            read += len(data)
            if total:
                pct = read * 100 // total
                print(f"\r  {pct}% ({read // 1024} / {total // 1024} KB)", end="", flush=True)
        print()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default=DEFAULT_VOICE, choices=sorted(VOICES.keys()))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    voice_dir = ROOT / "voices"
    voice_dir.mkdir(exist_ok=True)
    onnx = voice_dir / f"{args.voice}.onnx"
    cfg = voice_dir / f"{args.voice}.onnx.json"

    urls = VOICES[args.voice]
    print(f"[voice] {args.voice}")

    if onnx.exists() and cfg.exists() and not args.force:
        print(f"  already present at {onnx}")
        print(f"  set in .env:  PIPER_VOICE_MODEL={onnx}")
        return 0

    download(urls["onnx"], onnx)
    download(urls["json"], cfg)
    print(f"\n[done] set in .env:  PIPER_VOICE_MODEL={onnx}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
