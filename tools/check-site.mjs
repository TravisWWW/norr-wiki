import fs from 'node:fs';
import path from 'node:path';
import { sections, flattenItems } from '../src/navigation.mjs';
import { entities, entityPath } from '../src/lib/database.mjs';

const root = path.resolve('dist');
const base = '/norr-wiki/';
const origin = 'https://traviswww.github.io';
const files = fs.readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
const errors = new Set();
let checked = 0;
const existsCache = new Map();
const anchorCache = new Map();
function exists(target) { if (!existsCache.has(target)) existsCache.set(target, fs.existsSync(target)); return existsCache.get(target); }
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
    if (!exists(target)) errors.add(`${file}: missing ${url.pathname}`);
    else if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!anchorCache.has(target)) anchorCache.set(target, new Set([...fs.readFileSync(target, 'utf8').matchAll(/\b(?:id|name)="([^"]+)"/g)].map((m) => m[1])));
      if (!anchorCache.get(target).has(id)) errors.add(`${file}: missing anchor ${url.pathname}${url.hash}`);
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
const entityRoutes = new Set();
for (const entity of entities) {
  const route = entityPath(entity.kind, entity.key);
  if (entityRoutes.has(route)) errors.add(`Duplicate database route: ${route}`);
  entityRoutes.add(route);
  if (!exists(path.join(root, route, 'index.html'))) errors.add(`Database route missing: ${route}`);
}
if (errors.size) {
  console.error([...errors].join('\n'));
  process.exitCode = 1;
} else console.log(`PASS: ${files.length} HTML files, ${checked} internal links/assets/anchors, ${sourcePages.length} content routes, ${entities.length} database routes, ${sections.length} navigation sections.`);
