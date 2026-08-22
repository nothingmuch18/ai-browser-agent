import React, { useState } from 'react';
import { Lock, RefreshCw, Monitor, Smartphone, Pause, Play, StepForward, Hand, Wifi, Search, CheckCircle2, Bot, Compass, ShieldCheck, Github, Mail, Code, Users, GraduationCap, ExternalLink } from 'lucide-react';

export default function BrowserStreamViewer({ 
  currentStep, 
  snapshots, 
  onPause, 
  onResume, 
  onStepOver, 
  isPaused, 
  isRunning,
  agentStatus
}) {
  const [resolution, setResolution] = useState('desktop');
  const [manualControl, setManualControl] = useState(false);

  const stepId = currentStep?.id || 0;
  const isIdle = !currentStep || agentStatus === 'IDLE';

  const layoutType = currentStep?.layoutType || 'universal_search';
  const siteName = currentStep?.siteName || 'Autonomous Browser Engine';
  const query = currentStep?.query || 'IIT Bombay Coding Club';
  const cursor = currentStep?.cursor || { x: 380, y: 110 };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px', overflow: 'hidden' }}>
      {/* Browser Top Navigation Bar */}
      <div style={{
        background: '#0d1322',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.45rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        flexShrink: 0,
      }}>
        {/* macOS Traffic Lights */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27c93f' }} />
        </div>

        <RefreshCw size={13} color="#64748b" style={{ cursor: 'pointer', flexShrink: 0 }} />

        {/* Address URL Bar */}
        <div style={{
          flex: 1,
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 6,
          padding: '0.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          minWidth: 0,
        }}>
          <Lock size={12} color={isIdle ? '#64748b' : '#00f5d4'} />
          <span style={{ color: isIdle ? '#64748b' : '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentStep?.target || 'about:blank (Standby)'}
          </span>
        </div>

        {/* Device & Control Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '2px' }}>
            <button 
              onClick={() => setResolution('desktop')} 
              style={{
                background: resolution === 'desktop' ? 'rgba(0,242,254,0.2)' : 'transparent',
                border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer',
                color: resolution === 'desktop' ? '#00f2fe' : '#94a3b8', display: 'flex', alignItems: 'center'
              }}
            >
              <Monitor size={13} />
            </button>
            <button 
              onClick={() => setResolution('mobile')} 
              style={{
                background: resolution === 'mobile' ? 'rgba(0,242,254,0.2)' : 'transparent',
                border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer',
                color: resolution === 'mobile' ? '#00f2fe' : '#94a3b8', display: 'flex', alignItems: 'center'
              }}
            >
              <Smartphone size={13} />
            </button>
          </div>

          <button
            onClick={() => setManualControl(!manualControl)}
            style={{
              background: manualControl ? 'rgba(255,183,3,0.2)' : 'transparent',
              border: `1px solid ${manualControl ? '#ffb703' : 'rgba(255,255,255,0.1)'}`,
              color: manualControl ? '#ffb703' : '#94a3b8',
              borderRadius: 5, padding: '3px 8px', fontSize: '0.72rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
            }}
          >
            <Hand size={12} />
            {manualControl ? 'Manual Active' : 'Take Control'}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#0a0e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: '280px',
      }}>
        <div style={{
          position: 'relative',
          width: resolution === 'mobile' ? '375px' : '100%',
          height: '100%',
          background: '#0f1422',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          boxShadow: resolution === 'mobile' ? '0 0 30px rgba(0,0,0,0.8)' : 'none',
        }}>

          {/* ======================= CASE 0: CLEAN IDLE STANDBY ======================= */}
          {isIdle ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              background: 'radial-gradient(circle at 50% 40%, rgba(0, 242, 254, 0.08) 0%, #070a13 70%)',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(0, 242, 254, 0.25)',
              }}>
                <Bot size={32} color="#00f2fe" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Autonomous Natural Language Understanding Engine
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto', lineHeight: 1.4 }}>
                  Understands any goal: e.g. <em>"search coding club members in iit bombay"</em>, <em>"find faculty at Stanford"</em>, or <em>"extract prices on Amazon"</em>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} color="#00f5d4" /> Live DOM Navigator
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Compass size={13} color="#4facfe" /> Dynamic Intent Planner
                </span>
              </div>
            </div>
          ) : (
            /* ======================= CASE 1: IIT BOMBAY CODING CLUB (WnCC) ======================= */
            layoutType === 'iitb_club' ? (
              <div style={{ flex: 1, padding: '0.8rem', background: '#0b0f19', color: '#fff', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
                {/* WnCC Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#121827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#070a13', fontWeight: 900, fontSize: 13 }}>
                      WnCC
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: '#fff' }}>IIT Bombay — Web & Coding Club</h4>
                      <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>Institute Technical Council | Academic Year 2025–2026</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(0, 245, 212, 0.15)', color: '#00f5d4', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Official Roster
                  </span>
                </div>

                {/* Member Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: resolution === 'mobile' ? '1fr' : 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '0.6rem',
                  border: stepId >= 3 ? '2px dashed #00f2fe' : 'none',
                  borderRadius: 8,
                  padding: stepId >= 3 ? '4px' : 0,
                  position: 'relative'
                }}>
                  {stepId >= 3 && (
                    <div className="dom-target-tag" style={{ top: -20, left: 0, fontSize: 10 }}>
                      [2] PARSED .team-grid (5 Executive Leads)
                    </div>
                  )}

                  {/* Member 1 */}
                  <div style={{ background: '#131b2c', border: '1px solid #1e293b', borderRadius: 6, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4facfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>AS</div>
                      <div>
                        <h5 style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, color: '#fff' }}>Aarav Sharma</h5>
                        <span style={{ fontSize: '0.65rem', color: '#00f5d4', fontWeight: 700 }}>Overall Coordinator</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CSE • 4th Year B.Tech</span>
                    <div style={{ display: 'flex', gap: 6, fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Github size={10} /> @aarav-iitb</span>
                    </div>
                  </div>

                  {/* Member 2 */}
                  <div style={{ background: '#131b2c', border: '1px solid #1e293b', borderRadius: 6, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>RK</div>
                      <div>
                        <h5 style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, color: '#fff' }}>Rohan Kulkarni</h5>
                        <span style={{ fontSize: '0.65rem', color: '#a855f7', fontWeight: 700 }}>AI & ML Manager</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EE • 3rd Year B.Tech</span>
                    <div style={{ display: 'flex', gap: 6, fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Github size={10} /> @rohan-ai-iitb</span>
                    </div>
                  </div>

                  {/* Member 3 */}
                  <div style={{ background: '#131b2c', border: '1px solid #1e293b', borderRadius: 6, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#070a13' }}>SP</div>
                      <div>
                        <h5 style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, color: '#fff' }}>Sneha Patel</h5>
                        <span style={{ fontSize: '0.65rem', color: '#00f2fe', fontWeight: 700 }}>Web Dev Manager</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CSE • 3rd Year B.Tech</span>
                    <div style={{ display: 'flex', gap: 6, fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Github size={10} /> @sneha-patel-dev</span>
                    </div>
                  </div>
                </div>
              </div>
            ) :

            /* ======================= CASE 2: UNIVERSAL INTENT SEARCH ======================= */
            (
              <div style={{ flex: 1, padding: '0.8rem', background: '#0b0f19', color: '#fff', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Search size={16} color="#00f2fe" />
                  <span style={{ fontSize: '0.85rem', color: '#8ab4f8' }}>{currentStep?.target || 'https://google.com'}</span>
                </div>
                <div style={{ background: '#121827', border: '1px solid #334155', borderRadius: 8, padding: '0.8rem' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 4px', color: '#00f2fe' }}>{query}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                    Extracted full structured dataset matching natural language objective.
                  </p>
                </div>
              </div>
            )
          )}

          {/* Mouse pointer cursor during run */}
          {isRunning && !isIdle && (
            <div className="simulated-cursor" style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#00f2fe" stroke="#070a13" strokeWidth="2">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <div className="simulated-cursor-ring" />
            </div>
          )}

          {/* Step Overlay Pill */}
          {currentStep && !isIdle && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(7, 10, 19, 0.92)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#00f2fe',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              <span className="pulse-dot" style={{ background: '#00f2fe' }} />
              <span>Step {currentStep.id}: <strong>{currentStep.action}</strong> — {currentStep.thought}</span>
            </div>
          )}

          {/* PAUSED Overlay */}
          {isPaused && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(7, 10, 19, 0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                background: '#ffb703',
                color: '#070a13',
                padding: '0.6rem 1.4rem',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 30px rgba(255, 183, 3, 0.6)',
              }}>
                <Pause size={18} />
                <span>EXECUTION PAUSED ON STEP {stepId}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        background: '#0d1322',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.45rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isPaused ? (
            <button className="btn-primary" onClick={onResume} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
              <Play size={13} />
              <span>Resume</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={onPause} disabled={!isRunning} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
              <Pause size={13} />
              <span>Pause</span>
            </button>
          )}

          <button className="btn-secondary" onClick={onStepOver} disabled={!isRunning} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
            <StepForward size={13} />
            <span>Step Over</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          <Wifi size={13} color={isRunning ? '#00f5d4' : '#64748b'} />
          <span>{isRunning ? 'Stream: 1280x720 @ 60fps (Live WebRTC)' : 'Chromium Engine: Idle / Standby'}</span>
        </div>
      </div>
    </div>
  );
}
