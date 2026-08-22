import React, { useState } from 'react';
import { Camera, Lock, RefreshCw, Monitor, Smartphone, Pause, Play, StepForward, Hand, Maximize2 } from 'lucide-react';

export default function BrowserStreamViewer({ 
  currentStep, 
  snapshots, 
  onPause, 
  onResume, 
  onStepOver, 
  isPaused, 
  isRunning 
}) {
  const [resolution, setResolution] = useState('1280x720');
  const [manualControl, setManualControl] = useState(false);

  const activeSnapshot = currentStep?.snapshot || snapshots[snapshots.length - 1] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80';
  const bbox = currentStep?.bbox;
  const cursor = currentStep?.cursor || { x: 200, y: 150 };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Browser Bar / Window Controls */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.5rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem'
      }}>
        {/* Window Dots & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={13} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Address Bar */}
        <div style={{
          flex: 1,
          maxWdith: '600px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '0.25rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <Lock size={12} color="var(--accent-emerald)" />
          <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentStep?.target || 'https://www.amazon.com'}
          </span>
        </div>

        {/* Stream Resolution & View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
            <Monitor size={13} color={resolution === '1280x720' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} style={{ cursor: 'pointer' }} onClick={() => setResolution('1280x720')} />
            <Smartphone size={13} color={resolution === '375x812' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} style={{ cursor: 'pointer' }} onClick={() => setResolution('375x812')} />
          </div>

          <button 
            onClick={() => setManualControl(!manualControl)}
            style={{
              background: manualControl ? 'rgba(255, 183, 3, 0.2)' : 'transparent',
              border: `1px solid ${manualControl ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
              color: manualControl ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderRadius: '4px',
              padding: '0.2rem 0.4rem',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <Hand size={12} />
            <span>{manualControl ? 'Manual Active' : 'Take Control'}</span>
          </button>
        </div>
      </div>

      {/* Stream Display Canvas Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#070a13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Main Screenshot Background */}
        <div style={{
          position: 'relative',
          width: resolution === '375x812' ? '375px' : '100%',
          height: '100%',
          backgroundImage: `url(${activeSnapshot})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Target Bounding Box Overlay */}
          {bbox && isRunning && (
            <div 
              className="dom-target-box"
              style={{
                left: `${bbox.x}px`,
                top: `${bbox.y}px`,
                width: `${bbox.width}px`,
                height: `${bbox.height}px`,
              }}
            >
              <div className="dom-target-tag">{bbox.label}</div>
            </div>
          )}

          {/* Mouse Cursor Simulation */}
          {isRunning && (
            <div 
              className="simulated-cursor"
              style={{
                left: `${cursor.x}px`,
                top: `${cursor.y}px`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="#070a13" strokeWidth="2">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <div className="simulated-cursor-ring"></div>
            </div>
          )}

          {/* Pause / Live Overlay Status */}
          {isPaused && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 183, 3, 0.9)',
              color: '#070a13',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 15px rgba(255, 183, 3, 0.5)'
            }}>
              <Pause size={14} />
              <span>PAUSED ON STEP {currentStep?.id || 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls & Screenshot Filmstrip */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.5rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem'
      }}>
        {/* Playback Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isPaused ? (
            <button className="btn-primary" onClick={onResume} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              <Play size={13} />
              <span>Resume</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={onPause} disabled={!isRunning} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              <Pause size={13} />
              <span>Pause</span>
            </button>
          )}

          <button className="btn-secondary" onClick={onStepOver} disabled={!isRunning} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
            <StepForward size={13} />
            <span>Step Over</span>
          </button>
        </div>

        {/* Screenshot Filmstrip Thumbnails */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto' }}>
          <Camera size={14} color="var(--text-secondary)" />
          {snapshots.map((snap, idx) => (
            <img 
              key={idx}
              src={snap}
              alt={`Snap ${idx + 1}`}
              style={{
                width: '44px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: snap === activeSnapshot ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                opacity: snap === activeSnapshot ? 1 : 0.6,
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
