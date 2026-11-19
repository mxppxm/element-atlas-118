import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// inline css
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, href) => {
  const file = path.join(dist, href.replace(/^\.?\//, ''));
  if (!fs.existsSync(file)) return m;
  return `<style>\n${fs.readFileSync(file, 'utf8')}\n</style>`;
});

// inline module js
html = html.replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (m, a, src, b) => {
  const file = path.join(dist, src.replace(/^\.?\//, ''));
  if (!fs.existsSync(file)) return m;
  let js = fs.readFileSync(file, 'utf8');
  js = js.replace(/<\/script/gi, '<\\/script');
  const isModule = /type="module"/.test(a + b);
  return `<script${isModule ? ' type="module"' : ''}>\n${js}\n</script>`;
});

// strip modulepreload links
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');

const out = path.join(dist, 'neon-lab-3d.html');
fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`\n  ✓ single-file build → dist/neon-lab-3d.html  (${kb} KB)\n`);