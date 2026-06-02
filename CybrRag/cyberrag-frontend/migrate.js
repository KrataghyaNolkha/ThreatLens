const fs = require('fs');
const path = require('path');
const dir = './src/components';
const files = fs.readdirSync(dir);
let cssContent = '';
const cssFiles = files.filter(f => f.endsWith('.css'));
for (const file of cssFiles) {
  cssContent += '\n/* --- ' + file + ' --- */\n';
  cssContent += fs.readFileSync(path.join(dir, file), 'utf8');
  fs.unlinkSync(path.join(dir, file));
}
let indexCss = fs.readFileSync('./src/index.css', 'utf8');
if (!indexCss.includes('@layer components')) {
  indexCss += '\n@layer components {\n' + cssContent + '\n}\n';
} else {
  indexCss = indexCss.replace('@layer components {', '@layer components {\n' + cssContent);
}
fs.writeFileSync('./src/index.css', indexCss);

const jsxFiles = files.filter(f => f.endsWith('.jsx'));
for (const file of jsxFiles) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  // Remove component specific css imports
  content = content.replace(/import\s+['"].\/.*?\.css['"];?\n?/g, '');
  // Remove global css imports that might be leftover
  content = content.replace(/import\s+['"]\.\.\/styles\/globals\.css['"];?\n?/g, '');
  content = content.replace(/import\s+['"]\.\.\/styles\/AppShell\.css['"];?\n?/g, '');
  fs.writeFileSync(path.join(dir, file), content);
}
console.log('Migrated all CSS to index.css and cleaned up JSX files.');
