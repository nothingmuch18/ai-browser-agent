"""
Streaming WebSocket Manager and Hub with heartbeat, task routing,
multi-client fanout, reconnect buffer, and connection lifecycle management.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class StreamConnectionManager:
    """Manages WebSocket subscribers per task_id for low-latency live streaming."""

    def __init__(self) -> None:
        # task_id -> Set of active WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = {}
        # task_id -> Last known frame / state cache for instant reconnect hydration
        self._latest_state: Dict[str, dict] = {}
        self._lock = asyncio.Lock()

    async def connect(self, task_id: str, websocket: WebSocket) -> None:
        """Accept connection, register subscriber, and send immediate latest cached frame."""
        await websocket.accept()
        async with self._lock:
            if task_id not in self._connections:
                self._connections[task_id] = set()
            self._connections[task_id].add(websocket)

        logger.info("WS subscriber connected for task %s (active subscribers: %d)", task_id, len(self._connections[task_id]))

        # Hydrate newly connected client with the latest known snapshot if available
        cached = self._latest_state.get(task_id)
        if cached:
            try:
                await websocket.send_json(cached)
            except Exception as exc:
                logger.debug("Failed to send initial cached snapshot to client: %s", exc)

    async def disconnect(self, task_id: str, websocket: WebSocket) -> None:
        """Remove subscriber gracefully."""
        async with self._lock:
            conns = self._connections.get(task_id)
            if conns and websocket in conns:
                conns.remove(websocket)
                if not conns:
                    self._connections.pop(task_id, None)
        logger.info("WS subscriber disconnected for task %s", task_id)

    async def broadcast(self, task_id: str, message: dict) -> None:
        """Broadcast live frame or execution update to all active subscribers for task_id."""
        # Cache message for hydration on reconnect
        msg_type = message.get("type")
        if msg_type in ("frame", "step_completed", "step_started", "task_completed", "error"):
            self._latest_state[task_id] = message

        async with self._lock:
            conns = list(self._connections.get(task_id, set()))

        if not conns:
            return

        dead_sockets: List[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception as exc:
                logger.debug("Failed to deliver WS message to subscriber on task %s: %s", task_id, exc)
                dead_sockets.append(ws)

        if dead_sockets:
            async with self._lock:
                task_conns = self._connections.get(task_id)
                if task_conns:
                    for ws in dead_sockets:
                        task_conns.discard(ws)

    def cleanup_task(self, task_id: str) -> None:
        """Free memory caches for completed task."""
        self._latest_state.pop(task_id, None)


ws_stream_manager = StreamConnectionManager()
