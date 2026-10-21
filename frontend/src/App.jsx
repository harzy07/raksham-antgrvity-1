import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Smartphone, Users, 
  GitBranch, BarChart3, Layers, CheckCircle2, AlertCircle, Wifi
} from 'lucide-react';

import ConsumerPaymentView from './components/ConsumerPaymentView';
import AnalystConsoleView from './components/AnalystConsoleView';
import TrajectorySimulator from './components/TrajectorySimulator';
import MLBenchmarkView from './components/MLBenchmarkView';
import ArchitectureView from './components/ArchitectureView';

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [activeTab, setActiveTab] = useState('consumer');
  const [backendHealth, setBackendHealth] = useState({ online: false, latency: null });

  // Ping backend health
  useEffect(() => {
    async function checkHealth() {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_URL}/api/health`);
        if (res.ok) {
          const t1 = performance.now();
          setBackendHealth({ online: true, latency: Math.round(t1 - t0) });
        } else {
          setBackendHealth({ online: false, latency: null });
        }
      } catch (err) {
        setBackendHealth({ online: false, latency: null });
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(13, 21, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00e5ff 0%, #0d1527 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)'
            }}
          >
            <ShieldAlert size={24} color="#070b14" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff' }}>
                RAKSHAM
              </span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                HACKATHON FINALE EDITION
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              AI-Driven Scam Pattern Recognition · UPI · Banking · Wallets
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'consumer', label: "Meera's UPI App", icon: <Smartphone size={16} /> },
            { id: 'analyst', label: "Arjun's Console", icon: <Users size={16} /> },
            { id: 'trajectory', label: "Threat Trajectory", icon: <GitBranch size={16} /> },
            { id: 'benchmark', label: "ML Benchmark (LOFO)", icon: <BarChart3 size={16} /> },
            { id: 'architecture', label: "Trust & STRIDE", icon: <Layers size={16} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  background: isActive ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* System & Offline Health Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: backendHealth.online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${backendHealth.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: backendHealth.online ? 'var(--accent-green)' : 'var(--accent-coral)'
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendHealth.online ? 'var(--accent-green)' : 'var(--accent-coral)'
              }}
              className="pulse-dot"
            />
            {backendHealth.online ? (
              <span>Offline-Ready API ({backendHealth.latency}ms)</span>
            ) : (
              <span>Connecting to Backend...</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'consumer' && <ConsumerPaymentView apiUrl={API_URL} />}
        {activeTab === 'analyst' && <AnalystConsoleView apiUrl={API_URL} />}
        {activeTab === 'trajectory' && <TrajectorySimulator apiUrl={API_URL} />}
        {activeTab === 'benchmark' && <MLBenchmarkView apiUrl={API_URL} />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px 28px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        RAKSHAM · "The scam went AI-native. The payment still looks legitimate. We protect Meera. We equip Arjun." · Built for Hackathon Offline Finale
      </footer>
    </div>
  );
}
