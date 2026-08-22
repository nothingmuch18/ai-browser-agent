import React from 'react';
import { Bot, Cpu, Globe, History, AlertTriangle, Zap, Activity } from 'lucide-react';

export default function Header({ agentState, selectedModel, setSelectedModel, metrics, onOpenHistory, onEmergencyStop }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'RUNNING': return 'badge-running';
      case 'PAUSED': return 'badge-paused';
      case 'SUCCEEDED': return 'badge-success';
      case 'ERROR': return 'badge-error';
      default: return 'badge-idle';
    }
  };

  return (
    <header className="glass-panel" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            <Bot size={22} color="#070a13" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">AI BROWSER AGENT</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
              Autonomous Web Navigation & Vision Control
            </p>
          </div>
        </div>

        <div className={`badge ${getBadgeClass(agentState.status)}`}>
          {agentState.status === 'RUNNING' && <span className="pulse-dot"></span>}
          {agentState.status}
        </div>
      </div>

      {/* Center Metrics & Model Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
        {/* Model Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Cpu size={15} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Model:</span>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 600, padding: 0, cursor: 'pointer' }}
          >
            <option value="gemini-3.6-flash">Gemini 3.6 Flash (High)</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gpt-4o-vision">GPT-4o Vision</option>
          </select>
        </div>

        {/* Live Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <Activity size={14} color="var(--accent-emerald)" />
            <span>{metrics.fps} FPS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <Zap size={14} color="var(--accent-amber)" />
            <span>{metrics.latency}ms</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <Globe size={14} color="var(--accent-blue)" />
            <span>{metrics.tokens.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button className="btn-secondary" onClick={onOpenHistory} style={{ fontSize: '0.82rem' }}>
          <History size={15} />
          <span>History & Logs</span>
        </button>

        {agentState.status === 'RUNNING' && (
          <button className="btn-danger" onClick={onEmergencyStop} style={{ fontSize: '0.82rem' }}>
            <AlertTriangle size={15} />
            <span>Emergency Stop</span>
          </button>
        )}
      </div>
    </header>
  );
}
