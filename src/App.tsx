import { useState, useEffect } from 'react'

const SETUP_STEPS = [
  {
    step: '01',
    title: 'Install Python 3.8+',
    cmd: 'python3 --version',
    desc: 'Ensure Python 3.8 or higher is installed on your system.',
  },
  {
    step: '02',
    title: 'Navigate to App Directory',
    cmd: 'cd threat_intel_app',
    desc: 'Enter the application directory.',
  },
  {
    step: '03',
    title: 'Start the Application',
    cmd: './start.sh [PORT] [DATA_FILE] [DEBUG]',
    desc: 'Run the start script. It auto-creates a virtualenv, installs deps, and launches the server.',
  },
  {
    step: '04',
    title: 'Access ThreatNexus',
    cmd: 'http://localhost:5000',
    desc: 'Open your browser. On first boot, you\'ll be prompted to create the admin account.',
  },
]

const FEATURES = [
  { icon: '🛡', title: 'CVE Records', desc: 'Track vulnerabilities with severity, type (RCE/LPE/SQLi...), PoC code, references, and country targeting.' },
  { icon: '🗺', title: 'Access Map', desc: 'Map all your hosts/IPs with associated CVEs, services, OS, notes, and country data.' },
  { icon: '🌍', title: '3D World Globe', desc: 'Interactive 3D black & white globe showing country-level heatmap of your access data with click-to-filter.' },
  { icon: '🔑', title: 'Credential Manager', desc: 'Securely store SSH, RDP, FortiGate, SMB and any service credentials with custom columns.' },
  { icon: '👥', title: 'Users & Groups', desc: 'Admin creates users, multiple group assignments per user, group-based data isolation.' },
  { icon: '🔒', title: 'Security', desc: 'PBKDF2-SHA256 hashing, secure sessions, CSP headers, XSS/CSRF protection, no external DB.' },
]

const SCRIPTS = [
  { name: 'start.sh', desc: 'Start the application', usage: './start.sh 5000 ./data/intel.json false', color: '#00ff88' },
  { name: 'stop.sh', desc: 'Stop the application', usage: './stop.sh', color: '#ff4444' },
  { name: 'restart.sh', desc: 'Restart with new settings', usage: './restart.sh 8080', color: '#ffcc00' },
]

