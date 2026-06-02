const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'cyberrag-frontend', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacements = [
  // Fix rgba highlights (white in dark mode, black in light mode)
  { search: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, replace: 'rgba(var(--tl-glow-rgb),' },
  // Fix rgba shadows (black in dark mode, black/lighter in light mode)
  { search: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/g, replace: 'rgba(var(--tl-shadow-rgb),' },
  // specific backgrounds that are dark
  { search: /rgba\(\s*12\s*,\s*10\s*,\s*9\s*,\s*0\.85\s*\)/g, replace: 'var(--tl-header-bg, rgba(12, 10, 9, 0.85))' },
  { search: /rgba\(\s*20\s*,\s*18\s*,\s*16\s*,\s*([0-9.]+)\s*\)/g, replace: 'var(--tl-panel-bg, rgba(20, 18, 16, $1))' },
  // Fix missed hex codes (case insensitive)
  { search: /#0c0a09/gi, replace: 'var(--tl-bg-base, #0C0A09)' },
  { search: /#141210/gi, replace: 'var(--tl-bg-surface, #141210)' },
  { search: /#f5f0e8/gi, replace: 'var(--tl-text-primary, #F5F0E8)' },
  { search: /#564e44/gi, replace: 'var(--tl-text-muted, #564E44)' },
  { search: /#8a7f72/gi, replace: 'var(--tl-text-secondary, #8A7F72)' },
  // A few more text grays that might exist
  { search: /#c4b99a/gi, replace: 'var(--tl-text-hover, #C4B99A)' },
  { search: /#3a342e/gi, replace: 'var(--tl-text-muted-dark, #3A342E)' },
];

replacements.forEach(r => {
  css = css.replace(r.search, r.replace);
});

// We need to inject `--tl-glow-rgb` and `--tl-shadow-rgb` into the existing variable block
// Let's replace the existing variable block with an updated one.
css = css.replace(/\/\* --- Scoped Theme Variables for AppShell --- \*\/[\s\S]*?\/\* Ensure background applies to app-shell directly too \*\//, 
`/* --- Scoped Theme Variables for AppShell --- */
.app-shell {
  --tl-bg-base: #0C0A09;
  --tl-bg-surface: #141210;
  --tl-bg-sidebar: linear-gradient(180deg, #0F0D0B 0%, #0C0A09 100%);
  --tl-text-primary: #F5F0E8;
  --tl-text-secondary: #8A7F72;
  --tl-text-muted: #564E44;
  --tl-text-hover: #C4B99A;
  --tl-text-muted-dark: #3A342E;
  --tl-border: rgba(215, 163, 90, 0.1);
  --tl-card-bg: rgba(20, 18, 16, 0.9);
  --tl-glow-rgb: 255, 255, 255;
  --tl-shadow-rgb: 0, 0, 0;
  --tl-header-bg: rgba(12, 10, 9, 0.85);
  --tl-panel-bg: rgba(20, 18, 16, 0.9);
}

.app-shell.theme-light {
  --tl-bg-base: #F8F9FA;
  --tl-bg-surface: #FFFFFF;
  --tl-bg-sidebar: linear-gradient(180deg, #FFFFFF 0%, #F1F3F5 100%);
  --tl-text-primary: #1A1A1A;
  --tl-text-secondary: #4B5563;
  --tl-text-muted: #868E96;
  --tl-text-hover: #000000;
  --tl-text-muted-dark: #D1D5DB;
  --tl-border: rgba(0, 0, 0, 0.08);
  --tl-card-bg: rgba(255, 255, 255, 0.9);
  --tl-glow-rgb: 0, 0, 0;
  --tl-shadow-rgb: 0, 0, 0;
  --tl-header-bg: rgba(255, 255, 255, 0.85);
  --tl-panel-bg: rgba(255, 255, 255, 0.9);
}

/* Ensure background applies to app-shell directly too */`);

fs.writeFileSync(cssPath, css);
console.log('Successfully applied deep CSS variable injection!');
