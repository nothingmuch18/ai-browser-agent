# 🔴 Member A — Backend & AI Agent Guide

> **Role:** AI & Backend Lead  
> **Owns:** FastAPI Server, Gemini AI Agent ReAct Loop, Pydantic Data Models, SQLite Database, WebSocket Live Streaming  
> **Target Directory:** `./backend/`  
> **Git Branch:** `member-a/backend-ai`

---

## 📋 Step-by-Step Instructions

### Step 1: Set Up Your Git Branch
Open your terminal inside the cloned repository `ai-browser-agent` and run:
```bash
git checkout main
git pull origin main
git checkout -b member-a/backend-ai
```

---

### Step 2: Set Up Python Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

### Step 3: Set Your Environment Variables
Copy `.env.example` to `.env` inside `backend/`:
```bash
cp .env.example .env
```
Open `.env` and add your **GEMINI_API_KEY**:
```env
GEMINI_API_KEY=AIzaSy...your-actual-api-key
DATABASE_URL=sqlite:///./agent.db
CORS_ORIGINS=http://localhost:3000
```

---

### Step 4: Run the Master Prompt in Antigravity
Copy the Master Prompt below and paste it into your Antigravity prompt window. Press Enter and let Antigravity generate the core files.

---

## 🤖 MASTER PROMPT — MEMBER A

```text
You are building the backend and AI agent for an AI Browser Agent project. Build everything from scratch inside `./backend/`.

## Tech Stack
- Python 3.11+
- FastAPI with Uvicorn
- Google Gemini API (`google-generativeai` package using Gemini 2.0 Flash)
- SQLite with SQLAlchemy ORM
- WebSockets for live execution streaming
- Pydantic v2 for data models

## Requirements (`backend/requirements.txt`)
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
google-generativeai==0.8.0
pydantic==2.9.0
python-dotenv==1.0.1
aiofiles==24.1.0
websockets==13.0
python-multipart==0.0.9
httpx==0.27.0
pytest==8.3.2

## Files to Build

### 1. `app/config.py`
Load settings from `.env` using python-dotenv:
- `GEMINI_API_KEY`: str
- `DATABASE_URL`: str = "sqlite:///./agent.db"
- `CORS_ORIGINS`: list = ["http://localhost:3000"]

### 2. `app/models.py`
Define Pydantic Models (Shared API Contract):
```python
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
```

Define SQLAlchemy Models:
- `TaskModel`: id (str UUID), goal (str), target_url (str), status (str), steps_json (text/json), result_json (text/json), created_at (datetime), completed_at (datetime), total_tokens (int), execution_time_ms (int)
- `StepModel`: id (str UUID), task_id (FK TaskModel.id), step_number (int), action (str), target (str), status (str), result (str), screenshot_path (str), created_at (datetime)

### 3. `app/database.py`
Set up SQLAlchemy engine (`sqlite:///./agent.db`), sessionmaker, `Base`, and `get_db()` dependency helper.

### 4. `app/services/browser_engine.py` (MOCK VERSION FOR INTERFACE AGREEMENT)
Create a mock `BrowserEngine` class with matching async signatures so you can develop the AI agent independently:
- `async def start_session(self) -> str` (returns UUID session string)
- `async def navigate(self, session_id: str, url: str) -> dict`
- `async def click(self, session_id: str, selector: str) -> dict`
- `async def type_text(self, session_id: str, selector: str, text: str) -> dict`
- `async def extract(self, session_id: str, instruction: str) -> dict`
- `async def screenshot(self, session_id: str, path: str) -> str`
- `async def get_page_state(self, session_id: str) -> dict`
- `async def scroll(self, session_id: str, direction: str) -> dict`
- `async def close_session(self, session_id: str) -> None`

### 5. `app/services/ai_agent.py` — THE CORE REACT AGENT
Implement the AI planning and execution loop:
- Use `google.generativeai` configured with `GEMINI_API_KEY` (model: `gemini-2.0-flash`).
- Implement `run_agent_loop(task_id: str, db: Session, manager: ConnectionManager)`:
  - Fetch task from DB, set status to `running`.
  - Start browser session via `browser_engine.start_session()`.
  - Loop up to `max_steps`:
    1. Get page state from `browser_engine.get_page_state(session_id)`.
    2. Construct prompt with goal, page state, and action history.
    3. Call Gemini API demanding structured JSON response:
       ```json
       {
         "thought": "Reasoning here...",
         "action": "navigate|click|type|extract|screenshot|scroll|done",
         "target": "URL, CSS selector, or description",
         "value": "text to type if action is type"
       }
       ```
    4. Parse JSON. Execute corresponding `browser_engine` method.
    5. Take screenshot, save to `backend/screenshots/{task_id}_{step_number}.png`.
    6. Record step in DB.
    7. Broadcast `ExecutionUpdate` via WebSocket manager.
    8. If action is `done`, set task status to `completed` and break loop.
  - Close browser session when done or on error.

### 6. `app/routers/tasks.py`
Define FastAPI endpoints:
- `POST /api/v1/tasks` → Create task in DB, return `TaskResponse`.
- `GET /api/v1/tasks` → List all tasks with steps.
- `GET /api/v1/tasks/{id}` → Get single task.
- `POST /api/v1/tasks/{id}/execute` → Trigger `asyncio.create_task(run_agent_loop(id, ...))` and return task immediately.
- `POST /api/v1/tasks/{id}/cancel` → Set status to "cancelled".

### 7. `app/main.py`
- Initialize FastAPI app.
- Add `CORSMiddleware` (allow `http://localhost:3000`, methods `*`, headers `*`).
- Mount static files directory `/screenshots` pointing to `backend/screenshots`.
- Include `tasks` router.
- Implement WebSocket ConnectionManager and WebSocket route `/api/v1/ws/tasks/{task_id}`.
- On startup event, call `Base.metadata.create_all(bind=engine)`.

Ensure all code runs cleanly with `uvicorn app.main:app --reload --port 8000`.
```

---

### Step 5: Test & Verify Locally
Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```
Verify health:
- Open browser at `http://localhost:8000/docs` to see Swagger UI.
- Test `POST /api/v1/tasks` and `GET /api/v1/tasks`.

---

### Step 6: Commit and Push
```bash
git add .
git commit -m "feat(backend): complete FastAPI server and Gemini ReAct AI agent loop"
git push origin member-a/backend-ai
```