export default function App() {
  const [copied, setCopied] = useState<string | null>(null)
  const [time, setTime] = useState(new Date().toUTCString())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toUTCString()), 1000)
    return () => clearInterval(t)
  }, [])

  const copyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      color: '#e8e8e8',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      padding: '0',
    }}>
      {/* Header */}
      <div style={{
        background: '#0a0a0a',
        borderBottom: '1px solid #222',
        padding: '0 40px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#fff',
            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '14px', filter: 'invert(1)' }}>🛡</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '0.5px' }}>THREATNEXUS</span>
          <span style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' }}>Setup Guide</span>
        </div>
        <span style={{ fontSize: '11px', color: '#444' }}>{time.replace('GMT', 'UTC')}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        borderBottom: '1px solid #111',
        padding: '80px 40px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #333',
            borderRadius: '2px',
            fontSize: '10px',
            color: '#666',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>Threat Intelligence Platform v1.0</div>
          <h1 style={{
            fontSize: '52px', fontWeight: 700, color: '#fff',
            letterSpacing: '-1px', margin: '0 0 16px',
            textShadow: '0 0 40px rgba(255,255,255,0.1)',
          }}>THREATNEXUS</h1>
          <p style={{ fontSize: '14px', color: '#666', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.7' }}>
            A compact, secure Python web application for threat intelligence and CVE organization.
            Runs from a single script with zero external database requirements.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              padding: '4px 12px', background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.3)', borderRadius: '2px',
              fontSize: '11px', color: '#00ff88',
            }}>● No Database Required</div>
            <div style={{
              padding: '4px 12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px',
              fontSize: '11px', color: '#888',
            }}>● JSON File Storage</div>
            <div style={{
              padding: '4px 12px', background: 'rgba(68,136,255,0.1)',
              border: '1px solid rgba(68,136,255,0.3)', borderRadius: '2px',
              fontSize: '11px', color: '#4488ff',
            }}>● Flask + Python</div>
            <div style={{
              padding: '4px 12px', background: 'rgba(255,204,0,0.1)',
              border: '1px solid rgba(255,204,0,0.3)', borderRadius: '2px',
              fontSize: '11px', color: '#ffcc00',
            }}>● 3D Globe Map</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>

        {/* Quick Start */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>Quick Start</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#555', marginBottom: '32px' }}>Get up and running in minutes</p>
          <div style={{ display: 'grid', gap: '16px' }}>
            {SETUP_STEPS.map((s) => (
              <div key={s.step} style={{
                background: '#0a0a0a', border: '1px solid #1a1a1a',
                borderRadius: '8px', padding: '20px 24px',
                display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '20px', alignItems: 'center'
              }}>
                <div style={{ fontWeight: 700, fontSize: '28px', color: '#222', fontFamily: 'monospace' }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '6px' }}>{s.title}</div>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.5' }}>{s.desc}</div>
                </div>
                <div
                  style={{
                    background: '#000', border: '1px solid #222', borderRadius: '4px',
                    padding: '8px 16px', fontSize: '11px', color: '#00ff88', cursor: 'pointer',
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'border-color 0.15s',
                  }}
                  onClick={() => copyCmd(s.cmd, s.step)}
                >
                  <code>{s.cmd}</code>
                  <span style={{ color: '#444', fontSize: '10px' }}>{copied === s.step ? '✓ copied' : '📋'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scripts */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>Management Scripts</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#555', marginBottom: '32px' }}>
            The app includes bash scripts for easy lifecycle management. All scripts accept customizable arguments.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {SCRIPTS.map((s) => (
              <div key={s.name} style={{
                background: '#0a0a0a', border: '1px solid #1a1a1a',
                borderRadius: '8px', padding: '20px', overflow: 'hidden',
                borderTop: `2px solid ${s.color}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: s.color, fontWeight: 700 }}>{s.name}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '16px' }}>{s.desc}</div>
                <div
                  style={{
                    background: '#000', border: '1px solid #1a1a1a', borderRadius: '4px',
                    padding: '10px 14px', fontSize: '11px', color: s.color, cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onClick={() => copyCmd(s.usage, s.name)}
                >
                  <code>{s.usage}</code>
                  <span style={{ color: '#333', fontSize: '10px', marginLeft: '8px' }}>{copied === s.name ? '✓' : '📋'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Script Arguments */}
          <div style={{
            background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px',
            padding: '24px', marginTop: '16px',
          }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#888', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Start Script Arguments
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555', fontWeight: 400, fontSize: '10px', textTransform: 'uppercase' }}>Argument</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555', fontWeight: 400, fontSize: '10px', textTransform: 'uppercase' }}>Default</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#555', fontWeight: 400, fontSize: '10px', textTransform: 'uppercase' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { arg: '$1 — PORT', def: '5000', desc: 'HTTP port to listen on (1-65535)' },
                  { arg: '$2 — DATA_FILE', def: './data/threat_intel.json', desc: 'Path to JSON data storage file' },
                  { arg: '$3 — DEBUG', def: 'false', desc: 'Enable Flask debug mode (true/false)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '10px 12px', color: '#00ff88', fontFamily: 'monospace', fontSize: '11px' }}>{r.arg}</td>
                    <td style={{ padding: '10px 12px', color: '#888', fontFamily: 'monospace', fontSize: '11px' }}>{r.def}</td>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '11px' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>Features</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#555', marginBottom: '32px' }}>Everything you need for threat intelligence management</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: '#0a0a0a', border: '1px solid #1a1a1a',
                borderRadius: '8px', padding: '20px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Notes */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>Security Architecture</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>
          <div style={{
            background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Password Hashing', value: 'PBKDF2-SHA256 (600K rounds)', color: '#00ff88' },
                { label: 'Session Security', value: 'HttpOnly, SameSite=Lax cookies', color: '#00ff88' },
                { label: 'Input Sanitization', value: 'HTML escaping on all user input', color: '#00ff88' },
                { label: 'Content Security Policy', value: 'Strict CSP headers enforced', color: '#00ff88' },
                { label: 'XSS Protection', value: 'X-XSS-Protection header + CSP', color: '#00ff88' },
                { label: 'Clickjacking', value: 'X-Frame-Options: DENY', color: '#00ff88' },
                { label: 'Data Isolation', value: 'Group-based access control', color: '#ffcc00' },
                { label: 'One-time Setup', value: 'Admin created only on first boot', color: '#4488ff' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: item.color, marginTop: '2px' }}>●</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* File Structure */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>File Structure</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>
          <div style={{
            background: '#000', border: '1px solid #1a1a1a', borderRadius: '8px',
            padding: '24px', fontFamily: 'monospace', fontSize: '12px', color: '#555',
          }}>
            {[
              { indent: 0, text: 'threat_intel_app/', color: '#fff' },
              { indent: 1, text: 'app.py', color: '#00ff88', comment: '← Flask application & API' },
              { indent: 1, text: 'requirements.txt', color: '#888', comment: '← Python dependencies' },
              { indent: 1, text: 'start.sh', color: '#ffcc00', comment: '← Start script (takes port/file args)' },
              { indent: 1, text: 'stop.sh', color: '#ff4444', comment: '← Stop script' },
              { indent: 1, text: 'restart.sh', color: '#4488ff', comment: '← Restart script' },
              { indent: 1, text: 'templates/', color: '#fff' },
              { indent: 2, text: 'index.html', color: '#888', comment: '← Main SPA template' },
              { indent: 1, text: 'static/', color: '#fff' },
              { indent: 2, text: 'app.js', color: '#888', comment: '← Frontend JavaScript' },
              { indent: 1, text: 'data/', color: '#fff', comment: '← Auto-created' },
              { indent: 2, text: 'threat_intel.json', color: '#555', comment: '← All data stored here' },
              { indent: 1, text: '.venv/', color: '#333', comment: '← Auto-created virtualenv' },
              { indent: 1, text: '.secret_key', color: '#333', comment: '← Auto-generated secret' },
              { indent: 1, text: 'threatnexus.log', color: '#333', comment: '← Application logs' },
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#1a1a1a' }}>{'│ '.repeat(line.indent)}</span>
                <span style={{ color: line.color }}>{line.text}</span>
                {line.comment && <span style={{ color: '#333' }}>{line.comment}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #111', paddingTop: '32px', textAlign: 'center',
          fontSize: '11px', color: '#333',
        }}>
          <p>ThreatNexus — Threat Intelligence Platform</p>
          <p style={{ marginTop: '4px' }}>Secure · Lightweight · No External Database · Self-contained</p>
        </div>
      </div>
    </div>
  )
}
