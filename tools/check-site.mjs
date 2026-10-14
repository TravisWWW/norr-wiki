import fs from 'node:fs';
import path from 'node:path';
import { sections, flattenItems } from '../src/navigation.mjs';

const root = path.resolve('dist');
const base = '/norr-wiki/';
const origin = 'https://traviswww.github.io';
const files = fs.readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
const errors = new Set();
let checked = 0;
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const route = base + file.replaceAll('\\', '/').replace(/index\.html$/, '');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    const url = new URL(raw, origin + route);
    if (url.origin !== origin || !url.pathname.startsWith(base)) continue;
    // Starlight 的 404 页生成 /404/ canonical，但 Pages 实际使用 404.html。
    if (file === '404.html' && url.pathname === base + '404/') continue;
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const target = path.join(root, relative.endsWith('/') || !path.extname(relative) ? relative + '/index.html' : relative);
    checked++;
    if (!fs.existsSync(target)) errors.add(`${file}: missing ${url.pathname}`);
    else if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      const content = fs.readFileSync(target, 'utf8');
      if (!content.includes(`id="${id}"`) && !content.includes(`name="${id}"`)) errors.add(`${file}: missing anchor ${url.pathname}${url.hash}`);
    }
  }
}
for (const section of sections) {
  for (const slug of [section.landing, ...flattenItems(section.items).map((item) => item.slug)]) {
    if (!fs.existsSync(path.join(root, slug, 'index.html'))) errors.add(`Navigation: missing ${slug}`);
  }
}
// 检查每个内容文件都有构建路由；不依赖完整 Git 历史，适用于 Actions 浅克隆。
const sourcePages = fs.readdirSync('src/content/docs', { recursive: true }).filter((file) => /\.mdx?$/.test(file));
for (const file of sourcePages) {
  const slug = file.replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  if (!fs.existsSync(path.join(root, slug, 'index.html'))) errors.add(`Content route missing: ${file}`);
}
if (errors.size) {
  console.error([...errors].join('\n'));
  process.exitCode = 1;
} else console.log(`PASS: ${files.length} HTML files, ${checked} internal links/assets/anchors, ${sourcePages.length} content routes, ${sections.length} navigation sections.`);
