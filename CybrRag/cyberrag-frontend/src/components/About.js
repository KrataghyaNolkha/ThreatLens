// src/components/About.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Grid, Typography, Button } from '@mui/material';

const colors = { bg: '#000000', text: '#ffffff', muted: '#888888', border: '#222222' };
const headingFont = '"Helvetica Neue", "Inter", sans-serif';
const monoFont = '"JetBrains Mono", "Fira Code", monospace';
const bodyFont = '"Inter", sans-serif';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const AnimatedHeading = ({ text, sx = {} }) => {
  const words = text.split(' ');
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', ...sx }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { y: '110%', opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
          }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const StatCard = ({ num, label, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
    style={{ height: '100%' }}
  >
    <Box sx={{
      border: `1px solid transparent`,
      borderBottom: `1px solid ${colors.border}`,
      p: 4, height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      transition: 'all 0.3s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': { bgcolor: '#0a0a0a', borderColor: '#333' }
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', bgcolor: '#fff', transform: 'scaleY(0)', transformOrigin: 'top', transition: 'transform 0.3s', '.MuiBox-root:hover > &': { transform: 'scaleY(1)' } }} />
      <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '3rem', md: '4rem' }, fontWeight: 900, color: colors.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{num}</Typography>
      <Typography sx={{ fontFamily: monoFont, fontSize: '0.7rem', color: colors.muted, mt: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</Typography>
    </Box>
  </motion.div>
);

const PrincipleRow = ({ num, title, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <Box sx={{
      display: 'flex', gap: { xs: 2, md: 4 }, p: { xs: 3, md: 4 }, borderBottom: `1px solid ${colors.border}`,
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: '#fff', transform: 'scaleY(0)', transition: 'transform 0.3s ease-out'
      },
      '&:hover': {
        bgcolor: '#0a0a0a',
        paddingLeft: { xs: 4, md: 6 },
        '&::before': { transform: 'scaleY(1)' },
        '& .num': { color: '#fff' }
      }
    }}>
      <Typography className="num" sx={{ fontFamily: monoFont, fontSize: '0.7rem', color: colors.muted, minWidth: 32, mt: 0.5, fontWeight: 800, transition: 'color 0.3s' }}>{num}</Typography>
      <Box>
        <Typography sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: '1.1rem', mb: 1, textTransform: 'uppercase' }}>{title}</Typography>
        <Typography sx={{ fontFamily: bodyFont, fontSize: '0.95rem', color: colors.muted, lineHeight: 1.7 }}>{desc}</Typography>
      </Box>
    </Box>
  </motion.div>
);

const AudienceCard = ({ index, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    style={{ height: '100%' }}
  >
    <Box sx={{
      border: `1px solid ${colors.border}`, p: 4, height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: '#fff', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s ease'
      },
      '&:hover': {
        bgcolor: '#080808',
        borderColor: '#444',
        '&::before': { transform: 'scaleX(1)' }
      }
    }}>
      <Typography sx={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#444', mb: 2, fontWeight: 800 }}>// {String(index + 1).padStart(2, '0')}</Typography>
      <Typography sx={{ fontFamily: headingFont, fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', mb: 2 }}>{title}</Typography>
      <Typography sx={{ fontFamily: bodyFont, fontSize: '0.9rem', color: colors.muted, lineHeight: 1.7, flex: 1 }}>{desc}</Typography>
    </Box>
  </motion.div>
);

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const audience = [
    { title: 'SOC Analysts', desc: 'Tier-1 and Tier-2 analysts drowning in alert fatigue. ThreatLens prioritizes what matters — CRITICAL threats, not noise.' },
    { title: 'Threat Hunters', desc: 'Researchers reconstructing attack timelines. Turn raw logs into a clear narrative of how an attacker moved through your environment.' },
    { title: 'Small SecOps Teams', desc: 'Teams of 1–10 needing enterprise capabilities without enterprise budgets. Replace multiple point solutions with a single platform.' },
    { title: 'Security Students', desc: 'Anyone learning attack detection or MITRE ATT&CK. Transparent risk scoring provides a learning tool alongside an operational one.' },
  ];

  const stack = [
    { cat: 'Backend', items: ['FastAPI (Python)', 'SQLAlchemy ORM', 'APScheduler', 'Python-Jose JWT'] },
    { cat: 'AI & Intelligence', items: ['Groq LLaMA 3.1', 'TF-IDF Cosine Similarity', 'CISA KEV Feed', 'Abuse.ch Feodo + URLhaus'] },
    { cat: 'Database', items: ['MySQL 8.x', 'Full relational schema', 'JSON column support', 'Indexed queries'] },
    { cat: 'Security', items: ['Passlib bcrypt', 'JWT + Refresh tokens', 'Rate limiting', 'CORS hardened'] },
  ];

  return (
    <Box sx={{ bgcolor: colors.bg, color: colors.text, fontFamily: bodyFont, overflowX: 'hidden' }}>
      {/* Navbar */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        p: { xs: 2, md: 3 },
        transition: 'all 0.3s',
        ...(scrolled && { bgcolor: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid #222` })
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography onClick={() => navigate('/')} sx={{ fontFamily: monoFont, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '-0.05em' }}>
            THREATLENS ©
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => navigate('/')} sx={{ color: colors.muted, fontFamily: monoFont, fontSize: '0.8rem', '&:hover': { color: colors.text } }}>← BACK</Button>
            <Button onClick={() => navigate('/signup')} sx={{ bgcolor: colors.text, color: colors.bg, borderRadius: 0, fontFamily: monoFont, fontWeight: 800, px: 3, '&:hover': { bgcolor: '#ccc' } }}>GET STARTED</Button>
          </Box>
        </Box>
      </Box>

      {/* Hero with Image Background */}
      <Box sx={{ position: 'relative', pt: { xs: 24, md: 32 }, pb: { xs: 15, md: 24 }, px: { xs: 3, md: 8 }, borderBottom: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        {/* Background Image Blend */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <motion.img
            src="/assets/images/about_bg.png"
            alt="Abstract ThreatLens System"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) contrast(120%) brightness(50%)' }}
          />
          {/* Fades to blend image into the page */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, #000 0%, transparent 100%)' }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: 'linear-gradient(to right, #000 0%, transparent 100%)' }} />
        </Box>

        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1 }}>
          <motion.p
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            style={{ fontFamily: monoFont, fontSize: '0.9rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}
          >[ ABOUT THREATLENS ]</motion.p>
          <Box sx={{ overflow: 'hidden', maxWidth: 1000 }}>
            <AnimatedHeading
              text="Built for Analysts Who Can't Afford to Miss."
              sx={{ fontFamily: headingFont, fontSize: { xs: '3.5rem', md: '5.5rem' }, fontWeight: 900, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.04em', mb: 6 }}
            />
          </Box>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <Typography sx={{ fontFamily: bodyFont, fontSize: { xs: '1.1rem', md: '1.4rem' }, color: '#aaa', maxWidth: 600, lineHeight: 1.7, borderLeft: '2px solid #fff', pl: 3 }}>
              ThreatLens was born from a simple frustration: modern attackers are patient, but the tools defending against them are not.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ borderBottom: `1px solid ${colors.border}` }}>
        <Grid container spacing={0} alignItems="stretch">
          {[
            { num: '11', label: 'Parallel Detection Rules' },
            { num: '12', label: 'Log Formats Parsed' },
            { num: '8', label: 'Risk Scoring Factors' },
            { num: '5m', label: 'Correlation Sweep Interval' },
            { num: '<3s', label: 'AI SOC Report Generation' },
            { num: '∞', label: 'Campaign Tracking Window' },
          ].map((s, i) => (
            <Grid item xs={6} md={2} key={i} sx={{ borderRight: { md: i < 5 ? `1px solid ${colors.border}` : 'none' } }}>
              <StatCard num={s.num} label={s.label} index={i} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Why section */}
      <Box sx={{ py: 15, px: { xs: 3, md: 8 }, borderBottom: `1px solid ${colors.border}` }}>
        <Container maxWidth={false}>
          <Grid container spacing={10} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} style={{ fontFamily: monoFont, fontSize: '0.85rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>[ THE PROBLEM ]</motion.p>
              <AnimatedHeading text="Why Existing Tools Fail." sx={{ fontFamily: headingFont, fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.03em', mb: 4 }} />
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.2 }}>
                <img src="/assets/images/about_img1.png" alt="ThreatLens Logic" style={{ width: '100%', border: `1px solid ${colors.border}`, filter: 'grayscale(100%) contrast(110%) brightness(80%)', display: 'block', marginTop: '2rem' }} />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box sx={{ borderTop: `1px solid ${colors.border}` }}>
                {[
                  { heading: 'They think in windows.', body: 'Traditional SIEMs correlate events within 30-minute windows. APT actors deliberately spread attacks across days and weeks. A brute force attempt spread across 72 hours is invisible to fixed session windows.' },
                  { heading: 'They score without explaining.', body: 'Every SIEM we tested gave risk scores without explanation. Analysts had to reverse-engineer why something was CRITICAL. ThreatLens shows every factor, every point, and every reason.' },
                  { heading: 'They stop at the first rule.', body: 'Traditional rules use if/elif chains where only the first match fires. A log containing both PowerShell and Mimikatz only triggers "PowerShell." ThreatLens fires all 11 rules simultaneously.' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.6, delay: i * 0.15 }}>
                    <Box sx={{ py: 5, borderBottom: i < 2 ? `1px solid ${colors.border}` : 'none', position: 'relative' }}>
                      <Typography sx={{ fontFamily: monoFont, fontSize: '0.6rem', color: '#444', mb: 1, fontWeight: 800 }}>// FLAW 0{i + 1}</Typography>
                      <Typography sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase', mb: 1.5 }}>{item.heading}</Typography>
                      <Typography sx={{ fontFamily: bodyFont, fontSize: '1rem', color: colors.muted, lineHeight: 1.8 }}>{item.body}</Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* For Whom */}
      <Box sx={{ py: 15, px: { xs: 3, md: 8 }, borderBottom: `1px solid ${colors.border}`, bgcolor: '#040404' }}>
        <Container maxWidth={false}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} style={{ fontFamily: monoFont, fontSize: '0.85rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3rem' }}>[ WHO IS THIS FOR ]</motion.p>
          <Grid container spacing={3} alignItems="stretch">
            {audience.map((a, i) => (
              <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
                <Box sx={{ width: '100%', display: 'flex' }}>
                  <AudienceCard index={i} title={a.title} desc={a.desc} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Design Philosophy */}
      <Box sx={{ py: 15, px: { xs: 3, md: 8 }, borderBottom: `1px solid ${colors.border}` }}>
        <Container maxWidth={false}>
          <Grid container spacing={10}>
            <Grid item xs={12} md={4}>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} style={{ fontFamily: monoFont, fontSize: '0.85rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>[ DESIGN PHILOSOPHY ]</motion.p>
              <AnimatedHeading text="Four Principles. Zero Compromises." sx={{ fontFamily: headingFont, fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-0.03em', mb: 4 }} />
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.2 }}>
                <img src="/assets/images/about_img2.png" alt="Neural Analysis" style={{ width: '100%', border: `1px solid ${colors.border}`, filter: 'grayscale(100%) contrast(110%) brightness(80%)', display: 'block', marginTop: '2rem' }} />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ borderTop: `1px solid ${colors.border}` }}>
                <PrincipleRow num="01" title="Intelligence over rules" desc="Rules catch what you know. Intelligence catches what you don't. ThreatLens combines both — 11 detection rules AND real government threat feeds from CISA, Feodo Tracker, and URLhaus." delay={0} />
                <PrincipleRow num="02" title="Time is not a boundary" desc="Attackers plan in weeks. Most tools think in hours. Campaign tracking with no timeout ensures that a January recon and a March exfiltration are correctly linked to the same attacker." delay={0.1} />
                <PrincipleRow num="03" title="Transparency by default" desc="Every risk score comes with a full breakdown. No analyst should ever wonder 'why is this CRITICAL?' — ThreatLens always tells you exactly which factors contributed and by how many points." delay={0.2} />
                <PrincipleRow num="04" title="Automation without blindness" desc="SOAR automation is powerful but dangerous if unchecked. Every automated action — IP blocks, email alerts, webhooks — is logged, traceable, and reversible via the API." delay={0.3} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stack */}
      <Box sx={{ py: 15, px: { xs: 3, md: 8 }, borderBottom: `1px solid ${colors.border}` }}>
        <Container maxWidth={false}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} style={{ fontFamily: monoFont, fontSize: '0.85rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>[ TECHNOLOGY STACK ]</motion.p>
          <Grid container spacing={0} alignItems="stretch">
            {stack.map((s, i) => (
              <Grid item xs={12} sm={6} md={3} key={i} sx={{ borderRight: { md: i < 3 ? `1px solid ${colors.border}` : 'none' }, borderBottom: { xs: i < 3 ? `1px solid ${colors.border}` : 'none', md: 'none' }, p: 4 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.5, delay: i * 0.1 }} style={{ height: '100%' }}>
                  <Typography sx={{ fontFamily: monoFont, fontSize: '0.7rem', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>// {s.cat}</Typography>
                  {s.items.map((item, j) => (
                    <Typography key={j} sx={{ fontFamily: bodyFont, fontWeight: 600, fontSize: '1rem', mb: 1.5, color: colors.text }}>→ {item}</Typography>
                  ))}
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 20, px: { xs: 3, md: 8 } }}>
        <Container maxWidth={false}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}>
            <Typography sx={{ fontFamily: monoFont, fontSize: '0.85rem', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>[ INITIALIZE ]</Typography>
            <Typography sx={{ fontFamily: headingFont, fontSize: { xs: '3.5rem', md: '7rem' }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'uppercase', mb: 8 }}>
              Stop guessing.<br />Start responding.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/signup')} sx={{ bgcolor: colors.text, color: colors.bg, borderRadius: 0, fontFamily: headingFont, fontWeight: 800, fontSize: '1.1rem', px: 6, py: 2.5, transition: 'all 0.3s', '&:hover': { bgcolor: '#ccc', transform: 'translateX(4px)' } }}>
                CREATE NODE →
              </Button>
              <Button onClick={() => navigate('/')} sx={{ color: colors.muted, borderRadius: 0, fontFamily: monoFont, fontSize: '0.9rem', border: `1px solid ${colors.border}`, px: 4, transition: 'all 0.3s', '&:hover': { color: colors.text, borderColor: colors.text } }}>
                ← PLATFORM
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer line */}
      <Box sx={{ px: { xs: 3, md: 8 }, py: 4, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: monoFont, fontSize: '0.75rem', color: colors.muted }}>2026 © THREATLENS SECURITY</Typography>
        <Typography sx={{ fontFamily: monoFont, fontSize: '0.75rem', color: colors.muted }}>ALL RIGHTS RESERVED</Typography>
      </Box>
    </Box>
  );
}
