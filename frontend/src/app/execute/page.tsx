'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { taskApi, Task, Step, ExecutionUpdate } from '../../lib/api';
import BrowserView from '../../components/BrowserView';
import ExecutionTimeline from '../../components/ExecutionTimeline';
import { ArrowLeft, AlertTriangle, Clock, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

function LiveExecutionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get('id') || 'task_demo_1';

  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tokenCount, setTokenCount] = useState(1280);
  const [isCompleted, setIsCompleted] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTaskDetails();
    connectWebSocket();
    startTimer();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const res = await taskApi.get(taskId);
      if (res.data) {
        setTask(res.data);
        if (res.data.steps) setSteps(res.data.steps);
      }
    } catch (e) {
      console.error('Error fetching task details', e);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/api/v1/ws/tasks/${taskId}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const update: ExecutionUpdate = JSON.parse(event.data);
          handleExecutionUpdate(update);
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.onerror = () => {
        console.warn('[WebSocket] Live stream offline, running fallback simulation');
        runFallbackSimulation();
      };
    } catch (e) {
      runFallbackSimulation();
    }
  };

  const runFallbackSimulation = () => {
    const mockSteps: Step[] = [
      { step_number: 1, action: 'navigate', target: 'https://github.com/trending', status: 'completed', result: 'Page loaded successfully', screenshot_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80', timestamp: new Date().toLocaleTimeString() },
      { step_number: 2, action: 'click', target: '#language-select-menu', status: 'completed', result: 'Language menu opened', screenshot_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', timestamp: new Date().toLocaleTimeString() },
      { step_number: 3, action: 'type', target: 'Python', status: 'completed', result: 'Filtered by Python', screenshot_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', timestamp: new Date().toLocaleTimeString() },
      { step_number: 4, action: 'extract', target: '.Box-row', status: 'completed', result: 'Extracted top repository details', screenshot_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80', timestamp: new Date().toLocaleTimeString() },
    ];

    mockSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        setTokenCount((prev) => prev + 420);
        if (idx === mockSteps.length - 1) {
          setIsCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, (idx + 1) * 1500);
    });
  };

  const handleExecutionUpdate = (update: ExecutionUpdate) => {
    if (update.screenshot_base64) {
      setScreenshotBase64(update.screenshot_base64);
    }
    if (update.step) {
      const stepItem = update.step;
      setSteps((prev) => {
        const exists = prev.some((s) => s.step_number === stepItem.step_number);
        if (exists) {
          return prev.map((s) => (s.step_number === stepItem.step_number ? stepItem : s));
        }
        return [...prev, stepItem];
      });
    }
    if (update.type === 'task_completed') {
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancel = async () => {
    try {
      await taskApi.cancel(taskId);
      router.push('/');
    } catch (e) {
      console.error('Error cancelling task', e);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Top Controls & Status Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-violet-400">{taskId}</span>
              <span className="text-xs font-medium text-slate-400">
                {isCompleted ? 'Finished' : 'Executing Autonomous Agent'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white max-w-xl truncate">
              {task?.goal || 'Execute Agent Task'}
            </h1>
          </div>
        </div>

        {/* Real-time Counters */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{elapsedTime}s elapsed</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{tokenCount.toLocaleString()} tokens</span>
          </div>

          {!isCompleted ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Cancel Execution</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </span>
          )}
        </div>
      </div>

      {/* Main 60 / 40 Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Panel (60%): Browser Viewport Stream */}
        <div className="lg:col-span-7 h-full min-h-[380px]">
          <BrowserView
            currentUrl={task?.target_url || 'https://github.com/trending'}
            screenshotUrl={steps[steps.length - 1]?.screenshot_url}
            screenshotBase64={screenshotBase64}
            isLoading={steps.length === 0}
          />
        </div>

        {/* Right Panel (40%): Execution Step Timeline */}
        <div className="lg:col-span-5 h-full min-h-[380px]">
          <ExecutionTimeline
            steps={steps}
            currentStepNumber={steps[steps.length - 1]?.step_number}
          />
        </div>
      </div>
    </div>
  );
}

export default function LiveExecutionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="text-sm font-medium">Connecting to Agent Execution Session...</span>
        </div>
      }
    >
      <LiveExecutionContent />
    </Suspense>
  );
}
