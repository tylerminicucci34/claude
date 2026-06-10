"""Claude client. Handles system-prompt rendering, vision attachment,
tool-use loop, and conversation history.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

from anthropic import Anthropic


MAX_TOOL_ITERATIONS = 6


class Brain:
    def __init__(
        self,
        api_key: str,
        model: str,
        prompt_template: str,
        max_tokens: int = 1024,
        history_limit: int = 20,
        transcript_log: Optional[Path] = None,
        tools: Optional[list[dict]] = None,
        tool_executor: Optional[Callable[[str, dict], str]] = None,
        on_event: Optional[Callable[[str, str], None]] = None,
    ):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        self.prompt_template = prompt_template
        self.max_tokens = max_tokens
        self.history_limit = history_limit
        self.transcript_log = transcript_log
        self.tools = tools or []
        self.tool_executor = tool_executor
        self.on_event = on_event or (lambda *a, **k: None)
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

        user_content: list[dict] = []
        if screen_block is not None:
            user_content.append(screen_block)
        user_content.append({"type": "text", "text": user_text})

        self.history.append({"role": "user", "content": user_content})

        final_text = self._run_with_tools(system)

        self.history.append({"role": "assistant", "content": final_text})
        self._trim()
        self._log(user_text, final_text)
        return final_text

    def _run_with_tools(self, system: str) -> str:
        for _ in range(MAX_TOOL_ITERATIONS):
            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "system": system,
                "messages": self.history,
            }
            if self.tools and self.tool_executor:
                kwargs["tools"] = self.tools

            resp = self.client.messages.create(**kwargs)

            assistant_blocks = [block.model_dump() for block in resp.content]
            self.history.append({"role": "assistant", "content": assistant_blocks})

            tool_uses = [b for b in assistant_blocks if b.get("type") == "tool_use"]
            if resp.stop_reason != "tool_use" or not tool_uses or self.tool_executor is None:
                # Done — extract text
                text = "".join(
                    b.get("text", "") for b in assistant_blocks if b.get("type") == "text"
                ).strip()
                # Pop the assistant message back off; respond() will append the final string version
                self.history.pop()
                return text

            # Execute tools and append a single user turn with all results
            tool_results = []
            for tu in tool_uses:
                result = self.tool_executor(tu["name"], tu.get("input", {}) or {})
                self.on_event("tool_result", f"{tu['name']} → {result[:80]}")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tu["id"],
                    "content": result,
                })
            self.history.append({"role": "user", "content": tool_results})

        self.history.pop()  # drop the dangling assistant turn
        return "Tool loop exceeded iteration limit, Sir."

    def _trim(self) -> None:
        if len(self.history) <= self.history_limit:
            return
        # Trim from the front, but keep pairs balanced (don't start with tool_result)
        excess = len(self.history) - self.history_limit
        self.history = self.history[excess:]
        while self.history and self.history[0]["role"] != "user":
            self.history.pop(0)

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
