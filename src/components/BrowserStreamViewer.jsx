import React, { useState, useEffect } from 'react';
import { Camera, Lock, RefreshCw, Monitor, Smartphone, Pause, Play, StepForward, Hand, Maximize2, Wifi, WifiOff } from 'lucide-react';

export default function BrowserStreamViewer({ 
  currentStep, 
  snapshots, 
  onPause, 
  onResume, 
  onStepOver, 
  isPaused, 
  isRunning 
}) {
  const [resolution, setResolution] = useState('desktop');
  const [manualControl, setManualControl] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeSnapIdx, setActiveSnapIdx] = useState(null);

  const defaultSnapshot = 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=1200&q=90';
  const activeSnapshot = activeSnapIdx !== null
    ? snapshots[activeSnapIdx]
    : (currentStep?.snapshot || snapshots[snapshots.length - 1] || null);

  const bbox = currentStep?.bbox;
  const cursor = currentStep?.cursor || { x: 200, y: 150 };

  // Reset img loaded state when snapshot changes
  useEffect(() => {
    setImgLoaded(false);
    setActiveSnapIdx(null);
  }, [currentStep?.snapshot]);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Browser Chrome Bar */}
      <div style={{
        background: 'rgba(10, 15, 30, 0.98)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.45rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        flexShrink: 0,
      }}>
        {/* Window traffic lights */}
        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f56', boxShadow: '0 0 4px #ff5f5680' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 4px #ffbd2e80' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27c93f', boxShadow: '0 0 4px #27c93f80' }} />
        </div>

        <RefreshCw size={13} color="var(--text-secondary)" style={{ cursor: 'pointer', flexShrink: 0 }} />

        {/* Address Bar */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          padding: '0.22rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.77rem',
          fontFamily: 'var(--font-mono)',
          minWidth: 0,
        }}>
          <Lock size={11} color="var(--accent-emerald)" />
          <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentStep?.target?.startsWith('http') ? currentStep.target : 'https://www.amazon.com'}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Resolution toggle */}
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '2px' }}>
            <button onClick={() => setResolution('desktop')} title="Desktop view" style={{
              background: resolution === 'desktop' ? 'rgba(0,242,254,0.2)' : 'transparent',
              border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: resolution === 'desktop' ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center'
            }}>
              <Monitor size={13} />
            </button>
            <button onClick={() => setResolution('mobile')} title="Mobile view" style={{
              background: resolution === 'mobile' ? 'rgba(0,242,254,0.2)' : 'transparent',
              border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: resolution === 'mobile' ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center'
            }}>
              <Smartphone size={13} />
            </button>
          </div>

          {/* Take Control toggle */}
          <button
            onClick={() => setManualControl(!manualControl)}
            style={{
              background: manualControl ? 'rgba(255,183,3,0.15)' : 'transparent',
              border: `1px solid ${manualControl ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
              color: manualControl ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderRadius: 5,
              padding: '3px 9px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <Hand size={12} />
            {manualControl ? 'Manual Active' : 'Take Control'}
          </button>

          {/* Live/Offline indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: isRunning ? 'var(--accent-emerald)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isRunning ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isRunning ? 'LIVE' : 'IDLE'}</span>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#07091a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Inner frame for mobile view */}
        <div style={{
          position: 'relative',
          width: resolution === 'mobile' ? 375 : '100%',
          height: '100%',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          boxShadow: resolution === 'mobile' ? '0 0 40px rgba(0,0,0,0.7)' : 'none',
        }}>

          {/* Loading skeleton */}
          {!activeSnapshot && (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '1rem', color: 'var(--text-muted)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--accent-cyan)',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>Waiting for agent…</span>
            </div>
          )}

          {/* Snapshot Image */}
          {activeSnapshot && (
            <>
              {/* Blur placeholder while loading */}
              {!imgLoaded && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '3px solid rgba(0,242,254,0.3)',
                    borderTopColor: 'var(--accent-cyan)',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              )}
              <img
                key={activeSnapshot}
                src={activeSnapshot}
                alt="Browser snapshot"
                onLoad={() => setImgLoaded(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 0.35s ease',
                }}
              />
            </>
          )}

          {/* Bounding Box overlay */}
          {bbox && isRunning && (
            <div className="dom-target-box" style={{ left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height }}>
              <div className="dom-target-tag">{bbox.label}</div>
            </div>
          )}

          {/* Cursor */}
          {isRunning && activeSnapshot && (
            <div className="simulated-cursor" style={{ left: cursor.x, top: cursor.y }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="#070a13" strokeWidth="2">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <div className="simulated-cursor-ring" />
            </div>
          )}

          {/* PAUSED overlay */}
          {isPaused && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(7,10,19,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(3px)',
            }}>
              <div style={{
                background: 'rgba(255,183,3,0.95)',
                color: '#070a13',
                padding: '0.5rem 1.2rem',
                borderRadius: 8,
                fontWeight: 800, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 0 25px rgba(255,183,3,0.6)',
              }}>
                <Pause size={16} />
                PAUSED — Step {currentStep?.id || 1}
              </div>
            </div>
          )}

          {/* Step badge (top-left) */}
          {currentStep && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(7,10,19,0.85)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              backdropFilter: 'blur(6px)',
            }}>
              Step {currentStep.id} — {currentStep.action}
            </div>
          )}
        </div>
      </div>

      {/* Controls & Filmstrip */}
      <div style={{
        background: 'rgba(10,15,30,0.97)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.45rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem',
        flexShrink: 0,
      }}>
        {/* Playback buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isPaused ? (
            <button className="btn-primary" onClick={onResume} style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
              <Play size={13} /><span>Resume</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={onPause} disabled={!isRunning} style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
              <Pause size={13} /><span>Pause</span>
            </button>
          )}
          <button className="btn-secondary" onClick={onStepOver} disabled={!isRunning} style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
            <StepForward size={13} /><span>Step Over</span>
          </button>
        </div>

        {/* Filmstrip thumbnails */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', flex: 1, justifyContent: 'flex-end' }}>
          <Camera size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          {snapshots.length === 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No frames yet</span>
          )}
          {snapshots.map((snap, idx) => (
            <img
              key={idx}
              src={snap}
              alt={`Frame ${idx + 1}`}
              onClick={() => setActiveSnapIdx(idx === activeSnapIdx ? null : idx)}
              style={{
                width: 48, height: 30,
                objectFit: 'cover',
                borderRadius: 4,
                border: snap === activeSnapshot ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                opacity: snap === activeSnapshot ? 1 : 0.55,
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
