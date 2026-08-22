"""
AI Agent — ReAct loop powered by Gemini 2.0 Flash.

Flow:
  1. Receive a user goal + optional target URL.
  2. Start a browser session.
  3. Loop (up to max_steps):
       a. Get current page state.
       b. Ask Gemini for the next action as JSON:
          {"thought": "...", "action": "...", "target": "...", "value": "..."}
       c. Execute the action via BrowserEngine.
       d. Record the step, take a screenshot, broadcast via WebSocket.
  4. Return the final result.
"""

import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from app.config import settings
from app.database import task_store, generate_id
from app.models import StepResponse, ExecutionUpdate
from app.services.browser_engine import BrowserEngine

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configure Gemini client
# ---------------------------------------------------------------------------
client = genai.Client(api_key=settings.GEMINI_API_KEY)

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


# ---------------------------------------------------------------------------
# WebSocket manager (simple broadcast registry)
# ---------------------------------------------------------------------------
class ConnectionManager:
    """Manages WebSocket connections per task_id for live updates."""

    def __init__(self) -> None:
        self._connections: Dict[str, list] = {}

    async def connect(self, task_id: str, websocket) -> None:
        await websocket.accept()
        self._connections.setdefault(task_id, []).append(websocket)

    def disconnect(self, task_id: str, websocket) -> None:
        conns = self._connections.get(task_id, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast(self, task_id: str, message: dict) -> None:
        for ws in self._connections.get(task_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                logger.warning("Failed to send WS message for task %s", task_id)


ws_manager = ConnectionManager()


# ---------------------------------------------------------------------------
# AI Agent
# ---------------------------------------------------------------------------
class AIAgent:
    def __init__(self) -> None:
        self.browser = BrowserEngine()

    # ------------------------------------------------------------------
    async def execute_task(self, task_id: str) -> dict:
        """Run the full ReAct loop for *task_id*."""
        task = task_store.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        task["status"] = "running"
        start_time = time.time()
        steps: List[StepResponse] = []
        conversation_history: list = []

        try:
            # 1. Start browser session
            await self.browser.start_session()

            # 2. Navigate to initial URL if provided
            if task.get("target_url"):
                await self.browser.navigate(task["target_url"])

            # 3. ReAct loop
            for step_num in range(1, task.get("max_steps", 15) + 1):
                step_response = await self._execute_step(
                    task_id=task_id,
                    goal=task["goal"],
                    step_number=step_num,
                    conversation_history=conversation_history,
                )
                steps.append(step_response)

                # Broadcast the step update
                update = ExecutionUpdate(
                    task_id=task_id,
                    type="step_completed",
                    step=step_response,
                    message=f"Step {step_num}: {step_response.action} → {step_response.status}",
                )
                await ws_manager.broadcast(task_id, update.model_dump())

                # If the agent decided it's done, break
                if step_response.action == "done":
                    break

            # 4. Finalise
            elapsed_ms = int((time.time() - start_time) * 1000)
            task["status"] = "completed"
            task["steps"] = [s.model_dump() for s in steps]
            task["execution_time_ms"] = elapsed_ms
            task["completed_at"] = datetime.now(timezone.utc).isoformat()
            task["result"] = {
                "summary": steps[-1].result if steps else "No steps executed",
                "total_steps": len(steps),
            }

            # Broadcast completion
            await ws_manager.broadcast(
                task_id,
                ExecutionUpdate(
                    task_id=task_id,
                    type="task_completed",
                    message="Task completed successfully",
                ).model_dump(),
            )

        except Exception as exc:
            logger.exception("Task %s failed", task_id)
            task["status"] = "failed"
            task["result"] = {"error": str(exc)}
            await ws_manager.broadcast(
                task_id,
                ExecutionUpdate(
                    task_id=task_id,
                    type="step_failed",
                    message=f"Task failed: {exc}",
                ).model_dump(),
            )

        finally:
            await self.browser.close_session()

        return task

    # ------------------------------------------------------------------
    async def _execute_step(
        self,
        task_id: str,
        goal: str,
        step_number: int,
        conversation_history: list,
    ) -> StepResponse:
        """Ask Gemini for the next action, execute it, return a StepResponse."""

        # Build the prompt with current page state
        page_state = await self.browser.get_page_state()
        user_prompt = (
            f"Goal: {goal}\n"
            f"Step: {step_number}\n"
            f"Current page state:\n{json.dumps(page_state, indent=2)}\n\n"
            "What is your next action? Respond with JSON only."
        )

        # Build contents for the Gemini API
        conversation_history.append(
            types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)])
        )

        # Call Gemini
        raw_text = ""
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=conversation_history,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.2,
                ),
            )
            raw_text = response.text.strip()

            # Strip markdown fences if Gemini wraps it
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

            action_data = json.loads(raw_text)
        except (json.JSONDecodeError, Exception) as exc:
            logger.warning("Gemini response parse error: %s — raw: %s", exc, raw_text)
            action_data = {
                "thought": "Failed to parse Gemini response, finishing task.",
                "action": "done",
                "target": "Parse error — finishing early.",
                "value": "",
            }

        conversation_history.append(
            types.Content(role="model", parts=[types.Part.from_text(text=json.dumps(action_data))])
        )

        action = action_data.get("action", "done")
        target = action_data.get("target", "")
        value = action_data.get("value", "")
        thought = action_data.get("thought", "")

        logger.info(
            "Step %d | thought: %s | action: %s | target: %s",
            step_number, thought, action, target,
        )

        # Execute the action on the browser engine
        result = await self._run_action(action, target, value, task_id, step_number)

        # Take a screenshot after each step
        screenshot_data = await self.browser.screenshot(task_id, step_number)

        now = datetime.now(timezone.utc).isoformat()
        return StepResponse(
            step_number=step_number,
            action=action,
            target=target,
            status="completed",
            result=json.dumps(result),
            screenshot_url=screenshot_data.get("url"),
            timestamp=now,
        )

    # ------------------------------------------------------------------
    async def _run_action(
        self,
        action: str,
        target: str,
        value: str,
        task_id: str,
        step_number: int,
    ) -> dict:
        """Dispatch an action string to the appropriate BrowserEngine method."""
        dispatch = {
            "navigate": lambda: self.browser.navigate(target),
            "click": lambda: self.browser.click(target),
            "type": lambda: self.browser.type_text(target, value),
            "extract": lambda: self.browser.extract(target or None),
            "scroll": lambda: self.browser.scroll(target or "down"),
            "screenshot": lambda: self.browser.screenshot(task_id, step_number),
            "done": lambda: _async_noop({"status": "done", "summary": target}),
        }

        handler = dispatch.get(action)
        if handler is None:
            logger.warning("Unknown action '%s' — treating as done", action)
            return {"status": "unknown_action", "action": action}

        return await handler()


async def _async_noop(result: dict) -> dict:
    return result
