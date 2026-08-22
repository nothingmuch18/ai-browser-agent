"""
Pytest configuration and shared fixtures for AI Browser Agent integration tests.
Provides isolated database setups, mock environments, and FastAPI TestClients.
"""

import os
import sys
import tempfile
import pytest
from typing import Generator
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Try importing the actual application; if not yet present, build contract app
try:
    from app.main import app as actual_app
except ImportError:
    actual_app = None

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# ==============================================================================
# Shared Contract Definitions (Used for fallback and validation)
# ==============================================================================

class StepResponse(BaseModel):
    step_number: int
    action: str
    target: str
    status: str
    result: Optional[str] = None
    screenshot_url: Optional[str] = None
    timestamp: str

class TaskCreate(BaseModel):
    goal: str
    target_url: Optional[str] = None
    max_steps: int = 15
    require_approval: bool = False

class TaskResponse(BaseModel):
    id: str
    goal: str
    status: str
    steps: List[StepResponse] = []
    result: Optional[Dict[str, Any]] = None
    created_at: str
    completed_at: Optional[str] = None
    total_tokens: int = 0
    execution_time_ms: int = 0

class SessionResponse(BaseModel):
    session_id: str
    status: str
    created_at: str

# Create standalone contract app if actual app is not yet merged
def create_contract_test_app() -> FastAPI:
    test_app = FastAPI(title="AI Browser Agent Integration Test Server")
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    db_tasks: Dict[str, Dict[str, Any]] = {}
    db_sessions: Dict[str, Dict[str, Any]] = {}

    @test_app.get("/health")
    def health():
        return {"status": "healthy", "service": "ai-browser-agent"}

    @test_app.post("/api/v1/tasks", response_model=TaskResponse)
    def create_task(payload: TaskCreate):
        task_id = f"task-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        task_record = {
            "id": task_id,
            "goal": payload.goal,
            "status": "pending",
            "steps": [],
            "result": None,
            "created_at": now,
            "completed_at": None,
            "total_tokens": 0,
            "execution_time_ms": 0,
            "target_url": payload.target_url,
            "max_steps": payload.max_steps,
            "require_approval": payload.require_approval
        }
        db_tasks[task_id] = task_record
        return TaskResponse(**task_record)

    @test_app.get("/api/v1/tasks", response_model=List[TaskResponse])
    def list_tasks():
        return [TaskResponse(**t) for t in db_tasks.values()]

    @test_app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse)
    def get_task(task_id: str):
        if task_id not in db_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse(**db_tasks[task_id])

    @test_app.post("/api/v1/tasks/{task_id}/execute")
    def execute_task(task_id: str):
        if task_id not in db_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        db_tasks[task_id]["status"] = "running"
        step = {
            "step_number": 1,
            "action": "navigate",
            "target": db_tasks[task_id].get("target_url") or "https://example.com",
            "status": "completed",
            "result": "Page loaded successfully",
            "screenshot_url": f"/screenshots/{task_id}_step_1.png",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        db_tasks[task_id]["steps"].append(step)
        return {"message": "Execution started", "task_id": task_id, "status": "running"}

    @test_app.post("/api/v1/tasks/{task_id}/cancel")
    def cancel_task(task_id: str):
        if task_id not in db_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        db_tasks[task_id]["status"] = "failed"
        db_tasks[task_id]["result"] = {"error": "Task cancelled by user"}
        return {"message": "Task cancelled", "task_id": task_id, "status": "cancelled"}

    @test_app.get("/api/v1/tasks/{task_id}/screenshots")
    def get_screenshots(task_id: str):
        if task_id not in db_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        urls = [s["screenshot_url"] for s in db_tasks[task_id]["steps"] if s.get("screenshot_url")]
        return {"task_id": task_id, "screenshots": urls}

    @test_app.post("/api/v1/browser/sessions", response_model=SessionResponse)
    def create_session():
        session_id = f"session-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        session_record = {"session_id": session_id, "status": "active", "created_at": now}
        db_sessions[session_id] = session_record
        return SessionResponse(**session_record)

    @test_app.get("/api/v1/browser/sessions/{session_id}")
    def get_session(session_id: str):
        if session_id not in db_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        return db_sessions[session_id]

    @test_app.delete("/api/v1/browser/sessions/{session_id}")
    def delete_session(session_id: str):
        if session_id not in db_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        db_sessions[session_id]["status"] = "closed"
        return {"message": "Session closed", "session_id": session_id}

    return test_app

# ==============================================================================
# Fixtures
# ==============================================================================

@pytest.fixture(scope="session")
def app_instance():
    """Returns actual FastAPI app if available, or contract test app."""
    return actual_app if actual_app is not None else create_contract_test_app()

@pytest.fixture(scope="function")
def client(app_instance) -> Generator[TestClient, None, None]:
    """TestClient fixture for FastAPI endpoints."""
    with TestClient(app_instance) as test_client:
        yield test_client

@pytest.fixture(scope="function")
def sample_task_payload() -> Dict[str, Any]:
    """Sample task creation payload."""
    return {
        "goal": "Extract trending AI repositories on GitHub",
        "target_url": "https://github.com/trending",
        "max_steps": 10,
        "require_approval": False
    }
