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
  Radio,
  Wifi,
  Sparkles,
} from "lucide-react";
import { taskApi, type Task, type Step, type ExecutionUpdate, type ActionVisual } from "@/lib/api";
import { cn, formatDuration } from "@/lib/utils";
import BrowserView from "@/components/BrowserView";
import ExecutionTimeline from "@/components/ExecutionTimeline";

function ExecuteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get("id");

  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("about:blank");
  const [pageTitle, setPageTitle] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamFps, setStreamFps] = useState(0);
  const [actionVisual, setActionVisual] = useState<ActionVisual | null>(null);
  const [taskDone, setTaskDone] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /* ── Periodic HTTP sync as fallback/hydration layer ── */
  useEffect(() => {
    if (!taskId) return;
    const fetchCurrentTask = async () => {
      try {
        const res = await taskApi.get(taskId);
        setTask(res.data);
        if (res.data.steps?.length) {
          setSteps(res.data.steps);

          // Update URL if we haven't received a live frame yet
          const navStep = [...res.data.steps].reverse().find(
            (s) => s.action === "navigate" || s.target?.startsWith("http")
          );
          if (navStep?.target && (!currentUrl || currentUrl === "about:blank")) {
            setCurrentUrl(navStep.target);
          }
        }
        if (res.data.total_tokens) setTokens(res.data.total_tokens);
        if (res.data.status === "completed" || res.data.status === "failed") {
          setTaskDone(true);
          setIsStreaming(false);
        }
      } catch (err) {
        console.error("Task sync error:", err);
      }
    };

    fetchCurrentTask();
    if (!taskDone) {
      const interval = setInterval(fetchCurrentTask, 1500);
      return () => clearInterval(interval);
    }
  }, [taskId, taskDone, currentUrl]);

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

  /* ── WebSocket live browser screen streaming & event hub ── */
  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWebSocket = () => {
      if (!isMounted) return;

      const ws = new WebSocket(`ws://localhost:8001/api/v1/ws/tasks/${taskId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setWsConnected(true);
        setIsStreaming(!taskDone);

        // Setup ping/pong heartbeat keepalive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 5000);
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setWsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Auto reconnect if task is still running
        if (!taskDone) {
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        if (!isMounted) return;
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const update: ExecutionUpdate = JSON.parse(event.data);

          // 1. Live Browser Screen Frame
          if (update.type === "frame" || update.screenshot_base64) {
            if (update.screenshot_base64) {
              setLiveFrame(update.screenshot_base64);
            }
            if (update.url) {
              setCurrentUrl(update.url);
            }
            if (update.title) {
              setPageTitle(update.title);
            }
            if (update.fps !== undefined) {
              setStreamFps(update.fps);
            }
            if (update.action_visual) {
              setActionVisual(update.action_visual);
            }
            setIsStreaming(true);
          }

          // 2. Timeline Step Updates
          if (update.step) {
            setSteps((prev) => {
              const existing = prev.findIndex((s) => s.step_number === update.step!.step_number);
              if (existing >= 0) {
                const copy = [...prev];
                copy[existing] = update.step!;
                return copy;
              }
              return [...prev, update.step!];
            });

            if (update.step.action === "navigate" && update.step.target) {
              setCurrentUrl(update.step.target);
            }
          }

          // 3. Task Completion
          if (update.type === "task_completed" || update.type === "step_failed") {
            setTaskDone(true);
            setIsStreaming(false);
            setActionVisual(null);
          }
        } catch (err) {
          console.debug("WS message parse error:", err);
        }
      };
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [taskId, taskDone]);

  /* ── Cancel handler ── */
  const handleCancel = useCallback(async () => {
    if (!taskId) return;
    try {
      await taskApi.cancel(taskId);
      setTaskDone(true);
      setIsStreaming(false);
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  }, [taskId]);

  /* ── Guard ── */
  if (!taskId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4">
        <p className="text-sm">No task ID specified.</p>
        <button onClick={() => router.push("/")} className="gradient-button text-sm">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const latestStepScreenshot = [...steps].reverse().find((s) => s.screenshot_url)?.screenshot_url || null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-700/50 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Live Browser Session</h1>
              {isStreaming && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>
            {task && <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">{task.goal}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* WebSocket Status */}
          <div
            className={cn(
              "status-badge border text-xs gap-1.5",
              wsConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
            )}
          >
            {wsConnected ? <Radio className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
            {wsConnected ? (isStreaming ? "Streaming Live" : "Connected") : "Disconnected"}
          </div>

          {/* Tokens */}
          <div className="status-badge bg-slate-800/60 text-slate-300 border border-slate-700/50">
            <Coins className="w-3 h-3 text-amber-400" />
            {tokens.toLocaleString()} tokens
          </div>

          {/* Elapsed Time */}
          <div className="status-badge bg-slate-800/60 text-slate-300 border border-slate-700/50">
            <Clock className="w-3 h-3 text-sky-400" />
            {formatDuration(taskDone && task?.execution_time_ms ? task.execution_time_ms : elapsedMs)}
          </div>

          {/* Status / Cancel */}
          {taskDone ? (
            <div className="status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </div>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Task
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Execution Split View ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left — Live Browser Stream (7 cols / ~60%) */}
        <div className="lg:col-span-7 flex flex-col">
          <BrowserView
            url={currentUrl}
            screenshotBase64={liveFrame}
            screenshotUrl={!liveFrame ? latestStepScreenshot : null}
            isLoading={!taskDone && steps.length === 0 && !liveFrame}
            isStreaming={isStreaming}
            fps={streamFps}
            actionVisual={actionVisual}
            className="flex-1 min-h-[480px]"
          />
        </div>

        {/* Right — Live Synchronized Execution Timeline (5 cols / ~40%) */}
        <div className="lg:col-span-5 flex flex-col">
          <ExecutionTimeline
            steps={steps}
            className="flex-1 max-h-[75vh] overflow-y-auto"
          />
        </div>
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
