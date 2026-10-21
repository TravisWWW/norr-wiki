#!/usr/bin/env node
/**
 * merge-bestiary-contrib.mjs
 *   把「小伴侣」导出的账号记录（data/bestiary-contrib/*.json）合并进唯一一份权威图鉴文档
 *   src/data/bestiary-live.json（wiki 怪物图鉴页读的就是它）。
 *
 *   设计要点（用户要求：不要多份备份，只维护一份图鉴文档）：
 *     · data/bestiary-contrib/ 只是「收件箱」：每份贡献一个文件，便于多人同时上传不冲突；
 *     · 合并完成后默认把收件箱清空 —— 仓库里长期只留 src/data/bestiary-live.json 这一份图鉴；
 *     · 贡献者信息（角色 / 等级 / 时间）记进 meta.contributors，随文档一起保存，不丢来源。
 *
 *   合并规则（按怪物 id，逐字段取「更完整」的那份）：
 *     已记录 > 未记录；数值属性 > 技能 > 拾荒/掉落 > 等级 > 故事；
 *     列表类（拾荒 / 掉落 / 技能）取条目更多的那份；stats 取键更多的那份。
 *     tab / icon / bg 是派生字段，由 data/bestiary-static.json 补齐。
 *
 *   用法：
 *     node tools/merge-bestiary-contrib.mjs           # 合并 + 写入 + 清空收件箱
 *     node tools/merge-bestiary-contrib.mjs --keep    # 合并 + 写入，保留收件箱（本地调试）
 *     node tools/merge-bestiary-contrib.mjs --check   # 只报告差异，不写不删（CI 校验）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTRIB_DIR = path.join(ROOT, 'data', 'bestiary-contrib');
const STATIC_FILE = path.join(ROOT, 'data', 'bestiary-static.json');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'bestiary-live.json');
const CHECK = process.argv.includes('--check');
const KEEP = process.argv.includes('--keep');

const stat = JSON.parse(fs.readFileSync(STATIC_FILE, 'utf8'));
const TABS = stat.tabs || {};
const BATTLEMAPS = stat.battlemaps || {};

/* 现有权威文档 → 原始记录（丢掉 tab/icon/bg 等派生字段），作为合并基底 */
function readBase() {
  if (!fs.existsSync(OUT_FILE)) return { monsters: [], contributors: [] };
  let j;
  try { j = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); } catch (e) { return { monsters: [], contributors: [] }; }
  const list = Array.isArray(j.enemies) ? j.enemies : [];
  const derived = ['type', 'biome', 'lore', 'levelRange', 'alignment', 'specials', 'health', 'defense', 'resistance'];
  const monsters = list.map((e) => {
    const m = { id: e.id, name: e.name, recorded: !!e.recorded };
    derived.forEach((k) => { if (e[k]) m[k] = e[k]; });
    if (e.scavenging) m.scavenging = e.scavenging;
    if (e.drops) m.drops = e.drops;
    if (e.skills) m.skills = e.skills;
    if (e.stats) m.stats = e.stats;
    return m;
  });
  const contributors = (j.meta && Array.isArray(j.meta.contributors)) ? j.meta.contributors : [];
  return { monsters, contributors };
}

const base = readBase();

const files = fs.existsSync(CONTRIB_DIR)
  ? fs.readdirSync(CONTRIB_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];
if (!files.length) {
  console.log('收件箱为空（data/bestiary-contrib/ 没有新贡献），图鉴保持现状，无需合并。');
  process.exit(0);
}

const contribs = files.map((f) => {
  const raw = fs.readFileSync(path.join(CONTRIB_DIR, f), 'utf8');
  let j;
  try { j = JSON.parse(raw); } catch (e) { throw new Error(f + ' 不是合法 JSON：' + e.message); }
  if (!Array.isArray(j.monsters)) throw new Error(f + ' 缺少 monsters 数组');
  return { file: f, meta: j.meta || {}, monsters: j.monsters };
});

const score = (m) => (m.recorded ? 1000 : 0)
  + (Object.keys(m.stats || {}).length ? 100 : 0)
  + ((m.skills || []).length ? 50 : 0)
  + ((m.scavenging || []).length ? 20 : 0)
  + ((m.drops || []).length ? 20 : 0)
  + (m.levelRange ? 5 : 0)
  + (m.lore ? 2 : 0);

const longer = (a, b) => ((b || []).length > (a || []).length ? b : a);
const moreStats = (a, b) => (Object.keys(b || {}).length > Object.keys(a || {}).length ? b : a);

