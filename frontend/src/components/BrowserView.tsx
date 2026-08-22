"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Globe,
  Lock,
  RotateCw,
  Maximize2,
  Minimize2,
  Activity,
  Wifi,
  Radio,
  ExternalLink,
} from "lucide-react";

interface ActionVisual {
  action?: string;
  selector?: string;
  text?: string;
}

interface BrowserViewProps {
  url?: string;
  screenshotBase64?: string | null;
  screenshotUrl?: string | null;
  isLoading?: boolean;
  isStreaming?: boolean;
  fps?: number;
  actionVisual?: ActionVisual | null;
  className?: string;
}

export default function BrowserView({
  url = "about:blank",
  screenshotBase64,
  screenshotUrl,
  isLoading = false,
  isStreaming = false,
  fps = 0,
  actionVisual,
  className,
}: BrowserViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resolvedUrl =
    screenshotUrl && screenshotUrl.startsWith("/")
      ? `http://localhost:8001${screenshotUrl}`
      : screenshotUrl;

  const imageSrc = screenshotBase64
    ? `data:image/jpeg;base64,${screenshotBase64}`
    : resolvedUrl || null;

  return (
    <div
      className={cn(
        "glass-card overflow-hidden flex flex-col transition-all duration-300 relative group",
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-slate-950/95" : "",
        className
      )}
    >
      {/* Browser Chrome Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
        </div>

        {/* Reload / Refresh icon */}
        <div className="flex items-center gap-1 text-slate-500 shrink-0">
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors" title="Reload View">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1.5 min-w-0">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300 truncate font-mono select-all">
            {url || "about:blank"}
          </span>
          {url && url.startsWith("http") && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-slate-500 hover:text-slate-300 p-0.5"
              title="Open link in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Live Stream Status & FPS */}
        <div className="flex items-center gap-2 shrink-0">
          {isStreaming ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-medium animate-pulse">
              <Radio className="w-3 h-3 animate-spin" />
              <span>LIVE</span>
              {fps > 0 && <span className="opacity-80">({fps} FPS)</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[11px] font-mono">
              <Wifi className="w-3 h-3" />
              <span>STANDBY</span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Current Action Banner */}
      {actionVisual && (
        <div className="bg-violet-950/60 border-b border-violet-800/40 px-4 py-1.5 text-xs text-violet-300 flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            <span className="font-semibold uppercase text-violet-400">{actionVisual.action}:</span>
            <span className="text-slate-300 truncate">{actionVisual.selector || actionVisual.text || "Executing..."}</span>
          </div>
          {actionVisual.text && <span className="text-emerald-400 truncate max-w-[200px]">"{actionVisual.text}"</span>}
        </div>
      )}

      {/* Main Viewport */}
      <div className="relative flex-1 min-h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
        {imageSrc ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <img
              src={imageSrc}
              alt="Live Browser Stream"
              className="w-full h-full object-contain max-h-[75vh]"
            />
          </div>
        ) : isLoading ? (
          /* Skeleton Loader */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-slate-950/90">
            <div className="skeleton w-full h-8 rounded-lg" />
            <div className="skeleton w-3/4 h-6 rounded-lg" />
            <div className="skeleton w-full h-48 rounded-lg" />
            <div className="skeleton w-2/3 h-6 rounded-lg" />
            <div className="flex items-center gap-2 mt-4 text-violet-400 font-mono text-sm">
              <Activity className="w-5 h-5 animate-pulse" />
              <span>Connecting live browser stream…</span>
            </div>
          </div>
        ) : (
          /* Idle / Waiting state */
          <div className="flex flex-col items-center justify-center gap-3 text-slate-500 py-16">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-slate-400">
              <Globe className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-medium text-slate-400">Waiting for browser navigation…</p>
            <p className="text-xs text-slate-600">The live screen stream will display here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
