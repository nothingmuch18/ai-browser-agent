"""
Tasks Router: Handles Task CRUD, Execution Triggers, and Screenshot Endpoints.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task, Step, TaskCreate, TaskResponse, StepResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    """Create a new automation task."""
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    new_task = Task(
        id=task_id,
        goal=payload.goal,
        target_url=payload.target_url,
        status="pending",
        steps_json="[]",
        result_json=None,
        created_at=now,
        completed_at=None,
        total_tokens=0,
        execution_time_ms=0,
        require_approval=1 if payload.require_approval else 0,
        max_steps=payload.max_steps
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        goal=new_task.goal,
        status=new_task.status,
        steps=[],
        result=None,
        created_at=new_task.created_at,
        completed_at=None,
        total_tokens=0,
        execution_time_ms=0,
        target_url=new_task.target_url,
        max_steps=new_task.max_steps,
        require_approval=bool(new_task.require_approval)
    )

@router.get("", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    """List all automation tasks."""
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    results = []
    for t in tasks:
        # Parse steps
        steps_list = []
        for s in t.steps:
            steps_list.append(StepResponse(
                step_number=s.step_number,
                action=s.action,
                target=s.target,
                status=s.status,
                result=s.result,
                screenshot_url=s.screenshot_url or s.screenshot_path,
                timestamp=s.timestamp
            ))
        # If no relationship steps, try parsing steps_json
        if not steps_list and t.steps_json:
            try:
                raw_steps = json.loads(t.steps_json)
                steps_list = [StepResponse(**s) for s in raw_steps]
            except Exception:
                pass

        result_dict = None
        if t.result_json:
            try:
                result_dict = json.loads(t.result_json)
            except Exception:
                pass

        results.append(TaskResponse(
            id=t.id,
            goal=t.goal,
            status=t.status,
            steps=steps_list,
            result=result_dict,
            created_at=t.created_at,
            completed_at=t.completed_at,
            total_tokens=t.total_tokens or 0,
            execution_time_ms=t.execution_time_ms or 0,
            target_url=t.target_url,
            max_steps=t.max_steps or 15,
            require_approval=bool(t.require_approval)
        ))
    return results

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Retrieve details and step history for a specific task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    steps_list = []
    for s in task.steps:
        steps_list.append(StepResponse(
            step_number=s.step_number,
            action=s.action,
            target=s.target,
            status=s.status,
            result=s.result,
            screenshot_url=s.screenshot_url or s.screenshot_path,
            timestamp=s.timestamp
        ))
    if not steps_list and task.steps_json:
        try:
            raw_steps = json.loads(task.steps_json)
            steps_list = [StepResponse(**s) for s in raw_steps]
        except Exception:
            pass

    result_dict = None
    if task.result_json:
        try:
            result_dict = json.loads(task.result_json)
        except Exception:
            pass

    return TaskResponse(
        id=task.id,
        goal=task.goal,
        status=task.status,
        steps=steps_list,
        result=result_dict,
        created_at=task.created_at,
        completed_at=task.completed_at,
        total_tokens=task.total_tokens or 0,
        execution_time_ms=task.execution_time_ms or 0,
        target_url=task.target_url,
        max_steps=task.max_steps or 15,
        require_approval=bool(task.require_approval)
    )

@router.post("/{task_id}/execute")
def execute_task(task_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger execution of an existing task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    task.status = "running"
    db.commit()

    return {
        "message": "Task execution initiated",
        "task_id": task_id,
        "status": "running"
    }

@router.post("/{task_id}/cancel")
def cancel_task(task_id: str, db: Session = Depends(get_db)):
    """Cancel a running task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    task.status = "failed"
    task.result_json = json.dumps({"error": "Task execution cancelled by user"})
    task.completed_at = datetime.now(timezone.utc).isoformat()
    db.commit()

    return {
        "message": "Task cancelled successfully",
        "task_id": task_id,
        "status": "cancelled"
    }

@router.get("/{task_id}/screenshots")
def get_task_screenshots(task_id: str, db: Session = Depends(get_db)):
    """Get list of captured screenshot URLs for a given task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    screenshots = []
    for s in task.steps:
        if s.screenshot_url:
            screenshots.append(s.screenshot_url)
        elif s.screenshot_path:
            screenshots.append(s.screenshot_path)

    if not screenshots and task.steps_json:
        try:
            steps = json.loads(task.steps_json)
            for s in steps:
                if s.get("screenshot_url"):
                    screenshots.append(s["screenshot_url"])
        except Exception:
            pass

    return {
        "task_id": task_id,
        "screenshots": screenshots
    }
