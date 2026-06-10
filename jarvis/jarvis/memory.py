"""Persistent memory layer. Simple JSON store with two regions:

- facts: stable things about the user (name, preferences, projects)
- recent: rolling summary of recent interactions

The system prompt is rendered with a compact text view of both.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class MemoryState:
    facts: dict[str, Any] = field(default_factory=dict)
    recent: list[str] = field(default_factory=list)
    updated_at: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class MemoryStore:
    def __init__(self, path: Path, max_recent: int = 25):
        self.path = path
        self.max_recent = max_recent
        self.state = self._load()

    def _load(self) -> MemoryState:
        if not self.path.exists():
            return MemoryState()
        try:
            data = json.loads(self.path.read_text())
            return MemoryState(
                facts=data.get("facts", {}),
                recent=data.get("recent", []),
                updated_at=data.get("updated_at", ""),
            )
        except (json.JSONDecodeError, OSError):
            return MemoryState()

    def save(self) -> None:
        self.state.updated_at = datetime.now(timezone.utc).isoformat()
        self.path.write_text(json.dumps(self.state.to_dict(), indent=2))

    def add_fact(self, key: str, value: Any) -> None:
        self.state.facts[key] = value
        self.save()

    def remember(self, line: str) -> None:
        self.state.recent.append(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {line}")
        self.state.recent = self.state.recent[-self.max_recent:]
        self.save()

    def render(self) -> str:
        parts = []
        if self.state.facts:
            parts.append("Known facts:")
            for k, v in self.state.facts.items():
                parts.append(f"- {k}: {v}")
        if self.state.recent:
            parts.append("\nRecent interactions:")
            for line in self.state.recent[-15:]:
                parts.append(f"- {line}")
        return "\n".join(parts) if parts else "(no prior context)"
