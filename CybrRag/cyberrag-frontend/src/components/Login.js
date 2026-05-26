// src/components/Login.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiErrorMessage } from '../services/api';

const mono = '"JetBrains Mono", monospace';
const head = '"Helvetica Neue", "Inter", sans-serif';

// Animated terminal line that types itself
const TypeLine = ({ text, delay = 0, color = '#555' }) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 28);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return (
    <div style={{ fontFamily: mono, fontSize: '0.7rem', color, lineHeight: 1.6 }}>
      {shown}<span style={{ animation: 'blink 1s step-end infinite', opacity: shown.length < text.length ? 1 : 0 }}>█</span>
    </div>
  );
};

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    try {
      await login(form.login, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials. Please try again.'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', overflow: 'hidden', fontFamily: head }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .auth-input {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #444;
          color: #fff; font-family: ${mono}; font-size: 0.95rem; padding: 12px 0;
          outline: none; transition: border-color 0.3s; box-sizing: border-box;
        }
        .auth-input:focus { border-bottom-color: #fff; }
        .auth-input::placeholder { color: #666; }
      `}</style>

      {/* Left panel — terminal log */}
      <div style={{ width: '45%', borderRight: '1px solid #111', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        {/* Scanning line */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)', animation: 'scan 6s linear infinite', pointerEvents: 'none' }} />

        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: '0.8rem', color: '#555', letterSpacing: '0.1em' }}>THREATLENS ©</div>
          </motion.div>

          <div style={{ fontFamily: mono, fontSize: '0.65rem', color: '#333', marginBottom: 24 }}>// SYSTEM LOG</div>
          <TypeLine text="> Initializing ThreatLens auth module..." delay={200} color="#888" />
          <TypeLine text="> Connecting to security fabric..." delay={800} color="#777" />
          <TypeLine text="> Verifying session tokens..." delay={1500} color="#888" />
          <TypeLine text="> AWAITING CREDENTIALS" delay={2200} color="#bbb" />
        </div>

        <div>
          {[
            { num: '11', label: 'Detection Rules' },
            { num: '<3s', label: 'AI Report Time' },
            { num: '∞', label: 'Campaign Memory' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 + i * 0.15 }}
              style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: head, fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{s.num}</span>
              <span style={{ fontFamily: mono, fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase' }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ fontFamily: mono, fontSize: '0.7rem', color: '#999', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            // ACCESS TERMINAL
          </div>

          <h1 style={{ fontFamily: head, fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 8px', textTransform: 'uppercase', lineHeight: 1 }}>
            Sign In.
          </h1>
          <p style={{ fontFamily: mono, fontSize: '0.75rem', color: '#888', margin: '0 0 48px' }}>
            Your security command center awaits.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontFamily: mono, fontSize: '0.75rem', color: '#fff', background: '#111', border: '1px solid #333', padding: '12px 16px', marginBottom: 32 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <label style={{ fontFamily: mono, fontSize: '0.65rem', color: focused === 'login' ? '#fff' : '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, transition: 'color 0.3s' }}>
                Username / Email
              </label>
              <input className="auth-input" type="text" placeholder="analyst or analyst@company.com"
                value={form.login} onChange={e => setForm({ ...form, login: e.target.value })}
                onFocus={() => setFocused('login')} onBlur={() => setFocused('')}
                autoComplete="username" autoFocus />
            </div>

            <div>
              <label style={{ fontFamily: mono, fontSize: '0.65rem', color: focused === 'pass' ? '#fff' : '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', marginBottom: 8, transition: 'color 0.3s' }}>
                <span>Password</span>
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', color: '#aaa' }}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </span>
              </label>
              <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                autoComplete="current-password" />
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                background: '#fff', color: '#000', border: 'none', padding: '18px 32px',
                fontFamily: head, fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase',
                letterSpacing: '-0.02em', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
              }}>
              {loading ? '// AUTHENTICATING...' : 'ACCESS SYSTEM →'}
            </motion.button>
          </form>

          <div style={{ fontFamily: mono, fontSize: '0.7rem', color: '#888', marginTop: 32 }}>
            No account?{' '}
            <Link to="/signup" style={{ color: '#fff', textDecoration: 'none', borderBottom: '1px solid #333' }}>
              Initialize one →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
