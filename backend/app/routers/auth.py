"""
Authentication Router: Provides simple auth endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from app.models import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """Simple demo authentication returning a bearer token."""
    if payload.username and payload.password:
        return LoginResponse(
            access_token=f"demo-token-{payload.username}",
            token_type="bearer"
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
