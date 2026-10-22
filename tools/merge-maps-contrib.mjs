#!/usr/bin/env node
/**
 * merge-maps-contrib.mjs
 *   把「小伴侣」上传的地图数据（data/maps-contrib/*.json）合并成唯一一份公共地图数据文档
 *   public/norroth-maps.json，合并后清空收件箱。
 *
 *   合并规则（用户定的）：
 *     · 按地图 id 分组，取 at（该图数据最后更新时间）最大的那一份；
 *     · 整条替换 —— 名字 / 类型 / 采集点 / 怪物 / 出口格(ex) / 门(edges) 全部跟着走；
 *       门也可以删（以最新的那份为准）。
 *
 *   用法：
 *     node tools/merge-maps-contrib.mjs           # 合并 + 写入 + 清空收件箱
 *     node tools/merge-maps-contrib.mjs --keep    # 合并 + 写入，保留收件箱
 *     node tools/merge-maps-contrib.mjs --check   # 只报告差异，不写不删
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTRIB_DIR = path.join(ROOT, 'data', 'maps-contrib');
const OUT_FILE = path.join(ROOT, 'public', 'norroth-maps.json');
const CHECK = process.argv.includes('--check');
const KEEP = process.argv.includes('--keep');

function readBase() {
  if (!fs.existsSync(OUT_FILE)) return { maps: {}, contributors: [] };
  let j;
  try { j = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); } catch (e) { return { maps: {}, contributors: [] }; }
  return { maps: (j && j.maps) || {}, contributors: (j && j.meta && Array.isArray(j.meta.contributors)) ? j.meta.contributors : [] };
}
const base = readBase();

const files = fs.existsSync(CONTRIB_DIR)
  ? fs.readdirSync(CONTRIB_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];
if (!files.length) {
  console.log('收件箱为空（data/maps-contrib/ 没有新数据），公共地图数据保持现状。');
  process.exit(0);
}

const contribs = files.map((f) => {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(CONTRIB_DIR, f), 'utf8')); } catch (e) { throw new Error(f + ' 不是合法 JSON：' + e.message); }
  if (!j.maps || typeof j.maps !== 'object') throw new Error(f + ' 缺少 maps 对象');
  return { file: f, meta: j.meta || {}, maps: j.maps };
});

const maps = Object.assign({}, base.maps);
let updated = 0;
for (const c of contribs) {
  for (const id of Object.keys(c.maps)) {
    const e = c.maps[id];
    if (!e || typeof e !== 'object') continue;
    const cur = maps[id];
    if (!cur || (+e.at || 0) > (+cur.at || 0)) { maps[id] = e; updated++; }
  }
}

const contribMap = new Map();
for (const c of base.contributors) { const k = String(c.char || c.file || ''); if (k) contribMap.set(k, c); }
for (const c of contribs) {
  const k = String(c.meta.char || c.file || '');
  contribMap.set(k, {
    file: c.file, char: c.meta.char || '', level: c.meta.level || '', time: c.meta.time || '',
    count: Object.keys(c.maps || {}).length, mergedAt: new Date().toISOString().slice(0, 10),
  });
}
const contributors = [...contribMap.values()];

const meta = {
  source: '小伴侣地图数据（MapDB）· ' + contributors.length + ' 位贡献者合并',
  updated: new Date().toISOString(),
  version: '1.0',
  contributors,
  count: Object.keys(maps).length,
};

const out = JSON.stringify({ meta, maps }, null, 1) + '\n';
console.log('合并 ' + contribs.length + ' 份新数据 → 公共地图库 ' + meta.count + ' 张（本次更新 ' + updated + ' 张），贡献者 ' + contributors.length + ' 位');

if (CHECK) {
  const cur = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : '';
  if (cur !== out) { console.error('✗ ' + path.relative(ROOT, OUT_FILE) + ' 与合并结果不一致，请运行 node tools/merge-maps-contrib.mjs'); process.exit(1); }
  console.log('✓ 已是最新');
} else {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, out);
  console.log('已写入 ' + path.relative(ROOT, OUT_FILE) + '（' + out.length + ' 字节）');
  if (KEEP) {
    console.log('--keep：保留收件箱中的 ' + files.length + ' 个文件');
  } else {
    for (const f of files) fs.unlinkSync(path.join(CONTRIB_DIR, f));
    console.log('已清空收件箱（删除 ' + files.length + ' 个文件）—— 仓库只保留一份公共地图数据');
  }
}