function mergeMonster(a, b) {
  const best = score(b) > score(a) ? b : a;
  const other = best === a ? b : a;
  const pick = (k) => (best[k] !== undefined && best[k] !== '' && best[k] !== null ? best[k] : other[k]);
  return {
    id: best.id,
    name: pick('name') || other.name,
    type: pick('type') || '',
    biome: pick('biome') || '',
    lore: pick('lore') || '',
    recorded: !!(best.recorded || other.recorded),
    levelRange: pick('levelRange') || '',
    alignment: pick('alignment') || '',
    specials: pick('specials') || '',
    health: pick('health') || '',
    defense: pick('defense') || '',
    resistance: pick('resistance') || '',
    scavenging: longer(best.scavenging, other.scavenging) || [],
    drops: longer(best.drops, other.drops) || [],
    skills: longer(best.skills, other.skills) || [],
    stats: moreStats(best.stats, other.stats) || {},
  };
}

const byId = new Map();
for (const m of base.monsters) {
  if (!m || m.id == null) continue;
  byId.set(m.id, { ...m });
}
for (const c of contribs) {
  for (const m of c.monsters) {
    if (!m || m.id == null) continue;
    const cur = byId.get(m.id);
    byId.set(m.id, cur ? mergeMonster(cur, m) : { ...m });
  }
}

const enemies = [...byId.values()].sort((a, b) => a.id - b.id).map((m) => {
  const o = { id: m.id, name: m.name };
  if (m.type) o.type = m.type;
  if (m.biome) o.biome = m.biome;
  if (m.lore) o.lore = m.lore;
  o.tab = TABS[String(m.id)] || 'other';
  o.icon = 'https://www.norroth.com/images/maps/items/enemy_' + m.id + '.gif';
  const firstBio = String(m.biome || '').split(',')[0].trim();
  if (BATTLEMAPS[firstBio]) o.bg = BATTLEMAPS[firstBio];
  o.recorded = !!m.recorded;
  if (o.recorded) {
    if (m.levelRange) o.levelRange = m.levelRange;
    if (m.alignment) o.alignment = m.alignment;
    if (m.specials) o.specials = m.specials;
    if (m.health) o.health = m.health;
    if (m.defense) o.defense = m.defense;
    if (m.resistance) o.resistance = m.resistance;
  }
  if ((m.scavenging || []).length) o.scavenging = m.scavenging;
  if ((m.drops || []).length) o.drops = m.drops;
  if ((m.skills || []).length) o.skills = m.skills;
  if (m.stats && Object.keys(m.stats).length) o.stats = m.stats;
  return o;
});

/* 贡献者名册：按角色去重，保留最近一次上传的信息 */
const contribMap = new Map();
for (const c of base.contributors) {
  const key = String(c.char || c.file || '');
  if (key) contribMap.set(key, c);
}
for (const c of contribs) {
  const key = String(c.meta.char || c.file || '');
  contribMap.set(key, {
    file: c.file,
    char: c.meta.char || '',
    level: c.meta.level || '',
    time: c.meta.time || '',
    count: (c.monsters || []).length,
    recorded: (c.monsters || []).filter((m) => m.recorded).length,
    mergedAt: new Date().toISOString().slice(0, 10),
  });
}
const contributors = [...contribMap.values()];

const meta = {
  source: '游戏内 Inspect（/modal/inspect_enemy）· 小伴侣导出 · ' + contributors.length + ' 位贡献者合并',
  fetched: new Date().toISOString().slice(0, 10),
  version: '1.0',
  contributors,
  count: enemies.length,
  recordedCount: enemies.filter((e) => e.recorded).length,
  withLore: enemies.filter((e) => e.lore).length,
  withStats: enemies.filter((e) => e.stats).length,
  withSkills: enemies.filter((e) => e.skills).length,
  withBg: enemies.filter((e) => e.bg).length,
  tabs: {
    normal: enemies.filter((e) => e.tab === 'normal').length,
    boss: enemies.filter((e) => e.tab === 'boss').length,
    overlord: enemies.filter((e) => e.tab === 'overlord').length,
    other: enemies.filter((e) => e.tab === 'other').length,
  },
};

const out = JSON.stringify({ meta, enemies }, null, 1) + '\n';
console.log('合并 ' + contribs.length + ' 份新贡献 → 共 ' + enemies.length + ' 种（已记录 ' + meta.recordedCount + ' / 属性 ' + meta.withStats + ' / 技能 ' + meta.withSkills + '），贡献者 ' + contributors.length + ' 位');

if (CHECK) {
  const cur = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : '';
  if (cur !== out) { console.error('✗ ' + path.relative(ROOT, OUT_FILE) + ' 与合并结果不一致，请运行 node tools/merge-bestiary-contrib.mjs'); process.exit(1); }
  console.log('✓ 已是最新');
} else {
  fs.writeFileSync(OUT_FILE, out);
  console.log('已写入 ' + path.relative(ROOT, OUT_FILE) + '（' + out.length + ' 字节）');
  if (KEEP) {
    console.log('--keep：保留收件箱中的 ' + files.length + ' 个贡献文件');
  } else {
    for (const f of files) fs.unlinkSync(path.join(CONTRIB_DIR, f));
    console.log('已清空收件箱（删除 ' + files.length + ' 个贡献文件）—— 仓库只保留一份权威图鉴文档');
  }
}
