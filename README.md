# 🌐 AI Browser Agent — Autonomous Web Navigation & Vision Control

An enterprise-grade, autonomous AI Browser Agent designed to execute complex natural language web workflows, form automation, data extraction, and multi-step browser interactions with real-time WebSocket streaming.

---

## 🏗️ Architecture Overview

```
                                  +---------------------------------------+
                                  |         Next.js / Vite Client         |
                                  |  - Live Viewport Stream (60%)         |
                                  |  - Execution Step Timeline (40%)      |
                                  |  - Data Vault Inspector & Counters    |
                                  +---------------------------------------+
                                                     ▲
                                        WebSocket    │    REST HTTP
                                      (Port 8000/ws) │   (Port 8000/api)
                                                     ▼
                                  +---------------------------------------+
                                  |            FastAPI Backend            |
                                  |  - WebSocket Task Broadcast           |
                                  |  - Autonomous Vision Planner          |
                                  |  - SQLite (agent.db) Storage          |
                                  +---------------------------------------+
                                                     │
                                                     ▼
                                  +---------------------------------------+
                                  |       Playwright Chromium Engine      |
                                  |  - Headless / Headed Execution        |
                                  |  - DOM Vision Tree Parser             |
                                  |  - Viewport Screencast & Capture      |
                                  +---------------------------------------+
```

---

## 🚀 Quick Start & Docker Deployment

### 1. Run Everything with Docker Compose
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation (Swagger)**: `http://localhost:8000/docs`

---

### 2. Run Locally Without Docker

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Install Playwright Chromium binary
playwright install chromium

# Seed initial demo tasks
python ../scripts/seed_data.py

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

---

## 📡 API Endpoints & WebSocket Protocol

### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/v1/tasks` | List all previous agent execution sessions |
| `GET` | `/api/v1/tasks/{id}` | Get specific task details, steps, and data vault |
| `POST` | `/api/v1/tasks` | Create and launch a new autonomous browser task |
| `POST` | `/api/v1/tasks/{id}/cancel` | Abort a currently running execution session |

### WebSocket Real-time Stream
- **URL**: `ws://localhost:8000/api/v1/ws/tasks/{taskId}`
- **Message Protocol**:
  ```json
  {
    "type": "step_update",
    "step": {
      "step_number": 1,
      "action": "navigate",
      "target": "https://www.nike.com/checkout",
      "status": "completed",
      "timestamp": "12:00:01"
    },
    "screenshot_base64": "...",
    "extracted_data": [ ... ]
  }
  ```

---

## 🧪 Database Seeding
To populate `agent.db` with 3 pre-filled completed demo tasks:
```bash
python scripts/seed_data.py
```

---

## 🛡️ Key Capabilities
- ✅ **Natural Language Intent Parsing**: Automatically resolves target domains, login forms, and university rosters.
- ✅ **E-Commerce Auto-Checkout**: Variant selection, shipping form auto-fill, and payment confirmation.
- ✅ **Multi-Step Form Automation**: Step navigation, file/resume uploads, and reCAPTCHA score verification.
- ✅ **Deep Table Extraction**: Infinite scroll, dynamic AJAX table parsing, and JSON/CSV export.
