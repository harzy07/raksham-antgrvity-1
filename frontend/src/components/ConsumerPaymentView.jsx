import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, PhoneCall, 
  Eye, EyeOff, Lock, Clock, Send, Smartphone, Monitor, ArrowRight,
  CheckCircle2, RefreshCw, UserCheck
} from 'lucide-react';

const PRESETS = [
  {
    label: "Safe Transfer to Son",
    tag: "LOW RISK (0-39)",
    user_id: "meera_61",
    vpa: "son_rahul@okhdfc",
    name: "Rahul Verma (Son)",
    amount: 5000,
    message: "Hi Maa, sending money for groceries and milk.",
    call: false,
    screenShare: false,
    newDevice: false,
    pastedVpa: false,
  },
  {
    label: "New Payee / Large Bill",
    tag: "MEDIUM RISK (40-69)",
    user_id: "meera_61",
    vpa: "bescom_power@sbi",
    name: "BESCOM Billing",
    amount: 1850,
    message: "Payment due for electricity bill. Clear immediately.",
    call: false,
    screenShare: false,
    newDevice: false,
    pastedVpa: true,
  },
  {
    label: "Lottery Prize Caller",
    tag: "HIGH RISK (70-84)",
    user_id: "meera_61",
    vpa: "kbc_winner_payout@paytm",
    name: "KBC Payout Cell",
    amount: 8500,
    message: "Congratulations! Won 25 Lakhs KBC Lucky Draw. Pay processing fee of Rs 8,500 to officer Rana Singh on 9876543210. OTP is 4920.",
    call: true,
    screenShare: false,
    newDevice: true,
    pastedVpa: true,
  },
  {
    label: "Coached Digital Arrest",
    tag: "CRITICAL RISK (85-100)",
    user_id: "meera_61",
    vpa: "mule_4921@okaxis",
    name: "CBI Safe Collateral Escrow",
    amount: 48500,
    message: "DCP Cyber Cell Crime Branch: Narcotics parcel seized under Aadhaar. You are under digital arrest. Stay on video call. Transfer Rs 48,500 security deposit immediately.",
    call: true,
    screenShare: true,
    newDevice: true,
    pastedVpa: true,
  }
];

