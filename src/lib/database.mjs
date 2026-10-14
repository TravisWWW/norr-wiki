import { createHash } from 'node:crypto';
import crafting from '../data/crafting.json' with { type: 'json' };
import equipment from '../data/equipment.json' with { type: 'json' };
import maps from '../data/maps.json' with { type: 'json' };
import bestiary from '../data/bestiary.json' with { type: 'json' };
import dungeons from '../data/dungeons.json' with { type: 'json' };
import live from '../data/live-research.json' with { type: 'json' };
import liveRecipes from '../data/live-recipes.json' with { type: 'json' };

export const labels = { item: '物品与材料', map: '地图', monster: '怪物', boss: '副本 Boss', quest: '专业任务', profession: '制作专业' };
export const slug = (key) => String(key).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
  + '-' + createHash('sha256').update(String(key)).digest('hex').slice(0, 8);
export const entityPath = (kind, key) => `database/${kind}/${slug(key)}/`;
export const baseMaps = Object.values(maps.maps);
export const recipes = crafting.recipes;
export const professions = crafting.professions;
export const recipeLive = new Map(liveRecipes.recipes.map((r) => [r.id, r]));
export const equipmentIds = new Set(equipment.items.map((r) => r.id));
export const materialNames = new Set(recipes.flatMap((r) => r.materials).filter((name) => name && !name.includes('资料未提供')));
const itemNames = [...new Set([...recipes.map((r) => r.name), ...materialNames])].sort();
export const entities = [
  ...itemNames.map((name) => ({ kind: 'item', key: name, name, recipes: recipes.filter((r) => r.name === name), usedBy: recipes.filter((r) => r.materials.includes(name)), quests: live.quests.filter((q) => q.items.some((i) => i.name === name)), isMaterial: materialNames.has(name) })),
  ...live.maps.map((m) => ({ ...m, kind: 'map', key: String(m.id), recorded: maps.maps[m.id], gatheringLocations: live.gatheringLocations.filter((g) => g.coordinates === m.coordinates) })),
  ...live.enemies.map((m) => ({ ...m, kind: 'monster', key: String(m.id), recorded: bestiary.find((r) => r.id === m.id), locations: baseMaps.filter((r) => (r.m ?? []).includes(m.name)) })),
  ...dungeons.map((d) => ({ ...d, kind: 'boss', key: d.boss, name: d.boss, location: baseMaps.find((m) => `${m.wx}/${m.wy}` === d.coords) })),
  ...live.quests.map((q) => ({ ...q, kind: 'quest', key: String(q.id) })),
  ...professions.map((p) => ({ ...p, kind: 'profession', key: p.id, name: `${p.zh}（${p.en}）`, recipes: recipes.filter((r) => r.prof === p.id) })),
];
export const entityByName = new Map(entities.filter((e) => e.kind === 'item').map((e) => [e.name, e]));
export const counts = Object.fromEntries(Object.keys(labels).map((kind) => [kind, entities.filter((e) => e.kind === kind).length]));
export const byMonsterName = new Map(entities.filter((e) => e.kind === 'monster').map((e) => [e.name, e]));
export { live };
