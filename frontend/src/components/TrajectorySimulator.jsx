import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, AlertTriangle, ShieldAlert, 
  PhoneCall, Monitor, Users, Layers, ShieldCheck 
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    time: "T+0s",
    score: 18,
    tier: "LOW",
    engine: "Content + Session",
    title: "Scam Call + Forwarded Message",
    details: "Deepfake 'police' call, then a coercive message. Browser redacts sensitive digits client-side before sending text features.",
    callActive: true,
    screenShare: false,
    newMule: false,
    novelPattern: false,
    holdFired: false
  },
  {
    step: 2,
    time: "T+60s",
    score: 40,
    tier: "MEDIUM",
    engine: "Session + Context",
    title: "Screen-Share + New Device",
    details: "Victim is pressured to install a screen-share utility (AnyDesk/TeamViewer). Login detected from an unfamiliar device fingerprint.",
    callActive: true,
    screenShare: true,
    newMule: false,
    novelPattern: false,
    holdFired: false
  },
  {
    step: 3,
    time: "T+95s",
    score: 66,
    tier: "MEDIUM",
    engine: "Money-Graph Engine",
    title: "New Mule Payee",
    details: "Beneficiary VPA is fresh (< 3 days old), never transacted before. Amount (₹48,500) is far above user's normal average retail spend.",
    callActive: true,
    screenShare: true,
    newMule: true,
    novelPattern: false,
    holdFired: false
  },
  {
    step: 4,
    time: "T+110s",
    score: 82,
    tier: "HIGH",
    engine: "Emerging-Cluster (HDBSCAN)",
    title: "Novel Pattern Clustered",
    details: "Workflow matches no known static fraud rule. HDBSCAN flags high-density outlier signature as candidate emerging scam campaign.",
    callActive: true,
    screenShare: true,
    newMule: true,
    novelPattern: true,
    holdFired: false
  },
  {
    step: 5,
    time: "T+120s",
    score: 90,
    tier: "CRITICAL",
    engine: "Risk Fusion (GBT) → HOLD",
    title: "HOLD Before Debit",
    details: "Payment initiated; cumulative score crosses CRITICAL threshold (R=90). Reversible soft-hold fires before money leaves the bank.",
    callActive: true,
    screenShare: true,
    newMule: true,
    novelPattern: true,
    holdFired: true
  }
];

