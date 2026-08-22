import React from 'react';
import { Globe, Lock, RefreshCw, Loader2, Monitor } from 'lucide-react';

interface BrowserViewProps {
  currentUrl?: string;
  screenshotUrl?: string | null;
  screenshotBase64?: string | null;
  isLoading?: boolean;
}

export default function BrowserView({
  currentUrl = 'https://www.google.com',
  screenshotUrl,
  screenshotBase64,
  isLoading = false,
}: BrowserViewProps) {
  const imageSrc = screenshotBase64 
    ? `data:image/png;base64,${screenshotBase64}`
    : screenshotUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Chrome Window Header Bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-2xl flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-mono text-slate-300">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{currentUrl}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 hover:text-slate-200 cursor-pointer transition-colors" />
          <Monitor className="w-3.5 h-3.5 text-violet-400" />
        </div>
      </div>

      {/* Viewport Screenshot Display */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[360px]">
        {isLoading && !screenshotBase64 && !screenshotUrl ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="text-xs font-medium">Launching Chromium Session...</span>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={imageSrc}
              alt="Browser Viewport"
              className="w-full h-full object-cover object-top transition-opacity duration-300"
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 border border-violet-500/30 rounded-md text-[10px] font-mono text-violet-300 flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
              LIVE VIEWPORT
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
