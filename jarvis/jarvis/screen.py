"""Screen capture. Returns a base64-encoded PNG suitable for the Claude vision API.

Uses `mss` for cross-platform capture and `Pillow` for resize/encode. We downsample
so we don't blow the per-image token budget — Claude caps long edge at 1568 anyway.
"""
from __future__ import annotations

import base64
import io
from typing import Optional

try:
    import mss
    from PIL import Image
    _AVAILABLE = True
except ImportError:
    _AVAILABLE = False


def is_available() -> bool:
    return _AVAILABLE


def capture(max_dim: int = 1568, monitor_index: int = 0) -> Optional[dict]:
    """Capture the primary monitor and return a Claude-compatible image block.

    Returns an Anthropic content block dict, or None if capture isn't available.
    monitor_index=0 means "all monitors combined"; use 1+ to target a specific display.
    """
    if not _AVAILABLE:
        return None

    with mss.mss() as sct:
        monitors = sct.monitors
        idx = monitor_index if 0 <= monitor_index < len(monitors) else 0
        shot = sct.grab(monitors[idx])
        img = Image.frombytes("RGB", shot.size, shot.bgra, "raw", "BGRX")

    w, h = img.size
    longest = max(w, h)
    if longest > max_dim:
        scale = max_dim / longest
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")

    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/png",
            "data": b64,
        },
    }
