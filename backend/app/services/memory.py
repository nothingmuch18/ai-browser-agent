"""
Memory — short-term conversation / step memory for the AI agent.

Keeps a rolling window of the most recent steps so the Gemini prompt stays
within token limits while retaining enough context for good decisions.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any


@dataclass
class StepMemory:
    """Record of a single executed step."""
    step_number: int
    thought: str
    action: str
    target: str
    value: str
    result: dict


class AgentMemory:
    """Rolling memory buffer for the ReAct agent loop."""

    def __init__(self, max_steps: int = 10) -> None:
        self._max_steps = max_steps
        self._steps: list[StepMemory] = []

    def add_step(
        self,
        step_number: int,
        thought: str,
        action: str,
        target: str,
        value: str = "",
        result: dict | None = None,
    ) -> None:
        """Record a step, evicting the oldest if the window is full."""
        self._steps.append(
            StepMemory(
                step_number=step_number,
                thought=thought,
                action=action,
                target=target,
                value=value,
                result=result or {},
            )
        )
        if len(self._steps) > self._max_steps:
            self._steps.pop(0)

    def to_prompt_context(self) -> str:
        """Serialise the memory window into a string for the LLM prompt."""
        if not self._steps:
            return "No previous actions."
        lines = ["Previous actions:"]
        for s in self._steps:
            lines.append(
                f"  Step {s.step_number}: {s.action}({s.target}) "
                f"→ {json.dumps(s.result, default=str)[:200]}"
            )
        return "\n".join(lines)

    def clear(self) -> None:
        self._steps.clear()

    @property
    def step_count(self) -> int:
        return len(self._steps)
