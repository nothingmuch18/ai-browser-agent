"""
Simple Task Memory Service for tracking step context and action history.
"""

from typing import Dict, List, Any

class TaskMemory:
    """Stores in-memory execution history for active tasks."""

    def __init__(self):
        self._history: Dict[str, List[Dict[str, Any]]] = {}

    def add_step(self, task_id: str, step_data: Dict[str, Any]):
        if task_id not in self._history:
            self._history[task_id] = []
        self._history[task_id].append(step_data)

    def get_history(self, task_id: str) -> List[Dict[str, Any]]:
        return self._history.get(task_id, [])

    def clear(self, task_id: str):
        if task_id in self._history:
            del self._history[task_id]

memory_service = TaskMemory()
