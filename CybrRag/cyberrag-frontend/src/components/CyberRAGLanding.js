// src/components/CyberRAGLanding.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ──── WOW Effects ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// 1. Cursor Spotlight — soft radial glow following mouse
const CursorSpotlight = () => {
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const sx = useSpring(mx, { stiffness: 100, damping: 20 });
  const sy = useSpring(my, { stiffness: 100, damping: 20 });
  useEffect(() => {
    const h = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <motion.div style={{
      position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999,
      width: 700, height: 700, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.045) 0%, transparent 65%)',
      translateX: sx, translateY: sy, marginLeft: -350, marginTop: -350,
    }} />
  );
};

// 2. CRT scanline texture over the whole page
const ScanlineOverlay = () => (
  <Box sx={{
    position: 'fixed', inset: 0, zIndex: 998, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
  }} />
);

// 3. Count-up stat — resets and re-counts every time it enters viewport
const CounterStat = ({ end, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setCount(0);
        let cur = 0;
        const step = Math.max(1, Math.ceil(end / 45));
        const iv = setInterval(() => {
          cur = Math.min(cur + step, end);
          setCount(cur);
          if (cur >= end) clearInterval(iv);
        }, 30);
      } else { setCount(0); }
    }, { threshold: 0.5 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [end]);
  return (
    <Box ref={ref} sx={{ textAlign: 'center', py: 5, px: 2 }}>
      <Typography sx={{ fontFamily: '"Helvetica Neue",sans-serif', fontSize: { xs: '2.8rem', md: '4rem' }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>
        {count}{suffix}
      </Typography>
      <Typography sx={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.62rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', mt: 1.5 }}>
        {label}
      </Typography>
    </Box>
  );
};

// Brutalist Monochrome Theme
const colors = {
  bg: '#000000',
  text: '#ffffff',
  muted: '#666666',
  border: '#333333',
  accent: '#ffffff',
};

const headingFont = '"Helvetica Neue", "Inter", sans-serif';
const bodyFont = '"Inter", "-apple-system", sans-serif';
const monoFont = '"JetBrains Mono", monospace';

const textReveal = {
  hidden: { y: '100%' },
  visible: { y: '0%', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Scramble-then-resolve character animation — retriggers every scroll
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
const ScrambleText = ({ text, delay = 0, className = '', style = {} }) => {
  const [displayed, setDisplayed] = useState(text);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); else setInView(false); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) { setDisplayed(text); return; }
    let iteration = 0;
    const total = 14;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(
          text.split('').map((ch, idx) => {
            if (ch === ' ') return ' ';
            if (idx < iteration) return text[idx];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('')
        );
        iteration += 0.6;
        if (iteration >= text.length) { clearInterval(interval); setDisplayed(text); }
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [inView, text, delay]);

  return <span ref={ref} className={className} style={style}>{displayed}</span>;
};

const AnimatedHeading = ({ children, sx = {} }) => (
  <Box sx={sx}>
    <ScrambleText text={String(children).toUpperCase()} />
  </Box>
);

// Per-letter hover glitch — each character scrambles independently with staggered delay
const HoverGlitch = ({ text, sx = {} }) => {
  const [chars, setChars] = useState(text.split(''));
  const timers = useRef([]);

  const handleMouseEnter = () => {
    timers.current.forEach(clearTimeout);
    timers.current = text.split('').map((orig, i) =>
      setTimeout(() => {
        let count = 0;
        const iv = setInterval(() => {
          setChars(prev => {
            const next = [...prev];
            next[i] = orig === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
            return next;
          });
          count++;
          if (count > 7) {
            clearInterval(iv);
            setChars(prev => { const n = [...prev]; n[i] = orig; return n; });
          }
        }, 45);
      }, i * 30)
    );
  };

  const handleMouseLeave = () => {
    timers.current.forEach(clearTimeout);
    setChars(text.split(''));
  };

  return (
    <Box
      component="span"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ cursor: 'default', display: 'inline-block', userSelect: 'none', ...sx }}
    >
      {chars.map((ch, i) => (
        <Box
          key={i}
          component="span"
          sx={{ display: 'inline-block', minWidth: ch === ' ' ? '0.28em' : undefined }}
        >
          {ch}
        </Box>
      ))}
    </Box>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// ──── Feature Data ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'parsing', label: 'Log Parsing', count: 2,
    features: [
      { id:1, title:'Hybrid Log Parser', short:'Regex-first with LLM fallback.', novelty: "Most SIEMs fail silently on unknown formats. ThreatLens uses AI as a safety net—if regex fails, the LLM understands it contextually." },
      { id:2, title:'12-Format Classification', short:'Auto-classifies Windows, Linux, Cisco, etc.', novelty: "Priority-based matching ensures vendor-specific patterns (like Cisco ASA) are identified before generic firewall logs." },
    ]
  },
  {
    id: 'detection', label: 'Detection Engine', count: 5,
    features: [
      { id:3, title:'11-Rule Multi-Fire', short:'All matching rules fire simultaneously.', novelty: "Traditional SIEMs stop at the first rule match. ThreatLens evaluates all rules, reporting compound threats like PowerShell AND Mimikatz together." },
      { id:4, title:'Post-Breach Login', short:'Catches the exact moment an attacker breaks in.', novelty: "Instead of just alerting on failed attempts, it triggers a CRITICAL alert when a successful login follows repeated failures." },
      { id:5, title:'Persistent Tracking', short:'Links attacks across days and weeks.', novelty: "Campaigns never time out. A brute force in January and lateral movement in March are correctly linked together." },
      { id:6, title:'Attack Chain Correlation', short:'Recognizes full APT kill chain patterns.', novelty: "Recognizes behavioral patterns of progression against 12 predefined attack chains, not just isolated events." },
      { id:7, title:'Time-Decay Scoring', short:'Recent events weigh more; history fades.', novelty: "Historical context decays exponentially. An IP that attacked 2 months ago still raises a flag, just a smaller one." },
    ]
  },
  {
    id: 'intel', label: 'Threat Intel', count: 4,
    features: [
      { id:9, title:'Real-Time Feeds', short:'CISA KEV, Feodo Tracker, and URLhaus.', novelty: "Cross-references logs against real government/community feeds used by Fortune 500 SOCs." },
      { id:10, title:'Auto IOC Cross-Ref', short:'Every IP checked against live intelligence.', novelty: "Catches malicious activity even if no detection rules fire, by matching IPs against known botnet/C2 databases." },
      { id:11, title:'Cached RAG Intelligence', short:'Exact match + semantic TF-IDF search.', novelty: "Combines exact IOC matches with semantic vector search to find novel but related threats, instantly." },
      { id:12, title:'Active Blocklist', short:'Blocked IPs auto-escalated to CRITICAL.', novelty: "Enforced at the pipeline gate. IPs can be blocked manually or automatically by SOAR rules." },
    ]
  },
  {
    id: 'soar', label: 'SOAR', count: 3,
    features: [
      { id:13, title:'Configurable Rules', short:'Custom automation with 4 action types.', novelty: "Fully CRUD-managed API for creating rules like 'If credential dumping, auto-block IP and send Slack alert.'" },
      { id:14, title:'Async Webhooks', short:'Slack/Teams alerts fire in daemon threads.', novelty: "Webhooks fire asynchronously so they never block or slow down the log analysis pipeline." },
      { id:15, title:'SMTP Email Alerts', short:'Styled threat emails with severity coding.', novelty: "Automatically sends HTML-styled incident briefs with severity colors, MITRE techniques, and full attack narratives." },
    ]
  },
  {
    id: 'ai', label: 'AI Copilot', count: 1,
    features: [
      { id:16, title:'RAG-Powered Chat', short:'Database-aware analyst with real memory.', novelty: "Queries your actual MySQL tables to give answers grounded in real incident data, with multi-turn memory." },
    ]
  },
  {
    id: 'ops', label: 'Operations', count: 3,
    features: [
      { id:18, title:'Bulk Log Ingestion', short:'Upload thousands of logs without timeout.', novelty: "Processes logs asynchronously in batches of 50. Partial progress is saved even if the job fails midway." },
      { id:19, title:'System Health', short:'Live operational metrics and warnings.', novelty: "Tracks HTTP request metrics, logs slow requests, and monitors background scheduler health in real-time." },
      { id:20, title:'IP Investigation', short:'Chronological attack narrative for any IP.', novelty: "Merges raw logs and analyzed incidents into a single chronological timeline to reconstruct an attack." },
    ]
  },
];

// ──── Components ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const BrutalistButton = ({ children, onClick, primary }) => (
  <Button
    onClick={onClick}
    sx={{
      bgcolor: primary ? colors.accent : 'transparent',
      color: primary ? colors.bg : colors.text,
      border: `2px solid ${colors.accent}`,
      borderRadius: 0,
      fontFamily: headingFont,
      fontWeight: 800,
      fontSize: { xs: '1rem', md: '1.2rem' },
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      px: { xs: 4, md: 6 },
      py: { xs: 1.5, md: 2 },
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: primary ? colors.bg : colors.text,
        transform: 'scaleY(0)', transformOrigin: 'bottom',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 0,
      },
      '&:hover': { color: primary ? colors.text : colors.bg },
      '&:hover::after': { transform: 'scaleY(1)' }
    }}
  >
    <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
  </Button>
);

