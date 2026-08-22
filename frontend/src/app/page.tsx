"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  TrendingUp,
  Zap,
  Radio,
  Send,
  Loader2,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { taskApi, type Task } from "@/lib/api";
import { cn, timeAgo, formatDuration } from "@/lib/utils";
import TaskCard from "@/components/TaskCard";

/* ─── Status helpers ─── */
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

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Quick Execute form state ── */
  const [goal, setGoal] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ── Fetch tasks on mount & poll ── */
  const fetchTasks = async () => {
    try {
      const res = await taskApi.list();
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* Gracefully handle if backend is starting */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ── Derived metrics ── */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const successRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgSpeed =
    completedTasks > 0
      ? Math.round(
          tasks
            .filter((t) => t.status === "completed")
            .reduce((sum, t) => sum + t.execution_time_ms, 0) / completedTasks
        )
      : 0;
  const activeSessions = tasks.filter(
    (t) => t.status === "running" || t.status === "planning"
  ).length;

  /* ── Submit handler ── */
  async function handleExecute(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await taskApi.create(goal.trim(), targetUrl.trim() || undefined);
      const taskId = created.data.id;
      await taskApi.execute(taskId);
      router.push(`/execute?id=${taskId}`);
    } catch (err: unknown) {
      console.error("Execute failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to trigger execution";
      setErrorMessage(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskCard
          title="Total Tasks"
          value={totalTasks}
          icon={ListTodo}
          accentColor="violet"
          className="animate-slide-up"
        />
        <TaskCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          accentColor="emerald"
          className="animate-slide-up animate-delay-100"
        />
        <TaskCard
          title="Avg Speed"
          value={formatDuration(avgSpeed)}
          icon={Zap}
          accentColor="amber"
          className="animate-slide-up animate-delay-200"
        />
        <TaskCard
          title="Active Sessions"
          value={activeSessions}
          icon={Radio}
          accentColor="sky"
          className="animate-slide-up animate-delay-300"
        />
      </div>

      {/* ─── Quick Execute Panel ─── */}
      <div className="glass-card p-6 animate-slide-up animate-delay-400">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          Quick Execute
        </h2>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleExecute} className="space-y-4">
          <textarea
            id="goal-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder='Enter goal, e.g. "Find the top 3 trending Python repos on GitHub"'
            rows={3}
            className="input-field resize-none"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="target-url-input"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Target URL (e.g. https://github.com/trending)"
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={submitting || !goal.trim()}
              className={cn(
                "gradient-button flex items-center justify-center gap-2 min-w-[160px]",
                (submitting || !goal.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? "Executing…" : "Execute"}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Recent Tasks Table ─── */}
      <div className="glass-card overflow-hidden animate-slide-up animate-delay-400">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-violet-400" />
            Recent Tasks
          </h2>
          <span className="text-xs text-slate-500">Auto-updating</span>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">No tasks yet. Create one above to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                onClick={() => router.push(`/execute?id=${task.id}`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Goal */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-violet-300 transition-colors">
                    {task.goal}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timeAgo(task.created_at)} · {task.steps?.length || 0} steps
                    {task.execution_time_ms > 0 &&
                      ` · ${formatDuration(task.execution_time_ms)}`}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={cn(
                    "status-badge border text-xs",
                    statusClasses(task.status)
                  )}
                >
                  {task.status}
                </span>

                {/* Action */}
                <div className="p-2 rounded-lg text-slate-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
