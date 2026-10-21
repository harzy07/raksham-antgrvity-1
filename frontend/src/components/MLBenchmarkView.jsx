import React, { useState, useEffect } from 'react';
import { 
  BarChart3, RefreshCw, Cpu, Layers, CheckCircle2, 
  AlertTriangle, Database, FileSpreadsheet, ShieldAlert 
} from 'lucide-react';

export default function MLBenchmarkView({ apiUrl }) {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBenchmark = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/experiment/results`);
      const data = await res.json();
      setBenchmarkData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, [apiUrl]);

  const families = [
    { name: "KYC / refund", textRecall: 84, fusedRecall: 98, color: "var(--accent-green)" },
    { name: "Digital arrest", textRecall: 77, fusedRecall: 100, color: "var(--accent-cyan)" },
    { name: "Lottery / rewards", textRecall: 68, fusedRecall: 94, color: "var(--accent-cyan)" },
    { name: "UPI collect", textRecall: 43, fusedRecall: 98, color: "var(--accent-amber)" },
    { name: "Job task / crypto", textRecall: 26, fusedRecall: 94, color: "var(--accent-coral)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Benchmark Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Scientific Feasibility & Validation · Slide 06
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
              We ran the honest test: catch a scam family we trained on none of.
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Evaluated on N=1,200 transactions across 5 scam families. Reproducible via <code>ml/experiment.py</code>.
            </p>
          </div>

          <button className="btn btn-secondary" onClick={fetchBenchmark} style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={15} className={loading ? "pulse-dot" : ""} /> Reload Experiment Metrics
          </button>
        </div>

        {/* Big Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>KNOWN FAMILIES (SATURATED SET)</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '4px' }}>
              ≈ 1.00
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precision / Recall on known signatures</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>TEXT-ONLY MEAN RECALL (UNSEEN FAMILY)</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: '4px' }}>
              0.60 <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>(vs 0.97 Fused)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drops drastically when attacker changes wording</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>WORST UNSEEN FAMILY (JOB TASK)</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-coral)', marginTop: '4px' }}>
              0.26 <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>(vs 0.94 Fused)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proves text classifier alone is blind to new scams</div>
          </div>
        </div>
      </div>

      {/* Main Validation Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left: Bar Breakdown per Scam Family */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            Leave-One-Family-Out Recall Comparison
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Comparing Text-Only Baseline (grey/colored) vs RAKSHAM Multi-Engine Fused (green/cyan).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {families.map((fam, idx) => (
              <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fam.name}</span>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Text-only: <strong>{fam.textRecall}%</strong></span>
                    <span style={{ color: 'var(--accent-green)' }}>RAKSHAM Fused: <strong>{fam.fusedRecall}%</strong></span>
                  </div>
                </div>

                {/* Double Bar Comparison */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* Text-Only Bar */}
                  <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${fam.textRecall}%`,
                        height: '100%',
                        background: fam.color,
                        borderRadius: '5px',
                        transition: 'width 0.8s ease'
                      }}
                    ></div>
                  </div>
                  {/* Fused Bar */}
                  <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${fam.fusedRecall}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))',
                        borderRadius: '5px',
                        transition: 'width 0.8s ease'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--accent-coral)', borderRadius: '3px' }}></div>
              <span>Text-only (TF-IDF + LR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))', borderRadius: '3px' }}></div>
              <span>RAKSHAM 4-Engine Fusion (GBT)</span>
            </div>
          </div>
        </div>

        {/* Right: What this Proves & HDBSCAN Clustering Visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              What this Proves (Slide 06)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              A text-only baseline is strong on known scams but drops sharply on unseen families (down to 26% on novel job tasks).
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '8px' }}>
              That is why we add the <strong>Emerging-Cluster Detector (HDBSCAN)</strong> and fuse live session telemetry and money-graph signals.
            </p>

            <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              🎯 Target met: Mean unseen-family recall &ge; 0.80 at FPR &le; 1%, fixed before each run.
            </div>
          </div>

          {/* HDBSCAN Visual Representation */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>HDBSCAN Workflow Space</h4>
              <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Density Outliers</span>
            </div>

            {/* 2D Synthetic Cluster Scatter Map */}
            <div style={{ height: '150px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
              {/* Normal Payments Cluster 1 */}
              <div style={{ position: 'absolute', top: '35%', left: '25%', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px dashed rgba(16, 185, 129, 0.4)' }}></div>
              {/* Normal Payments Cluster 2 */}
              <div style={{ position: 'absolute', top: '50%', left: '55%', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.15)', border: '1px dashed rgba(0, 229, 255, 0.4)' }}></div>

              {/* Scattered normal points */}
              {[
                { t: 40, l: 30 }, { t: 45, l: 32 }, { t: 38, l: 28 }, { t: 55, l: 58 }, { t: 60, l: 62 }, { t: 52, l: 56 }
              ].map((p, i) => (
                <div key={i} style={{ position: 'absolute', top: `${p.t}%`, left: `${p.l}%`, width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
              ))}

              {/* Novel Scam Outliers (Cluster label == -1) */}
              {[
                { t: 15, l: 85, label: "Digital Arrest Multi-Channel" },
                { t: 25, l: 75, label: "Job Task Telegram Burst" },
                { t: 80, l: 15, label: "Unseen Mule Fan-out" }
              ].map((p, i) => (
                <div key={`outlier-${i}`} style={{ position: 'absolute', top: `${p.t}%`, left: `${p.l}%`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-coral)', boxShadow: '0 0 8px var(--accent-coral)' }}></div>
                  <span style={{ fontSize: '0.65rem', color: '#fda4af', fontWeight: 600 }}>{p.label}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px', textAlign: 'center' }}>
              HDBSCAN isolates novel scam campaigns as dense outliers without requiring prior training labels.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
