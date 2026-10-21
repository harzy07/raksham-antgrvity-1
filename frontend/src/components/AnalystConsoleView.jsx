import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, Clock, 
  User, RefreshCw, FileText, ChevronRight, AlertOctagon, Activity
} from 'lucide-react';

export default function AnalystConsoleView({ apiUrl }) {
  const [queue, setQueue] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  const fetchQueueAndAudit = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${apiUrl}/api/analyst/queue`),
        fetch(`${apiUrl}/api/analyst/audit-log`)
      ]);
      const qData = await qRes.json();
      const aData = await aRes.json();
      setQueue(qData);
      setAuditLog(aData);
      if (qData.length > 0 && !selectedCase) {
        setSelectedCase(qData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueAndAudit();
  }, [apiUrl]);

  const handleAction = async (actionType) => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`${apiUrl}/api/analyst/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txn_id: selectedCase.txn_id,
          action: actionType,
          analyst_name: "Arjun (PSP Fraud Ops)",
          notes: actionNotes || (actionType === 'RELEASE' ? "False positive release to payment rail" : "Confirmed coercive digital arrest mule")
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionNotes("");
        await fetchQueueAndAudit();
        setSelectedCase(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Fraud-Ops Capacity & SLA Header (Slide 02 & Slide 08) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active Soft-Holds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-coral)', marginTop: '4px' }}>
            {queue.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>held before debit</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginTop: '4px' }}>Target: &le; 0.1% routed to CRITICAL</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Reviewer First-Touch</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            1.8 min <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>avg</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>SLA Target: &lt; 5 min met</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Precision at CRITICAL</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
            94.2% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>calibrated</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Target: &ge; 0.90 precision</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Zero-Friction Payments</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '4px' }}>
            98.6%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Target: &gt; 95% payments frictionless</div>
        </div>
      </div>

      {/* Main Review Console: Ranked Queue (Left) + Case Deep Dive (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Ranked Queue Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="var(--accent-coral)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ranked Review Queue (Arjun's View)</h3>
            </div>
            <button className="btn btn-secondary" onClick={fetchQueueAndAudit} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <RefreshCw size={14} className={loading ? "pulse-dot" : ""} /> Refresh
            </button>
          </div>

          {queue.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="var(--accent-green)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontWeight: 600 }}>Zero pending holds in queue!</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Simulate a critical transaction from Meera's tab to populate this queue.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {queue.map((item) => {
                const isSelected = selectedCase?.txn_id === item.txn_id;
                return (
                  <div
                    key={item.txn_id}
                    onClick={() => setSelectedCase(item)}
                    style={{
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid var(--accent-coral)' : '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-critical">R = {item.risk_score}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.txn_id}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({item.user_id})</span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      To: <strong style={{ color: 'var(--text-main)' }}>{item.beneficiary_vpa}</strong> ({item.beneficiary_name})
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      ⚡ Reason: {item.reason_code}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Case Inspection & Soft-Hold Controls */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hold Inspection & Decision</h3>
              <span className="badge badge-critical">Soft-Hold Active</span>
            </div>

            {!selectedCase ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>
                Select a transaction from the queue to review evidence and release or block.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* User & Payee Snapshot */}
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Victim Account:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedCase.user_id} (Meera)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Target Mule VPA:</span>
                    <strong style={{ color: 'var(--accent-coral)' }}>{selectedCase.beneficiary_vpa}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Amount at Risk:</span>
                    <strong style={{ color: 'var(--accent-coral)', fontSize: '0.95rem' }}>₹{selectedCase.amount.toLocaleString()}</strong>
                  </div>
                </div>

                {/* 4-Engine Risk Attribution */}
                {selectedCase.breakdown && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                      4-ENGINE DETECTION ATTRIBUTION (SLIDE 04)
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Content Classifier (TF-IDF + LR):</span>
                          <strong>{selectedCase.breakdown.content_risk}%</strong>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedCase.breakdown.content_risk}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Session State (Coaching / Screen Share):</span>
                          <strong>{selectedCase.breakdown.session_risk}%</strong>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedCase.breakdown.session_risk}%`, height: '100%', background: 'var(--accent-coral)' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Money-Graph Engine (Mule Traits):</span>
                          <strong>{selectedCase.breakdown.money_graph_risk}%</strong>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedCase.breakdown.money_graph_risk}%`, height: '100%', background: 'var(--accent-amber)' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Emerging-Cluster (HDBSCAN Novelty):</span>
                          <strong>{selectedCase.breakdown.novelty_anomaly_score}%</strong>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${selectedCase.breakdown.novelty_anomaly_score}%`, height: '100%', background: 'var(--accent-purple)' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Redacted Content Snippet */}
                {selectedCase.redacted_message && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                    <div style={{ color: 'var(--text-dim)', marginBottom: '4px', fontWeight: 600 }}>REDACTED CONTENT SNIPPET:</div>
                    <div style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{selectedCase.redacted_message}"
                    </div>
                  </div>
                )}

                {/* Analyst Notes */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Analyst Review Notes</label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter reason for release or confirmed fraud..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      marginTop: '4px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {selectedCase && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                className="btn btn-success"
                onClick={() => handleAction('RELEASE')}
                style={{ flex: 1, padding: '12px' }}
              >
                <CheckCircle2 size={16} /> Release to Payment Rail
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleAction('BLOCK')}
                style={{ flex: 1, padding: '12px' }}
              >
                <XCircle size={16} /> Confirm Fraud & Block Mule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Immutable Audit Log (Slide 07) */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Immutable Audit Log (RBI & DPDP-Act Compliance)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '8px' }}>AUDIT ID</th>
                <th style={{ padding: '8px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px' }}>EVENT</th>
                <th style={{ padding: '8px' }}>TXN ID</th>
                <th style={{ padding: '8px' }}>RISK (R)</th>
                <th style={{ padding: '8px' }}>TIER</th>
                <th style={{ padding: '8px' }}>REASON / NOTES</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{log.audit_id}</td>
                  <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{log.timestamp.split('T')[1]?.substring(0, 8) || log.timestamp}</td>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{log.event}</td>
                  <td style={{ padding: '8px', fontFamily: 'monospace' }}>{log.txn_id}</td>
                  <td style={{ padding: '8px', color: log.risk_score >= 85 ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                    {log.risk_score ? `R=${log.risk_score}` : '-'}
                  </td>
                  <td style={{ padding: '8px' }}>{log.tier || '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{log.notes || log.reason_code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
