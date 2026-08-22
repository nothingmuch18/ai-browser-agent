import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api/v1",
  headers: { "Content-Type": "application/json" },
});

/* ─── Types ─── */

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
  status: "pending" | "planning" | "running" | "completed" | "failed";
  steps: Step[];
  result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
  total_tokens: number;
  execution_time_ms: number;
}

export interface ActionVisual {
  action?: string;
  selector?: string;
  text?: string;
}

export interface ExecutionUpdate {
  task_id: string;
  type:
    | "frame"
    | "step_started"
    | "step_completed"
    | "step_failed"
    | "task_completed"
    | "screenshot"
    | "error";
  step?: Step;
  message?: string;
  screenshot_base64?: string;
  url?: string;
  title?: string;
  fps?: number;
  action_visual?: ActionVisual;
  timestamp?: string;
}

/* ─── API Client ─── */

export const taskApi = {
  create: (goal: string, target_url?: string) =>
    api.post<Task>("/tasks", { goal, target_url }),
  list: () => api.get<Task[]>("/tasks"),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  execute: (id: string) => api.post<Task>(`/tasks/${id}/execute`),
  cancel: (id: string) => api.post(`/tasks/${id}/cancel`),
};
