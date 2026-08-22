"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TaskCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: "violet" | "emerald" | "amber" | "sky";
  className?: string;
}

const accentMap = {
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "shadow-violet-500/5",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/5",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/5",
  },
  sky: {
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    text: "text-sky-400",
    glow: "shadow-sky-500/5",
  },
};

export default function TaskCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "violet",
  className,
}: TaskCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div
      className={cn(
        "glass-card-hover p-5 flex flex-col gap-3",
        `hover:shadow-lg ${accent.glow}`,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl border",
            accent.bg,
            accent.border
          )}
        >
          <Icon className={cn("w-4.5 h-4.5", accent.text)} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-50 tracking-tight">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 pb-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
