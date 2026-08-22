"use client";

import { cn } from "@/lib/utils";
import type { Step } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
} from "lucide-react";

/* ─── Action icon mapping ─── */
const actionIcons: Record<string, string> = {
  navigate: "🧭",
  click: "👆",
  type: "⌨️",
  extract: "📋",
  screenshot: "📸",
  scroll: "📜",
  wait: "⏳",
  done: "✅",
};

function formatResult(result: string | null): string | null {
  if (!result) return null;
  if (result.startsWith("{")) {
    try {
      const parsed = JSON.parse(result);
      if (parsed.summary) return parsed.summary;
      if (parsed.error) return `Error: ${parsed.error}`;
      if (parsed.title) return `Page: ${parsed.title}`;
      if (parsed.url) return `Navigated to ${parsed.url}`;
      if (parsed.text) return `Typed "${parsed.text}"`;
      if (parsed.selector) return `Target: ${parsed.selector}`;
    } catch {
      // Return as is if not valid JSON
    }
  }
  return result;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-400" />;
    case "running":
      return <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />;
    default:
      return <Circle className="w-4 h-4 text-slate-600" />;
  }
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "failed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "running":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

interface ExecutionTimelineProps {
  steps: Step[];
  className?: string;
}

export default function ExecutionTimeline({
  steps,
  className,
}: ExecutionTimelineProps) {
  return (
    <div className={cn("glass-card p-5", className)}>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
        Execution Timeline
      </h3>

      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Waiting for agent to start…</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 via-slate-700/40 to-transparent" />

          <div className="space-y-1">
            {steps.map((step, i) => {
              const isActive = step.status === "running";
              const isFailed = step.status === "failed";
              const icon = actionIcons[step.action] || "🔹";
              const formattedResult = formatResult(step.result);

              return (
                <div
                  key={step.step_number}
                  className={cn(
                    "relative flex items-start gap-3 p-3 rounded-xl transition-all duration-300",
                    isActive && "bg-violet-500/5 glow-ring",
                    isFailed && "bg-red-500/5 border border-red-500/20",
                    !isActive && !isFailed && "hover:bg-slate-800/30"
                  )}
                  style={{
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  {/* Step number circle */}
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-9 h-9 rounded-full border text-sm font-bold shrink-0",
                      isActive
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                        : isFailed
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : step.status === "completed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-800/60 border-slate-700 text-slate-500"
                    )}
                  >
                    {step.step_number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base" title={step.action}>
                        {icon}
                      </span>
                      <span className="text-sm font-semibold text-slate-200 capitalize">
                        {step.action}
                      </span>
                      <span
                        className={cn(
                          "status-badge text-[10px] border",
                          getStatusBadgeClasses(step.status)
                        )}
                      >
                        {getStatusIcon(step.status)}
                        {step.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono truncate" title={step.target}>
                      {step.target}
                    </p>
                    {formattedResult && (
                      <p className={cn(
                        "text-xs mt-1 leading-relaxed",
                        isFailed ? "text-red-400/90 font-medium" : "text-slate-400"
                      )}>
                        {formattedResult}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
