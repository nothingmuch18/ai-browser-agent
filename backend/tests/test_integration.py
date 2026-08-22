"""
Integration Test Suite for AI Browser Agent
Verifies API contract adherence, task lifecycles, database persistence,
browser session orchestration, and screenshot delivery.
"""

import pytest
from fastapi.testclient import TestClient


class TestHealthAndSystem:
    """Verifies infrastructure and system health endpoints."""

    def test_health_check(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["ok", "healthy"]


class TestTaskLifecycle:
    """Tests full end-to-end task lifecycle and data contract adherence."""

    def test_create_task_success(self, client: TestClient, sample_task_payload: dict):
        response = client.post("/api/v1/tasks", json=sample_task_payload)
        assert response.status_code in [200, 201]
        data = response.json()

        # Contract assertions
        assert "id" in data
        assert data["goal"] == sample_task_payload["goal"]
        assert data["status"] == "pending"
        assert isinstance(data["steps"], list)
        assert "created_at" in data
        assert data["total_tokens"] == 0
        assert data["execution_time_ms"] == 0

    def test_get_task_by_id(self, client: TestClient, sample_task_payload: dict):
        # 1. Create a task first
        create_res = client.post("/api/v1/tasks", json=sample_task_payload)
        assert create_res.status_code in [200, 201]
        task_id = create_res.json()["id"]

        # 2. Retrieve task
        get_res = client.get(f"/api/v1/tasks/{task_id}")
        assert get_res.status_code == 200
        data = get_res.json()
        assert data["id"] == task_id
        assert data["goal"] == sample_task_payload["goal"]

    def test_list_all_tasks(self, client: TestClient, sample_task_payload: dict):
        # Create at least one task
        client.post("/api/v1/tasks", json=sample_task_payload)

        # List tasks
        response = client.get("/api/v1/tasks")
        assert response.status_code == 200
        tasks = response.json()
        assert isinstance(tasks, list)
        assert len(tasks) >= 1

    def test_execute_task_flow(self, client: TestClient, sample_task_payload: dict):
        # 1. Create task
        create_res = client.post("/api/v1/tasks", json=sample_task_payload)
        task_id = create_res.json()["id"]

        # 2. Trigger execution
        exec_res = client.post(f"/api/v1/tasks/{task_id}/execute")
        assert exec_res.status_code in [200, 202]

        # 3. Verify task steps and status updated
        task_res = client.get(f"/api/v1/tasks/{task_id}")
        assert task_res.status_code == 200
        task_data = task_res.json()
        assert task_data["status"] in ["running", "completed", "pending"]

    def test_cancel_task(self, client: TestClient, sample_task_payload: dict):
        # 1. Create task
        create_res = client.post("/api/v1/tasks", json=sample_task_payload)
        task_id = create_res.json()["id"]

        # 2. Cancel task
        cancel_res = client.post(f"/api/v1/tasks/{task_id}/cancel")
        assert cancel_res.status_code == 200

        # 3. Verify cancelled status
        task_res = client.get(f"/api/v1/tasks/{task_id}")
        assert task_res.status_code == 200
        task_data = task_res.json()
        assert task_data["status"] in ["failed", "cancelled"]

    def test_get_task_screenshots(self, client: TestClient, sample_task_payload: dict):
        # 1. Create and execute task
        create_res = client.post("/api/v1/tasks", json=sample_task_payload)
        task_id = create_res.json()["id"]
        client.post(f"/api/v1/tasks/{task_id}/execute")

        # 2. Request screenshots
        response = client.get(f"/api/v1/tasks/{task_id}/screenshots")
        assert response.status_code == 200
        data = response.json()
        assert "screenshots" in data
        assert isinstance(data["screenshots"], list)


class TestBrowserSessions:
    """Verifies browser session allocation and teardown endpoints."""

    def test_browser_session_lifecycle(self, client: TestClient):
        # 1. Create session
        create_res = client.post("/api/v1/browser/sessions")
        assert create_res.status_code in [200, 201]
        session_data = create_res.json()
        assert "session_id" in session_data
        session_id = session_data["session_id"]

        # 2. Get session
        get_res = client.get(f"/api/v1/browser/sessions/{session_id}")
        assert get_res.status_code == 200

        # 3. Close session
        del_res = client.delete(f"/api/v1/browser/sessions/{session_id}")
        assert del_res.status_code == 200
