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
 *   ★ 资源点名字归一化（v2.6.162）：
 *     有些贡献者用中文/翻译玩游戏，录进来的点位名是中文（如 "Minnow 碼頭"），
 *     和英文名（"Minnow Pier"）在公共库里并存 → tooltip 出现两种内容。
 *     这里在合并时把中文名还原成英文并去重，base（历史数据）和新上传都过一遍。
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

/* ---- 资源点名字归一化：中文名 = 专有名词(英文) + 中文通用名 ---- */
const CJK_ALIAS = [
  [/碼頭|码头/g, 'Pier'],
  [/採石場|采石场/g, 'Quarry'],
  [/樹林|树林/g, 'Grove'],
  [/田野/g, 'Field'],
  [/採礦|采矿/g, 'Mine'],
  [/修正檔|修正档/g, 'Patch'],
  [/战斗训练/g, 'Combat Training'],
  /* 出口格标签（ex 第 4 列，不显示但同源污染） */
  [/走私者路線|走私者路线/g, 'Smugglers Route'],
  [/傳送門|传送门/g, 'Portal'],
  [/入口/g, 'Entrance'],
];
function normalizeGatherName(name) {
  if (name == null) return name;
  let s = String(name);
  if (!/[\u4e00-\u9fff]/.test(s)) return s;
  for (const [re, en] of CJK_ALIAS) s = s.replace(re, en);
  return s.replace(/\s+/g, ' ').trim();
}
function uniq(arr) {
  const out = [], seen = new Set();
  (arr || []).forEach((x) => { if (x && !seen.has(x)) { seen.add(x); out.push(x); } });
  return out;
}
/* 就地归一化一条地图记录（g / gt / ex 里的名字），返回是否有改动 */
function normalizeMapRecord(e) {
  if (!e || typeof e !== 'object') return false;
  let changed = false;
  if (Array.isArray(e.g)) {
    const ng = uniq(e.g.map(normalizeGatherName));
    if (ng.length !== e.g.length || ng.some((x, i) => x !== e.g[i])) changed = true;
    e.g = ng;
  }
  if (Array.isArray(e.gt)) {
    const seen = new Set(), out = [];
    for (const t of e.gt) {
      if (!Array.isArray(t)) continue;
      const nm = normalizeGatherName(t[2]);
      const key = t[0] + ',' + t[1] + ',' + nm;
      if (seen.has(key)) { changed = true; continue; }
      seen.add(key);
      if (nm !== t[2]) changed = true;
      out.push([t[0], t[1], nm]);
    }
    if (out.length !== e.gt.length) changed = true;
    e.gt = out;
  }
  if (Array.isArray(e.ex)) {
    e.ex = e.ex.map((t) => {
      if (!Array.isArray(t)) return t;
      const nm = normalizeGatherName(t[3]);
      if (nm !== t[3]) changed = true;
      return [t[0], t[1], t[2], nm];
    });
  }
  return changed;
}

function readBase() {
  if (!fs.existsSync(OUT_FILE)) return { maps: {}, contributors: [] };
  let j;
  try { j = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); } catch (e) { return { maps: {}, contributors: [] }; }
  return { maps: (j && j.maps) || {}, contributors: (j && j.meta && Array.isArray(j.meta.contributors)) ? j.meta.contributors : [] };
}
const base = readBase();

/* 历史数据也要归一化（清掉已经混进公共库的中文名） */
let baseChanged = 0;
for (const id of Object.keys(base.maps)) {
  if (normalizeMapRecord(base.maps[id])) baseChanged++;
}

const files = fs.existsSync(CONTRIB_DIR)
  ? fs.readdirSync(CONTRIB_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];
if (!files.length && !baseChanged) {
  console.log('收件箱为空且公共库无需归一化，公共地图数据保持现状。');
  process.exit(0);
}

const contribs = files.map((f) => {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(CONTRIB_DIR, f), 'utf8')); } catch (e) { throw new Error(f + ' 不是合法 JSON：' + e.message); }
  if (!j.maps || typeof j.maps !== 'object') throw new Error(f + ' 缺少 maps 对象');
  for (const id of Object.keys(j.maps)) normalizeMapRecord(j.maps[id]);
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
console.log('合并 ' + contribs.length + ' 份新数据 → 公共地图库 ' + meta.count + ' 张（本次更新 ' + updated + ' 张，归一化历史 ' + baseChanged + ' 张），贡献者 ' + contributors.length + ' 位');

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