const AccordionItem = ({ title, content, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ borderBottom: `2px solid ${colors.border}`, py: 3 }}>
      <Box 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover .accordion-title': { pl: 2 } }}
        onClick={() => setOpen(!open)}
      >
        <Typography 
          className="accordion-title"
          sx={{ 
            fontFamily: headingFont, 
            fontSize: { xs: '1.5rem', md: '2.5rem' }, 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '-0.03em',
            transition: 'padding 0.3s ease',
            color: open ? colors.text : colors.muted
          }}
        >
          <span style={{ fontSize: '1rem', verticalAlign: 'top', marginRight: '20px', fontFamily: monoFont }}>0{index}</span>
          {title}
        </Typography>
        <Box sx={{ width: 30, height: 30, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', bgcolor: colors.text, transform: 'translateY(-50%)' }} />
          <Box sx={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', bgcolor: colors.text, transform: 'translateX(-50%)', transition: 'transform 0.4s ease', ...(open && { transform: 'translateX(-50%) scaleY(0)' }) }} />
        </Box>
      </Box>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <Typography sx={{ pt: 3, pb: 1, fontFamily: bodyFont, fontSize: '1.1rem', color: colors.muted, maxWidth: 600, lineHeight: 1.6 }}>
              {content}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      p: { xs: 2, md: 4 },
      ...(scrolled && { bgcolor: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid #333` })
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mixBlendMode: scrolled ? 'normal' : 'difference' }}>
        <Typography onClick={() => window.scrollTo(0,0)} sx={{ fontFamily: monoFont, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.05em', cursor: 'pointer' }}>
          THREATLENS ©
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {[{ label: 'Features', id: 'features' }, { label: 'Architecture', id: 'architecture' }, { label: 'About', path: '/about' }].map((item) => (
            <Typography key={item.label} onClick={() => { 
                if (item.path) { navigate(item.path); }
                else { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
            }} sx={{ fontFamily: monoFont, fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { textDecoration: 'line-through' } }}>
              {item.label}
            </Typography>
          ))}
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { textDecoration: 'line-through' } }} onClick={() => window.open('/docs', '_blank')}>
            DOCS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { textDecoration: 'line-through' } }} onClick={() => navigate('/login')}>
            SIGN IN
          </Typography>
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.9rem', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { textDecoration: 'line-through' }, display: { xs: 'none', sm: 'block' } }} onClick={() => navigate('/signup')}>
            DEPLOY
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const AsciiGraphic = () => {
  const glitchRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (glitchRef.current && Math.random() > 0.8) {
        glitchRef.current.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        setTimeout(() => {
          if (glitchRef.current) glitchRef.current.style.transform = 'translate(0,0)';
        }, 50);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box ref={glitchRef} sx={{ position: 'absolute', right: '-10%', top: '20%', opacity: 0.1, pointerEvents: 'none', zIndex: 0, display: { xs: 'none', lg: 'block' } }}>
      <pre style={{ fontFamily: monoFont, fontSize: '8px', lineHeight: '8px', fontWeight: 900 }}>
        {`
¦¦¦¦¦¦¦¦+¦¦+  ¦¦+¦¦¦¦¦¦+ ¦¦¦¦¦¦¦+ ¦¦¦¦¦+ ¦¦¦¦¦¦¦¦+
+--¦¦+--+¦¦¦  ¦¦¦¦¦+--¦¦+¦¦+----+¦¦+--¦¦++--¦¦+--+
   ¦¦¦   ¦¦¦¦¦¦¦¦¦¦¦¦¦¦++¦¦¦¦¦+  ¦¦¦¦¦¦¦¦   ¦¦¦
   ¦¦¦   ¦¦+--¦¦¦¦¦+--¦¦+¦¦+--+  ¦¦+--¦¦¦   ¦¦¦
   ¦¦¦   ¦¦¦  ¦¦¦¦¦¦  ¦¦¦¦¦¦¦¦¦¦+¦¦¦  ¦¦¦   ¦¦¦
   +-+   +-+  +-++-+  +-++------++-+  +-+   +-+
`}
      </pre>
    </Box>
  );
};

const BrutalistBento = () => (
  <Grid container spacing={0} sx={{ borderTop: `2px solid ${colors.border}`, borderLeft: `2px solid ${colors.border}` }}>
    {MODULES.map((module, index) => (
      <Grid item xs={12} md={index < 2 ? 6 : 4} key={module.id} sx={{ borderRight: `2px solid ${colors.border}`, borderBottom: `2px solid ${colors.border}` }}>
        <Box sx={{ minHeight: 260, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: index % 2 ? '#030303' : '#000' }}>
          <Box>
            <Typography sx={{ fontFamily: monoFont, fontSize: '0.75rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.14em', mb: 2 }}>
              0{index + 1} / {module.count} systems
            </Typography>
            <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, color: colors.text }}>
              <HoverGlitch text={module.label} />
            </Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            {module.features.slice(0, 3).map((feature) => (
              <Box key={feature.id} sx={{ py: 1.5, borderTop: `1px solid ${colors.border}` }}>
                <Typography sx={{ fontFamily: headingFont, color: colors.text, fontWeight: 800, fontSize: '1rem' }}>{feature.title}</Typography>
                <Typography sx={{ fontFamily: monoFont, color: colors.muted, fontSize: '0.72rem', mt: 0.75, lineHeight: 1.6 }}>{feature.short}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    ))}
  </Grid>
);

const ArchDisplay = () => (
  <Box sx={{ position: 'sticky', top: 120, minHeight: 560, border: `2px solid ${colors.border}`, overflow: 'hidden', bgcolor: '#020202' }}>
    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
      <img src="/assets/images/hero_img4.png" alt="ThreatLens architecture" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) contrast(120%) brightness(70%)' }} />
    </Box>
    <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 } }}>
      <Typography sx={{ fontFamily: monoFont, color: colors.muted, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.14em', mb: 4 }}>
        // SIGNAL VIEW
      </Typography>
      {['Ingest', 'Parse', 'Detect', 'Enrich', 'Correlate', 'Respond'].map((stage, index) => (
        <Box key={stage} sx={{ display: 'grid', gridTemplateColumns: '36px 1fr', alignItems: 'center', gap: 2, py: 2, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontFamily: monoFont, color: colors.muted, fontSize: '0.75rem' }}>{String(index + 1).padStart(2, '0')}</Typography>
          <Typography sx={{ fontFamily: headingFont, color: colors.text, fontWeight: 900, fontSize: { xs: '1.2rem', md: '1.8rem' }, textTransform: 'uppercase' }}>
            {stage}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 900], [0, -120]);

  return (
    <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: '100vh', overflowX: 'hidden', fontFamily: bodyFont, position: 'relative' }}>
      <CursorSpotlight />
      <ScanlineOverlay />
      <Navbar />
      <AsciiGraphic />

      <Box sx={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', px: { xs: 3, md: 8 }, pb: { xs: 8, md: 10 } }}>
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/assets/images/hero_img1.png" alt="ThreatLens command interface" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(28%) contrast(120%)' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), transparent 35%)' }} />
        </Box>

        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2, px: 0 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '4.4rem', sm: '7rem', md: '11rem' }, fontWeight: 900, lineHeight: 0.82, letterSpacing: '-0.06em', textTransform: 'uppercase', color: colors.text }}>
              <HoverGlitch text="Autonomous" />
              <br />
              <Box component="span" sx={{ color: 'transparent', WebkitTextStroke: { xs: '1px #fff', md: '2px #fff' } }}>
                <HoverGlitch text="Intelligence" />
              </Box>
            </Typography>
          </motion.div>

          <Box sx={{ mt: { xs: 5, md: 8 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 4, alignItems: 'end' }}>
            <Typography sx={{ fontFamily: monoFont, color: colors.muted, fontSize: { xs: '0.78rem', md: '1rem' }, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.7, maxWidth: 520 }}>
              // ThreatLens dynamically structures unknown telemetry without rigid regex parsers. Real-time correlation engine active.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <BrutalistButton primary onClick={() => navigate('/signup')}>Initialize</BrutalistButton>
              <BrutalistButton onClick={() => navigate('/login')}>Access</BrutalistButton>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <Grid container>
          {[
            { end: 11,  suffix: '',   label: 'Parallel Detection Rules' },
            { end: 12,  suffix: '+',  label: 'Log Formats Parsed' },
            { end: 100, suffix: '',   label: 'Risk Score Max' },
            { end: 3,   suffix: 's',  label: 'AI SOC Report Time' },
            { end: 5,   suffix: 'min',label: 'Correlation Sweep Interval' },
          ].map((s, i) => (
            <Grid item xs={6} md key={i} sx={{
              borderRight: { md: i < 4 ? '1px solid #111' : 'none' },
              borderBottom: { xs: i < 4 ? '1px solid #111' : 'none', md: 'none' }
            }}>
              <CounterStat end={s.end} suffix={s.suffix} label={s.label} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Embedded Image 5 breaking sections */}
      <Box sx={{ width: '100%', position: 'relative', height: '150px', overflow: 'hidden' }}>
        {/* Top and bottom fade — no hard lines */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, #000, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #000, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <motion.div style={{ y: yParallax, opacity: 0.35 }}>
          <img src="/assets/images/hero_img5.png" alt="Divider Parallax" style={{ width: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
        </motion.div>
      </Box>

      {/* Feature Bento Section */}
      <Box sx={{ py: 15, position: 'relative', overflow: 'hidden' }} id="features">
        {/* Top gradient fade from previous section */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, #000 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <motion.div style={{ y: yParallax, position: 'absolute', left: '-5%', top: '10%', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}>
          <Typography sx={{ fontFamily: headingFont, fontSize: '20vw', fontWeight: 900, color: 'transparent', WebkitTextStroke: `2px ${colors.text}` }}>SYSTEM</Typography>
        </motion.div>
        
        <Container maxWidth={false} sx={{ px: { xs: 3, md: 8 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} sx={{ mb: 10, alignItems: 'center' }}>
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-100px" }} variants={fadeUp}>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: monoFont, fontSize: '1rem', color: colors.muted, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >[ CAPABILITIES ]</motion.p>
                <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '2.5rem', md: '5rem' }, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>
                  <ScrambleText text="EVERYTHING YOUR SOC NEEDS." />
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: 'easeOut' }} viewport={{ once: false }}>
                <Box sx={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  
                  {/* Left edge gradient — fades the image into the black background on its left side */}
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, width: '25%', height: '100%', zIndex: 2, pointerEvents: 'none',
                    background: `linear-gradient(to right, ${colors.bg} 0%, transparent 100%)`
                  }} />

                  {/* The diagram — full, readable, with a slow float + very slow drift rotation */}
                  <motion.img
                    src="/assets/images/hero_img3.png"
                    alt="SOC Capabilities Diagram"
                    animate={{
                      y: [-8, 8, -8],
                      rotate: [-1, 1, -1],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: '100%',
                      maxWidth: '640px',
                      height: 'auto',
                      display: 'block',
                      filter: 'contrast(115%) brightness(105%)',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-100px" }} variants={fadeUp}>
            <BrutalistBento />
          </motion.div>
        </Container>
      </Box>

      {/* Architecture Section with Clean Image Embed */}
      <Box sx={{ py: 15, bgcolor: '#050505', position: 'relative', overflow: 'hidden' }} id="architecture">
        {/* Seamless top fade from feature section */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, background: 'linear-gradient(to bottom, #000 0%, #050505 100%)', zIndex: 1, pointerEvents: 'none' }} />
        {/* Seamless bottom fade into next section */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, background: 'linear-gradient(to top, #000 0%, #050505 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <Container maxWidth={false} sx={{ px: { xs: 3, md: 8 } }}>
          <Grid container spacing={8} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: false }} variants={fadeUp}>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: monoFont, fontSize: '1rem', color: colors.muted, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >[ SYSTEM ARCHITECTURE ]</motion.p>
                <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '1.5rem', md: '2.5rem' }, fontWeight: 900, textTransform: 'uppercase', mb: 4, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  <ScrambleText text="SIX-STAGE INTELLIGENCE PIPELINE." />
                </Typography>
                <Box sx={{ borderTop: `2px solid ${colors.border}` }}>
                  <AccordionItem index="1" title="Log Ingestion" content="A hybrid Regex + LLM parser extracts 9 structured fields from every raw log: source_ip, dest_ip, event_id, user, status, log_type, process, port, hostname. If regex fails on an unknown format, a Groq LLM fallback dynamically interprets it — handling 12 vendor formats including Windows, Cisco ASA, Palo Alto, AWS CloudTrail, Azure, and GCP without ever crashing the pipeline." />
                  <AccordionItem index="2" title="Multi-Rule Detection" content="11 parallel detection rules fire simultaneously against every parsed event. Rules target Brute Force, Post-Breach Login, C2 Beaconing, Privilege Escalation, Lateral Movement, and Data Exfiltration. A stateful IP tracker maintains attack sessions indefinitely — a single attacker can be tracked across days without a session timeout." />
                  <AccordionItem index="3" title="Threat Intelligence" content="Every detected artifact is cross-referenced in real-time against three live feeds: CISA KEV (Known Exploited Vulnerabilities), Feodo Tracker (C2 botnets), and URLhaus (malware distribution). IPs on active blocklists are auto-escalated to CRITICAL severity. NVD CVE enrichment and MITRE ATT&CK tactic mapping are applied with local caching for sub-100ms lookups." />
                  <AccordionItem index="4" title="Risk Scoring" content="An 8-factor risk engine produces a 0—œ100 composite score per incident. Factors include: blocklist membership (+40), active CVE exploitability (+25), IOC match confidence (+20), lateral movement indicators (+15), geo-anomaly (+10), time-decay weight, campaign escalation multiplier, and MITRE tactic severity. Scores are recalculated on every new event from the same source." />
                  <AccordionItem index="5" title="AI SOC Response" content="When risk scores breach configurable thresholds, the Groq LLaMA-3 model generates a structured SOC incident report containing: executive summary, full attack narrative, recommended containment steps, and analyst caveats — all in under 3 seconds. SOAR rules then fire asynchronously: Slack/Teams webhooks, styled SMTP email alerts, and firewall block commands run in daemon threads to avoid latency." />
                  <AccordionItem index="6" title="Proactive Correlation" content="A background correlation engine runs every 5 minutes scanning all incidents for slow-burn attack patterns invisible to real-time rules: Distributed Brute Force (same password across many IPs), Slow Enumeration (low-frequency port scanning), and Campaign Escalation (same attacker changing tactics over days). Correlated events are merged into unified attack campaigns with a single elevated risk score." />
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <ArchDisplay />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Edge-to-Edge Divider Image with Scrolling Ticker */}
      <Box sx={{ width: '100%', height: '300px', overflow: 'hidden', position: 'relative' }}>
        <img src="/assets/images/hero_img5.png" alt="Divider" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(55%)' }} />

        {/* Top gradient fade */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to bottom, #000, transparent)', zIndex: 2 }} />
        {/* Bottom gradient fade */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, #000, transparent)', zIndex: 2 }} />

        {/* ──── TOP ticker — scrolls RIGHT to LEFT (threat intel data) */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          py: 1.5, overflow: 'hidden',
        }}>
          <style>{`
            @keyframes top-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
            .top-ticker-track { display:flex; width:max-content; animation: top-ticker 22s linear infinite; }
          `}</style>
          <div className="top-ticker-track">
            {[
              'THREAT LEVEL: ELEVATED', 'GROQ LLAMA-3.1 — ONLINE', 'CISA KEV FEED — SYNCED',
              'FEODO TRACKER — ACTIVE', 'URLHAUS — MONITORING', 'CORRELATION ENGINE — RUNNING',
              'NVD CVE ENRICHMENT — LIVE', 'MITRE ATT&CK MAPPED', 'SOAR RULES — ARMED',
              /* duplicate */ 'THREAT LEVEL: ELEVATED', 'GROQ LLAMA-3.1 — ONLINE', 'CISA KEV FEED — SYNCED',
              'FEODO TRACKER — ACTIVE', 'URLHAUS — MONITORING', 'CORRELATION ENGINE — RUNNING',
              'NVD CVE ENRICHMENT — LIVE', 'MITRE ATT&CK MAPPED', 'SOAR RULES — ARMED',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, px: 3 }}>
                <Box sx={{ mr: 2, width: 5, height: 5, borderRadius: '50%', bgcolor: '#ffffff', flexShrink: 0, opacity: 0.6 }} />
                <Typography sx={{ fontFamily: monoFont, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </div>
        </Box>

        
        {/* Ticker overlay — bottom half of the image */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
          borderTop: `1px solid rgba(255,255,255,0.15)`,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          py: 2, overflow: 'hidden',
        }}>
          <style>{`
            @keyframes ticker-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .ticker-track {
              display: flex;
              width: max-content;
              animation: ticker-scroll 30s linear infinite;
            }
            .ticker-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="ticker-track">
            {[
              '11 Parallel Detection Rules',
              '12 Log Formats Supported',
              '8-Factor Risk Scoring',
              'CISA KEV Live Feed',
              'Groq LLaMA-3 SOC Reports in <3s',
              'No-Timeout Campaign Tracking',
              'Feodo Tracker + URLhaus Integration',
              'Async SOAR: Webhook · Email · Block',
              'TF-IDF Semantic Threat RAG',
              'Background Correlation Engine — Every 5 Min',
              /* Duplicate for seamless loop */
              '11 Parallel Detection Rules',
              '12 Log Formats Supported',
              '8-Factor Risk Scoring',
              'CISA KEV Live Feed',
              'Groq LLaMA-3 SOC Reports in <3s',
              'No-Timeout Campaign Tracking',
              'Feodo Tracker + URLhaus Integration',
              'Async SOAR: Webhook · Email · Block',
              'TF-IDF Semantic Threat RAG',
              'Background Correlation Engine — Every 5 Min',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, px: 4 }}>
                <Typography sx={{ fontFamily: monoFont, fontSize: '0.75rem', fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {item}
                </Typography>
                <Box sx={{ mx: 3, width: 4, height: 4, borderRadius: '50%', bgcolor: colors.muted, flexShrink: 0 }} />
              </Box>
            ))}
          </div>
        </Box>
      </Box>

      {/* Massive CTA */}
      <Box sx={{ py: 20, px: { xs: 3, md: 8 }, position: 'relative', overflow: 'hidden' }} id="cta">
        {/* Background Image for CTA */}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/assets/images/hero_img6.png" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(30%)' }} />
        </Box>
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '3rem', md: '7rem' }, fontWeight: 900, lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.04em', mb: 8, color: colors.text }}>
              <HoverGlitch text="STOP GUESSING." />
              <br/>
              <HoverGlitch text="START RESPONDING." />
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <Button
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: colors.bg, color: colors.text, borderRadius: 0, border: `2px solid ${colors.border}`,
                fontFamily: headingFont, fontWeight: 800, fontSize: '1.5rem', px: 8, py: 3,
                '&:hover': { bgcolor: colors.text, color: colors.bg }
              }}
            >
              DEPLOY THREATLENS
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 8 }, py: 10 }}>
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.7 }}>
              <Typography sx={{ fontFamily: headingFont, fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', mb: 2 }}>THREATLENS ©</Typography>
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.9rem', color: colors.muted, maxWidth: 300 }}>
                Operating at the intersection of Generative AI and strict, deterministic SecOps.
              </Typography>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 8 }}>
            <Box>
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.8rem', color: colors.muted, mb: 2 }}>PLATFORM</Typography>
              {['Analytics', 'Rules Engine', 'SOAR Actions'].map((link, i) => (
                <motion.div key={link} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Typography sx={{ fontFamily: headingFont, fontSize: '1.2rem', fontWeight: 600, mb: 1, cursor: 'pointer', '&:hover': { color: colors.muted } }}>{link}</Typography>
                </motion.div>
              ))}
            </Box>
            <Box>
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.8rem', color: colors.muted, mb: 2 }}>COMPANY</Typography>
              {['Documentation', 'API', 'Status'].map((link, i) => (
                <motion.div key={link} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Typography sx={{ fontFamily: headingFont, fontSize: '1.2rem', fontWeight: 600, mb: 1, cursor: 'pointer', '&:hover': { color: colors.muted } }}>{link}</Typography>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 15, pt: 4, borderTop: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.8rem', color: colors.muted }}>2026 © THREATLENS SECURITY</Typography>
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.8rem', color: colors.muted }}>ALL RIGHTS RESERVED</Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
