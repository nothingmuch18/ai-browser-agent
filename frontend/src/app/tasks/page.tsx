"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  Loader2,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
} from "lucide-react";
import { taskApi, type Task } from "@/lib/api";
import { cn, timeAgo, formatDuration } from "@/lib/utils";

function statusClasses(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "failed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "running":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "planning":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "failed":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case "running":
      return <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />;
    case "planning":
      return <PlayCircle className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  }
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.list();
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ListTodo className="w-7 h-7 text-violet-400" />
            Task Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View history, live execution status, and logs of all browser tasks.
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700/80 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-violet-400")} />
          Refresh
        </button>
      </div>

      {/* Tasks Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            <p className="text-sm text-slate-500">Loading task records...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-base font-medium text-slate-300">No tasks created yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Start an autonomous browser task from the Dashboard.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => router.push(`/execute?id=${task.id}`)}
                className="flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-slate-100 truncate text-base">
                      {task.goal}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>Created {timeAgo(task.created_at)}</span>
                    <span>•</span>
                    <span>{task.steps?.length || 0} steps</span>
                    {task.execution_time_ms > 0 && (
                      <>
                        <span>•</span>
                        <span>Duration: {formatDuration(task.execution_time_ms)}</span>
                      </>
                    )}
                    <span className="font-mono text-slate-500 text-[11px] truncate max-w-[140px]">
                      ID: {task.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={cn(
                      "status-badge border text-xs gap-1.5",
                      statusClasses(task.status)
                    )}
                  >
                    <StatusIcon status={task.status} />
                    {task.status}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-violet-300 group-hover:bg-violet-500/20 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
