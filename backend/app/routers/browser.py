"""
Browser Session Router: Manages Playwright browser lifecycle endpoints.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.models import SessionResponse

router = APIRouter(prefix="/browser", tags=["Browser Sessions"])

# In-memory tracking for active browser sessions
_active_sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session():
    """Create and initialize a new browser automation session."""
    session_id = f"session-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    session_data = {
        "session_id": session_id,
        "status": "active",
        "created_at": now
    }
    _active_sessions[session_id] = session_data
    return SessionResponse(**session_data)

@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str):
    """Get status of an active browser session."""
    if session_id not in _active_sessions:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return SessionResponse(**_active_sessions[session_id])

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    """Close and terminate a browser session."""
    if session_id not in _active_sessions:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    _active_sessions[session_id]["status"] = "closed"
    closed = _active_sessions.pop(session_id)
    return {
        "message": f"Browser session '{session_id}' terminated",
        "session_id": session_id,
        "status": "closed"
    }
