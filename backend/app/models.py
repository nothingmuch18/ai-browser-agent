from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TaskCreate(BaseModel):
    goal: str
    target_url: Optional[str] = None
    max_steps: int = 15
    require_approval: bool = False

class StepResponse(BaseModel):
    step_number: int
    action: str        # "navigate" | "click" | "type" | "extract" | "screenshot" | "scroll" | "wait" | "done"
    target: str
    status: str        # "pending" | "running" | "completed" | "failed"
    result: Optional[str] = None
    screenshot_url: Optional[str] = None
    timestamp: str

class TaskResponse(BaseModel):
    id: str
    goal: str
    status: str        # "pending" | "planning" | "running" | "completed" | "failed"
    steps: List[StepResponse] = []
    result: Optional[Dict[str, Any]] = None
    created_at: str
    completed_at: Optional[str] = None
    total_tokens: int = 0
    execution_time_ms: int = 0

class ExecutionUpdate(BaseModel):
    task_id: str
    type: str          # "step_started" | "step_completed" | "step_failed" | "task_completed" | "screenshot"
    step: Optional[StepResponse] = None
    message: str
    screenshot_base64: Optional[str] = None