export default function TrajectorySimulator() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = STEPS[currentStepIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Controls Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Threat Scenario · Slide 03 & A2
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
              A coached victim is the hard case. The hold fires before the debit.
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Risk is a trajectory, not one static flag. Scores accumulate silently; tiers apply when payment is initiated.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setCurrentStepIdx(0);
                setIsPlaying(false);
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (currentStepIdx >= STEPS.length - 1) setCurrentStepIdx(0);
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Pause Trace" : "Auto-Play Trace"}
            </button>
          </div>
        </div>

        {/* 5-Step Visual Stepper Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '24px' }}>
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            const isPassed = idx <= currentStepIdx;
            let barColor = 'rgba(16, 185, 129, 0.4)';
            if (s.score >= 85) barColor = 'var(--accent-coral)';
            else if (s.score >= 70) barColor = '#fb923c';
            else if (s.score >= 40) barColor = 'var(--accent-amber)';

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setIsPlaying(false);
                }}
                style={{
                  background: isActive ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                  border: isActive ? `2px solid ${barColor}` : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  opacity: isPassed ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>{s.time}</span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: s.score >= 85 ? 'var(--accent-coral)' : (s.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-green)')
                    }}
                  >
                    R={s.score}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  via {s.engine}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trajectory Deep-Dive Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Dynamic Cumulative Risk Gauge & SVG Trajectory Line */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cumulative Risk Score Trajectory</h3>
            <span
              className={`badge badge-${current.tier.toLowerCase()}`}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {current.tier} TIER
            </span>
          </div>

          {/* SVG Risk Curve Chart */}
          <div style={{ height: '180px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Threshold Grid Lines */}
              <line x1="0" y1="24" x2="500" y2="24" stroke="rgba(244, 63, 94, 0.25)" strokeDasharray="4" />
              <text x="5" y="20" fill="var(--accent-coral)" fontSize="10" fontWeight="600">CRITICAL ≥ 85</text>

              <line x1="0" y1="48" x2="500" y2="48" stroke="rgba(249, 115, 22, 0.2)" strokeDasharray="4" />
              <text x="5" y="44" fill="#fb923c" fontSize="10" fontWeight="600">HIGH ≥ 70</text>

              <line x1="0" y1="96" x2="500" y2="96" stroke="rgba(245, 158, 11, 0.2)" strokeDasharray="4" />
              <text x="5" y="92" fill="var(--accent-amber)" fontSize="10" fontWeight="600">MEDIUM ≥ 40</text>

              {/* Trajectory Points & Path */}
              {/* Coordinates: T0: (50, 131), T60: (150, 96), T95: (250, 54), T110: (350, 28), T120: (450, 16) */}
              <path
                d="M 50 131 L 150 96 L 250 54 L 350 28 L 450 16"
                fill="none"
                stroke="rgba(0, 229, 255, 0.25)"
                strokeWidth="3"
              />

              {/* Animated Progress Path */}
              {currentStepIdx > 0 && (
                <path
                  d={`M 50 131 ${currentStepIdx >= 1 ? 'L 150 96' : ''} ${currentStepIdx >= 2 ? 'L 250 54' : ''} ${currentStepIdx >= 3 ? 'L 350 28' : ''} ${currentStepIdx >= 4 ? 'L 450 16' : ''}`}
                  fill="none"
                  stroke={current.score >= 85 ? 'var(--accent-coral)' : 'var(--accent-cyan)'}
                  strokeWidth="4"
                />
              )}

              {/* Point Circles */}
              {[
                { x: 50, y: 131, r: 18, label: "T+0s", idx: 0 },
                { x: 150, y: 96, r: 40, label: "T+60s", idx: 1 },
                { x: 250, y: 54, r: 66, label: "T+95s", idx: 2 },
                { x: 350, y: 28, r: 82, label: "T+110s", idx: 3 },
                { x: 450, y: 16, r: 90, label: "T+120s", idx: 4 }
              ].map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={i === currentStepIdx ? 9 : 5}
                    fill={i === currentStepIdx ? (pt.r >= 85 ? 'var(--accent-coral)' : 'var(--accent-cyan)') : '#1e2c4f'}
                    stroke={i === currentStepIdx ? '#fff' : 'var(--border-subtle)'}
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill={i === currentStepIdx ? '#fff' : 'var(--text-dim)'}
                    fontSize="11"
                    fontWeight={i === currentStepIdx ? "800" : "500"}
                  >
                    R={pt.r}
                  </text>
                  <text
                    x={pt.x}
                    y={155}
                    textAnchor="middle"
                    fill="var(--text-dim)"
                    fontSize="10"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Current Score Big Display */}
          <div style={{ marginTop: '20px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>CURRENT POINT IN WORKFLOW:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{current.time} · {current.title}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: current.score >= 85 ? 'var(--accent-coral)' : (current.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-green)') }}>
                R = {current.score}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Threat Context & Slide 03 Countermeasures */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Step Details */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              Step {current.step} Incident Analysis
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {current.details}
            </p>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Live Call Coaching:</span>{' '}
                <strong style={{ color: current.callActive ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                  {current.callActive ? "YES (Active)" : "NO"}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Screen Share Active:</span>{' '}
                <strong style={{ color: current.screenShare ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                  {current.screenShare ? "YES (AnyDesk)" : "NO"}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Payee Freshness:</span>{' '}
                <strong style={{ color: current.newMule ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                  {current.newMule ? "Fresh Mule VPA" : "Known Contact"}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>HDBSCAN Cluster:</span>{' '}
                <strong style={{ color: current.novelPattern ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                  {current.novelPattern ? "Candidate Novel Outlier" : "Normal Cluster"}
                </strong>
              </div>
            </div>
          </div>

          {/* Slide 03 Countermeasures: What the Attacker Needs, and We Deny */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                  Coached-Victim Countermeasure
                </h5>
                <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '16px' }}>
                  <li>A human question, not a dismissible banner: <em>"Is someone on a call guiding this payment right now?"</em></li>
                  <li>A cooling-off timer the caller cannot skip for the victim.</li>
                  <li>Bank-initiated safe call-back. We never ask for an OTP.</li>
                </ul>
              </div>

              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-coral)', marginBottom: '8px' }}>
                  What the Attacker Needs, and We Deny
                </h5>
                <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '16px' }}>
                  <li><strong>Turn victim authorization into irreversible movement.</strong> <span style={{ color: 'var(--accent-green)' }}>DENIED</span>: We hold before debit.</li>
                  <li><strong>Stay under any single static threshold.</strong> <span style={{ color: 'var(--accent-green)' }}>DENIED</span>: We score the whole workflow trajectory.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
