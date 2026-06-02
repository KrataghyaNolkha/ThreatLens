const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'cyberrag-frontend', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacements = [
  { search: /#0C0A09/g, replace: 'var(--tl-bg-base, #0C0A09)' },
  { search: /#141210/g, replace: 'var(--tl-bg-surface, #141210)' },
  { search: /rgba\(20,\s*18,\s*16,\s*0\.9\)/g, replace: 'var(--tl-card-bg, rgba(20, 18, 16, 0.9))' },
  { search: /#F5F0E8/g, replace: 'var(--tl-text-primary, #F5F0E8)' },
  { search: /#564E44/g, replace: 'var(--tl-text-muted, #564E44)' },
  { search: /#8A7F72/g, replace: 'var(--tl-text-secondary, #8A7F72)' },
  { search: /rgba\(215,\s*163,\s*90,\s*0\.1\)/g, replace: 'var(--tl-border, rgba(215, 163, 90, 0.1))' },
  { search: /linear-gradient\(180deg,\s*#0F0D0B\s*0%,\s*#0C0A09\s*100%\)/g, replace: 'var(--tl-bg-sidebar, linear-gradient(180deg, #0F0D0B 0%, #0C0A09 100%))' }
];

// Perform replacements
replacements.forEach(r => {
  css = css.replace(r.search, r.replace);
});

// Insert CSS Variables at the top of @layer components
const variablesBlock = `
/* --- Scoped Theme Variables for AppShell --- */
.app-shell {
  --tl-bg-base: #0C0A09;
  --tl-bg-surface: #141210;
  --tl-bg-sidebar: linear-gradient(180deg, #0F0D0B 0%, #0C0A09 100%);
  --tl-text-primary: #F5F0E8;
  --tl-text-secondary: #8A7F72;
  --tl-text-muted: #564E44;
  --tl-border: rgba(215, 163, 90, 0.1);
  --tl-card-bg: rgba(20, 18, 16, 0.9);
}

.app-shell.theme-light {
  --tl-bg-base: #F8F9FA;
  --tl-bg-surface: #FFFFFF;
  --tl-bg-sidebar: linear-gradient(180deg, #FFFFFF 0%, #F1F3F5 100%);
  --tl-text-primary: #1A1A1A;
  --tl-text-secondary: #4B5563;
  --tl-text-muted: #868E96;
  --tl-border: rgba(0, 0, 0, 0.08);
  --tl-card-bg: rgba(255, 255, 255, 0.9);
}

/* Ensure background applies to app-shell directly too */
.app-shell.theme-light {
  background: var(--tl-bg-base) !important;
  color: var(--tl-text-primary) !important;
}
.app-shell.theme-light .sidebar {
  background: var(--tl-bg-sidebar) !important;
}
.app-shell.theme-light .card {
  background: var(--tl-card-bg) !important;
}
`;

css = css.replace('@layer components {', '@layer components {\n' + variablesBlock);

fs.writeFileSync(cssPath, css);
console.log('Successfully injected CSS variables into index.css!');
