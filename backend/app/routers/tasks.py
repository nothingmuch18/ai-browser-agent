"""
Task Router — /api/v1/tasks

Endpoints:
  POST   /tasks             — Create a new task
  GET    /tasks             — List all tasks
  GET    /tasks/{task_id}   — Get a specific task
  POST   /tasks/{task_id}/execute — Execute task (runs AI loop in background)
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException

from app.database import task_store, generate_id
from app.models import TaskCreate, TaskResponse, StepResponse
from app.services.ai_agent import AIAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

agent = AIAgent()

# Keep track of running background tasks so they aren't garbage-collected
_background_tasks: dict = {}


# ---------------------------------------------------------------------------
# POST /tasks — create
# ---------------------------------------------------------------------------
@router.post("", response_model=TaskResponse)
async def create_task(body: TaskCreate):
    task_id = generate_id()
    now = datetime.now(timezone.utc).isoformat()

    task = {
        "id": task_id,
        "goal": body.goal,
        "target_url": body.target_url,
        "max_steps": body.max_steps,
        "require_approval": body.require_approval,
        "status": "pending",
        "steps": [],
        "result": None,
        "created_at": now,
        "completed_at": None,
        "total_tokens": 0,
        "execution_time_ms": 0,
    }
    task_store[task_id] = task
    logger.info("Created task %s — goal: %s", task_id, body.goal)
    return TaskResponse(**task)


# ---------------------------------------------------------------------------
# GET /tasks — list all
# ---------------------------------------------------------------------------
@router.get("", response_model=List[TaskResponse])
async def list_tasks():
    tasks = []
    for t in task_store.values():
        steps = [StepResponse(**s) if isinstance(s, dict) else s for s in t.get("steps", [])]
        tasks.append(
            TaskResponse(
                id=t["id"],
                goal=t["goal"],
                status=t["status"],
                steps=steps,
                result=t.get("result"),
                created_at=t["created_at"],
                completed_at=t.get("completed_at"),
                total_tokens=t.get("total_tokens", 0),
                execution_time_ms=t.get("execution_time_ms", 0),
            )
        )
    return tasks


# ---------------------------------------------------------------------------
# GET /tasks/{task_id} — detail
# ---------------------------------------------------------------------------
@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    task = task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    steps = [StepResponse(**s) if isinstance(s, dict) else s for s in task.get("steps", [])]
    return TaskResponse(
        id=task["id"],
        goal=task["goal"],
        status=task["status"],
        steps=steps,
        result=task.get("result"),
        created_at=task["created_at"],
        completed_at=task.get("completed_at"),
        total_tokens=task.get("total_tokens", 0),
        execution_time_ms=task.get("execution_time_ms", 0),
    )


# ---------------------------------------------------------------------------
# POST /tasks/{task_id}/execute — run in background
# ---------------------------------------------------------------------------
@router.post("/{task_id}/execute")
async def execute_task(task_id: str):
    task = task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task["status"] == "running":
        raise HTTPException(status_code=409, detail="Task is already running")

    # Launch the AI agent loop as a background coroutine
    bg_task = asyncio.create_task(agent.execute_task(task_id))
    _background_tasks[task_id] = bg_task
    bg_task.add_done_callback(lambda _t: _background_tasks.pop(task_id, None))

    logger.info("Execution started for task %s", task_id)
    return {"task_id": task_id, "status": "execution_started"}


# ---------------------------------------------------------------------------
# POST /tasks/{task_id}/cancel — cancel a running task
# ---------------------------------------------------------------------------
@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str):
    task = task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Cancel the asyncio background task if it's still running
    bg_task = _background_tasks.get(task_id)
    if bg_task and not bg_task.done():
        bg_task.cancel()
        _background_tasks.pop(task_id, None)

    task["status"] = "cancelled"
    logger.info("Task %s cancelled", task_id)
    return {"task_id": task_id, "status": "cancelled"}
