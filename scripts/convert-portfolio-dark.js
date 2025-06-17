const fs = require('fs');
const path = require('path');

// Root of the web site repo (where package.json lives)
const ROOT = path.join(__dirname, '..');

// Helper to read file list recursively
function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) return getHtmlFiles(res);
    if (entry.isFile() && res.endsWith('.html')) return [res];
    return [];
  });
}

// Determine portfolio HTML pages we care about
const projectDir = path.join(ROOT, 'projects');
const htmlFiles = getHtmlFiles(projectDir).filter((p) => /\/projects\//.test(p));

// Also root level *-portfolio pages (pattern: *-*.html but excluding index.html etc.)
const rootHtmlFiles = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !['index.html'].includes(f))
  .map((f) => path.join(ROOT, f));

const files = [...htmlFiles, ...rootHtmlFiles];

const DARK_LINK = '<link rel="stylesheet" href="/assets/css/portfolio-dark.css">';

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove any inline <style>...</style>
  const withoutStyles = content.replace(/<style[\s\S]*?<\/style>/gi, () => {
    changed = true;
    return '';
  });

  content = withoutStyles;

  // 2. Replace old portfolio.css links with dark css
  content = content.replace(/<link[^>]*portfolio\.css[^>]*>/gi, (m) => {
    changed = true;
    return DARK_LINK;
  });

  // 3. Ensure dark css link present after google fonts link
  if (!/portfolio-dark\.css/.test(content)) {
    content = content.replace(/<link[^>]*fonts.*?>/, (match) => {
      changed = true;
      return match + '\n    ' + DARK_LINK;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✔ converted', path.relative(ROOT, filePath));
  }
});

console.log('Done.'); 