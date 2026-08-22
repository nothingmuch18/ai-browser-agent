"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  XCircle,
  Coins,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { taskApi, type Task, type Step, type ExecutionUpdate } from "@/lib/api";
import { cn, formatDuration } from "@/lib/utils";
import BrowserView from "@/components/BrowserView";
import ExecutionTimeline from "@/components/ExecutionTimeline";

function ExecuteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get("id");

  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("about:blank");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [taskDone, setTaskDone] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /* ── Fetch & sync task data ── */
  useEffect(() => {
    if (!taskId) return;
    const fetchCurrentTask = async () => {
      try {
        const res = await taskApi.get(taskId);
        setTask(res.data);
        if (res.data.steps?.length) {
          setSteps(res.data.steps);
          
          // Find latest navigation URL
          const navStep = [...res.data.steps].reverse().find(
            (s) => s.action === "navigate" || s.target?.startsWith("http")
          );
          if (navStep?.target) {
            setCurrentUrl(navStep.target);
          } else if (res.data.target_url) {
            setCurrentUrl(res.data.target_url);
          }

          // Set latest step's screenshot url if no base64 received
          const lastWithScreenshot = [...res.data.steps].reverse().find((s) => s.screenshot_url);
          if (lastWithScreenshot?.screenshot_url && !screenshot) {
            setScreenshot(null); // let BrowserView load screenshot_url
          }
        }
        if (res.data.total_tokens) setTokens(res.data.total_tokens);
        if (res.data.status === "completed" || res.data.status === "failed") {
          setTaskDone(true);
        }
      } catch (err) {
        console.error("Failed to fetch task", err);
      }
    };

    fetchCurrentTask();
    if (!taskDone) {
      const interval = setInterval(fetchCurrentTask, 1200);
      return () => clearInterval(interval);
    }
  }, [taskId, taskDone, screenshot]);

  /* ── Elapsed time ticker ── */
  useEffect(() => {
    if (taskDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskDone]);

  /* ── WebSocket connection ── */
  useEffect(() => {
    if (!taskId || taskDone) return;

    const ws = new WebSocket(
      `ws://localhost:8001/api/v1/ws/tasks/${taskId}`
    );
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const update: ExecutionUpdate = JSON.parse(event.data);

        if (update.screenshot_base64) {
          setScreenshot(update.screenshot_base64);
        }

        if (update.step) {
          setSteps((prev) => {
            const existing = prev.findIndex(
              (s) => s.step_number === update.step!.step_number
            );
            if (existing >= 0) {
              const copy = [...prev];
              copy[existing] = update.step!;
              return copy;
            }
            return [...prev, update.step!];
          });

          /* Update URL from navigate actions */
          if (
            update.step.action === "navigate" &&
            update.step.target
          ) {
            setCurrentUrl(update.step.target);
          }
        }

        if (
          update.type === "task_completed" ||
          update.type === "step_failed"
        ) {
          setTaskDone(true);
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [taskId, taskDone]);

  /* ── Cancel handler ── */
  const handleCancel = useCallback(async () => {
    if (!taskId) return;
    try {
      await taskApi.cancel(taskId);
      setTaskDone(true);
    } catch (err) {
      console.error("Cancel failed", err);
    }
  }, [taskId]);

  /* ── Guard ── */
  if (!taskId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4">
        <p className="text-sm">No task ID specified.</p>
        <button
          onClick={() => router.push("/")}
          className="gradient-button text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Header Bar ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-100">
              Live Execution
            </h1>
            {task && (
              <p className="text-xs text-slate-500 truncate max-w-md">
                {task.goal}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* WS status indicator */}
          <div
            className={cn(
              "status-badge border text-xs",
              wsConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                wsConnected ? "bg-emerald-400" : "bg-slate-500"
              )}
            />
            {wsConnected ? "Live" : "Disconnected"}
          </div>

          {/* Token counter */}
          <div className="status-badge bg-slate-800/60 text-slate-300 border border-slate-700/50">
            <Coins className="w-3 h-3 text-amber-400" />
            {tokens.toLocaleString()} tokens
          </div>

          {/* Elapsed time */}
          <div className="status-badge bg-slate-800/60 text-slate-300 border border-slate-700/50">
            <Clock className="w-3 h-3 text-sky-400" />
            {formatDuration(
              taskDone && task?.execution_time_ms
                ? task.execution_time_ms
                : elapsedMs
            )}
          </div>

          {/* Cancel / Done button */}
          {taskDone ? (
            <div className="status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </div>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ─── Split View ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-[520px]">
        {/* Left — Browser (60%) */}
        <BrowserView
          url={currentUrl}
          screenshotBase64={screenshot}
          screenshotUrl={
            [...steps].reverse().find((s) => s.screenshot_url)?.screenshot_url || null
          }
          isLoading={!taskDone && steps.length === 0}
          className="lg:col-span-3 min-h-[480px]"
        />

        {/* Right — Timeline (40%) */}
        <ExecutionTimeline
          steps={steps}
          className="lg:col-span-2 max-h-[600px] overflow-y-auto"
        />
      </div>
    </div>
  );
}

export default function ExecutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <ExecuteContent />
    </Suspense>
  );
}
