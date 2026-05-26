// src/components/Signup.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiErrorMessage } from '../services/api';

const mono = '"JetBrains Mono", monospace';
const head = '"Helvetica Neue", "Inter", sans-serif';

const FieldBlock = ({ label, children, active }) => (
  <div style={{ marginBottom: 28 }}>
    <label style={{
      fontFamily: mono, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em',
      color: active ? '#fff' : '#888', display: 'block', marginBottom: 8, transition: 'color 0.3s',
    }}>{label}</label>
    {children}
  </div>
);

export default function Signup() {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', organization: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [step, setStep] = useState(0); // step counter for sidebar
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Progress sidebar steps
  const steps = ['Identity', 'Contact', 'Security'];
  const currentStep = form.username ? (form.email ? 2 : 1) : 0;

  const validate = () => {
    if (!form.username || !form.email || !form.password) return 'Username, email and password are required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      await signup({ username: form.username, full_name: form.full_name || undefined, email: form.email, organization: form.organization || undefined, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create account. Try a different username.'));
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', overflow: 'hidden', fontFamily: head }}>
      <style>{`
        @keyframes scan { 0%{top:-2px} 100%{top:100vh} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .su-input {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #444;
          color: #fff; font-family: ${mono}; font-size: 0.9rem; padding: 10px 0;
          outline: none; transition: border-color 0.3s; box-sizing: border-box;
        }
        .su-input:focus { border-bottom-color: #fff; }
        .su-input::placeholder { color: #666; }
        .su-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media(max-width:600px) { .su-row { grid-template-columns: 1fr; } }
      `}</style>

      {/* Left sidebar — progress tracker */}
      <div style={{ width: 220, borderRight: '1px solid #111', padding: '60px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)', animation: 'scan 8s linear infinite' }} />

        <div>
          <motion.div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: mono, fontSize: '0.75rem', color: '#555', letterSpacing: '0.1em', marginBottom: 64 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            THREATLENS ©
          </motion.div>

          <div style={{ fontFamily: mono, fontSize: '0.62rem', color: '#777', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            // SETUP PROGRESS
          </div>

          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 + 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i <= currentStep ? '#fff' : '#222',
                transition: 'background 0.4s',
                animation: i === currentStep ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontFamily: mono, fontSize: '0.7rem', color: i <= currentStep ? '#fff' : '#666', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.4s' }}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ fontFamily: mono, fontSize: '0.6rem', color: '#777', lineHeight: 1.8 }}>
          <div>→ First account</div>
          <div style={{ color: '#999', marginTop: 4 }}>gets ADMIN role</div>
        </motion.div>
      </div>

      {/* Main form area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 64px', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 560 }}>

          <div style={{ fontFamily: mono, fontSize: '0.65rem', color: '#999', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            // INITIALIZE ACCOUNT
          </div>

          <h1 style={{ fontFamily: head, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 6px', textTransform: 'uppercase', lineHeight: 1 }}>
            Create Access.
          </h1>
          <p style={{ fontFamily: mono, fontSize: '0.72rem', color: '#888', margin: '0 0 48px' }}>
            Deploy your ThreatLens intelligence node.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontFamily: mono, fontSize: '0.72rem', color: '#fff', background: '#0a0a0a', border: '1px solid #333', padding: '12px 16px', marginBottom: 32 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* Row: Username + Full name */}
            <div className="su-row">
              <FieldBlock label="Username *" active={focused === 'username'}>
                <input className="su-input" type="text" placeholder="analyst_01"
                  value={form.username} onChange={set('username')}
                  onFocus={() => setFocused('username')} onBlur={() => setFocused('')}
                  autoComplete="username" autoFocus />
              </FieldBlock>
              <FieldBlock label="Full Name" active={focused === 'full_name'}>
                <input className="su-input" type="text" placeholder="Jane Smith"
                  value={form.full_name} onChange={set('full_name')}
                  onFocus={() => setFocused('full_name')} onBlur={() => setFocused('')}
                  autoComplete="name" />
              </FieldBlock>
            </div>

            <FieldBlock label="Email *" active={focused === 'email'}>
              <input className="su-input" type="email" placeholder="analyst@company.com"
                value={form.email} onChange={set('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                autoComplete="email" />
            </FieldBlock>

            <FieldBlock label="Organization" active={focused === 'org'}>
              <input className="su-input" type="text" placeholder="Acme Security Corp"
                value={form.organization} onChange={set('organization')}
                onFocus={() => setFocused('org')} onBlur={() => setFocused('')} />
            </FieldBlock>

            {/* Row: Password + Confirm */}
            <div className="su-row">
              <FieldBlock label={<span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Password *</span>
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', color: '#555' }}>{showPassword ? 'HIDE' : 'SHOW'}</span>
              </span>} active={focused === 'pass'}>
                <input className="su-input" type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars"
                  value={form.password} onChange={set('password')}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                  autoComplete="new-password" />
              </FieldBlock>
              <FieldBlock label="Confirm Password *" active={focused === 'confirm'}>
                <input className="su-input" type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                  value={form.confirm} onChange={set('confirm')}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                  autoComplete="new-password" />
              </FieldBlock>
            </div>

            {/* Password strength indicator */}
            {form.password.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    height: 2, flex: 1,
                    background: form.password.length >= i * 2 ? '#fff' : '#222',
                    transition: 'background 0.3s',
                  }} />
                ))}
                <span style={{ fontFamily: mono, fontSize: '0.6rem', color: '#555', marginLeft: 8, whiteSpace: 'nowrap' }}>
                  {form.password.length < 4 ? 'WEAK' : form.password.length < 8 ? 'FAIR' : form.password.length < 12 ? 'STRONG' : 'OPTIMAL'}
                </span>
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', background: '#fff', color: '#000', border: 'none', padding: '18px 32px',
                fontFamily: head, fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase',
                letterSpacing: '-0.02em', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s', marginBottom: 24,
              }}>
              {loading ? '// INITIALIZING NODE...' : 'DEPLOY ACCOUNT →'}
            </motion.button>
          </form>

          <div style={{ fontFamily: mono, fontSize: '0.7rem', color: '#888' }}>
            Already initialized?{' '}
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', borderBottom: '1px solid #333' }}>
              Access system →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
