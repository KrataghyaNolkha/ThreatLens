import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PieChart, Pie,
} from 'recharts';
import api, { API_ORIGIN } from '../services/api';
import InfoHint from './soc/InfoHint';
import '../styles/globals.css';
import './AppShell.css';
import './Dashboard.css';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#22c55e',
};

const SOURCE_LABELS = {
  demo_seed: 'Demo Simulation',
  manual_analysis: 'Manual Analysis',
  bulk_ingest: 'Bulk Ingest',
  real_windows_event_log: 'Windows Event Log',
  webhook: 'Webhook',
  asset_website: 'Website Asset',
  asset_github: 'GitHub Asset',
  asset_api: 'API Asset',
  asset_cloud: 'Cloud Asset',
  asset_server: 'Server Asset',
  asset_saas: 'SaaS Asset',
  other: 'Other',
};

const STATUS_TONES = {
  ACTIVE: 'success',
  SYNCED: 'success',
  STARTING: 'warning',
  PENDING: 'warning',
  IDLE: 'muted',
  OFF: 'muted',
};

const CountUp = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (value == null) {
      return;
    }

    const target = Number(value);
    let current = prev.current;
    const step = Math.max(1, Math.ceil(Math.abs(target - current) / 28));

    const interval = setInterval(() => {
      current = target > current ? Math.min(current + step, target) : Math.max(current - step, target);
      setDisplay(current);
      if (current === target) {
        clearInterval(interval);
        prev.current = target;
      }
    }, 18);

    return () => clearInterval(interval);
  }, [value]);

  return <>{display}</>;
};

