# 🔵 Member C — Frontend Dashboard Guide

> **Role:** Frontend & UX Lead  
> **Owns:** Next.js Dashboard, Dark Mode Glassmorphic Design, Live Execution View, WebSocket Streaming, Execution Timeline  
> **Target Directory:** `./frontend/`  
> **Git Branch:** `member-c/frontend`

---

## 📋 Step-by-Step Instructions

### Step 1: Set Up Your Git Branch
Open your terminal inside `ai-browser-agent` and run:
```bash
git checkout main
git pull origin main
git checkout -b member-c/frontend
```

---

### Step 2: Initialize Next.js Project
```bash
cd frontend
# If frontend folder exists, install dependencies:
npm install lucide-react axios clsx tailwind-merge
```

---

### Step 3: Run the Master Prompt in Antigravity
Copy the Master Prompt below and paste it into your Antigravity prompt window. Let Antigravity build the UI components and pages.

---

## 🤖 MASTER PROMPT — MEMBER C

```text
You are building the frontend dashboard for an AI Browser Agent project.

Build your project inside: `./frontend/`

## Tech Stack
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS
- Lucide React icons
- Axios for REST calls
- Native WebSockets for live execution updates

## Color & Design System
- Background: `bg-slate-950` (#020617)
- Cards: `bg-slate-900/60 border border-slate-800 backdrop-blur-md`
- Primary Accent: Violet-500 (`#8b5cf6`), Secondary: Emerald-500
- Text: Slate-50 (primary), Slate-400 (secondary)

## Files to Build

### 1. `src/lib/api.ts` — API Client & Types
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

export interface Step {
  step_number: number;
  action: string;
  target: string;
  status: string;
  result: string | null;
  screenshot_url: string | null;
  timestamp: string;
}

export interface Task {
  id: string;
  goal: string;
  status: 'pending' | 'planning' | 'running' | 'completed' | 'failed';
  steps: Step[];
  result: Record<string, any> | null;
  created_at: string;
  completed_at: string | null;
  total_tokens: number;
  execution_time_ms: number;
}

export interface ExecutionUpdate {
  task_id: str;
  type: 'step_started' | 'step_completed' | 'step_failed' | 'task_completed' | 'screenshot';
  step?: Step;
  message: string;
  screenshot_base64?: string;
}

export const taskApi = {
  create: (goal: string, target_url?: string) => api.post<Task>('/tasks', { goal, target_url }),
  list: () => api.get<Task[]>('/tasks'),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  execute: (id: string) => api.post<Task>(`/tasks/${id}/execute`),
  cancel: (id: string) => api.post(`/tasks/${id}/cancel`),
};
```

### 2. `src/components/Navbar.tsx`
Glassmorphic header:
- Logo: `🤖 AI Browser Agent` with violet gradient text
- Navigation items: Dashboard (`/`), Tasks (`/tasks`)
- Status pill indicator: "System Active" green dot

### 3. `src/components/BrowserView.tsx`
Fake Chrome Browser window frame:
- Top bar with red/yellow/green control buttons and mock URL input showing current page URL
- Main viewport showing page screenshot:
  - Supports base64 screenshot data or static URL from `/screenshots/`
  - Shows loading skeleton if no screenshot is available yet

### 4. `src/components/ExecutionTimeline.tsx`
Vertical timeline showing agent execution steps:
- Each step displays: step_number, action icon (🧭 navigate, 👆 click, ⌨️ type, 📋 extract), target, status badge (spinner if running, checkmark if complete)
- Animated pulse effect for active step

### 5. `src/app/page.tsx` — Dashboard Page
- Top Row: 4 Metric Cards
  - Total Tasks
  - Success Rate (%)
  - Avg Speed (s)
  - Active Sessions
- Quick Execute Panel:
  - Goal textarea ("Enter goal, e.g. Find the top 3 trending Python repos on GitHub")
  - Optional Target URL input
  - Execute button (violet gradient, loading spinner when submitted)
  - On submit: calls `taskApi.create`, then `taskApi.execute`, then redirects to `/execute?id={taskId}`
- Recent Tasks Table:
  - List of recent tasks with goal, status badge, created time, and action button to view details

### 6. `src/app/execute/page.tsx` — Live Execution Page (`?id={taskId}`)
- Connects to WebSocket `ws://localhost:8000/api/v1/ws/tasks/${taskId}`
- Splits screen into 2 panels:
  - Left (60%): `<BrowserView />` showing live streaming screenshot
  - Right (40%): `<ExecutionTimeline />` showing real-time step progress
- Cancel Execution button
- Token usage counter & elapsed time clock

Ensure high-end glassmorphic UI, dark theme, smooth transitions, and error toast handling.
```

---

### Step 4: Test & Verify Locally
Run the Next.js dev server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to verify dashboard layout and styling!

---

### Step 5: Commit and Push
```bash
git add .
git commit -m "feat(frontend): complete Next.js dashboard and WebSocket live execution view"
git push origin member-c/frontend
```
