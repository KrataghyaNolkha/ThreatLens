const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'cyberrag-frontend', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldLightVars = /\.app-shell\.theme-light\s*\{[\s\S]*?\}/;
const newLightVars = `.app-shell.theme-light {
  --tl-bg-base: #FAFBFF;
  --tl-bg-surface: #FFFFFF;
  --tl-bg-sidebar: #FFFFFF;
  --tl-text-primary: #1A202C;
  --tl-text-secondary: #4A5568;
  --tl-text-muted: #A0AEC0;
  --tl-text-hover: #4C51BF;
  --tl-text-muted-dark: #E2E8F0;
  --tl-border: rgba(0, 0, 0, 0.04);
  --tl-border-hover: rgba(0, 0, 0, 0.08);
  --tl-card-bg: #FFFFFF;
  --tl-glow-rgb: 255, 255, 255;
  --tl-shadow-rgb: 107, 114, 128; /* Used for drop shadows */
  --tl-header-bg: rgba(255, 255, 255, 0.95);
  --tl-panel-bg: #FFFFFF;
  
  /* New Indigo Accents specifically for light mode */
  --accent-primary: #667EEA;
  --accent-warm: #5A67D8;
  --accent-primary-dim: rgba(102, 126, 234, 0.15);
  --accent-primary-glow: rgba(90, 103, 216, 0.25);
  --accent-blue: #4299E1;
}`;

css = css.replace(oldLightVars, newLightVars);

// Fix the active nav item style in index.css
// The nav item hover/active is around line 170-200. Let's append some overrides for theme-light.
const overrides = `
/* Theme-light specific overrides for Nazday aesthetic */
.app-shell.theme-light .sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.03);
}

.app-shell.theme-light .nav-item {
  color: #718096;
}

.app-shell.theme-light .nav-item:hover {
  background: rgba(102, 126, 234, 0.05);
  color: #667EEA;
}

.app-shell.theme-light .nav-active {
  background: #F0F5FF !important; /* light purple/blue bubble */
  color: #5A67D8 !important;
  border-color: transparent !important;
  box-shadow: none !important;
  font-weight: 700;
}

.app-shell.theme-light .nav-active .nav-icon {
  color: #5A67D8 !important;
}

.app-shell.theme-light .nav-active::before {
  display: none; /* hide the left amber accent line if any */
}

/* Card aesthetics */
.app-shell.theme-light .soc-panel,
.app-shell.theme-light .card,
.app-shell.theme-light .soc-metric-card,
.app-shell.theme-light .asset-card {
  border: 1px solid rgba(0, 0, 0, 0.02) !important;
  box-shadow: 0 15px 35px -5px rgba(107, 114, 128, 0.08) !important;
  border-radius: 20px;
}

.app-shell.theme-light .page-header-title {
  color: #1A202C;
  font-weight: 800;
}
`;

if (!css.includes('.app-shell.theme-light .nav-active')) {
  css += overrides;
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('index.css updated');
