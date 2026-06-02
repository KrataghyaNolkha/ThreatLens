const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'cyberrag-frontend', 'src', 'styles', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacements = [
  { search: /--bg-base:\s*#0C0A09;/g, replace: '--bg-base:     var(--tl-bg-base, #0C0A09);' },
  { search: /--bg-surface:\s*#141210;/g, replace: '--bg-surface:  var(--tl-bg-surface, #141210);' },
  { search: /--bg-elevated:\s*#1A1714;/g, replace: '--bg-elevated: var(--tl-card-bg, #1A1714);' },
  { search: /--bg-panel:\s*rgba\(20, 18, 16, 0.88\);/g, replace: '--bg-panel:    var(--tl-panel-bg, rgba(20, 18, 16, 0.88));' },
  { search: /--bg-overlay:\s*rgba\(12, 10, 9, 0.92\);/g, replace: '--bg-overlay:  var(--tl-header-bg, rgba(12, 10, 9, 0.92));' },
  
  { search: /--border-subtle:\s*rgba\(215, 163, 90, 0.08\);/g, replace: '--border-subtle:  var(--tl-border, rgba(215, 163, 90, 0.08));' },
  { search: /--border-default:\s*rgba\(215, 163, 90, 0.14\);/g, replace: '--border-default: var(--tl-border-hover, rgba(215, 163, 90, 0.14));' },
  { search: /--border-strong:\s*rgba\(215, 163, 90, 0.26\);/g, replace: '--border-strong:  var(--tl-border-hover, rgba(215, 163, 90, 0.26));' },

  { search: /--text-primary:\s*#F5F0E8;/g, replace: '--text-primary:   var(--tl-text-primary, #F5F0E8);' },
  { search: /--text-secondary:\s*#C4B99A;/g, replace: '--text-secondary: var(--tl-text-secondary, #C4B99A);' },
  { search: /--text-muted:\s*#8A7F72;/g, replace: '--text-muted:     var(--tl-text-muted, #8A7F72);' },
  { search: /--text-dim:\s*#564E44;/g, replace: '--text-dim:       var(--tl-text-muted-dark, #564E44);' },

  { search: /--shadow-soft:\s*0 8px 28px rgba\(0, 0, 0, 0.35\);/g, replace: '--shadow-soft:  0 8px 28px rgba(var(--tl-shadow-rgb, 0, 0, 0), 0.35);' },
  { search: /--shadow-panel:\s*0 20px 52px rgba\(0, 0, 0, 0.42\);/g, replace: '--shadow-panel: 0 20px 52px rgba(var(--tl-shadow-rgb, 0, 0, 0), 0.42);' },
];

replacements.forEach(r => {
  css = css.replace(r.search, r.replace);
});

// Also replace white/X backgrounds on some components:
css = css.replace(/background:\s*rgba\(\s*255,\s*255,\s*255,\s*0\.03\s*\)/g, 'background: rgba(var(--tl-glow-rgb, 255, 255, 255), 0.03)');
css = css.replace(/background:\s*rgba\(\s*255,\s*255,\s*255,\s*0\.04\s*\)/g, 'background: rgba(var(--tl-glow-rgb, 255, 255, 255), 0.04)');
css = css.replace(/background:\s*rgba\(\s*255,\s*255,\s*255,\s*0\.05\s*\)/g, 'background: rgba(var(--tl-glow-rgb, 255, 255, 255), 0.05)');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Fixed globals.css successfully!');
