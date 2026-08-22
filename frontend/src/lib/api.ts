import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
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
  target_url?: string;
  status: 'pending' | 'planning' | 'running' | 'completed' | 'failed';
  steps: Step[];
  result: Record<string, any> | null;
  created_at: string;
  completed_at: string | null;
  total_tokens: number;
  execution_time_ms: number;
}

export interface ExecutionUpdate {
  task_id: string;
  type: 'step_started' | 'step_completed' | 'step_failed' | 'task_completed' | 'screenshot';
  step?: Step;
  message: string;
  screenshot_base64?: string;
}

// In-memory mock storage for offline demonstration
const mockTasks: Map<string, Task> = new Map([
  [
    'task_demo_1',
    {
      id: 'task_demo_1',
      goal: 'Find top 3 trending Python repositories on GitHub',
      target_url: 'https://github.com/trending',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3590000).toISOString(),
      total_tokens: 3420,
      execution_time_ms: 2400,
      result: {
        repos: [
          { name: 'psf/black', stars: '38.4k', description: 'The uncompromising Python code formatter' },
          { name: 'tiangolo/fastapi', stars: '74.2k', description: 'FastAPI framework, high performance, easy to learn' },
          { name: 'vllm-project/vllm', stars: '24.1k', description: 'A high-throughput and memory-efficient LLM serving engine' }
        ]
      },
      steps: [
        { step_number: 1, action: 'navigate', target: 'https://github.com/trending', status: 'completed', result: 'Page loaded', screenshot_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80', timestamp: '11:40:01' },
        { step_number: 2, action: 'click', target: '#language-select-menu', status: 'completed', result: 'Language menu opened', screenshot_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', timestamp: '11:40:02' },
        { step_number: 3, action: 'type', target: 'Python', status: 'completed', result: 'Selected Python', screenshot_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', timestamp: '11:40:03' },
        { step_number: 4, action: 'extract', target: '.Box-row', status: 'completed', result: '3 repositories extracted', screenshot_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80', timestamp: '11:40:04' }
      ]
    }
  ]
]);

export const taskApi = {
  create: async (goal: string, target_url?: string): Promise<{ data: Task }> => {
    try {
      const res = await api.post<Task>('/tasks', { goal, target_url });
      return res;
    } catch (e) {
      console.warn('[taskApi] REST server offline, generating fallback task');
      const newTask: Task = {
        id: 'task_' + Math.random().toString(36).substring(2, 9),
        goal,
        target_url: target_url || 'https://www.google.com',
        status: 'pending',
        steps: [],
        result: null,
        created_at: new Date().toISOString(),
        completed_at: null,
        total_tokens: 0,
        execution_time_ms: 0,
      };
      mockTasks.set(newTask.id, newTask);
      return { data: newTask };
    }
  },

  list: async (): Promise<{ data: Task[] }> => {
    try {
      const res = await api.get<Task[]>('/tasks');
      return res;
    } catch (e) {
      return { data: Array.from(mockTasks.values()) };
    }
  },

  get: async (id: string): Promise<{ data: Task }> => {
    try {
      const res = await api.get<Task>(`/tasks/${id}`);
      return res;
    } catch (e) {
      const task = mockTasks.get(id) || Array.from(mockTasks.values())[0];
      return { data: task };
    }
  },

  execute: async (id: string): Promise<{ data: Task }> => {
    try {
      const res = await api.post<Task>(`/tasks/${id}/execute`);
      return res;
    } catch (e) {
      const task = mockTasks.get(id);
      if (task) task.status = 'running';
      return { data: task || (Array.from(mockTasks.values())[0]) };
    }
  },

  cancel: async (id: string): Promise<{ data: any }> => {
    try {
      return await api.post(`/tasks/${id}/cancel`);
    } catch (e) {
      const task = mockTasks.get(id);
      if (task) task.status = 'failed';
      return { data: { message: 'Cancelled' } };
    }
  },
};
