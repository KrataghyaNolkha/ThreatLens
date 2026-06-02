const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cyberrag-frontend', 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove CSS imports
content = content.replace(/import '\.\/AppShell\.css';\r?\n?/g, '');
content = content.replace(/import '\.\/Dashboard\.css';\r?\n?/g, '');

// Update chart gradients
const oldChartGradient = /<defs>[\s\S]*?<\/defs>/;
const newChartGradient = `<defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>`;
content = content.replace(oldChartGradient, newChartGradient);

const oldAreas = /<Area type="monotone" dataKey="critical"[\s\S]*?<\/AreaChart>/;
const newAreas = `<Area type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={1.5} fill="url(#critGrad)" />
          <Area type="monotone" dataKey="high" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#purpleGrad)" />
          <Area type="monotone" dataKey="medium" stroke="var(--accent-blue)" strokeWidth={1.5} fill="transparent" />
        </AreaChart>`;
content = content.replace(oldAreas, newAreas);

// Find the main return block
const startMarker = /  return \(\r?\n    <div className="soc-dashboard">/;
const match = content.match(startMarker);

if (match) {
  const returnStart = match.index;
  const lastBrace = content.lastIndexOf('}');
  
  const newReturn = `  return (
    <div className="soc-dashboard nazday-layout">
      {/* Top Header */}
      <motion.div
        className="nazday-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ padding: '24px 0', marginBottom: '16px' }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Welcome back, SOC Analyst!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
          Today is a great day to secure your monitored assets.
        </p>
      </motion.div>

      {/* Main Grid: Left 70%, Right 30% */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Trend Chart (Acts like Revenue) */}
          <section className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Incident Trend</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-primary)' }} /> High
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#EF4444' }} /> Critical
                </span>
              </div>
            </div>
            <IncidentTrendChart totalIncidents={totalIncidents} stats={stats} />
          </section>

          {/* Metrics Grid */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <MetricCard label="Open Cases" value={stats?.open_incidents || 0} sub="needs analyst review" tone="critical" delay={0.04} />
            <MetricCard label="In Review" value={stats?.investigating_incidents || 0} sub="active workload" tone="info" delay={0.08} />
            <MetricCard label="Assets" value={stats?.monitored_assets || 0} sub="signal sources" tone="default" delay={0.12} />
          </section>

          {/* Activity / Case Queue */}
          <Panel
            title="Recent Activity"
            hint="Grouped analyst queue for triage."
            action={<button className="btn-ghost" onClick={() => navigate('/investigate')} style={{ color: 'var(--accent-primary)' }}>See All</button>}
          >
            <div className="queue-list" style={{ marginTop: '16px' }}>
              {hasIncidents ? incidents.slice(0, 5).map((incident, index) => (
                <QueueItem
                  key={incident.id}
                  incident={incident}
                  active={selectedIncident?.id === incident.id}
                  onSelect={setSelectedIncident}
                  index={index}
                />
              )) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <span className="empty-title">No recent activity</span>
                  <span className="empty-sub">Run the real log collector to populate cases.</span>
                </div>
              )}
            </div>
          </Panel>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Gradient Status Card (Like "Your Card") */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>System Status</h3>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #A78BFA 100%)',
              borderRadius: '24px',
              padding: '24px',
              color: '#FFFFFF',
              boxShadow: '0 20px 40px -10px var(--accent-primary-glow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Glass circles decoration */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', right: '40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '32px' }}>ThreatLens Engine</div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '16px', fontFamily: 'var(--font-mono)', opacity: 0.9, marginBottom: '32px' }}>
                <span>****</span><span>****</span><span>****</span><span>LIVE</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '12px', opacity: 0.8 }}>
                <div>
                  <div style={{ marginBottom: '4px' }}>Total Logs</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, opacity: 1 }}>{totalLogs.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ marginBottom: '4px' }}>Uptime</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, opacity: 1 }}>99.9%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Source IPs (Acts like Exchange Rate) */}
          <Panel title="Top Source IPs" action={<button className="btn-ghost" style={{ color: 'var(--accent-primary)' }} onClick={() => navigate('/investigate')}>See All</button>}>
            <div className="rank-list" style={{ marginTop: '12px' }}>
              {topIps.map((item, index) => (
                <div key={\`\${item.ip}-\${index}\`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', width: '20px' }}>{index + 1}</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '10px', fontWeight: 'bold' }}>IP</div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.ip}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.incident_count} alerts</span>
                    <span style={{ color: '#EF4444', fontSize: '14px' }}>↑</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Source Breakdown (Acts like Features Tool) */}
          <Panel title="Telemetry Sources">
            <div className="stacked-bars" style={{ marginTop: '12px' }}>
              <MiniBar label="Demo Simulation" value={stats?.incident_sources?.demo_seed || 0} total={totalIncidents} color="var(--accent-warm)" />
              <MiniBar label="Real Windows Logs" value={stats?.incident_sources?.real_windows_event_log || 0} total={totalIncidents} color="var(--accent-blue)" />
              <MiniBar label="Asset Signals" value={(stats?.incident_sources?.asset_website || 0)} total={totalIncidents} color="var(--accent-primary)" />
            </div>
          </Panel>
          
        </div>
      </div>
    </div>
  );
}
`;

  content = content.substring(0, returnStart) + newReturn;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Dashboard.jsx refactored successfully.');
} else {
  console.log('Main return block not found.');
}
