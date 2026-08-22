import React from 'react';
import { Step } from '../lib/api';
import { Compass, MousePointerClick, Keyboard, FileText, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

interface ExecutionTimelineProps {
  steps: Step[];
  currentStepNumber?: number;
}

export default function ExecutionTimeline({ steps, currentStepNumber }: ExecutionTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'navigate': return <Compass className="w-4 h-4 text-sky-400" />;
      case 'click': return <MousePointerClick className="w-4 h-4 text-violet-400" />;
      case 'type': return <Keyboard className="w-4 h-4 text-purple-400" />;
      case 'extract': return <FileText className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Timeline Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Execution Steps</h3>
        <span className="text-xs font-mono text-slate-400">{steps.length} Steps</span>
      </div>

      {/* Steps List Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
            <span>Waiting for task execution to start...</span>
          </div>
        ) : (
          steps.map((step) => {
            const isActive = currentStepNumber === step.step_number || step.status === 'running';
            const isCompleted = step.status === 'completed';

            return (
              <div
                key={step.step_number}
                className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Step Icon Badge */}
                <div className="p-2 rounded-md bg-slate-900 border border-slate-800 shrink-0">
                  {getActionIcon(step.action)}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#{step.step_number}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                        {step.action}
                      </span>
                    </div>

                    {/* Status Indicator */}
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs font-mono text-slate-300 truncate bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60">
                    {step.target}
                  </p>

                  {step.result && (
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                      {step.result}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
