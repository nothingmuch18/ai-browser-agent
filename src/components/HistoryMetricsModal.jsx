import React from 'react';
import { X, CheckCircle2, Clock, Zap, Cpu, Award, Trash2 } from 'lucide-react';

export default function HistoryMetricsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sessionHistory = [
    {
      id: "run_8912",
      prompt: "Search for Wireless Noise Canceling Headphones and extract top 3 items",
      url: "https://www.amazon.com",
      status: "SUCCEEDED",
      duration: "1.8s",
      steps: 5,
      tokens: 2840,
      timestamp: "11:15:08"
    },
    {
      id: "run_8911",
      prompt: "Find lowest non-stop flight from NYC to LHR for next Friday",
      url: "https://www.kayak.com",
      status: "SUCCEEDED",
      duration: "2.4s",
      steps: 7,
      tokens: 4120,
      timestamp: "10:42:15"
    },
    {
      id: "run_8910",
      prompt: "Auto-fill checkout shipping address form on Demo Store",
      url: "https://demo-store.shop",
      status: "SUCCEEDED",
      duration: "1.2s",
      steps: 4,
      tokens: 1980,
      timestamp: "09:30:00"
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 10, 19, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Modal Header */}
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }} className="gradient-text">
              AGENT SESSION HISTORY & METRICS
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Performance benchmarks, task completion logs, and token usage analytics.
            </p>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.3rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Metrics Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <Award size={18} color="var(--accent-emerald)" style={{ marginBottom: '0.2rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>100%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Success Rate</div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <Clock size={18} color="var(--accent-cyan)" style={{ marginBottom: '0.2rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>1.8s</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg Task Speed</div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <Zap size={18} color="var(--accent-amber)" style={{ marginBottom: '0.2rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>5.3</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg Steps / Task</div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <Cpu size={18} color="var(--accent-purple)" style={{ marginBottom: '0.2rem' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>8,940</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Tokens</div>
          </div>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sessionHistory.map((run) => (
            <div key={run.id} className="glass-card" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>{run.id}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{run.status}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{run.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0, color: '#fff' }}>{run.prompt}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{run.url}</span>
              </div>

              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div>Duration: <strong style={{ color: '#fff' }}>{run.duration}</strong></div>
                <div>Steps: <strong style={{ color: 'var(--accent-cyan)' }}>{run.steps}</strong></div>
                <div>Tokens: <strong style={{ color: 'var(--accent-emerald)' }}>{run.tokens}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
