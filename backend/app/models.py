"""
Shared Pydantic and SQLAlchemy Data Models for AI Browser Agent.
Defines the strict integration contracts between Frontend, Backend, and Browser Engine.
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# ==============================================================================
# 1. Pydantic Models (API Integration Contracts)
# ==============================================================================

class StepResponse(BaseModel):
    step_number: int
    action: str        # "navigate" | "click" | "type" | "extract" | "screenshot" | "scroll" | "wait"
    target: str        # URL, selector, or description
    status: str        # "pending" | "running" | "completed" | "failed"
    result: Optional[str] = None
    screenshot_url: Optional[str] = None
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    goal: str
    target_url: Optional[str] = None
    max_steps: int = 15
    require_approval: bool = False


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
    target_url: Optional[str] = None
    max_steps: int = 15
    require_approval: bool = False

    model_config = ConfigDict(from_attributes=True)


class ExecutionUpdate(BaseModel):
    task_id: str
    type: str          # "step_started" | "step_completed" | "step_failed" | "task_completed" | "screenshot"
    step: Optional[StepResponse] = None
    message: str
    screenshot_base64: Optional[str] = None


class SessionResponse(BaseModel):
    session_id: str
    status: str
    created_at: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==============================================================================
# 2. SQLAlchemy ORM Models (Database Persistence)
# ==============================================================================

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    target_url = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="pending", index=True)
    steps_json = Column(Text, default="[]")
    result_json = Column(Text, nullable=True)
    created_at = Column(String, nullable=False)
    completed_at = Column(String, nullable=True)
    total_tokens = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)
    require_approval = Column(Integer, default=0)
    max_steps = Column(Integer, default=15)

    steps = relationship("Step", back_populates="task", cascade="all, delete-orphan")


class Step(Base):
    __tablename__ = "steps"

    id = Column(String, primary_key=True, index=True)
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
    target = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="pending")
    result = Column(Text, nullable=True)
    screenshot_path = Column(Text, nullable=True)
    screenshot_url = Column(Text, nullable=True)
    timestamp = Column(String, nullable=False)

    task = relationship("Task", back_populates="steps")
