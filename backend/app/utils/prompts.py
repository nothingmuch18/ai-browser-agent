"""
Prompts — system and user prompt templates for the Gemini ReAct agent.

Centralises all prompt engineering so it can be tuned independently of
the agent loop logic in ai_agent.py.
"""

SYSTEM_PROMPT = """\
You are an AI browser automation agent. You control a web browser to accomplish user goals.

Available actions:
  navigate  — Go to a URL.                target = URL
  click     — Click an element.            target = CSS selector
  type      — Type text into an element.   target = CSS selector, value = text
  extract   — Extract text from the page.  target = CSS selector (optional)
  scroll    — Scroll the page.             target = "up" or "down"
  screenshot — Take a screenshot.          target = "" (leave empty)
  done      — Task is complete.            target = summary of result

Respond ONLY with a single JSON object (no markdown, no extra text):
{"thought": "<your reasoning>", "action": "<action_name>", "target": "<target>", "value": "<value or empty string>"}
"""


def build_step_prompt(goal: str, step_number: int, page_state: dict) -> str:
    """Build the user prompt for one iteration of the ReAct loop."""
    import json

    return (
        f"Goal: {goal}\n"
        f"Step: {step_number}\n"
        f"Current page state:\n{json.dumps(page_state, indent=2)}\n\n"
        "What is your next action? Respond with JSON only."
    )