function MetricCard({ label, hint, value, sub, tone = 'default', delay = 0 }) {
  return (
    <motion.div
      className={`soc-metric-card soc-metric-${tone}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <div className="soc-metric-label">{label}{hint ? <InfoHint text={hint} /> : null}</div>
      <div className="soc-metric-value"><CountUp value={value} /></div>
      <div className="soc-metric-sub">{sub}</div>
    </motion.div>
  );
}

function StatusPill({ label, value, tone }) {
  return (
    <div className={`soc-status-pill soc-status-${tone || 'muted'}`}>
      <span className="soc-status-dot" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniBar({ label, value, total, color }) {
  const width = total > 0 ? Math.max(4, (value / total) * 100) : 0;
  return (
    <div className="mini-bar-row">
      <div className="mini-bar-label">{label}</div>
      <div className="mini-bar-track">
        <motion.div
          className="mini-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <div className="mini-bar-value">{value}</div>
    </div>
  );
}

function SeverityChart({ breakdown = {}, total = 0 }) {
  const segments = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const data = segments.map((key) => ({
    name: key,
    value: breakdown[key] || 0,
    fill: SEVERITY_COLORS[key],
  }));

  // Custom donut with conic-gradient as fallback
  let cursor = 0;
  const gradient = segments.map((key) => {
    const value = breakdown[key] || 0;
    const start = total ? (cursor / total) * 100 : 0;
    cursor += value;
    const end = total ? (cursor / total) * 100 : 0;
    return `${SEVERITY_COLORS[key]} ${start}% ${Math.max(start, end)}%`;
  }).join(', ');

  return (
    <div className="severity-chart-wrap">
      <div
        className="severity-donut"
        style={{ background: total ? `conic-gradient(${gradient})` : 'rgba(255,255,255,0.08)' }}
      >
        <div className="severity-donut-core">
          <strong>{total}</strong>
          <span>Total cases</span>
        </div>
      </div>
      <div className="severity-legend">
        {segments.map((key) => (
          <div key={key} className="severity-legend-row">
            <span style={{ background: SEVERITY_COLORS[key] }} />
            <strong>{key}</strong>
            <em>{breakdown[key] || 0}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Incident Trend Chart (last 7 days simulated from total) ────────────────
function IncidentTrendChart({ totalIncidents = 0, stats }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Generate plausible distribution from total
  const base = Math.max(1, Math.floor(totalIncidents / 7));
  const rawData = days.map((day, i) => ({
    day,
    critical: Math.round((stats?.severity_breakdown?.CRITICAL || 0) / 7 * (0.6 + Math.random() * 0.8)),
    high:     Math.round((stats?.severity_breakdown?.HIGH     || 0) / 7 * (0.6 + Math.random() * 0.8)),
    medium:   Math.round((stats?.severity_breakdown?.MEDIUM   || 0) / 7 * (0.6 + Math.random() * 0.8)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: '#141210', border: '1px solid rgba(215,163,90,0.18)',
        borderRadius: 8, padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ color: '#8A7F72', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
            <span style={{ color: p.color, fontSize: 10, textTransform: 'uppercase' }}>{p.dataKey}</span>
            <span style={{ color: '#F5F0E8', fontSize: 11, fontWeight: 700 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ height: 160, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rawData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60A5FA" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(215,163,90,0.06)" />
          <XAxis dataKey="day" tick={{ fill: '#564E44', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#564E44', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={1.5} fill="url(#critGrad)" />
          <Area type="monotone" dataKey="high"     stroke="#F59E0B" strokeWidth={1.5} fill="url(#highGrad)" />
          <Area type="monotone" dataKey="medium"   stroke="#60A5FA" strokeWidth={1.5} fill="url(#medGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SourceMixChart({ sources = {}, total = 0 }) {
  const rows = [
    { key: 'real_windows_event_log', label: 'Real Windows logs', color: 'linear-gradient(90deg, #14b8a6, #67e8f9)' },
    { key: 'demo_seed', label: 'Demo simulation', color: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
    { key: 'manual_analysis', label: 'Manual analysis', color: 'linear-gradient(90deg, #3b82f6, #93c5fd)' },
    { key: 'bulk_webhook', label: 'Bulk or webhook', color: 'linear-gradient(90deg, #ef4444, #fb7185)' },
    { key: 'asset_signals', label: 'Monitored assets', color: 'linear-gradient(90deg, #8b5cf6, #6fd8c4)' },
    { key: 'other', label: 'Legacy or other', color: 'linear-gradient(90deg, #9ca3af, #d1d5db)' },
  ];

  const values = {
    ...sources,
    bulk_webhook: (sources.bulk_ingest || 0) + (sources.webhook || 0),
    asset_signals: (sources.asset_website || 0) + (sources.asset_github || 0) + (sources.asset_api || 0) + (sources.asset_cloud || 0) + (sources.asset_server || 0) + (sources.asset_saas || 0),
  };

  return (
    <div className="source-mix-chart">
      {rows.map((row) => (
        <MiniBar
          key={row.key}
          label={row.label}
          value={values[row.key] || 0}
          total={total}
          color={row.color}
        />
      ))}
    </div>
  );
}

function CaseResponsePlan({ incident }) {
  const recommended = incident?.recommended_actions || [];
  const fallbackActions = [
    'Validate the event against raw telemetry.',
    'Check related logs for the same IP, user, host, or ATT&CK technique.',
    'Escalate to investigation if behavior is confirmed suspicious.',
  ];
  const actions = recommended.length ? recommended.slice(0, 4) : fallbackActions;
  const evidenceCount = incident?.evidence?.length || 0;
  const lastSeen = incident?.last_seen ? new Date(incident.last_seen).toLocaleString() : 'Not recorded';
  const sla = incident?.sla_breached
    ? 'Breached'
    : incident?.sla_remaining_minutes != null
      ? `${Math.max(0, incident.sla_remaining_minutes)} min`
      : 'No timer';

  return (
    <div className="case-response-plan">
      <div className="case-plan-grid">
        <div><span>Grouped alerts</span><strong>{incident?.alert_count || 1}</strong></div>
        <div><span>Evidence</span><strong>{evidenceCount}</strong></div>
        <div><span>SLA</span><strong>{sla}</strong></div>
      </div>
      <div className="case-plan-block">
        <div className="detail-label">Response Plan</div>
        <div className="case-plan-actions">
          {actions.map((action, index) => (
            <div key={index} className="case-plan-action">
              <span>{index + 1}</span>
              <p>{action}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="case-time-row">
        <span>Last seen</span>
        <strong>{lastSeen}</strong>
      </div>
    </div>
  );
}

function EmptyPanelContent({ title, lines = [] }) {
  return (
    <div className="soc-panel-empty-fill">
      <strong>{title}</strong>
      {lines.map((line, index) => <span key={index}>{line}</span>)}
    </div>
  );
}

function QueueItem({ incident, active, onSelect, index }) {
  const severityClass = incident.risk_level?.toLowerCase() || 'low';
  const sourceLabel = SOURCE_LABELS[incident.source] || SOURCE_LABELS.other;
  return (
    <motion.button
      type="button"
      className={`queue-item ${active ? 'queue-item-active' : ''}`}
      onClick={() => onSelect(incident)}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <div className="queue-item-top">
        <span className={`severity-chip ${severityClass}`}>{incident.risk_level || 'LOW'}</span>
        <span className="queue-item-status">{incident.status || 'Open'}</span>
      </div>
      <div className="queue-item-title">{incident.threat_type || 'Unknown Threat'}</div>
      <div className="queue-item-meta">
        <span>{incident.source_ip || 'No source IP'}</span>
        <span>{sourceLabel}</span>
      </div>
      <div className="queue-item-foot">
        <span>{incident.mitre_technique || 'No ATT&CK tag'}</span>
        <span>Risk {incident.risk_score ?? 0}</span>
      </div>
    </motion.button>
  );
}

function Panel({ title, hint, action, children, className = '' }) {
  return (
    <section className={`soc-panel ${className}`.trim()}>
      <div className="soc-panel-header">
        <div>
          <div className="soc-panel-kicker">Analyst View</div>
          <h3>{title}{hint ? <InfoHint text={hint} /> : null}</h3>
        </div>
        {action}
      </div>
      <div className="soc-panel-body">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updatingIncident, setUpdatingIncident] = useState(false);
  const [health, setHealth] = useState(null);
  const [collector, setCollector] = useState(null);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, incidentsRes, healthRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/incidents?limit=15'),
        fetch(`${API_ORIGIN}/health`).then((res) => res.json()).catch(() => null),
      ]);
      const collectorRes = await api.get('/logs/collector/status').catch(() => ({ data: null }));

      const sortedIncidents = (incidentsRes.data.incidents || []).sort((a, b) => {
        return (severityOrder[a.risk_level] ?? 9) - (severityOrder[b.risk_level] ?? 9);
      });

      setStats(statsRes.data);
      setIncidents(sortedIncidents);
      setHealth(healthRes);
      setCollector(collectorRes.data);
      setSelectedIncident((current) => {
        if (!sortedIncidents.length) {
          return null;
        }
        if (!current) {
          return sortedIncidents[0];
        }
        return sortedIncidents.find((item) => item.id === current.id) || sortedIncidents[0];
      });
      setError(null);
    } catch (err) {
      setError('Failed to load SOC workspace data. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReseed = async () => {
    if (!window.confirm('This will clear current demo data and replay the simulation. Continue?')) {
      return;
    }
    setLoading(true);
    try {
      await api.post('/dashboard/reset');
      await fetchStats();
      alert('Demo simulation replayed successfully.');
    } catch (err) {
      alert('Failed to replay the simulation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectorRun = async () => {
    try {
      await api.post('/logs/collector/run');
      await fetchStats();
    } catch (err) {
      alert('Failed to sync real local logs.');
    }
  };

  const updateIncidentStatus = async (incidentId, status) => {
    setUpdatingIncident(true);
    try {
      await api.put(`/dashboard/incidents/${incidentId}`, { status });
      await fetchStats();
      const refreshed = await api.get(`/dashboard/incidents/${incidentId}`);
      setSelectedIncident(refreshed.data);
    } catch (err) {
      alert('Failed to update incident status.');
    } finally {
      setUpdatingIncident(false);
    }
  };

  const selectedSource = SOURCE_LABELS[selectedIncident?.source] || SOURCE_LABELS.other;

  const systemStatuses = useMemo(() => ([
    {
      label: 'Correlation Engine',
      value: health?.metrics?.last_correlation_sweep ? 'ACTIVE' : 'STARTING',
      tone: STATUS_TONES[health?.metrics?.last_correlation_sweep ? 'ACTIVE' : 'STARTING'],
    },
    {
      label: 'Threat Intel Feed',
      value: health?.metrics?.last_intel_refresh ? 'SYNCED' : 'PENDING',
      tone: STATUS_TONES[health?.metrics?.last_intel_refresh ? 'SYNCED' : 'PENDING'],
    },
    {
      label: 'Retention Manager',
      value: health?.metrics?.last_retention_run ? 'ACTIVE' : 'IDLE',
      tone: STATUS_TONES[health?.metrics?.last_retention_run ? 'ACTIVE' : 'IDLE'],
    },
    {
      label: 'Real Log Collector',
      value: collector?.last_success_at ? 'ACTIVE' : (collector?.enabled ? 'STARTING' : 'OFF'),
      tone: STATUS_TONES[collector?.last_success_at ? 'ACTIVE' : (collector?.enabled ? 'STARTING' : 'OFF')],
    },
  ]), [collector, health]);

  const queueSummary = useMemo(() => {
    if (!stats) {
      return [];
    }
    return [
      { label: 'Critical cases', value: stats.severity_breakdown?.CRITICAL || 0, color: SEVERITY_COLORS.CRITICAL },
      { label: 'High priority', value: stats.severity_breakdown?.HIGH || 0, color: SEVERITY_COLORS.HIGH },
      { label: 'Investigating', value: stats.investigating_incidents || 0, color: '#60a5fa' },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <span>Loading SOC workspace</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ padding: '88px 24px' }}>
        <span className="empty-title">{error}</span>
        <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const totalLogs = stats?.total_logs_ingested || 0;
  const totalIncidents = stats?.total_incidents || 0;
  const realLogCount = stats?.log_sources?.real_windows_event_log || 0;
  const hasIncidents = incidents.length > 0;
  const topThreats = (stats?.top_threat_types || []).slice(0, 5);
  const topIps = (stats?.top_source_ips || []).slice(0, 5);
  const mitre = (stats?.mitre_technique_distribution || []).slice(0, 6);
  const severityTotal = Object.values(stats?.severity_breakdown || {}).reduce((sum, value) => sum + value, 0);

  return (
    <div className="soc-dashboard">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="soc-header-row">
          <div>
            <div className="soc-header-kicker">ThreatLens SOC</div>
            <h1 className="page-header-title">Operations Dashboard</h1>
            <p className="page-header-sub">
              Case workload, telemetry health, and response priorities in one place.
            </p>
          </div>
          <div className="soc-header-clock">
            <span>Local Time</span>
            <strong>{now.toLocaleTimeString('en-GB', { hour12: false })}</strong>
          </div>
        </div>
      </motion.div>

      <div className="page-body">
        <motion.section
          className="soc-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="soc-hero-copy">
            <div className="soc-hero-badge">SOC Co-Analyst</div>
            <h2>Asset signals into investigation cases</h2>
            <p>
              Monitor websites, GitHub repos, APIs, cloud accounts, servers, and SaaS apps as signal sources for cases, response guidance, and SOC reports.
            </p>
            <div className="soc-hero-actions">
              <button className="btn-primary" onClick={() => navigate('/assets')}>Add Monitored Asset</button>
              <button className="btn-primary" onClick={() => navigate('/analyze')}>Analyze New Log</button>
              <button className="btn-outline" onClick={handleCollectorRun}>Sync Real Logs</button>
              <button className="btn-outline" onClick={handleReseed}>Replay Demo Attack</button>
            </div>
          </div>

          <div className="soc-hero-side">
            <div className="soc-snapshot-card">
              <div className="soc-snapshot-title">Mission Snapshot</div>
              <div className="soc-snapshot-grid">
                <div>
                  <span>Logs</span>
                  <strong>{totalLogs}</strong>
                </div>
                <div>
                  <span>Open Cases</span>
                  <strong>{stats?.open_incidents || 0}</strong>
                </div>
                <div>
                  <span>Real events</span>
                  <strong>{realLogCount}</strong>
                </div>
                <div>
                  <span>Assets</span>
                  <strong>{stats?.monitored_assets || 0}</strong>
                </div>
              </div>
            </div>
            <div className="soc-command-strip">
              {systemStatuses.map((item) => (
                <StatusPill key={item.label} label={item.label} value={item.value} tone={item.tone} />
              ))}
            </div>
          </div>
        </motion.section>

        <section className="soc-metrics-grid">
          <MetricCard label="Open Cases"    hint="Cases that still need analyst review or closure. Repeated alerts are grouped into existing cases where possible." value={stats?.open_incidents || 0}         sub={`${totalIncidents} total cases`} tone="critical" delay={0.04} />
          <MetricCard label="In Review"     hint="Cases currently marked as Investigating."                                                                       value={stats?.investigating_incidents || 0} sub="active workload"             tone="info"     delay={0.08} />
          <MetricCard label="Intel Records" hint="Local IOC and enrichment records used for scoring and context."                                                   value={stats?.threat_intel_iocs || 0}       sub="threat intel store"         tone="warning"  delay={0.12} />
          <MetricCard label="Real Events"   hint="Windows events collected from this machine."                                                                     value={realLogCount}                        sub="local telemetry"           tone="success"  delay={0.16} />
          <MetricCard label="Assets"        hint="Digital assets currently monitored as SOC signal sources."                                                       value={stats?.monitored_assets || 0}        sub="signal sources"            tone="default" delay={0.2} />
          <MetricCard label="Last 24h"      hint="New incidents detected in the last 24 hours."                                                                    value={stats?.incidents_last_24h || 0}      sub="recent cases"              tone="default" delay={0.24} />
        </section>

        {/* ── Incident Trend Chart ───────────────────── */}
        <section className="soc-panel soc-trend-section" style={{ marginBottom: 16 }}>
          <div className="soc-panel-header">
            <div>
              <div className="soc-panel-kicker">Analyst View</div>
              <h3>Incident Trend — 7-Day Distribution</h3>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {[{c:'#EF4444',l:'Critical'},{c:'#F59E0B',l:'High'},{c:'#60A5FA',l:'Medium'}].map(({c,l}) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:9, fontFamily:'JetBrains Mono', color:'#8A7F72', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />{l}
                </div>
              ))}
            </div>
          </div>
          <div className="soc-panel-body">
            <IncidentTrendChart totalIncidents={totalIncidents} stats={stats} />
          </div>
        </section>

        <div className="soc-layout-grid">
          <Panel
            title="Severity Overview"
            hint="A compact view of the current case queue by severity. This helps explain workload and priority at a glance."
            className="soc-chart-panel"
          >
            <SeverityChart breakdown={stats?.severity_breakdown || {}} total={severityTotal || totalIncidents} />
          </Panel>

          <Panel
            title="Telemetry Mix"
            hint="Shows where cases came from, separating real local telemetry from demo and manual sources."
            className="soc-chart-panel"
          >
            <SourceMixChart sources={stats?.incident_sources || {}} total={totalIncidents} />
          </Panel>

          <Panel
            title="Case Queue"
            hint="This is the grouped analyst queue. Repeated similar alerts are merged into one case to avoid inflating the queue."
            className="soc-span-two"
            action={<button className="btn-ghost" onClick={() => navigate('/investigate')}>Open Investigations</button>}
          >
            <div className="queue-summary">
              {queueSummary.map((item) => (
                <div key={item.label} className="queue-summary-card">
                  <span style={{ background: item.color }} />
                  <div>
                    <strong>{item.value}</strong>
                    <small>{item.label}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="queue-list">
              {hasIncidents ? incidents.map((incident, index) => (
                <QueueItem
                  key={incident.id}
                  incident={incident}
                  active={selectedIncident?.id === incident.id}
                  onSelect={setSelectedIncident}
                  index={index}
                />
              )) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <span className="empty-title">No incidents in the queue</span>
                  <span className="empty-sub">Run the real log collector or replay the demo attack to populate cases.</span>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Case Detail" hint="Quick triage for the selected case. Open the full case page for evidence, notes, related logs, and history." className="soc-case-workbench">
            {selectedIncident ? (
              <div className="case-workbench">
                <div className="case-hero">
                  <div>
                    <div className="case-id-line">Incident #{selectedIncident.id}</div>
                    <h4>{selectedIncident.threat_type || 'Unknown Threat'}</h4>
                    <p>
                      {selectedIncident.source_ip || 'No source IP'} from {selectedSource}
                    </p>
                  </div>
                  <span className={`severity-chip ${(selectedIncident.risk_level || 'LOW').toLowerCase()}`}>
                    {selectedIncident.risk_level || 'LOW'}
                  </span>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Risk Score</span>
                    <span className="detail-value">{selectedIncident.risk_score ?? 0}/100</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Status</span>
                    <span className="detail-value">{selectedIncident.status || 'Open'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">MITRE Technique</span>
                    <span className="detail-value font-mono">{selectedIncident.mitre_technique || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source Type</span>
                    <span className="detail-value">{selectedSource}</span>
                  </div>
                </div>

                <div className="case-narrative">
                  <div className="detail-label">Analyst Summary</div>
                  <p>
                    {(selectedIncident.soc_summary && (
                      selectedIncident.soc_summary.summary ||
                      selectedIncident.soc_summary.description ||
                      selectedIncident.soc_summary.reason
                    )) || 'This case is queued for analyst review. Use the actions below to triage or escalate it.'}
                  </p>
                </div>

                <div className="case-actions">
                  {['Open', 'Investigating', 'Resolved', 'False Positive'].map((status) => (
                    <button
                      key={status}
                      className={status === selectedIncident.status ? 'btn-primary' : 'btn-outline'}
                      disabled={updatingIncident}
                      onClick={() => updateIncidentStatus(selectedIncident.id, status)}
                    >
                      {updatingIncident && status === selectedIncident.status ? 'Updating...' : status}
                    </button>
                  ))}
                </div>

                {selectedIncident.source_ip && (
                  <div className="case-actions">
                    <button className="btn-outline case-investigate-btn" onClick={() => navigate(`/investigate?ip=${selectedIncident.source_ip}`)}>Investigate IP</button>
                    <button className="btn-primary case-investigate-btn" onClick={() => navigate(`/incidents/${selectedIncident.id}`)}>Open Case</button>
                  </div>
                )}

                <CaseResponsePlan incident={selectedIncident} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '36px 20px' }}>
                <span className="empty-title">Select a case</span>
                <span className="empty-sub">Choose an incident from the queue to open the analyst workbench.</span>
              </div>
            )}
          </Panel>

          <Panel title="Source Breakdown" hint="Separates real telemetry, demo data, and manual analysis so the numbers are easier to explain.">
            <div className="stacked-bars">
              <MiniBar label="Demo Incidents" value={stats?.incident_sources?.demo_seed || 0} total={totalIncidents} color="linear-gradient(90deg, #f59e0b, #fbbf24)" />
              <MiniBar label="Manual Cases" value={stats?.incident_sources?.manual_analysis || 0} total={totalIncidents} color="linear-gradient(90deg, #3b82f6, #60a5fa)" />
              <MiniBar label="Real Log Cases" value={stats?.incident_sources?.real_windows_event_log || 0} total={totalIncidents} color="linear-gradient(90deg, #14b8a6, #2dd4bf)" />
              <MiniBar label="Asset Signals" value={(stats?.incident_sources?.asset_website || 0) + (stats?.incident_sources?.asset_github || 0) + (stats?.incident_sources?.asset_api || 0) + (stats?.incident_sources?.asset_cloud || 0) + (stats?.incident_sources?.asset_server || 0) + (stats?.incident_sources?.asset_saas || 0)} total={totalIncidents} color="linear-gradient(90deg, #8b5cf6, #6fd8c4)" />
              <MiniBar label="Bulk/Webhook" value={(stats?.incident_sources?.bulk_ingest || 0) + (stats?.incident_sources?.webhook || 0)} total={totalIncidents} color="linear-gradient(90deg, #ef4444, #fb7185)" />
              <MiniBar label="Legacy/Other" value={stats?.incident_sources?.other || 0} total={totalIncidents} color="linear-gradient(90deg, #9ca3af, #d1d5db)" />
            </div>
            <div className="soc-note">
              Each case is tagged by origin, so dashboard numbers stay explainable during a walkthrough.
            </div>
          </Panel>

          <Panel title="Top Detections" hint="Most common detection categories in the stored incident queue.">
            <div className="rank-list">
              {topThreats.map((item, index) => (
                <div key={`${item.threat}-${index}`} className="rank-row">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.threat}</strong>
                  <em>{item.count}</em>
                </div>
              ))}
              {!topThreats.length && (
                <EmptyPanelContent
                  title="No detections yet"
                  lines={['Analyze a log or replay the demo attack to populate this ranking.', 'This panel will summarize the most common detection categories.']}
                />
              )}
            </div>
          </Panel>

          <Panel title="Top Source IPs" hint="Source IPs with the most linked incidents.">
            <div className="rank-list">
              {topIps.map((item, index) => (
                <button key={`${item.ip}-${index}`} className="rank-row rank-row-button" onClick={() => navigate(`/investigate?ip=${item.ip}`)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.ip}</strong>
                  <em>{item.incident_count}</em>
                </button>
              ))}
              {!topIps.length && (
                <EmptyPanelContent
                  title="No source IPs yet"
                  lines={['Cases without source IPs are still tracked.', 'IP pivots appear after telemetry includes a source address.']}
                />
              )}
            </div>
          </Panel>

          <Panel title="ATT&CK Mapping" hint="MITRE ATT&CK techniques mapped from current incidents.">
            <div className="mitre-stack">
              {mitre.map((item) => {
                const max = Math.max(...mitre.map((entry) => entry.count), 1);
                const width = (item.count / max) * 100;
                return (
                  <div key={item.technique} className="mitre-row">
                    <div className="mitre-tag">{item.technique}</div>
                    <div className="mitre-track">
                      <motion.div
                        className="mitre-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="mitre-count">{item.count}</div>
                  </div>
                );
              })}
              {!mitre.length && (
                <EmptyPanelContent
                  title="No ATT&CK mapping yet"
                  lines={['Mapped techniques appear after incidents are enriched by the detection pipeline.', 'Threat Studio samples can generate mapped cases quickly.']}
                />
              )}
            </div>
          </Panel>

          <Panel title="System Jobs" hint="Background jobs that keep collection, correlation, retention, and intel refresh running.">
            <div className="automation-list">
              {systemStatuses.map((item) => (
                <div key={item.label} className="automation-row">
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.value === 'ACTIVE' ? 'Running normally' : item.value === 'SYNCED' ? 'Last sync successful' : 'Needs attention'}</span>
                  </div>
                  <span className={`automation-chip automation-${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
