import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Clock, Code, ChevronRight, CornerDownRight } from 'lucide-react';

export default function ExecutionFeed({ steps, activeStepId }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const getActionBadgeStyle = (action) => {
    switch (action) {
      case 'NAVIGATE': return { bg: 'rgba(79, 172, 254, 0.15)', color: '#4facfe', border: 'rgba(79, 172, 254, 0.4)' };
      case 'CLICK': return { bg: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', border: 'rgba(0, 242, 254, 0.4)' };
      case 'TYPE': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.4)' };
      case 'EXTRACT': return { bg: 'rgba(0, 245, 212, 0.15)', color: '#00f5d4', border: 'rgba(0, 245, 212, 0.4)' };
      default: return { bg: 'rgba(255, 183, 3, 0.15)', color: '#ffb703', border: 'rgba(255, 183, 3, 0.4)' };
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.9)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Action Execution Feed</h2>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {steps.length} Steps Completed
        </span>
      </div>

      {/* Steps List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        {steps.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.82rem' }}>
            Ready to execute. Enter prompt and click <strong>Run Agent</strong> to launch task.
          </div>
        ) : (
          steps.map((step) => {
            const badgeStyle = getActionBadgeStyle(step.action);
            const isActive = activeStepId === step.id;

            return (
              <div 
                key={step.id}
                className="glass-card"
                style={{
                  padding: '0.65rem 0.8rem',
                  borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  boxShadow: isActive ? 'var(--shadow-glow-cyan)' : 'none',
                  background: isActive ? 'rgba(0, 242, 254, 0.04)' : 'var(--bg-card)'
                }}
              >
                {/* Step Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      #{step.id}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {step.action}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={11} />
                      {step.duration}
                    </span>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" />
                  </div>
                </div>

                {/* Agent Thought Reasoning */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0 0 0.3rem 0', lineHeight: '1.35', fontWeight: 500 }}>
                  {step.thought}
                </p>

                {/* Target Selector / Action Payload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', background: 'rgba(0, 0, 0, 0.3)', padding: '0.25rem 0.45rem', borderRadius: '4px' }}>
                  <CornerDownRight size={12} color="var(--text-secondary)" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {step.target} {step.value ? `➔ "${step.value}"` : ''}
                  </span>
                </div>

                {/* Expand JSON Details Toggle */}
                <div 
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem', cursor: 'pointer' }}
                >
                  <Code size={11} />
                  <span>{expandedStep === step.id ? 'Hide Parameters' : 'View Payload JSON'}</span>
                  <ChevronRight size={11} style={{ transform: expandedStep === step.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {/* Expanded JSON Inspector */}
                {expandedStep === step.id && (
                  <pre style={{
                    marginTop: '0.4rem',
                    background: '#070a13',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-cyan)',
                    overflowX: 'auto'
                  }}>
                    {JSON.stringify({
                      step: step.id,
                      action: step.action,
                      selector: step.target,
                      timestamp: step.timestamp,
                      bbox: step.bbox || null,
                    }, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
