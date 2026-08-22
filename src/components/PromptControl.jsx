import React from 'react';
import { Play, RotateCcw, Sparkles, Globe, Sliders, Eye, Zap, Compass } from 'lucide-react';
import { PRESET_PROMPTS } from '../services/agentMockEngine';

export default function PromptControl({ 
  prompt, 
  setPrompt, 
  targetUrl, 
  setTargetUrl, 
  agentMode, 
  setAgentMode, 
  maxSteps, 
  setMaxSteps, 
  headless, 
  setHeadless,
  isRunning,
  onRun,
  onReset
}) {
  const loadPreset = (preset) => {
    setPrompt(preset.prompt);
    setTargetUrl(preset.url);
    if (preset.mode) setAgentMode(preset.mode);
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {/* Preset Quick Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Sparkles size={13} color="var(--accent-cyan)" />
          <span>Quick Prompts:</span>
        </div>
        {PRESET_PROMPTS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => loadPreset(preset)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              padding: '0.25rem 0.65rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* Inputs Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px auto', gap: '0.8rem', alignItems: 'center' }}>
        {/* Natural Language Prompt */}
        <div style={{ position: 'relative', width: '100%' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want the AI Browser Agent to do (e.g. Search products, fill out forms, extract data...)"
            rows={2}
            style={{
              width: '100%',
              resize: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.88rem',
              lineHeight: '1.3'
            }}
          />
        </div>

        {/* Target URL & Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.65rem' }}>
            <Globe size={14} color="var(--accent-cyan)" style={{ marginRight: '0.4rem' }} />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Target URL (e.g. https://www.amazon.com)"
              style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sliders size={12} />
              <span>Max Steps: <strong>{maxSteps}</strong></span>
              <input 
                type="range" 
                min="1" 
                max="25" 
                value={maxSteps} 
                onChange={(e) => setMaxSteps(Number(e.target.value))}
                style={{ width: '60px', accentColor: 'var(--accent-cyan)' }} 
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={headless} 
                onChange={(e) => setHeadless(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }} 
              />
              <span>Headless</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn-primary" 
            onClick={onRun} 
            disabled={isRunning || !prompt.trim()}
            style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
          >
            <Play size={16} fill="currentColor" />
            <span>{isRunning ? 'Executing...' : 'Run Agent'}</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={onReset}
            title="Reset Agent Session"
            style={{ padding: '0.75rem' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Mode Selection Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Execution Mode:</span>
        
        <button
          onClick={() => setAgentMode('autonomous')}
          style={{
            background: agentMode === 'autonomous' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            border: `1px solid ${agentMode === 'autonomous' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            color: agentMode === 'autonomous' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Compass size={12} />
          <span>Autonomous AI</span>
        </button>

        <button
          onClick={() => setAgentMode('vision')}
          style={{
            background: agentMode === 'vision' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${agentMode === 'vision' ? '#a855f7' : 'var(--border-subtle)'}`,
            color: agentMode === 'vision' ? '#a855f7' : 'var(--text-secondary)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Eye size={12} />
          <span>Vision Bounding-Box</span>
        </button>

        <button
          onClick={() => setAgentMode('fast')}
          style={{
            background: agentMode === 'fast' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
            border: `1px solid ${agentMode === 'fast' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
            color: agentMode === 'fast' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Zap size={12} />
          <span>Fast Scraping</span>
        </button>
      </div>
    </div>
  );
}
