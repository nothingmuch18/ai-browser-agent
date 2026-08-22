"""
Pydantic schemas (shared API contract) and SQLAlchemy ORM models.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from pydantic import BaseModel
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


# ═══════════════════════════════════════════════════════════════════════════
# Pydantic Schemas
# ═══════════════════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════════════════
# SQLAlchemy ORM Models
# ═══════════════════════════════════════════════════════════════════════════

def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TaskModel(Base):
    """Persisted task record."""
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=_uuid)
    goal = Column(Text, nullable=False)
    target_url = Column(String, nullable=True)
    status = Column(String, default="pending")
    max_steps = Column(Integer, default=15)
    steps_json = Column(Text, default="[]")     # JSON-serialised list of steps
    result_json = Column(Text, nullable=True)    # JSON-serialised result dict
    created_at = Column(DateTime, default=_utcnow)
    completed_at = Column(DateTime, nullable=True)
    total_tokens = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)

    steps = relationship("StepModel", back_populates="task", cascade="all, delete-orphan")


class StepModel(Base):
    """Persisted step record."""
    __tablename__ = "steps"

    id = Column(String, primary_key=True, default=_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
    target = Column(Text, default="")
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    screenshot_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    task = relationship("TaskModel", back_populates="steps")
