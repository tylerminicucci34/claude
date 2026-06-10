"""Claude client. Handles system-prompt rendering, vision attachment,
and conversation history management.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from anthropic import Anthropic


class Brain:
    def __init__(
        self,
        api_key: str,
        model: str,
        prompt_template: str,
        max_tokens: int = 1024,
        history_limit: int = 20,
        transcript_log: Optional[Path] = None,
    ):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        self.prompt_template = prompt_template
        self.max_tokens = max_tokens
        self.history_limit = history_limit
        self.transcript_log = transcript_log
        self.history: list[dict] = []

    def _render_system(self, user_address: str, memory_text: str) -> str:
        return (
            self.prompt_template
            .replace("{{USER_ADDRESS}}", user_address)
            .replace("{{MEMORY}}", memory_text)
        )

    def respond(
        self,
        user_text: str,
        user_address: str,
        memory_text: str,
        screen_block: Optional[dict] = None,
    ) -> str:
        system = self._render_system(user_address, memory_text)

        content: list[dict] = []
        if screen_block is not None:
            content.append(screen_block)
        content.append({"type": "text", "text": user_text})

        self.history.append({"role": "user", "content": content})

        # Trim history but preserve pairs
        if len(self.history) > self.history_limit:
            self.history = self.history[-self.history_limit:]

        resp = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=system,
            messages=self.history,
        )

        text = "".join(
            block.text for block in resp.content if getattr(block, "type", "") == "text"
        ).strip()

        self.history.append({"role": "assistant", "content": text})
        self._log(user_text, text)
        return text

    def _log(self, user_text: str, assistant_text: str) -> None:
        if self.transcript_log is None:
            return
        entry = {
            "ts": datetime.now().isoformat(),
            "user": user_text,
            "assistant": assistant_text,
        }
        with self.transcript_log.open("a") as f:
            f.write(json.dumps(entry) + "\n")