export default function ConsumerPaymentView({ apiUrl }) {
  const [userId, setUserId] = useState("meera_61");
  const [vpa, setVpa] = useState("mule_4921@okaxis");
  const [payeeName, setPayeeName] = useState("CBI Safe Collateral Escrow");
  const [amount, setAmount] = useState(48500);
  const [rawText, setRawText] = useState(
    "DCP Cyber Crime Mumbai: A courier in your name contains narcotics. You are under digital arrest. Contact officer at 9876543210. Your OTP code is 884102. Transfer Rs 48,500 to account 912345678912."
  );
  
  // Session & Context Signals
  const [callActive, setCallActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(true);
  const [newDevice, setNewDevice] = useState(true);
  const [pastedVpa, setPastedVpa] = useState(true);
  
  // Client Redaction state
  const [redactedText, setRedactedText] = useState("");
  const [maskedEntities, setMaskedEntities] = useState([]);
  const [showRedactionPreview, setShowRedactionPreview] = useState(true);
  
  // Response & Modal states
  const [loading, setLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'MEDIUM', 'HIGH', 'CRITICAL', 'LOW'
  const [timerCount, setTimerCount] = useState(30);

  // Client-side instant redaction
  useEffect(() => {
    async function performRedaction() {
      try {
        const res = await fetch(`${apiUrl}/api/redact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_text: rawText })
        });
        const data = await res.json();
        setRedactedText(data.redacted_text);
        setMaskedEntities(data.masked_entities || []);
      } catch (err) {
        // Fallback local regex masking
        let txt = rawText
          .replace(/[6-9]\d{9}/g, '[REDACTED_PHONE]')
          .replace(/\b\d{4,6}\b/g, '[REDACTED_OTP]');
        setRedactedText(txt);
      }
    }
    performRedaction();
  }, [rawText, apiUrl]);

  // High tier 30s timer
  useEffect(() => {
    let interval = null;
    if (activeModal === 'HIGH' && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, timerCount]);

  const loadPreset = (p) => {
    setUserId(p.user_id);
    setVpa(p.vpa);
    setPayeeName(p.name);
    setAmount(p.amount);
    setRawText(p.message);
    setCallActive(p.call);
    setScreenShareActive(p.screenShare);
    setNewDevice(p.newDevice);
    setPastedVpa(p.pastedVpa);
    setScoreResult(null);
    setActiveModal(null);
  };

  const handlePay = async () => {
    setLoading(true);
    setScoreResult(null);
    try {
      const payload = {
        user_id: userId,
        beneficiary_vpa: vpa,
        beneficiary_name: payeeName,
        amount: parseFloat(amount),
        redacted_message: redactedText,
        session: {
          call_active: callActive,
          screen_share_active: screenShareActive,
          time_on_step: callActive ? 120 : 15,
          app_switched_count: 2
        },
        context: {
          device_id: "DEV_XIAOMI_NOTE",
          is_new_device: newDevice,
          pasted_vpa: pastedVpa,
          geo_velocity_kmh: 0.0,
          is_odd_hour: false
        }
      };

      const res = await fetch(`${apiUrl}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setScoreResult(data);
      setTimerCount(30);
      setActiveModal(data.tier);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
      {/* LEFT COLUMN: UPI Pay App View (Meera) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(0, 229, 255, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Smartphone size={22} color="var(--accent-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Consumer Payment Flow</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Persona: Meera, 61 · Trusted-Payee Suppression Active</p>
            </div>
          </div>
          <span className="badge badge-low">Live SDK Snippet</span>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            1-Click Demo Scenarios (From Pitch Deck)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>₹{p.amount.toLocaleString()} · {p.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Beneficiary UPI ID (VPA)</label>
              <input
                type="text"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Amount (₹ INR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Beneficiary Display Name</label>
            <input
              type="text"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                marginTop: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* User Forwarded Lure Text & Trust Boundary 1 Redaction Preview */}
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={15} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Forwarded Suspicious SMS / WhatsApp Lure</span>
              </div>
              <button
                onClick={() => setShowRedactionPreview(!showRedactionPreview)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                {showRedactionPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showRedactionPreview ? "View Raw Text" : "View Redacted Preview"}
              </button>
            </div>

            {!showRedactionPreview ? (
              <textarea
                rows={3}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste message received from caller/SMS here..."
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit'
                }}
              />
            ) : (
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', border: '1px solid #1e3a5f' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
                  TRUST BOUNDARY 1 PREVIEW: CLIENT-SIDE MASKED (OTP/PHONES/CARDS HIDDEN)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {redactedText || "No text provided"}
                </div>
                {maskedEntities.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {maskedEntities.map((m, idx) => (
                      <span key={idx} style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>
                        🛡️ Masked {m.type}: {m.original_snippet}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-time Client Telemetry Toggles */}
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
              SIMULATED CLIENT & SESSION SIGNALS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={callActive} onChange={(e) => setCallActive(e.target.checked)} />
                <span style={{ color: callActive ? 'var(--accent-coral)' : 'var(--text-muted)', fontWeight: callActive ? 600 : 400 }}>
                  📞 Call Active in Background
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={screenShareActive} onChange={(e) => setScreenShareActive(e.target.checked)} />
                <span style={{ color: screenShareActive ? 'var(--accent-coral)' : 'var(--text-muted)', fontWeight: screenShareActive ? 600 : 400 }}>
                  🖥️ Screen-Share (AnyDesk) Active
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={newDevice} onChange={(e) => setNewDevice(e.target.checked)} />
                <span style={{ color: newDevice ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                  📱 Unrecognized New Device
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={pastedVpa} onChange={(e) => setPastedVpa(e.target.checked)} />
                <span style={{ color: pastedVpa ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                  📋 VPA Pasted from Clipboard
                </span>
              </label>
            </div>
          </div>

          {/* Pay Button */}
          <button
            className="btn btn-primary"
            onClick={handlePay}
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '6px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="pulse-dot" /> Scoring Pre-Transaction Risk...
              </>
            ) : (
              <>
                Authorize & Pay ₹{parseFloat(amount || 0).toLocaleString()} <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Intervention & Friction Budget Preview (Slide 05) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Dynamic Slide 05 Friction Dialogue */}
        <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Friction Budget Modal</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Slide 05 Spec</span>
          </div>

          {!scoreResult ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              <ShieldCheck size={48} color="#1e2c4f" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem' }}>Choose a preset or click <strong>Authorize & Pay</strong> to trigger the live pre-transaction risk call on the payment path.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#475569' }}>Target Latency: &lt; 300 ms inline budget</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* LOW TIER DIALOGUE */}
              {scoreResult.tier === 'LOW' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <CheckCircle2 size={28} color="var(--accent-green)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>LOW · 0–39: Silent Allow</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    No interruption to Meera. Logged for the model and money-graph only.
                  </p>
                  <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                    ✓ Trusted-payee suppression active: Zero friction for familiar family payee.
                  </div>
                </div>
              )}

              {/* MEDIUM TIER DIALOGUE */}
              {scoreResult.tier === 'MEDIUM' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', marginBottom: '10px' }}>
                    <AlertTriangle size={24} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RAKSHAM · MEDIUM 40–69</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    New payee, first time, large amount.
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Check who asked you to pay before you continue.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>Proceed</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setScoreResult(null)}>Not now</button>
                  </div>
                </div>
              )}

              {/* HIGH TIER DIALOGUE */}
              {scoreResult.tier === 'HIGH' && (
                <div style={{ background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c', marginBottom: '10px' }}>
                    <PhoneCall size={24} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RAKSHAM · HIGH 70–84</span>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                    Are you on a call with someone guiding this payment?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Please wait {timerCount} seconds. A genuine bank or government agency will never rush you.
                  </p>
                  
                  {/* Countdown Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                    <Clock size={18} color="#fb923c" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cooling-off timer: {timerCount}s remaining</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} disabled={timerCount > 0}>
                      {timerCount > 0 ? `I'm alone (${timerCount}s)` : "I'm alone"}
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setScoreResult(null)}>
                      Stop & Exit
                    </button>
                  </div>
                </div>
              )}

              {/* CRITICAL TIER DIALOGUE */}
              {scoreResult.tier === 'CRITICAL' && (
                <div className="glow-coral" style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.5)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-coral)', marginBottom: '10px' }}>
                    <ShieldAlert size={26} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RAKSHAM · CRITICAL 85–100</span>
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
                    We’ve paused this transfer for your safety.
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '8px' }}>
                    An analyst is reviewing. Your bank will call you on a verified line. <strong>No money has moved.</strong>
                  </p>
                  <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', color: '#fda4af' }}>
                    ⚠️ Soft-Hold before debit fired. Case automatically routed to PSP Fraud Analyst (Arjun).
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>Okay</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert(`Reason: ${scoreResult.reason_code}`)}>
                      Why?
                    </button>
                  </div>
                </div>
              )}

              {/* Calibrated Score Metric Card */}
              <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Calibrated Score R ∈ [0, 100]</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: scoreResult.risk_score >= 85 ? 'var(--accent-coral)' : (scoreResult.risk_score >= 40 ? 'var(--accent-amber)' : 'var(--accent-green)') }}>
                    R = {scoreResult.risk_score}
                  </span>
                </div>

                {/* Score Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '10px' }}>
                  <div style={{ width: '40%', background: 'rgba(16, 185, 129, 0.4)', borderRight: '1px solid #111' }}></div>
                  <div style={{ width: '30%', background: 'rgba(245, 158, 11, 0.4)', borderRight: '1px solid #111' }}></div>
                  <div style={{ width: '15%', background: 'rgba(249, 115, 22, 0.4)', borderRight: '1px solid #111' }}></div>
                  <div style={{ width: '15%', background: 'rgba(244, 63, 94, 0.4)' }}></div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Audit Reason Code:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600, textAlign: 'right', maxWidth: '240px' }}>{scoreResult.reason_code}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Inline Risk Latency:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{scoreResult.latency_ms} ms</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
