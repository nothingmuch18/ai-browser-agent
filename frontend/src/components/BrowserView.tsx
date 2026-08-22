"use client";

import { cn } from "@/lib/utils";
import { Globe, Lock, RotateCw } from "lucide-react";

interface BrowserViewProps {
  url?: string;
  screenshotBase64?: string | null;
  screenshotUrl?: string | null;
  isLoading?: boolean;
  className?: string;
}

export default function BrowserView({
  url = "about:blank",
  screenshotBase64,
  screenshotUrl,
  isLoading = false,
  className,
}: BrowserViewProps) {
  const resolvedUrl =
    screenshotUrl && screenshotUrl.startsWith("/")
      ? `http://localhost:8001${screenshotUrl}`
      : screenshotUrl;

  const imageSrc = screenshotBase64
    ? `data:image/png;base64,${screenshotBase64}`
    : resolvedUrl || null;

  return (
    <div
      className={cn(
        "glass-card overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Browser Chrome Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40 border-b border-slate-700/50">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <button className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors" />
          <button className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors" />
          <button className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors" />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 text-slate-500">
          <button className="p-1 rounded hover:bg-slate-700/50 transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5">
          <Lock className="w-3 h-3 text-slate-500" />
          <span className="text-xs text-slate-400 truncate font-mono">
            {url}
          </span>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 min-h-[320px] bg-slate-950/80">
        {isLoading ? (
          /* Skeleton loader */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className="skeleton w-full h-8 rounded-lg" />
            <div className="skeleton w-3/4 h-6 rounded-lg" />
            <div className="skeleton w-full h-40 rounded-lg" />
            <div className="skeleton w-5/6 h-6 rounded-lg" />
            <div className="skeleton w-2/3 h-6 rounded-lg" />
            <div className="flex items-center gap-2 mt-4">
              <Globe className="w-5 h-5 text-slate-600 animate-pulse" />
              <span className="text-sm text-slate-600">Loading page…</span>
            </div>
          </div>
        ) : imageSrc ? (
          /* Screenshot */
          <img
            src={imageSrc}
            alt="Browser screenshot"
            className="w-full h-full object-contain"
          />
        ) : (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
            <Globe className="w-10 h-10" />
            <p className="text-sm">Waiting for navigation…</p>
          </div>
        )}
      </div>
    </div>
  );
}
