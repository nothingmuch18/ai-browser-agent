"""
FastAPI application entry-point.

• CORS middleware (allows http://localhost:3000)
• Static file mount at /screenshots
• WebSocket endpoint at /api/v1/ws/tasks/{task_id}
• Health-check at GET /health
• Task router at /api/v1/tasks/*
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import tasks
from app.services.stream_manager import ws_stream_manager

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — create DB tables on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import models so Base.metadata knows about them
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified")
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Browser Agent",
    description="An AI-powered browser automation agent backed by Gemini 2.0 Flash",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files — serve screenshots
# ---------------------------------------------------------------------------
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
app.mount("/screenshots", StaticFiles(directory=SCREENSHOTS_DIR), name="screenshots")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(tasks.router)

# ---------------------------------------------------------------------------
# Health-check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["meta"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-browser-agent",
        "version": "0.1.0",
    }


# ---------------------------------------------------------------------------
# WebSocket — production live browser screen & execution updates stream
# ---------------------------------------------------------------------------
@app.websocket("/api/v1/ws/tasks/{task_id}")
async def websocket_task_updates(websocket: WebSocket, task_id: str):
    await ws_stream_manager.connect(task_id, websocket)
    logger.info("WS stream connected for task %s", task_id)
    try:
        while True:
            # Handle incoming ping/control messages from frontend
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
            else:
                logger.debug("WS client msg on task %s: %s", task_id, data)
    except WebSocketDisconnect:
        await ws_stream_manager.disconnect(task_id, websocket)
        logger.info("WS stream disconnected for task %s", task_id)
    except Exception as exc:
        logger.warning("WS stream error for task %s: %s", task_id, exc)
        await ws_stream_manager.disconnect(task_id, websocket)
