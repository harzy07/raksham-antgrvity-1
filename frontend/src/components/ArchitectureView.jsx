import React from 'react';
import { 
  ShieldCheck, Lock, Database, Server, UserCheck, 
  Layers, AlertTriangle, ArrowRight, CheckCircle, ExternalLink 
} from 'lucide-react';

export default function ArchitectureView() {
  const strideRows = [
    {
      stride: "Spoofing",
      threat: "Deepfake authority; spoofed client signals",
      control: "Human question + timer + call-back; server-side signal validation",
      residual: "May still proceed → log + post-event reversal"
    },
    {
      stride: "Tampering",
      threat: "Model evasion; poisoned feedback",
      control: "Emerging-cluster, red-team, reviewed pattern updates",
      residual: "Novel evasion until retrain; bounded by review"
    },
    {
      stride: "Repudiation",
      threat: "Disputed hold",
      control: "Reason codes + immutable audit log",
      residual: "Dispute volume; clear appeal path"
    },
    {
      stride: "Info disclosure",
      threat: "Message content / PII leak; ID re-identification",
      control: "Client-side redaction (OTP/phone/cards masked), not stored on disk, DPDP aligned",
      residual: "Depends on correct regex redaction; tested each release"
    },
    {
      stride: "Denial of service",
      threat: "Friction weaponised to block legitimate transactions",
      control: "Rate-limited friction; trusted payee suppression; fail-safe widens band",
      residual: "Abuse attempts capped per user / payee pair"
    },
    {
      stride: "Elevation",
      threat: "Console takeover; insider analyst misuse",
      control: "RBAC, least privilege, dual review on CRITICAL release, audit trail",
      residual: "Residual insider risk; strictly audited by compliance"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Trust Boundaries Diagram (Slide A1) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
          Architecture · Slide A1
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', marginBottom: '8px' }}>
          End-to-End System with Trust Boundaries
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Only redacted, minimised text crosses Trust Boundary 1. Digits are masked client-side and re-validated server-side; not stored.
        </p>

        {/* 3 Pillars Architecture Flow */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.3fr auto 1fr', gap: '12px', alignItems: 'center' }}>
          {/* Pillar 1: Client */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)' }}>
              <Lock size={18} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>CLIENT · BROWSER</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', border: '1px solid #1e3a5f' }}>
                <strong>Signal Capture + Redaction</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Masks OTP / account / card / phone</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>'What we send' Preview</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Consent + user-visible payload</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Session State & Context</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Call-in-progress, screen-share, device</div>
              </div>
            </div>
          </div>

          {/* Trust Boundary 1 */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ height: '60px', width: '2px', background: 'var(--accent-coral)', margin: '0 auto 6px auto', borderStyle: 'dashed' }}></div>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-coral)', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              TRUST BOUNDARY 1
            </span>
            <div style={{ height: '60px', width: '2px', background: 'var(--accent-coral)', margin: '6px auto 0 auto', borderStyle: 'dashed' }}></div>
          </div>

          {/* Pillar 2: PSP Backend */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-green)' }}>
              <Server size={18} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>PSP BACKEND · FASTAPI / PYTHON</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Risk API (/score)</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Target &lt; 300ms inline budget on payment path</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Content Classifier (TF-IDF + LR)</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Calibrated probability on redacted text</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Money-Graph + HDBSCAN Cluster</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Mule traits + novel campaign isolation</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', border: '1px solid #1e3a5f' }}>
                <strong>Risk Fusion (GBT) → Tier Policy</strong>
                <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>Score R ∈ [0, 100] + Trusted Payee Suppression</div>
              </div>
            </div>
          </div>

          {/* Trust Boundary 2 */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ height: '60px', width: '2px', background: 'var(--accent-amber)', margin: '0 auto 6px auto', borderStyle: 'dashed' }}></div>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              TRUST BOUNDARY 2
            </span>
            <div style={{ height: '60px', width: '2px', background: 'var(--accent-amber)', margin: '6px auto 0 auto', borderStyle: 'dashed' }}></div>
          </div>

          {/* Pillar 3: Analyst & Payment Rail */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-purple)' }}>
              <UserCheck size={18} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>ANALYST · RAIL OPS</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Review Console</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Ranked hold queue, reason codes spelled out</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Soft-Hold Control</strong>
                <div style={{ color: 'var(--accent-coral)', fontSize: '0.7rem' }}>Reversible release / block before debit</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                <strong>Immutable Audit Log</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>RBI & DPDP-Act compliant audit trail</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STRIDE Threat Model Table (Slide A3) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>STRIDE Threat Model & Residual Risk Matrix (Slide A3)</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px', width: '15%' }}>STRIDE</th>
                <th style={{ padding: '10px', width: '25%' }}>IDENTIFIED THREAT</th>
                <th style={{ padding: '10px', width: '35%' }}>RAKSHAM COUNTERMEASURE</th>
                <th style={{ padding: '10px', width: '25%' }}>RESIDUAL RISK & MITIGATION</th>
              </tr>
            </thead>
            <tbody>
              {strideRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{row.stride}</td>
                  <td style={{ padding: '10px', color: 'var(--text-main)' }}>{row.threat}</td>
                  <td style={{ padding: '10px', color: 'var(--accent-green)' }}>{row.control}</td>
                  <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{row.residual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 48-Hour Plan & Execution Cut-List (Slide 09) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>
          48-Hour Plan & Finale Execution Matrix (Slide 09)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              Minimum Viable Demo (Never Cut)
            </h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '18px' }}>
              <li><strong>One scam message</strong> → High R → Correct tiered friction → Analyst sees CRITICAL hold fired before debit.</li>
              <li><strong>Redaction preview shown</strong>: Sensitive PII digits masked before sending.</li>
              <li><strong>/score returns tier + reason</strong> in &lt; 300 ms.</li>
              <li><strong>Hold is reversible</strong>: Analyst can release back to payment rail with 1 click.</li>
              <li><strong>Unseen-family benchmark reported</strong>: Proves multi-engine need.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px' }}>
              Competitive Edge: Why RAKSHAM Wins (Slide 10)
            </h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '18px' }}>
              <li><strong>Beats the coached victim</strong>: We don't rely on victim spotting red flags; we intercept the workflow.</li>
              <li><strong>Friction is a budget</strong>: 98%+ normal payments experience zero interruption; warnings are surgical.</li>
              <li><strong>Holds before debit</strong>: Reversible soft-hold stops money movement before irrevocable UPI settlement.</li>
              <li><strong>Privacy by construction</strong>: Raw messages never stored; DPDP-Act compliant client-side redaction.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
