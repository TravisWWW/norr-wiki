---
title: 制作配方全表
description: 13 个制作专业（官方帮助 id=113~132）的完整成品与配方明细：每个专业能制作的物品类型、材质档，以及每件成品的需求等级、材料与属性。
gameVersion: "EA"
verifiedDate: 2026-10-14
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（各制作职业配方页，id=113~132）
---

本页汇总全部 **13 个制作专业**的完整成品与配方：每个专业可制作的**物品类型**（如斧、剑、匕首、弓、弩、拳套、盾、法书、药水、宠物等）、**材质档位**，以及**每件成品的需求等级、材料与基础属性**。数据来自游戏内帮助文档各制作职业的配方页（id=113~132）。

> 说明：装备词条列为该档位的**基础值**；实际成品还会随品质（Quality）与稀有度浮动。半成品与加工材料以「成品 ← 配方」形式列出。

## 0. 成品类型速查（哪个专业做什么）

| 专业 | 归属职业 | 能做的成品类型 |
|---|---|---|
| **Weaponsmithing 铸武** | Berserker | 斧 Axes、剑 Swords、权杖 Scepters、**匕首 Daggers**、锤 Maces、矛 Spears |
| **Armorsmithing 铸甲** | Zealot | 金属重甲：腰带 Belts / 靴 Boots / 手 Gloves / 头 Helmets / 腿 Leggings / **盾 Shields** / 胸 Chests |
| **Leatherworking 制皮** | Berserker/Druid/Ranger/Rogue | 皮甲：腰带 / **盾** / 胸 / 手 / 头 / 腿 / 靴（按骨/鳞/翅/哥布林/甲壳分词条） |
| **Tailoring 裁缝** | Archmage/Druid | 布甲：腰带 / 靴 / 手 / 头 / 腿 / 胸 + **法书 Encased Tome** |
| **Jeweling 珠宝** | Archmage/Zealot | 宝石切割（Cabochon→Round→Princess→Emerald→Radiant）+ 戒指 Rings / 耳环 Earrings / 项链 Necklace |
| **Hunting 狩猎** | Berserker/Druid/Ranger/Zealot/Rogue | **弓 Bow**、拳套 Cestus、项链 / 耳环 / 戒指 |
| **Carpentry 木工** | Ranger | 木料（杆 Rod / 棍 Club / 板 Planks / 柄 Handle / 卷轴 Scroll）+ **弩 Crossbow** |
| **Alchemy 炼金** | Archmage | 药水（法力/生命/回春/增益）+ 法杖 Staff + 魔杖 Wand + 鱼油 / 宝珠 Orb |
| **Cartography 制图** | Archmage/Ranger/Zealot/Rogue | 墨水 Ink / 卷轴 Scroll / 蓝图 Blueprint / 远征地图 Map / 回城卷轴 / 鉴定卷轴 |
| **Stonemasonry 石工** | Berserker | 石料：精炼石 / 砖 Bricks / 地砖 Tiles / 柱 Pillars / 碎石 Gravel |
| **Toolsmithing 工具** | Rogue | 工具（镐/锄/斧/钓竿）+ 投掷武器 Throwing + 盗贼武器（拳刃/三叉/双轮刃） |
| **Cooking 烹饪** | 全职业 | 菜肴（蔬菜/鱼/水果/肉/混合/节日），给治疗 + buff |
| **Petbreeding 养宠** | Druid | 宠物 Pets + 宠物粮 Pet Food |

## 0.1 材料 Tier 对照（角色等级门槛）【官方 id=104】

| Tier | 角色等级 | 金属 | 木材 | 纤维 | 石料 | 鱼 | 尸块/其它 |
|---|---|---|---|---|---|---|---|
| T1 | 1-9 | Copper 铜 | Aspen 白杨 | Cotton 棉 | Slate 板岩 | Minnow | Mucky 污秽 |
| T2 | 10-19 | Iron 铁 | Elm 榆木 | Silkworm Cocoon 蚕茧 | Fieldstone 原石 | Shrimp | Scrap 废料 |
| T3 | 20-29 | Tin 锡 | Spruce 云杉 | Jute 黄麻 | Soapstone 皂石 | White Bass | Low Quality 低品质 |
| T4 | 30-39 | Coal 煤 | Maple 枫木 | Nettle 荨麻 | Sandstone 砂岩 | Smallmouth Bass | Medium Quality 中品质 |
| T5 | 40-49 | Mithril 秘银 | Beech 山毛榉 | Ramie 苎麻 | Laterite 红土 | Largemouth Bass | Quality 高品质 |
| T6 | 50-59 | Valentaal | Ash 白蜡木 | Bamboo 竹 | Travertine 石灰华 | Northern Pike | Graded |

> 金属锭换算：铜=4 矿、铁=5 矿、**青铜=1 铜锭+4 锡矿**、钢=1 铁锭+5 煤、秘银=8 秘银矿。
> 每个子类通常 3 档，解锁门槛 **Lv1 / Lv5 / Lv9**。

---


## Tailoring 裁缝（Archmage / Druid）

> 官方 help id=113。制作台见对应 NPC。

### Materials 材料 / 半成品

**Cotton 棉**

- `Mucky Scroll` ← 1× Cotton Boll
- `Cotton Spool` ← 2× Cotton Boll
- `Cotton Fleece` ← 4× Cotton Boll
- `Cotton Padding` ← 1× Cotton Fleece
- `Cotton Cord` ← 2× Cotton Spool

**Silk 丝**

- `Silk Spool` ← 2× Silkworm Cocoon
- `Scrap Scroll` ← 2× Silkworm Cocoon
- `Silk Fleece` ← 5× Silkworm Cocoon
- `Silk Padding` ← 1× Silk Fleece
- `Silk Cord` ← 2× Silk Spool

**Jute 黄麻**

- `Jute Spool` ← 2× Jute
- `Low Quality Scroll` ← 3× Jute
- `Jute Fleece` ← 6× Jute
- `Jute Padding` ← 1× Jute Fleece
- `Jute Cord` ← 2× Jute Spool

**Nettle 荨麻**

- `Nettle Spool` ← 2× Nettle
- `Medium Quality Scroll` ← 4× Nettle
- `Nettle Fleece` ← 7× Nettle
- `Nettle Padding` ← 1× Nettle Fleece
- `Nettle Cord` ← 2× Nettle Spool

**Ramie 苎麻**

- `Ramie Spool` ← 2× Ramie
- `Quality Scroll` ← 5× Ramie
- `Ramie Fleece` ← 8× Ramie
- `Ramie Padding` ← 1× Ramie Fleece
- `Ramie Cord` ← 2× Ramie Spool

### Belts 腰带

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Wrap | 1 | 2× Cotton Fleece | 2 Mana Regeneration, 2 Maximum Life, 2 Resilience |
| Cotton Sash | 5 | 3× Cotton Fleece + 1× Cotton Cord | 8 Mana Regeneration, 8 Maximum Life, 8 Resilience |
| Cotton War Cinch | 9 | 4× Cotton Fleece + 1× Cotton Cord + 1× Cotton Padding | 14 Mana Regeneration, 14 Maximum Life, 14 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Wrap | 10 | 2× Silk Fleece | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Silk Sash | 15 | 3× Silk Fleece + 1× Silk Cord | 23 Mana Regeneration, 23 Maximum Life, 23 Resilience |
| Silk War Cinch | 19 | 4× Silk Fleece + 1× Silk Cord + 1× Silk Padding | 29 Mana Regeneration, 29 Maximum Life, 29 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Wrap | 20 | 2× Jute Fleece | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Jute Sash | 25 | 3× Jute Fleece + 1× Jute Cord | 38 Mana Regeneration, 38 Maximum Life, 38 Resilience |
| Jute War Cinch | 29 | 4× Jute Fleece + 1× Jute Cord + 1× Jute Padding | 44 Mana Regeneration, 44 Maximum Life, 44 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Wrap | 30 | 2× Nettle Fleece | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Nettle Sash | 35 | 3× Nettle Fleece + 1× Nettle Cord | 53 Mana Regeneration, 53 Maximum Life, 53 Resilience |
| Nettle War Cinch | 39 | 4× Nettle Fleece + 1× Nettle Cord + 1× Nettle Padding | 59 Mana Regeneration, 59 Maximum Life, 59 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Wrap | 40 | 2× Ramie Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Ramie Sash | 45 | 3× Ramie Fleece + 1× Ramie Cord | 68 Mana Regeneration, 68 Maximum Life, 68 Resilience |
| Ramie War Cinch | 49 | 4× Ramie Fleece + 1× Ramie Cord + 1× Ramie Padding | 74 Mana Regeneration, 74 Maximum Life, 74 Resilience |

### Boots 靴子

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Sandals | 1 | 2× Cotton Fleece | 2 Mana Regeneration, 2 Maximum Life, 2 Resilience |
| Cotton Boots | 5 | 3× Cotton Fleece + 1× Cotton Cord | 8 Mana Regeneration, 8 Maximum Life, 8 Resilience |
| Cotton Brogans | 9 | 4× Cotton Fleece + 2× Cotton Cord | 14 Mana Regeneration, 14 Maximum Life, 14 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Sandals | 10 | 2× Silk Fleece | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Silk Boots | 15 | 3× Silk Fleece + 1× Silk Cord | 23 Mana Regeneration, 23 Maximum Life, 23 Resilience |
| Silk Brogans | 19 | 4× Silk Fleece + 2× Silk Cord | 29 Mana Regeneration, 29 Maximum Life, 29 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Sandals | 20 | 2× Jute Fleece | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Jute Boots | 25 | 3× Jute Fleece + 1× Jute Cord | 38 Mana Regeneration, 38 Maximum Life, 38 Resilience |
| Jute Brogans | 29 | 4× Jute Fleece + 2× Jute Cord | 44 Mana Regeneration, 44 Maximum Life, 44 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Sandals | 30 | 2× Nettle Fleece | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Nettle Boots | 35 | 3× Nettle Fleece + 1× Nettle Cord | 53 Mana Regeneration, 53 Maximum Life, 53 Resilience |
| Nettle Brogans | 39 | 4× Nettle Fleece + 2× Nettle Cord | 59 Mana Regeneration, 59 Maximum Life, 59 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Sandals | 40 | 2× Ramie Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Ramie Boots | 45 | 3× Ramie Fleece + 1× Ramie Cord | 68 Mana Regeneration, 68 Maximum Life, 68 Resilience |
| Ramie Brogans | 49 | 4× Ramie Fleece + 2× Ramie Cord | 74 Mana Regeneration, 74 Maximum Life, 74 Resilience |

### Gloves 手套

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Bracers | 1 | 2× Cotton Fleece | 2 Mana Regeneration, 2 Maximum Life, 2 Resilience |
| Cotton Gloves | 5 | 3× Cotton Fleece + 1× Cotton Padding | 8 Mana Regeneration, 8 Maximum Life, 8 Resilience |
| Cotton Manifers | 9 | 4× Cotton Fleece + 2× Cotton Padding | 14 Mana Regeneration, 14 Maximum Life, 14 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Bracers | 10 | 2× Silk Fleece | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Silk Gloves | 15 | 3× Silk Fleece + 1× Silk Padding | 23 Mana Regeneration, 23 Maximum Life, 23 Resilience |
| Silk Manifers | 19 | 4× Silk Fleece + 2× Silk Padding | 29 Mana Regeneration, 29 Maximum Life, 29 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Bracers | 20 | 2× Jute Fleece | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Jute Gloves | 25 | 3× Jute Fleece + 1× Jute Padding | 38 Mana Regeneration, 38 Maximum Life, 38 Resilience |
| Jute Manifers | 29 | 4× Jute Fleece + 2× Jute Padding | 44 Mana Regeneration, 44 Maximum Life, 44 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Bracers | 30 | 2× Nettle Fleece | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Nettle Gloves | 35 | 3× Nettle Fleece + 1× Nettle Padding | 53 Mana Regeneration, 53 Maximum Life, 53 Resilience |
| Nettle Manifers | 39 | 4× Nettle Fleece + 2× Nettle Padding | 59 Mana Regeneration, 59 Maximum Life, 59 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Bracers | 40 | 2× Ramie Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Ramie Gloves | 45 | 3× Ramie Fleece + 1× Ramie Padding | 68 Mana Regeneration, 68 Maximum Life, 68 Resilience |
| Ramie Manifers | 49 | 4× Ramie Fleece + 2× Ramie Padding | 74 Mana Regeneration, 74 Maximum Life, 74 Resilience |

### Helmets 头盔

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Headband | 1 | 3× Cotton Fleece | 3 Mana Regeneration, 3 Maximum Life, 3 Resilience |
| Cotton Cap | 5 | 3× Cotton Fleece + 2× Cotton Padding | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Cotton Hood | 9 | 4× Cotton Fleece + 3× Cotton Padding + 1× Cotton Cord | 27 Mana Regeneration, 27 Maximum Life, 27 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Headband | 10 | 3× Silk Fleece | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Silk Cap | 15 | 3× Silk Fleece + 2× Silk Padding | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Silk Hood | 19 | 4× Silk Fleece + 3× Silk Padding + 1× Silk Cord | 57 Mana Regeneration, 57 Maximum Life, 57 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Headband | 20 | 3× Jute Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Jute Cap | 25 | 3× Jute Fleece + 2× Jute Padding | 75 Mana Regeneration, 75 Maximum Life, 75 Resilience |
| Jute Hood | 29 | 4× Jute Fleece + 3× Jute Padding + 1× Jute Cord | 87 Mana Regeneration, 87 Maximum Life, 87 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Headband | 30 | 3× Nettle Fleece | 90 Mana Regeneration, 90 Maximum Life, 90 Resilience |
| Nettle Cap | 35 | 3× Nettle Fleece + 2× Nettle Padding | 105 Mana Regeneration, 105 Maximum Life, 105 Resilience |
| Nettle Hood | 39 | 4× Nettle Fleece + 3× Nettle Padding + 1× Nettle Cord | 117 Mana Regeneration, 117 Maximum Life, 117 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Headband | 40 | 3× Ramie Fleece | 120 Mana Regeneration, 120 Maximum Life, 120 Resilience |
| Ramie Cap | 45 | 3× Ramie Fleece + 2× Ramie Padding | 135 Mana Regeneration, 135 Maximum Life, 135 Resilience |
| Ramie Hood | 49 | 4× Ramie Fleece + 3× Ramie Padding + 1× Ramie Cord | 147 Mana Regeneration, 147 Maximum Life, 147 Resilience |

### Leggings 护腿

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Legwraps | 1 | 3× Cotton Fleece | 3 Mana Regeneration, 3 Maximum Life, 3 Resilience |
| Cotton Breeches | 5 | 3× Cotton Fleece + 2× Cotton Padding | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Cotton Leg Guards | 9 | 4× Cotton Fleece + 3× Cotton Padding + 1× Cotton Cord | 27 Mana Regeneration, 27 Maximum Life, 27 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Legwraps | 10 | 3× Silk Fleece | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Silk Breeches | 15 | 3× Silk Fleece + 2× Silk Padding | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Silk Leg Guards | 19 | 4× Silk Fleece + 3× Silk Padding + 1× Silk Cord | 57 Mana Regeneration, 57 Maximum Life, 57 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Legwraps | 20 | 3× Jute Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Jute Breeches | 25 | 3× Jute Fleece + 2× Jute Padding | 75 Mana Regeneration, 75 Maximum Life, 75 Resilience |
| Jute Leg Guards | 29 | 4× Jute Fleece + 3× Jute Padding + 1× Jute Cord | 87 Mana Regeneration, 87 Maximum Life, 87 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Legwraps | 30 | 3× Nettle Fleece | 90 Mana Regeneration, 90 Maximum Life, 90 Resilience |
| Nettle Breeches | 35 | 3× Nettle Fleece + 2× Nettle Padding | 105 Mana Regeneration, 105 Maximum Life, 105 Resilience |
| Nettle Leg Guards | 39 | 4× Nettle Fleece + 3× Nettle Padding + 1× Nettle Cord | 117 Mana Regeneration, 117 Maximum Life, 117 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Legwraps | 40 | 3× Ramie Fleece | 120 Mana Regeneration, 120 Maximum Life, 120 Resilience |
| Ramie Breeches | 45 | 3× Ramie Fleece + 2× Ramie Padding | 135 Mana Regeneration, 135 Maximum Life, 135 Resilience |
| Ramie Leg Guards | 49 | 4× Ramie Fleece + 3× Ramie Padding + 1× Ramie Cord | 147 Mana Regeneration, 147 Maximum Life, 147 Resilience |

### Chests 胸甲

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Drape | 1 | 4× Cotton Fleece | 6 Mana Regeneration, 6 Maximum Life, 6 Resilience |
| Cotton Tunic | 5 | 5× Cotton Fleece + 2× Cotton Padding + 1× Cotton Cord | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Cotton Cloak | 9 | 8× Cotton Fleece + 4× Cotton Padding + 2× Cotton Cord | 54 Mana Regeneration, 54 Maximum Life, 54 Resilience |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Drape | 10 | 4× Silk Fleece | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Silk Tunic | 15 | 5× Silk Fleece + 2× Silk Padding + 1× Silk Cord | 90 Mana Regeneration, 90 Maximum Life, 90 Resilience |
| Silk Cloak | 19 | 8× Silk Fleece + 4× Silk Padding + 2× Silk Cord | 114 Mana Regeneration, 114 Maximum Life, 114 Resilience |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Drape | 20 | 4× Jute Fleece | 120 Mana Regeneration, 120 Maximum Life, 120 Resilience |
| Jute Tunic | 25 | 5× Jute Fleece + 2× Jute Padding + 1× Jute Cord | 150 Mana Regeneration, 150 Maximum Life, 150 Resilience |
| Jute Cloak | 29 | 8× Jute Fleece + 4× Jute Padding + 2× Jute Cord | 174 Mana Regeneration, 174 Maximum Life, 174 Resilience |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Drape | 30 | 4× Nettle Fleece | 180 Mana Regeneration, 180 Maximum Life, 180 Resilience |
| Nettle Tunic | 35 | 5× Nettle Fleece + 2× Nettle Padding + 1× Nettle Cord | 210 Mana Regeneration, 210 Maximum Life, 210 Resilience |
| Nettle Cloak | 39 | 8× Nettle Fleece + 4× Nettle Padding + 2× Nettle Cord | 234 Mana Regeneration, 234 Maximum Life, 234 Resilience |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Drape | 40 | 4× Ramie Fleece | 240 Mana Regeneration, 240 Maximum Life, 240 Resilience |
| Ramie Tunic | 45 | 5× Ramie Fleece + 2× Ramie Padding + 1× Ramie Cord | 270 Mana Regeneration, 270 Maximum Life, 270 Resilience |
| Ramie Cloak | 49 | 8× Ramie Fleece + 4× Ramie Padding + 2× Ramie Cord | 294 Mana Regeneration, 294 Maximum Life, 294 Resilience |

### Encased Tome 法书（副手）

**Cotton 棉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cotton Garnet Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Garnet | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Onyx Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Onyx | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Peridot Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Peridot | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Quartz Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Quartz | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Sapphire Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Sapphire | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Sphene Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Sphene | 15 Evasion, 15 Hit Rating, 15 Spell Damage |
| Cotton Spinel Tome | 5 | 4× Mucky Scroll + 2× Cotton Fleece + 2× Cabochon Spinel | 15 Evasion, 15 Hit Rating, 15 Spell Damage |

**Silk 丝**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Silk Garnet Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Garnet | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Onyx Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Onyx | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Peridot Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Peridot | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Quartz Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Quartz | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Sapphire Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Sapphire | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Sphene Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Sphene | 45 Evasion, 45 Hit Rating, 45 Spell Damage |
| Silk Spinel Tome | 15 | 4× Scrap Scroll + 2× Silk Fleece + 2× Round Spinel | 45 Evasion, 45 Hit Rating, 45 Spell Damage |

**Jute 黄麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Jute Garnet Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Garnet | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Onyx Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Onyx | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Peridot Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Peridot | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Quartz Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Quartz | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Sapphire Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Sapphire | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Sphene Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Sphene | 75 Evasion, 75 Hit Rating, 75 Spell Damage |
| Jute Spinel Tome | 25 | 4× Low Quality Scroll + 2× Jute Fleece + 2× Princess Spinel | 75 Evasion, 75 Hit Rating, 75 Spell Damage |

**Nettle 荨麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Nettle Garnet Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Garnet | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Onyx Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Onyx | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Peridot Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Peridot | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Quartz Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Quartz | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Sapphire Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Sapphire | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Sphene Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Sphene | 105 Evasion, 105 Hit Rating, 105 Spell Damage |
| Nettle Spinel Tome | 35 | 4× Medium Quality Scroll + 2× Nettle Fleece + 2× Emerald Spinel | 105 Evasion, 105 Hit Rating, 105 Spell Damage |

**Ramie 苎麻**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Ramie Garnet Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Garnet | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Onyx Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Onyx | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Peridot Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Peridot | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Quartz Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Quartz | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Sapphire Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Sapphire | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Sphene Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Sphene | 135 Evasion, 135 Hit Rating, 135 Spell Damage |
| Ramie Spinel Tome | 45 | 4× Quality Scroll + 2× Ramie Fleece + 2× Radiant Spinel | 135 Evasion, 135 Hit Rating, 135 Spell Damage |


## Alchemy 炼金（Archmage）

> 官方 help id=114。制作台见对应 NPC。

### Mana 法力药水

- `Tiny Mana Potion` ← 2× Blue Poppy Seed + 3× Spirit Essence
- `Small Mana Potion` ← 3× Blue Lily Seed + 6× Spirit Essence
- `Small Mana Potion` ← 3× Tiny Mana Potion
- `Medium Mana Potion` ← 4× Blue Bensil Seed + 9× Spirit Essence
- `Medium Mana Potion` ← 3× Small Mana Potion
- `Large Mana Potion` ← 3× Medium Mana Potion
- `Large Mana Potion` ← 1× Medium Quality Fish Oil + 5× Blue Kerria Seed + 12× Spirit Essence
- `Greater Mana Potion` ← 3× Large Mana Potion
- `Greater Mana Potion` ← 1× Quality Fish Oil + 6× Blue Penta Seed + 15× Spirit Essence

### Buffs 增益药水

- `Tiny Spell Damage Potion` ← 1× Red Poppy Seed + 1× Blue Poppy Seed + 1× Mucky Fish Oil
- `Tiny Attack Speed Potion` ← 1× Red Poppy Seed + 1× Blue Poppy Seed + 1× Mucky Fish Oil
- `Tiny Armor Penetration Potion` ← 1× Red Poppy Seed + 1× Blue Poppy Seed + 1× Mucky Fish Oil
- `Tiny Critical Strike Potion` ← 1× Red Poppy Seed + 1× Blue Poppy Seed + 1× Mucky Fish Oil
- `Small Spell Damage Potion` ← 1× Red Lily Seed + 1× Blue Lily Seed + 1× Scrap Fish Oil
- `Small Attack Speed Potion` ← 1× Red Lily Seed + 1× Blue Lily Seed + 1× Scrap Fish Oil
- `Small Armor Penetration Potion` ← 1× Red Lily Seed + 1× Blue Lily Seed + 1× Scrap Fish Oil
- `Small Critical Strike Potion` ← 1× Red Lily Seed + 1× Blue Lily Seed + 1× Scrap Fish Oil
- `Medium Spell Damage Potion` ← 1× Red Bensil Seed + 1× Blue Bensil Seed + 2× Low Quality Fish Oil
- `Medium Attack Speed Potion` ← 1× Red Bensil Seed + 1× Blue Bensil Seed + 2× Low Quality Fish Oil
- `Medium Armor Penetration Potion` ← 1× Red Bensil Seed + 1× Blue Bensil Seed + 2× Low Quality Fish Oil
- `Medium Critical Strike Potion` ← 1× Red Bensil Seed + 1× Blue Bensil Seed + 2× Low Quality Fish Oil
- `Large Spell Damage Potion` ← 1× Red Kerria Seed + 1× Blue Kerria Seed + 2× Medium Quality Fish Oil
- `Large Attack Speed Potion` ← 1× Red Kerria Seed + 1× Blue Kerria Seed + 2× Medium Quality Fish Oil
- `Large Armor Penetration Potion` ← 1× Red Kerria Seed + 1× Blue Kerria Seed + 2× Medium Quality Fish Oil
- `Large Critical Strike Potion` ← 1× Red Kerria Seed + 1× Blue Kerria Seed + 2× Medium Quality Fish Oil
- `Greater Spell Damage Potion` ← 1× Red Penta Seed + 1× Blue Penta Seed + 3× Quality Fish Oil
- `Greater Attack Speed Potion` ← 1× Red Penta Seed + 1× Blue Penta Seed + 3× Quality Fish Oil
- `Greater Armor Penetration Potion` ← 1× Red Penta Seed + 1× Blue Penta Seed + 3× Quality Fish Oil
- `Greater Critical Strike Potion` ← 1× Red Penta Seed + 1× Blue Penta Seed + 3× Quality Fish Oil

### Rejuvenation 回春药水

- `Tiny Rejuvenation Potion` ← 1× Red Poppy Seed + 1× Blue Poppy Seed + 6× Spirit Essence
- `Small Rejuvenation Potion` ← 2× Red Lily Seed + 1× Blue Lily Seed + 9× Spirit Essence
- `Small Rejuvenation Potion` ← 3× Tiny Rejuvenation Potion
- `Medium Rejuvenation Potion` ← 2× Red Bensil Seed + 2× Blue Bensil Seed + 12× Spirit Essence
- `Medium Rejuvenation Potion` ← 3× Small Rejuvenation Potion
- `Large Rejuvenation Potion` ← 1× Medium Quality Fish Oil + 3× Red Kerria Seed + 2× Blue Kerria Seed + 15× Spirit Essence
- `Large Rejuvenation Potion` ← 3× Medium Rejuvenation Potion
- `Greater Rejuvenation Potion` ← 3× Large Rejuvenation Potion
- `Greater Rejuvenation Potion` ← 1× Quality Fish Oil + 3× Red Penta Seed + 3× Blue Penta Seed + 18× Spirit Essence

### Health 生命药水

- `Tiny Health Potion` ← 2× Red Poppy Seed + 3× Spirit Essence
- `Small Health Potion` ← 3× Red Lily Seed + 6× Spirit Essence
- `Small Health Potion` ← 3× Tiny Health Potion
- `Medium Health Potion` ← 4× Red Bensil Seed + 9× Spirit Essence
- `Medium Health Potion` ← 3× Small Health Potion
- `Large Health Potion` ← 3× Medium Health Potion
- `Large Health Potion` ← 1× Medium Quality Fish Oil + 5× Red Kerria Seed + 12× Spirit Essence
- `Greater Health Potion` ← 3× Large Health Potion
- `Greater Health Potion` ← 1× Quality Fish Oil + 6× Red Penta Seed + 15× Spirit Essence

### Staff 法杖

**Cabochon Orb 蛋面宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Aspen Novice Staff 〔双手〕 | 1 | 2× Cabochon Orb | 4 Critical Strike, 4 Hit Rating, 4 Mana |
| Aspen Initiate Staff 〔双手〕 | 5 | 4× Cabochon Orb + 1× Aspen Rod | 18 Critical Strike, 18 Hit Rating, 18 Mana |
| Aspen Grandmaster Staff 〔双手〕 | 9 | 8× Cabochon Orb + 1× Aspen Rod | 32 Critical Strike, 32 Hit Rating, 32 Mana |

**Round Orb 圆形宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Elm Novice Staff 〔双手〕 | 10 | 2× Round Orb | 35 Critical Strike, 35 Hit Rating, 35 Mana |
| Elm Initiate Staff 〔双手〕 | 15 | 4× Round Orb + 1× Elm Rod | 53 Critical Strike, 53 Hit Rating, 53 Mana |
| Elm Grandmaster Staff 〔双手〕 | 19 | 8× Round Orb + 1× Elm Rod | 67 Critical Strike, 67 Hit Rating, 67 Mana |

**Princess Orb 公主方宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Spruce Novice Staff 〔双手〕 | 20 | 2× Princess Orb + 1× Spruce Rod | 70 Critical Strike, 70 Hit Rating, 70 Mana |
| Spruce Initiate Staff 〔双手〕 | 25 | 4× Princess Orb + 1× Spruce Rod | 88 Critical Strike, 88 Hit Rating, 88 Mana |
| Spruce Grandmaster Staff 〔双手〕 | 29 | 8× Princess Orb + 1× Spruce Rod | 102 Critical Strike, 102 Hit Rating, 102 Mana |

**Emerald Orb 祖母绿宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Maple Novice Staff 〔双手〕 | 30 | 2× Emerald Orb + 1× Maple Rod | 105 Critical Strike, 105 Hit Rating, 105 Mana |
| Maple Initiate Staff 〔双手〕 | 35 | 4× Emerald Orb + 1× Maple Rod | 123 Critical Strike, 123 Hit Rating, 123 Mana |
| Maple Grandmaster Staff 〔双手〕 | 39 | 8× Emerald Orb + 1× Maple Rod | 137 Critical Strike, 137 Hit Rating, 137 Mana |

**Radiant Orb 雷迪恩宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Beech Novice Staff 〔双手〕 | 40 | 2× Radiant Orb + 1× Beech Rod | 140 Critical Strike, 140 Hit Rating, 140 Mana |
| Beech Initiate Staff 〔双手〕 | 45 | 4× Radiant Orb + 1× Beech Rod | 158 Critical Strike, 158 Hit Rating, 158 Mana |
| Beech Grandmaster Staff 〔双手〕 | 49 | 8× Radiant Orb + 1× Beech Rod | 172 Critical Strike, 172 Hit Rating, 172 Mana |

### Wand 魔杖

**Cabochon Orb 蛋面宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Aspen Novice Wand | 1 | 2× Cabochon Orb | 4 Attack Speed, 4 Hit Rating, 4 Mana |
| Aspen Initiate Wand | 5 | 4× Cabochon Orb + 1× Aspen Handle | 18 Attack Speed, 18 Hit Rating, 18 Mana |
| Aspen Grandmaster Wand | 9 | 8× Cabochon Orb + 1× Aspen Handle | 32 Attack Speed, 32 Hit Rating, 32 Mana |

**Round Orb 圆形宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Elm Novice Wand | 10 | 2× Round Orb | 35 Attack Speed, 35 Hit Rating, 35 Mana |
| Elm Initiate Wand | 15 | 4× Round Orb + 1× Elm Handle | 53 Attack Speed, 53 Hit Rating, 53 Mana |
| Elm Grandmaster Wand | 19 | 8× Round Orb + 1× Elm Handle | 67 Attack Speed, 67 Hit Rating, 67 Mana |

**Princess Orb 公主方宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Spruce Novice Wand | 20 | 2× Princess Orb + 1× Spruce Handle | 70 Attack Speed, 70 Hit Rating, 70 Mana |
| Spruce Initiate Wand | 25 | 4× Princess Orb + 1× Spruce Handle | 88 Attack Speed, 88 Hit Rating, 88 Mana |
| Spruce Grandmaster Wand | 29 | 8× Princess Orb + 1× Spruce Handle | 102 Attack Speed, 102 Hit Rating, 102 Mana |

**Emerald Orb 祖母绿宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Maple Novice Wand | 30 | 2× Emerald Orb + 1× Maple Handle | 105 Attack Speed, 105 Hit Rating, 105 Mana |
| Maple Initiate Wand | 35 | 4× Emerald Orb + 1× Maple Handle | 123 Attack Speed, 123 Hit Rating, 123 Mana |
| Maple Grandmaster Wand | 39 | 8× Emerald Orb + 1× Maple Handle | 137 Attack Speed, 137 Hit Rating, 137 Mana |

**Radiant Orb 雷迪恩宝珠**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Beech Novice Wand | 40 | 2× Radiant Orb + 1× Beech Handle | 140 Attack Speed, 140 Hit Rating, 140 Mana |
| Beech Initiate Wand | 45 | 4× Radiant Orb + 1× Beech Handle | 158 Attack Speed, 158 Hit Rating, 158 Mana |
| Beech Grandmaster Wand | 49 | 8× Radiant Orb + 1× Beech Handle | 172 Attack Speed, 172 Hit Rating, 172 Mana |

### Oils 鱼油

- `Mucky Fish Oil` ← 3× Mucky Oily Fish Carcass
- `Scrap Fish Oil` ← 3× Scrap Oily Fish Carcass
- `Low Quality Fish Oil` ← 3× Low Quality Oily Fish Carcass
- `Medium Quality Fish Oil` ← 3× Medium Quality Oily Fish Carcass
- `Quality Fish Oil` ← 3× Quality Oily Fish Carcass

### Orb 宝珠

- `Cabochon Orb` ← 1× Rough Sphene + 1× Rough Spinel + 1× Rough Sapphire + 1× Rough Peridot + 1× Rough Garnet + 1× Rough Quartz + 1× Rough Onyx
- `Round Orb` ← 1× Cabochon Sphene + 1× Cabochon Spinel + 1× Cabochon Sapphire + 1× Cabochon Peridot + 1× Cabochon Garnet + 1× Cabochon Quartz + 1× Cabochon Onyx
- `Princess Orb` ← 1× Round Sphene + 1× Round Spinel + 1× Round Sapphire + 1× Round Peridot + 1× Round Garnet + 1× Round Quartz + 1× Round Onyx
- `Emerald Orb` ← 1× Princess Sphene + 1× Princess Spinel + 1× Princess Sapphire + 1× Princess Peridot + 1× Princess Garnet + 1× Princess Quartz + 1× Princess Onyx
- `Radiant Orb` ← 1× Emerald Sphene + 1× Emerald Spinel + 1× Emerald Sapphire + 1× Emerald Peridot + 1× Emerald Garnet + 1× Emerald Quartz + 1× Emerald Onyx


## Weaponsmithing 铸武（Berserker）

> 官方 help id=115。制作台见对应 NPC。

### Materials 材料 / 半成品

**Copper 铜**

- `Copper Ingot` ← 4× Copper Ore
- `Copper Nails` ← 1× Copper Ingot
- `Copper Hilt` ← 2× Copper Ingot
- `Copper Blade` ← 2× Copper Ingot
- `Copper Point` ← 2× Copper Ingot
- `Copper Axe Blade` ← 2× Copper Ingot

**Iron 铁**

- `Iron Ingot` ← 5× Iron Ore
- `Iron Nails` ← 1× Iron Ingot
- `Iron Hilt` ← 2× Iron Ingot
- `Iron Blade` ← 2× Iron Ingot
- `Iron Point` ← 2× Iron Ingot
- `Iron Axe Blade` ← 2× Iron Ingot

**Bronze 青铜**

- `Bronze Nails` ← 1× Bronze Ingot
- `Bronze Hilt` ← 2× Bronze Ingot
- `Bronze Blade` ← 2× Bronze Ingot
- `Bronze Point` ← 2× Bronze Ingot
- `Bronze Axe Blade` ← 2× Bronze Ingot
- `Bronze Ingot` ← 1× Copper Ingot + 4× Tin Ore

**Steel 钢**

- `Steel Ingot` ← 1× Iron Ingot + 5× Lump of Coal
- `Steel Nails` ← 1× Steel Ingot
- `Steel Hilt` ← 2× Steel Ingot
- `Steel Blade` ← 2× Steel Ingot
- `Steel Point` ← 2× Steel Ingot
- `Steel Axe Blade` ← 2× Steel Ingot

**Mithril 秘银**

- `Mithril Ingot` ← 8× Mithril Ore
- `Mithril Nails` ← 1× Mithril Ingot
- `Mithril Hilt` ← 2× Mithril Ingot
- `Mithril Blade` ← 2× Mithril Ingot
- `Mithril Point` ← 2× Mithril Ingot
- `Mithril Axe Blade` ← 2× Mithril Ingot

### Axes 斧

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Berserker Axe | 1 | 1× Copper Axe Blade + 2× Copper Ingot | 4 Bleed Damage, 4 Hit Rating, 4 Life Steal |
| Copper Battle Axe | 5 | 1× Copper Axe Blade + 6× Copper Ingot + 1× Aspen Handle | 18 Bleed Damage, 18 Hit Rating, 18 Life Steal |
| Copper Twin-bladed Axe | 9 | 1× Copper Axe Blade + 12× Copper Ingot + 1× Aspen Handle | 32 Bleed Damage, 32 Hit Rating, 32 Life Steal |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Berserker Axe | 10 | 1× Iron Axe Blade + 2× Iron Ingot | 35 Bleed Damage, 35 Hit Rating, 35 Life Steal |
| Iron Battle Axe | 15 | 1× Iron Axe Blade + 6× Iron Ingot + 1× Elm Handle | 53 Bleed Damage, 53 Hit Rating, 53 Life Steal |
| Iron Twin-bladed Axe | 19 | 1× Iron Axe Blade + 12× Iron Ingot + 1× Elm Handle | 67 Bleed Damage, 67 Hit Rating, 67 Life Steal |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Berserker Axe | 20 | 1× Bronze Axe Blade + 2× Bronze Ingot + 1× Spruce Handle | 70 Bleed Damage, 70 Hit Rating, 70 Life Steal |
| Bronze Battle Axe | 25 | 1× Bronze Axe Blade + 6× Bronze Ingot + 1× Spruce Handle | 88 Bleed Damage, 88 Hit Rating, 88 Life Steal |
| Bronze Twin-bladed Axe | 29 | 1× Bronze Axe Blade + 12× Bronze Ingot + 1× Spruce Handle | 102 Bleed Damage, 102 Hit Rating, 102 Life Steal |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Berserker Axe | 30 | 1× Steel Axe Blade + 2× Steel Ingot + 1× Maple Handle | 105 Bleed Damage, 105 Hit Rating, 105 Life Steal |
| Steel Battle Axe | 35 | 1× Steel Axe Blade + 6× Steel Ingot + 1× Maple Handle | 123 Bleed Damage, 123 Hit Rating, 123 Life Steal |
| Steel Twin-bladed Axe | 39 | 1× Steel Axe Blade + 12× Steel Ingot + 1× Maple Handle | 137 Bleed Damage, 137 Hit Rating, 137 Life Steal |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Berserker Axe | 40 | 1× Mithril Axe Blade + 2× Mithril Ingot + 1× Beech Handle | 140 Bleed Damage, 140 Hit Rating, 140 Life Steal |
| Mithril Battle Axe | 45 | 1× Mithril Axe Blade + 6× Mithril Ingot + 1× Beech Handle | 158 Bleed Damage, 158 Hit Rating, 158 Life Steal |
| Mithril Twin-bladed Axe | 49 | 1× Mithril Axe Blade + 12× Mithril Ingot + 1× Beech Handle | 172 Bleed Damage, 172 Hit Rating, 172 Life Steal |

### Swords 剑

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Shortsword | 1 | 1× Copper Hilt + 1× Copper Blade | 4 Armor Penetration, 4 Critical Strike, 4 Hit Rating |
| Copper Scimitar | 5 | 1× Copper Hilt + 1× Copper Blade + 6× Copper Ingot | 18 Armor Penetration, 18 Critical Strike, 18 Hit Rating |
| Copper Warblade | 9 | 1× Copper Hilt + 1× Copper Blade + 12× Copper Ingot | 32 Armor Penetration, 32 Critical Strike, 32 Hit Rating |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Shortsword | 10 | 1× Iron Hilt + 1× Iron Blade | 35 Armor Penetration, 35 Critical Strike, 35 Hit Rating |
| Iron Scimitar | 15 | 1× Iron Hilt + 1× Iron Blade + 6× Iron Ingot | 53 Armor Penetration, 53 Critical Strike, 53 Hit Rating |
| Iron Warblade | 19 | 1× Iron Hilt + 1× Iron Blade + 12× Iron Ingot | 67 Armor Penetration, 67 Critical Strike, 67 Hit Rating |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Shortsword | 20 | 1× Bronze Hilt + 1× Bronze Blade | 70 Armor Penetration, 70 Critical Strike, 70 Hit Rating |
| Bronze Scimitar | 25 | 1× Bronze Hilt + 1× Bronze Blade + 6× Bronze Ingot | 88 Armor Penetration, 88 Critical Strike, 88 Hit Rating |
| Bronze Warblade | 29 | 1× Bronze Hilt + 1× Bronze Blade + 12× Bronze Ingot | 102 Armor Penetration, 102 Critical Strike, 102 Hit Rating |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Shortsword | 30 | 1× Steel Hilt + 1× Steel Blade | 105 Armor Penetration, 105 Critical Strike, 105 Hit Rating |
| Steel Scimitar | 35 | 1× Steel Hilt + 1× Steel Blade + 6× Steel Ingot | 123 Armor Penetration, 123 Critical Strike, 123 Hit Rating |
| Steel Warblade | 39 | 1× Steel Hilt + 1× Steel Blade + 12× Steel Ingot | 137 Armor Penetration, 137 Critical Strike, 137 Hit Rating |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Shortsword | 40 | 1× Mithril Hilt + 1× Mithril Blade | 140 Armor Penetration, 140 Critical Strike, 140 Hit Rating |
| Mithril Scimitar | 45 | 1× Mithril Hilt + 1× Mithril Blade + 6× Mithril Ingot | 158 Armor Penetration, 158 Critical Strike, 158 Hit Rating |
| Mithril Warblade | 49 | 1× Mithril Hilt + 1× Mithril Blade + 12× Mithril Ingot | 172 Armor Penetration, 172 Critical Strike, 172 Hit Rating |

### Scepters 权杖

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Caduceus | 9 | 1× Copper Hilt + 12× Copper Ingot + 1× Cabochon Orb | 32 Critical Chance, 32 Hit Rating, 32 Mana Steal |
| Copper Scepter | 1 | 1× Copper Hilt + 2× Copper Ingot + 1× Cabochon Orb | 4 Critical Chance, 4 Hit Rating, 4 Mana Steal |
| Copper Crozier | 5 | 1× Copper Hilt + 6× Copper Ingot + 1× Cabochon Orb | 18 Critical Chance, 18 Hit Rating, 18 Mana Steal |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Caduceus | 19 | 1× Iron Hilt + 12× Iron Ingot + 1× Round Orb | 67 Critical Chance, 67 Hit Rating, 67 Mana Steal |
| Iron Scepter | 10 | 1× Iron Hilt + 2× Iron Ingot + 1× Round Orb | 35 Critical Chance, 35 Hit Rating, 35 Mana Steal |
| Iron Crozier | 15 | 1× Iron Hilt + 6× Iron Ingot + 1× Round Orb | 53 Critical Chance, 53 Hit Rating, 53 Mana Steal |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Caduceus | 29 | 1× Bronze Hilt + 12× Bronze Ingot + 1× Princess Orb | 102 Critical Chance, 102 Hit Rating, 102 Mana Steal |
| Bronze Scepter | 20 | 1× Bronze Hilt + 2× Bronze Ingot + 1× Princess Orb | 70 Critical Chance, 70 Hit Rating, 70 Mana Steal |
| Bronze Crozier | 25 | 1× Bronze Hilt + 6× Bronze Ingot + 1× Princess Orb | 88 Critical Chance, 88 Hit Rating, 88 Mana Steal |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Caduceus | 39 | 1× Steel Hilt + 12× Steel Ingot + 1× Emerald Orb | 137 Critical Chance, 137 Hit Rating, 137 Mana Steal |
| Steel Scepter | 30 | 1× Steel Hilt + 2× Steel Ingot + 1× Emerald Orb | 105 Critical Chance, 105 Hit Rating, 105 Mana Steal |
| Steel Crozier | 35 | 1× Steel Hilt + 6× Steel Ingot + 1× Emerald Orb | 123 Critical Chance, 123 Hit Rating, 123 Mana Steal |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Caduceus | 49 | 1× Mithril Hilt + 12× Mithril Ingot + 1× Radiant Sapphire | 172 Critical Chance, 172 Hit Rating, 172 Mana Steal |
| Mithril Scepter | 40 | 1× Mithril Hilt + 2× Mithril Ingot + 1× Radiant Sphene | 140 Critical Chance, 140 Hit Rating, 140 Mana Steal |
| Mithril Crozier | 45 | 1× Mithril Hilt + 6× Mithril Ingot + 1× Radiant Spinel | 158 Critical Chance, 158 Hit Rating, 158 Mana Steal |

### Daggers 匕首

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Shiv Dagger | 1 | 1× Copper Hilt + 2× Copper Ingot | 4 Armor Penetration, 4 Attack Speed, 4 Hit Rating |
| Copper Dirk Dagger | 5 | 1× Copper Hilt + 6× Copper Ingot | 18 Armor Penetration, 18 Attack Speed, 18 Hit Rating |
| Copper Kris Dagger | 9 | 1× Copper Hilt + 12× Copper Ingot | 32 Armor Penetration, 32 Attack Speed, 32 Hit Rating |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Shiv Dagger | 10 | 1× Iron Hilt + 2× Iron Ingot | 35 Armor Penetration, 35 Attack Speed, 35 Hit Rating |
| Iron Dirk Dagger | 15 | 1× Iron Hilt + 6× Iron Ingot | 53 Armor Penetration, 53 Attack Speed, 53 Hit Rating |
| Iron Kris Dagger | 19 | 1× Iron Hilt + 12× Iron Ingot | 67 Armor Penetration, 67 Attack Speed, 67 Hit Rating |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Shiv Dagger | 20 | 1× Bronze Hilt + 2× Bronze Ingot | 70 Armor Penetration, 70 Attack Speed, 70 Hit Rating |
| Bronze Dirk Dagger | 25 | 1× Bronze Hilt + 3× Bronze Ingot | 88 Armor Penetration, 88 Attack Speed, 88 Hit Rating |
| Bronze Kris Dagger | 29 | 1× Bronze Hilt + 12× Bronze Ingot | 102 Armor Penetration, 102 Attack Speed, 102 Hit Rating |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Shiv Dagger | 30 | 1× Steel Hilt + 2× Steel Ingot | 105 Armor Penetration, 105 Attack Speed, 105 Hit Rating |
| Steel Dirk Dagger | 35 | 1× Steel Hilt + 6× Steel Ingot | 123 Armor Penetration, 123 Attack Speed, 123 Hit Rating |
| Steel Kris Dagger | 39 | 1× Steel Hilt + 12× Steel Ingot | 137 Armor Penetration, 137 Attack Speed, 137 Hit Rating |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Shiv Dagger | 40 | 1× Mithril Hilt + 2× Mithril Ingot | 140 Armor Penetration, 140 Attack Speed, 140 Hit Rating |
| Mithril Dirk Dagger | 45 | 1× Mithril Hilt + 6× Mithril Ingot | 158 Armor Penetration, 158 Attack Speed, 158 Hit Rating |
| Mithril Kris Dagger | 49 | 1× Mithril Hilt + 12× Mithril Ingot | 172 Armor Penetration, 172 Attack Speed, 172 Hit Rating |

### Maces 锤（钝器）

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Great Club 〔双手〕 | 1 | 3× Copper Ingot | 4 Blunt Damage, 4 Critical Strike, 4 Hit Rating |
| Copper Heavy Flail 〔双手〕 | 5 | 6× Copper Ingot + 1× Aspen Club | 18 Blunt Damage, 18 Critical Strike, 18 Hit Rating |
| Copper Warhammer 〔双手〕 | 9 | 12× Copper Ingot + 1× Aspen Club | 32 Blunt Damage, 32 Critical Strike, 32 Hit Rating |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Great Club 〔双手〕 | 10 | 2× Iron Ingot | 35 Blunt Damage, 35 Critical Strike, 35 Hit Rating |
| Iron Heavy Flail 〔双手〕 | 15 | 6× Iron Ingot + 1× Elm Club | 53 Blunt Damage, 53 Critical Strike, 53 Hit Rating |
| Iron Warhammer 〔双手〕 | 19 | 12× Iron Ingot + 1× Elm Club | 67 Blunt Damage, 67 Critical Strike, 67 Hit Rating |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Great Club 〔双手〕 | 20 | 2× Bronze Ingot + 1× Spruce Club | 70 Blunt Damage, 70 Critical Strike, 70 Hit Rating |
| Bronze Heavy Flail 〔双手〕 | 25 | 6× Bronze Ingot + 1× Spruce Club | 88 Blunt Damage, 88 Critical Strike, 88 Hit Rating |
| Bronze Warhammer 〔双手〕 | 29 | 12× Bronze Ingot + 1× Spruce Club | 102 Blunt Damage, 102 Critical Strike, 102 Hit Rating |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Great Club 〔双手〕 | 30 | 2× Steel Ingot + 1× Maple Club | 105 Blunt Damage, 105 Critical Strike, 105 Hit Rating |
| Steel Heavy Flail 〔双手〕 | 35 | 6× Steel Ingot + 1× Maple Club | 123 Blunt Damage, 123 Critical Strike, 123 Hit Rating |
| Steel Warhammer 〔双手〕 | 39 | 12× Steel Ingot + 1× Maple Club | 137 Blunt Damage, 137 Critical Strike, 137 Hit Rating |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Great Club 〔双手〕 | 40 | 2× Mithril Ingot + 1× Beech Club | 140 Blunt Damage, 140 Critical Strike, 140 Hit Rating |
| Mithril Heavy Flail 〔双手〕 | 45 | 6× Mithril Ingot + 1× Beech Club | 158 Blunt Damage, 158 Critical Strike, 158 Hit Rating |
| Mithril Warhammer 〔双手〕 | 49 | 12× Mithril Ingot + 1× Beech Club | 172 Blunt Damage, 172 Critical Strike, 172 Hit Rating |

### Spears 长矛

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Spear 〔双手〕 | 1 | 1× Copper Point + 2× Copper Ingot | 4 Armor Penetration, 4 Hit Rating, 4 Physical Damage |
| Copper Pike 〔双手〕 | 5 | 1× Copper Point + 6× Copper Ingot + 1× Aspen Rod | 18 Armor Penetration, 18 Hit Rating, 18 Physical Damage |
| Copper Trident 〔双手〕 | 9 | 3× Copper Point + 8× Copper Ingot + 1× Aspen Rod | 32 Armor Penetration, 32 Hit Rating, 32 Physical Damage |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Spear 〔双手〕 | 10 | 1× Iron Point + 2× Iron Ingot | 35 Armor Penetration, 35 Hit Rating, 35 Physical Damage |
| Iron Pike 〔双手〕 | 15 | 1× Iron Point + 6× Iron Ingot + 1× Elm Rod | 53 Armor Penetration, 53 Hit Rating, 53 Physical Damage |
| Iron Trident 〔双手〕 | 19 | 3× Iron Point + 8× Iron Ingot + 1× Elm Rod | 67 Armor Penetration, 67 Hit Rating, 67 Physical Damage |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Spear 〔双手〕 | 20 | 1× Bronze Point + 2× Bronze Ingot + 1× Spruce Rod | 70 Armor Penetration, 70 Hit Rating, 70 Physical Damage |
| Bronze Pike 〔双手〕 | 25 | 1× Bronze Point + 6× Bronze Ingot + 1× Spruce Rod | 88 Armor Penetration, 88 Hit Rating, 88 Physical Damage |
| Bronze Trident 〔双手〕 | 29 | 3× Bronze Point + 8× Bronze Ingot + 1× Spruce Rod | 102 Armor Penetration, 102 Hit Rating, 102 Physical Damage |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Spear 〔双手〕 | 30 | 1× Steel Point + 2× Steel Ingot + 1× Maple Rod | 105 Armor Penetration, 105 Hit Rating, 105 Physical Damage |
| Steel Pike 〔双手〕 | 35 | 1× Steel Point + 6× Steel Ingot + 1× Maple Rod | 123 Armor Penetration, 123 Hit Rating, 123 Physical Damage |
| Steel Trident 〔双手〕 | 39 | 3× Steel Point + 8× Steel Ingot + 1× Maple Rod | 137 Armor Penetration, 137 Hit Rating, 137 Physical Damage |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Spear 〔双手〕 | 40 | 1× Mithril Point + 2× Mithril Ingot + 1× Beech Rod | 140 Armor Penetration, 140 Hit Rating, 140 Physical Damage |
| Mithril Pike 〔双手〕 | 45 | 1× Mithril Point + 6× Mithril Ingot + 1× Beech Rod | 158 Armor Penetration, 158 Hit Rating, 158 Physical Damage |
| Mithril Trident 〔双手〕 | 49 | 3× Mithril Point + 8× Mithril Ingot + 1× Beech Rod | 172 Armor Penetration, 172 Hit Rating, 172 Physical Damage |


## Armorsmithing 铸甲（Zealot）

> 官方 help id=116。制作台见对应 NPC。

### Materials 材料 / 半成品

**Copper 铜**

- `Copper Ingot` ← 4× Copper Ore
- `Copper Wire` ← 1× Copper Ingot
- `Copper Buckle` ← 1× Copper Ingot
- `Copper Plating` ← 2× Copper Ingot
- `Copper Chain` ← 2× Copper Ingot

**Iron 铁**

- `Iron Ingot` ← 5× Iron Ore
- `Iron Wire` ← 1× Iron Ingot
- `Iron Buckle` ← 1× Iron Ingot
- `Iron Plating` ← 2× Iron Ingot
- `Iron Chain` ← 2× Iron Ingot

**Bronze 青铜**

- `Bronze Wire` ← 1× Bronze Ingot
- `Bronze Buckle` ← 1× Bronze Ingot
- `Bronze Plating` ← 2× Bronze Ingot
- `Bronze Chain` ← 2× Bronze Ingot
- `Bronze Ingot` ← 1× Copper Ingot + 4× Tin Ore

**Steel 钢**

- `Steel Ingot` ← 1× Iron Ingot + 5× Lump of Coal
- `Steel Wire` ← 1× Steel Ingot
- `Steel Buckle` ← 1× Steel Ingot
- `Steel Plating` ← 2× Steel Ingot
- `Steel Chain` ← 2× Steel Ingot

**Mithril 秘银**

- `Mithril Ingot` ← 8× Mithril Ore
- `Mithril Wire` ← 1× Mithril Ingot
- `Mithril Buckle` ← 1× Mithril Ingot
- `Mithril Plating` ← 2× Mithril Ingot
- `Mithril Chain` ← 2× Mithril Ingot

### Belts 腰带

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Belt | 1 | 4× Copper Ingot | 2 Fortitude, 2 Life Regeneration, 2 Maximum Life |
| Copper Girdle | 5 | 6× Copper Ingot + 1× Copper Buckle | 8 Fortitude, 8 Life Regeneration, 8 Maximum Life |
| Copper Plated Girdle | 9 | 8× Copper Ingot + 1× Copper Buckle + 1× Copper Plating | 14 Fortitude, 14 Life Regeneration, 14 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Belt | 10 | 4× Iron Ingot | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Iron Girdle | 15 | 6× Iron Ingot + 1× Iron Buckle | 23 Fortitude, 23 Life Regeneration, 23 Maximum Life |
| Iron Plated Girdle | 19 | 10× Iron Ingot + 2× Iron Buckle + 2× Iron Plating | 29 Fortitude, 29 Life Regeneration, 29 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Belt | 20 | 4× Bronze Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Bronze Girdle | 25 | 6× Bronze Ingot + 1× Bronze Buckle | 38 Fortitude, 38 Life Regeneration, 38 Maximum Life |
| Bronze Plated Girdle | 29 | 10× Bronze Ingot + 2× Bronze Buckle + 2× Bronze Plating | 44 Fortitude, 44 Life Regeneration, 44 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Belt | 30 | 4× Steel Ingot | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Steel Girdle | 35 | 6× Steel Ingot + 1× Steel Buckle | 53 Fortitude, 53 Life Regeneration, 53 Maximum Life |
| Steel Plated Girdle | 39 | 10× Steel Ingot + 2× Steel Buckle + 2× Steel Plating | 59 Fortitude, 59 Life Regeneration, 59 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Belt | 40 | 4× Mithril Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Mithril Girdle | 45 | 6× Mithril Ingot + 1× Mithril Buckle | 68 Fortitude, 68 Life Regeneration, 68 Maximum Life |
| Mithril Plated Girdle | 49 | 10× Mithril Ingot + 2× Mithril Buckle + 2× Mithril Plating | 74 Fortitude, 74 Life Regeneration, 74 Maximum Life |

### Boots 靴子

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Boots | 1 | 4× Copper Ingot | 2 Fortitude, 2 Life Regeneration, 2 Maximum Life |
| Copper Greaves | 5 | 6× Copper Ingot + 1× Copper Buckle | 8 Fortitude, 8 Life Regeneration, 8 Maximum Life |
| Copper Plated Greaves | 9 | 8× Copper Ingot + 2× Copper Buckle | 14 Fortitude, 14 Life Regeneration, 14 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Boots | 10 | 4× Iron Ingot | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Iron Greaves | 15 | 6× Iron Ingot + 1× Iron Buckle | 23 Fortitude, 23 Life Regeneration, 23 Maximum Life |
| Iron Plated Greaves | 19 | 8× Iron Ingot + 2× Iron Buckle | 29 Fortitude, 29 Life Regeneration, 29 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Boots | 20 | 4× Bronze Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Bronze Greaves | 25 | 6× Bronze Ingot + 1× Bronze Buckle | 38 Fortitude, 38 Life Regeneration, 38 Maximum Life |
| Bronze Plated Greaves | 29 | 8× Bronze Ingot + 2× Bronze Buckle | 44 Fortitude, 44 Life Regeneration, 44 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Boots | 30 | 4× Steel Ingot | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Steel Greaves | 35 | 6× Steel Ingot + 1× Steel Buckle | 53 Fortitude, 53 Life Regeneration, 53 Maximum Life |
| Steel Plated Greaves | 39 | 8× Steel Ingot + 2× Steel Buckle | 59 Fortitude, 59 Life Regeneration, 59 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Boots | 40 | 4× Mithril Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Mithril Greaves | 45 | 6× Mithril Ingot + 1× Mithril Buckle | 68 Fortitude, 68 Life Regeneration, 68 Maximum Life |
| Mithril Plated Greaves | 49 | 8× Mithril Ingot + 2× Mithril Buckle | 74 Fortitude, 74 Life Regeneration, 74 Maximum Life |

### Gloves 手套

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Gloves | 1 | 4× Copper Ingot | 2 Fortitude, 2 Life Regeneration, 2 Maximum Life |
| Copper Gauntlets | 5 | 6× Copper Ingot + 1× Copper Plating | 8 Fortitude, 8 Life Regeneration, 8 Maximum Life |
| Copper Plated Gauntlets | 9 | 8× Copper Ingot + 2× Copper Plating | 14 Fortitude, 14 Life Regeneration, 14 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Gloves | 10 | 4× Iron Ingot | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Iron Gauntlets | 15 | 6× Iron Ingot + 1× Iron Plating | 23 Fortitude, 23 Life Regeneration, 23 Maximum Life |
| Iron Plated Gauntlets | 19 | 8× Iron Ingot + 2× Iron Plating | 29 Fortitude, 29 Life Regeneration, 29 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Gloves | 20 | 4× Bronze Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Bronze Gauntlets | 25 | 6× Bronze Ingot + 1× Bronze Plating | 38 Fortitude, 38 Life Regeneration, 38 Maximum Life |
| Bronze Plated Gauntlets | 29 | 8× Bronze Ingot + 2× Bronze Plating | 44 Fortitude, 44 Life Regeneration, 44 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Gloves | 30 | 4× Steel Ingot | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Steel Gauntlets | 35 | 6× Steel Ingot + 1× Steel Plating | 53 Fortitude, 53 Life Regeneration, 53 Maximum Life |
| Steel Plated Gauntlets | 39 | 8× Steel Ingot + 2× Steel Plating | 59 Fortitude, 59 Life Regeneration, 59 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Gloves | 40 | 4× Mithril Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Mithril Gauntlets | 45 | 6× Mithril Ingot + 1× Mithril Plating | 68 Fortitude, 68 Life Regeneration, 68 Maximum Life |
| Mithril Plated Gauntlets | 49 | 8× Mithril Ingot + 2× Mithril Plating | 74 Fortitude, 74 Life Regeneration, 74 Maximum Life |

### Helmets 头盔

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Kettle Helmet | 1 | 6× Copper Ingot | 3 Fortitude, 3 Life Regeneration, 3 Maximum Life |
| Copper Barbute | 5 | 6× Copper Ingot + 2× Copper Plating | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Copper Great Helmet | 9 | 8× Copper Ingot + 3× Copper Plating + 1× Copper Buckle | 27 Fortitude, 27 Life Regeneration, 27 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Kettle Helmet | 10 | 6× Iron Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Iron Barbute | 15 | 6× Iron Ingot + 2× Iron Plating | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Iron Great Helmet | 19 | 8× Iron Ingot + 3× Iron Plating + 1× Iron Buckle | 57 Fortitude, 57 Life Regeneration, 57 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Kettle Helmet | 20 | 6× Bronze Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Bronze Barbute | 25 | 6× Bronze Ingot + 2× Bronze Plating | 75 Fortitude, 75 Life Regeneration, 75 Maximum Life |
| Bronze Great Helmet | 29 | 8× Bronze Ingot + 3× Bronze Plating + 1× Bronze Buckle | 87 Fortitude, 87 Life Regeneration, 87 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Kettle Helmet | 30 | 6× Steel Ingot | 90 Fortitude, 90 Life Regeneration, 90 Maximum Life |
| Steel Barbute | 35 | 6× Steel Ingot + 2× Steel Plating | 105 Fortitude, 105 Life Regeneration, 105 Maximum Life |
| Steel Great Helmet | 39 | 8× Steel Ingot + 3× Steel Plating + 1× Steel Buckle | 117 Fortitude, 117 Life Regeneration, 117 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Kettle Helmet | 40 | 6× Mithril Ingot | 120 Fortitude, 120 Life Regeneration, 120 Maximum Life |
| Mithril Barbute | 45 | 6× Mithril Ingot + 2× Mithril Plating | 135 Fortitude, 135 Life Regeneration, 135 Maximum Life |
| Mithril Great Helmet | 49 | 8× Mithril Ingot + 3× Mithril Plating + 1× Mithril Buckle | 147 Fortitude, 147 Life Regeneration, 147 Maximum Life |

### Leggings 护腿

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Leggings | 1 | 6× Copper Ingot | 3 Fortitude, 3 Life Regeneration, 3 Maximum Life |
| Copper Chausses | 5 | 6× Copper Ingot + 2× Copper Plating | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Copper Plated Chausses | 9 | 8× Copper Ingot + 3× Copper Plating + 1× Copper Buckle | 27 Fortitude, 27 Life Regeneration, 27 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Leggings | 10 | 6× Iron Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Iron Chausses | 15 | 6× Iron Ingot + 2× Iron Plating | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Iron Plated Chausses | 19 | 8× Iron Ingot + 3× Iron Plating + 1× Iron Buckle | 57 Fortitude, 57 Life Regeneration, 57 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Leggings | 20 | 6× Bronze Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Bronze Chausses | 25 | 6× Bronze Ingot + 2× Bronze Plating | 75 Fortitude, 75 Life Regeneration, 75 Maximum Life |
| Bronze Plated Chausses | 29 | 8× Bronze Ingot + 3× Bronze Plating + 1× Bronze Buckle | 87 Fortitude, 87 Life Regeneration, 87 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Leggings | 30 | 6× Steel Ingot | 90 Fortitude, 90 Life Regeneration, 90 Maximum Life |
| Steel Chausses | 35 | 6× Steel Ingot + 2× Steel Plating | 105 Fortitude, 105 Life Regeneration, 105 Maximum Life |
| Steel Plated Chausses | 39 | 8× Steel Ingot + 3× Steel Plating + 1× Steel Buckle | 117 Fortitude, 117 Life Regeneration, 117 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Leggings | 40 | 6× Mithril Ingot | 120 Fortitude, 120 Life Regeneration, 120 Maximum Life |
| Mithril Chausses | 45 | 6× Mithril Ingot + 2× Mithril Plating | 135 Fortitude, 135 Life Regeneration, 135 Maximum Life |
| Mithril Plated Chausses | 49 | 8× Mithril Ingot + 3× Mithril Plating + 1× Mithril Buckle | 147 Fortitude, 147 Life Regeneration, 147 Maximum Life |

### Shields 盾牌

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Round Shield | 1 | 6× Copper Ingot | 3 Fortitude, 3 Life Regeneration, 3 Maximum Life |
| Copper Kite Shield | 5 | 6× Copper Ingot + 2× Copper Plating | 15 Fortitude, 15 Life Regeneration, 15 Maximum Life |
| Copper Tower Shield | 9 | 8× Copper Ingot + 4× Copper Plating | 27 Fortitude, 27 Life Regeneration, 27 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Round Shield | 10 | 6× Iron Ingot | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Iron Kite Shield | 15 | 6× Iron Ingot + 2× Iron Plating | 45 Fortitude, 45 Life Regeneration, 45 Maximum Life |
| Iron Tower Shield | 19 | 8× Iron Ingot + 4× Iron Plating | 57 Fortitude, 57 Life Regeneration, 57 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Round Shield | 20 | 6× Bronze Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Bronze Kite Shield | 25 | 6× Bronze Ingot + 2× Bronze Plating | 75 Fortitude, 75 Life Regeneration, 75 Maximum Life |
| Bronze Tower Shield | 29 | 8× Bronze Ingot + 4× Bronze Plating | 87 Fortitude, 87 Life Regeneration, 87 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Round Shield | 30 | 6× Steel Ingot | 90 Fortitude, 90 Life Regeneration, 90 Maximum Life |
| Steel Kite Shield | 35 | 6× Steel Ingot + 2× Steel Plating | 105 Fortitude, 105 Life Regeneration, 105 Maximum Life |
| Steel Tower Shield | 39 | 8× Steel Ingot + 4× Steel Plating | 117 Fortitude, 117 Life Regeneration, 117 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Round Shield | 40 | 6× Mithril Ingot | 120 Fortitude, 120 Life Regeneration, 120 Maximum Life |
| Mithril Kite Shield | 45 | 6× Mithril Ingot + 2× Mithril Plating | 135 Fortitude, 135 Life Regeneration, 135 Maximum Life |
| Mithril Tower Shield | 49 | 8× Mithril Ingot + 4× Mithril Plating | 147 Fortitude, 147 Life Regeneration, 147 Maximum Life |

### Chests 胸甲

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Chainmail | 1 | 8× Copper Ingot | 6 Fortitude, 6 Life Regeneration, 6 Maximum Life |
| Copper Plated Mail | 5 | 10× Copper Ingot + 2× Copper Plating + 1× Copper Buckle | 30 Fortitude, 30 Life Regeneration, 30 Maximum Life |
| Copper Breast Plate | 9 | 16× Copper Ingot + 4× Copper Plating + 2× Copper Buckle | 54 Fortitude, 54 Life Regeneration, 54 Maximum Life |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Chainmail | 10 | 8× Iron Ingot | 60 Fortitude, 60 Life Regeneration, 60 Maximum Life |
| Iron Plated Mail | 15 | 10× Iron Ingot + 2× Iron Plating + 1× Iron Buckle | 90 Fortitude, 90 Life Regeneration, 90 Maximum Life |
| Iron Breast Plate | 19 | 16× Iron Ingot + 4× Iron Plating + 2× Iron Buckle | 114 Fortitude, 114 Life Regeneration, 114 Maximum Life |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Chainmail | 20 | 8× Bronze Ingot | 120 Fortitude, 120 Life Regeneration, 120 Maximum Life |
| Bronze Plated Mail | 25 | 10× Bronze Ingot + 2× Bronze Plating + 1× Bronze Buckle | 150 Fortitude, 150 Life Regeneration, 150 Maximum Life |
| Bronze Breast Plate | 29 | 16× Bronze Ingot + 4× Bronze Plating + 2× Bronze Buckle | 174 Fortitude, 174 Life Regeneration, 174 Maximum Life |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Chainmail | 30 | 8× Steel Ingot | 180 Fortitude, 180 Life Regeneration, 180 Maximum Life |
| Steel Plated Mail | 35 | 10× Steel Ingot + 2× Steel Plating + 1× Steel Buckle | 210 Fortitude, 210 Life Regeneration, 210 Maximum Life |
| Steel Breast Plate | 39 | 16× Steel Ingot + 4× Steel Plating + 2× Steel Buckle | 234 Fortitude, 234 Life Regeneration, 234 Maximum Life |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Chainmail | 40 | 8× Mithril Ingot | 240 Fortitude, 240 Life Regeneration, 240 Maximum Life |
| Mithril Plated Mail | 45 | 10× Mithril Ingot + 2× Mithril Plating + 1× Mithril Buckle | 270 Fortitude, 270 Life Regeneration, 270 Maximum Life |
| Mithril Breast Plate | 49 | 16× Mithril Ingot + 4× Mithril Plating + 2× Mithril Buckle | 294 Fortitude, 294 Life Regeneration, 294 Maximum Life |


## Cooking 烹饪（全职业）

> 官方 help id=117。制作台见对应 NPC。

### Holiday 节日

**Oktoberfest 慕尼黑啤酒节**

- `Norrothbrau` ← ?× (未公布)

**Saint Patrick's Day 圣帕特里克节**

- `Corned Beef` ← ?× (未公布)

**Halloween 万圣节**

- `Blood Soup` ← 5× Anatomical Heart

**Easter 复活节**

- `Chocolate Egg` ← 5× Cacao Bean

**Winterdays 冬幕节**

- `Gingerbread Cookie` ← 5× Cookie Dough

**Valentine 情人节**

- `Love Cupcake` ← 5× Cupcake Mix

### Mucky 污秽(T1)

**Vegetables 蔬菜**

- `Mucky Vegetable Salad` ← 1× Mucky Vegetables
- `Mucky Vegetable Pie` ← 2× Mucky Vegetables
- `Mucky Vegetable Stew` ← 3× Mucky Vegetables

**Fish 鱼**

- `Smoked Minnow` ← 1× Minnow
- `Minnow Sausage` ← 2× Minnow
- `Grilled Minnow Fillets` ← 3× Minnow

**Fruits 水果**

- `Mucky Fruit Skewer` ← 1× Mucky Fruits
- `Mucky Fruit Jam` ← 2× Mucky Fruits
- `Mucky Fruit Salad` ← 3× Mucky Fruits

**Meat 肉**

- `Mucky Meat Stick` ← 1× Mucky Meat
- `Mucky Tart` ← 2× Mucky Meat
- `Mucky Steak` ← 3× Mucky Meat

**Mixed 混合**

- `Mucky Beef Stew` ← 1× Mucky Meat + 3× Sweet Potato
- `Mucky Fish And Chips` ← 2× Minnow + 3× Sweet Potato
- `Mucky Sweet Potato Salad` ← 3× Mucky Fruits + 3× Sweet Potato
- `Mucky Peasant Salad` ← 3× Mucky Vegetables + 3× Sweet Potato

### Scrap 废料(T2)

**Fruits 水果**

- `Scrap Fruit Skewer` ← 2× Scrap Fruits
- `Scrap Fruit Jam` ← 3× Scrap Fruits
- `Scrap Fruit Salad` ← 4× Scrap Fruits

**Meat 肉**

- `Scrap Meat Stick` ← 2× Scrap Meat
- `Scrap Tart` ← 3× Scrap Meat
- `Scrap Steak` ← 4× Scrap Meat

**Mixed 混合**

- `Scrap Beef Stew` ← 2× Scrap Meat + 3× Common Mushroom
- `Scrap Fish And Chips` ← 3× Shrimp + 3× Common Mushroom
- `Scrap Sweet Mushroom Salad` ← 4× Scrap Fruits + 3× Common Mushroom
- `Scrap Peasant Salad` ← 4× Scrap Vegetables + 3× Common Mushroom

**Vegetables 蔬菜**

- `Scrap Vegetable Salad` ← 2× Scrap Vegetables
- `Scrap Vegetable Pie` ← 3× Scrap Vegetables
- `Scrap Vegetable Stew` ← 4× Scrap Vegetables

**Fish 鱼**

- `Smoked Shrimp` ← 2× Shrimp
- `Shrimp Sausage` ← 3× Shrimp
- `Grilled Shrimp Fillets` ← 4× Shrimp

### Low Quality 低品质(T3)

**Fruits 水果**

- `Low Quality Fruit Skewer` ← 3× Low Quality Fruits
- `Low Quality Fruit Jam` ← 4× Low Quality Fruits
- `Low Quality Fruit Salad` ← 5× Low Quality Fruits

**Meat 肉**

- `Low Quality Meat Stick` ← 3× Low Quality Meat
- `Low Quality Tart` ← 4× Low Quality Meat
- `Low Quality Steak` ← 5× Low Quality Meat

**Mixed 混合**

- `Low Quality Beef Stew` ← 3× Low Quality Meat + 3× Beans
- `Low Quality Fish And Chips` ← 4× White Bass + 3× Beans
- `Low Quality Sweet Bean Salad` ← 5× Low Quality Fruits + 3× Beans
- `Low Quality Peasant Salad` ← 5× Low Quality Vegetables + 3× Beans

**Vegetables 蔬菜**

- `Low Quality Vegetable Salad` ← 3× Low Quality Vegetables
- `Low Quality Vegetable Pie` ← 4× Low Quality Vegetables
- `Low Quality Vegetable Stew` ← 5× Low Quality Vegetables

**Fish 鱼**

- `Smoked White Bass` ← 3× White Bass
- `White Bass Sausage` ← 4× White Bass
- `Grilled White Bass Fillets` ← 5× White Bass

### Medium Quality 中品质(T4)

**Fruits 水果**

- `Medium Quality Fruit Skewer` ← 4× Medium Quality Fruits
- `Medium Quality Fruit Jam` ← 5× Medium Quality Fruits
- `Medium Quality Fruit Salad` ← 6× Medium Quality Fruits

**Meat 肉**

- `Medium Quality Meat Stick` ← 4× Medium Quality Meat
- `Medium Quality Tart` ← 5× Medium Quality Meat
- `Medium Quality Steak` ← 6× Medium Quality Meat

**Mixed 混合**

- `Medium Quality Beef Stew` ← 4× Medium Quality Meat + 3× Sugar Beet
- `Medium Quality Fish And Chips` ← 5× Smallmouth Bass + 3× Sugar Beet
- `Medium Quality Sweet Beet Salad` ← 6× Medium Quality Fruits + 3× Sugar Beet
- `Medium Quality Peasant Salad` ← 6× Medium Quality Vegetables + 3× Sugar Beet

**Vegetables 蔬菜**

- `Medium Quality Vegetable Salad` ← 4× Medium Quality Vegetables
- `Medium Quality Vegetable Pie` ← 5× Medium Quality Vegetables
- `Medium Quality Vegetable Stew` ← 6× Medium Quality Vegetables

**Fish 鱼**

- `Smoked Smallmouth Bass` ← 4× Smallmouth Bass
- `Smallmouth Bass Sausage` ← 5× Smallmouth Bass
- `Grilled Smallmouth Bass Fillets` ← 6× Smallmouth Bass

### Quality 高品质(T5)

**Fish 鱼**

- `Smoked Largemouth Bass` ← 5× Largemouth Bass
- `Largemouth Bass Sausage` ← 6× Largemouth Bass
- `Grilled Largemouth Bass Fillets` ← 7× Largemouth Bass

**Fruits 水果**

- `Quality Fruit Skewer` ← 5× Quality Fruits
- `Quality Fruit Jam` ← 6× Quality Fruits
- `Quality Fruit Salad` ← 7× Quality Fruits

**Meat 肉**

- `Quality Meat Stick` ← 5× Quality Meat
- `Quality Tart` ← 6× Quality Meat
- `Quality Steak` ← 7× Quality Meat

**Mixed 混合**

- `Quality Beef Stew` ← 5× Quality Meat + 3× Corn
- `Quality Fish And Chips` ← 6× Largemouth Bass + 3× Corn
- `Quality Sweet Corn Salad` ← 7× Quality Fruits + 3× Corn
- `Quality Peasant Salad` ← 7× Quality Vegetables + 3× Corn

**Vegetables 蔬菜**

- `Quality Vegetable Salad` ← 5× Quality Vegetables
- `Quality Vegetable Pie` ← 6× Quality Vegetables
- `Quality Vegetable Stew` ← 7× Quality Vegetables


## Jeweling 珠宝（Archmage / Zealot）

> 官方 help id=118。制作台见对应 NPC。

### Jewels 宝石（成品）

**Cabochon 蛋面**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Cabochon Jewel | 1 | 1× Cabochon Garnet + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Onyx + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Peridot + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Quartz + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Sapphire + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Sphene + 1× Copper Wire |  |
| Cabochon Jewel | 1 | 1× Cabochon Spinel + 1× Copper Wire |  |

**Round 圆形**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Round Jewel | 10 | 1× Round Garnet + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Onyx + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Peridot + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Quartz + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Sapphire + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Sphene + 1× Iron Wire |  |
| Round Jewel | 10 | 1× Round Spinel + 1× Iron Wire |  |

**Princess 公主方**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Princess Jewel | 20 | 1× Princess Garnet + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Onyx + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Peridot + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Quartz + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Sapphire + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Sphene + 1× Bronze Wire |  |
| Princess Jewel | 20 | 1× Princess Spinel + 1× Bronze Wire |  |

**Emerald 祖母绿**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Emerald Jewel | 30 | 1× Emerald Garnet + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Onyx + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Peridot + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Quartz + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Sapphire + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Sphene + 1× Steel Wire |  |
| Emerald Jewel | 30 | 1× Emerald Spinel + 1× Steel Wire |  |

**Radiant 雷迪恩**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Radiant Jewel | 40 | 1× Radiant Garnet + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Onyx + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Peridot + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Quartz + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Sapphire + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Sphene + 1× Mithril Wire |  |
| Radiant Jewel | 40 | 1× Radiant Spinel + 1× Mithril Wire |  |

### Jewelry 首饰

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Ring | 1 | 4× Copper Wire | 4 Mana |
| Copper Earrings | 1 | 4× Copper Wire | 4 Maximum Life |
| Copper Necklace | 1 | 8× Copper Wire | 4 Fortitude |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Ring | 10 | 4× Iron Wire | 35 Mana |
| Iron Earrings | 10 | 4× Iron Wire | 35 Maximum Life |
| Iron Necklace | 10 | 8× Iron Wire | 35 Fortitude |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Ring | 20 | 4× Bronze Wire | 70 Mana |
| Bronze Earrings | 20 | 4× Bronze Wire | 70 Maximum Life |
| Bronze Necklace | 20 | 8× Bronze Wire | 70 Fortitude |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Ring | 30 | 4× Steel Wire | 105 Mana |
| Steel Earrings | 30 | 4× Steel Wire | 105 Maximum Life |
| Steel Necklace | 30 | 8× Steel Wire | 105 Fortitude |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Ring | 40 | 4× Mithril Wire | 140 Mana |
| Mithril Earrings | 40 | 4× Mithril Wire | 140 Maximum Life |
| Mithril Necklace | 40 | 8× Mithril Wire | 140 Fortitude |

### Gem 宝石（切割）

**Cabochon 蛋面**

- `Cabochon Garnet` ← 3× Rough Garnet
- `Cabochon Onyx` ← 3× Rough Onyx
- `Cabochon Peridot` ← 3× Rough Peridot
- `Cabochon Quartz` ← 3× Rough Quartz
- `Cabochon Sapphire` ← 3× Rough Sapphire
- `Cabochon Sphene` ← 3× Rough Sphene
- `Cabochon Spinel` ← 3× Rough Spinel

**Round 圆形**

- `Round Garnet` ← 3× Cabochon Garnet
- `Round Onyx` ← 3× Cabochon Onyx
- `Round Peridot` ← 3× Cabochon Peridot
- `Round Quartz` ← 3× Cabochon Quartz
- `Round Sapphire` ← 3× Cabochon Sapphire
- `Round Sphene` ← 3× Cabochon Sphene
- `Round Spinel` ← 3× Cabochon Spinel

**Princess 公主方**

- `Princess Garnet` ← 3× Round Garnet
- `Princess Onyx` ← 3× Round Onyx
- `Princess Peridot` ← 3× Round Peridot
- `Princess Quartz` ← 3× Round Quartz
- `Princess Sapphire` ← 3× Round Sapphire
- `Princess Sphene` ← 3× Round Sphene
- `Princess Spinel` ← 3× Round Spinel

**Emerald 祖母绿**

- `Emerald Garnet` ← 3× Princess Garnet
- `Emerald Onyx` ← 3× Princess Onyx
- `Emerald Peridot` ← 3× Princess Peridot
- `Emerald Quartz` ← 3× Princess Quartz
- `Emerald Sapphire` ← 3× Princess Sapphire
- `Emerald Sphene` ← 3× Princess Sphene
- `Emerald Spinel` ← 3× Princess Spinel

**Radiant 雷迪恩**

- `Radiant Garnet` ← 3× Emerald Garnet
- `Radiant Onyx` ← 3× Emerald Onyx
- `Radiant Peridot` ← 3× Emerald Peridot
- `Radiant Quartz` ← 3× Emerald Quartz
- `Radiant Sapphire` ← 3× Emerald Sapphire
- `Radiant Sphene` ← 3× Emerald Sphene
- `Radiant Spinel` ← 3× Emerald Spinel


## Carpentry 木工（Ranger）

> 官方 help id=119。制作台见对应 NPC。

### Materials 材料 / 半成品

**Paper Scrolls 纸卷轴**

- `Mucky Scroll` ← 1× Aspen Log
- `Scrap Scroll` ← 2× Elm Log
- `Low Quality Scroll` ← 3× Spruce Log
- `Medium Quality Scroll` ← 4× Maple Log
- `Quality Scroll` ← 5× Beech Log

**Aspen 白杨**

- `Aspen Rod` ← 4× Aspen Log
- `Aspen Club` ← 4× Aspen Log
- `Aspen Planks` ← 4× Aspen Log
- `Aspen Handle` ← 1× Aspen Rod

**Elm 榆木**

- `Elm Rod` ← 5× Elm Log
- `Elm Club` ← 5× Elm Log
- `Elm Planks` ← 5× Elm Log
- `Elm Handle` ← 1× Elm Rod

**Spruce 云杉**

- `Spruce Rod` ← 6× Spruce Log
- `Spruce Club` ← 6× Spruce Log
- `Spruce Planks` ← 6× Spruce Log
- `Spruce Handle` ← 1× Spruce Rod

**Maple 枫木**

- `Maple Rod` ← 7× Maple Log
- `Maple Club` ← 7× Maple Log
- `Maple Planks` ← 7× Maple Log
- `Maple Handle` ← 1× Maple Rod

**Beech 山毛榉**

- `Beech Rod` ← 8× Beech Log
- `Beech Club` ← 8× Beech Log
- `Beech Planks` ← 8× Beech Log
- `Beech Handle` ← 1× Beech Rod

### Crossbow 弩

**Aspen 白杨**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Aspen Pistol Crossbow 〔双手〕 | 1 | 1× Aspen Rod + 2× Mucky String | 4 Armor Penetration, 4 Critical Strike, 4 Hit Rating |
| Aspen Repeating Crossbow 〔双手〕 | 5 | 2× Aspen Rod + 1× Copper Nails + 3× Mucky String | 18 Armor Penetration, 18 Critical Strike, 18 Hit Rating |
| Aspen Arbalest 〔双手〕 | 9 | 4× Aspen Rod + 1× Copper Nails + 4× Mucky String | 32 Armor Penetration, 32 Critical Strike, 32 Hit Rating |

**Elm 榆木**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Elm Pistol Crossbow 〔双手〕 | 10 | 1× Elm Rod + 2× Scrap String | 35 Armor Penetration, 35 Critical Strike, 35 Hit Rating |
| Elm Repeating Crossbow 〔双手〕 | 15 | 2× Elm Rod + 1× Iron Nails + 3× Scrap String | 53 Armor Penetration, 53 Critical Strike, 53 Hit Rating |
| Elm Arbalest 〔双手〕 | 19 | 4× Elm Rod + 1× Iron Nails + 4× Scrap String | 67 Armor Penetration, 67 Critical Strike, 67 Hit Rating |

**Spruce 云杉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Spruce Pistol Crossbow 〔双手〕 | 20 | 1× Spruce Rod + 2× Low Quality String | 70 Armor Penetration, 70 Critical Strike, 70 Hit Rating |
| Spruce Repeating Crossbow 〔双手〕 | 25 | 2× Spruce Rod + 1× Bronze Nails + 3× Low Quality String | 88 Armor Penetration, 88 Critical Strike, 88 Hit Rating |
| Spruce Arbalest 〔双手〕 | 29 | 4× Spruce Rod + 1× Bronze Nails + 4× Low Quality String | 102 Armor Penetration, 102 Critical Strike, 102 Hit Rating |

**Maple 枫木**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Maple Pistol Crossbow 〔双手〕 | 30 | 1× Maple Rod + 2× Medium Quality String | 105 Armor Penetration, 105 Critical Strike, 105 Hit Rating |
| Maple Repeating Crossbow 〔双手〕 | 35 | 2× Maple Rod + 1× Steel Nails + 3× Medium Quality String | 123 Armor Penetration, 123 Critical Strike, 123 Hit Rating |
| Maple Arbalest 〔双手〕 | 39 | 4× Maple Rod + 1× Steel Nails + 4× Medium Quality String | 137 Armor Penetration, 137 Critical Strike, 137 Hit Rating |

**Beech 山毛榉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Beech Pistol Crossbow 〔双手〕 | 40 | 1× Beech Rod + 2× Quality String | 140 Armor Penetration, 140 Critical Strike, 140 Hit Rating |
| Beech Repeating Crossbow 〔双手〕 | 45 | 2× Beech Rod + 1× Mithril Nails + 3× Quality String | 158 Armor Penetration, 158 Critical Strike, 158 Hit Rating |
| Beech Arbalest 〔双手〕 | 49 | 4× Beech Rod + 1× Mithril Nails + 4× Quality String | 172 Armor Penetration, 172 Critical Strike, 172 Hit Rating |


## Cartography 制图（Archmage / Ranger / Zealot / Rogue）

> 官方 help id=120。制作台见对应 NPC。

### Materials 材料 / 半成品

**Ink 墨水**

- `Aspen Gall Ink` ← 1× Aspen Gall
- `Elm Gall Ink` ← 2× Elm Gall
- `Spruce Gall Ink` ← 3× Spruce Gall
- `Maple Gall Ink` ← 4× Maple Gall
- `Beech Gall Ink` ← 5× Beech Gall

**Fabric Scrolls 布制卷轴**

- `Mucky Scroll` ← 1× Cotton Boll
- `Scrap Scroll` ← 2× Silkworm Cocoon
- `Low Quality Scroll` ← 3× Jute
- `Medium Quality Scroll` ← 4× Nettle
- `Quality Scroll` ← 5× Ramie

**Hide Scrolls 皮制卷轴**

- `Mucky Scroll` ← 1× Mucky Hide
- `Scrap Scroll` ← 2× Scrap Hide
- `Low Quality Scroll` ← 3× Low Quality Hide
- `Medium Quality Scroll` ← 4× Medium Quality Hide
- `Quality Scroll` ← 5× Quality Hide

### Maps 远征地图

**Expedition T1 远征 T1**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Vulcanic Map | 9 | 10× Mucky Scroll + 4× Aspen Gall Ink + 2× Aspen Rod + 1× Cabochon Garnet + 500× Spirit Essence |  |
| Mucky Venom Map | 9 | 10× Mucky Scroll + 4× Aspen Gall Ink + 2× Aspen Rod + 1× Cabochon Peridot + 500× Spirit Essence |  |
| Mucky Arctic Map | 9 | 10× Mucky Scroll + 4× Aspen Gall Ink + 2× Aspen Rod + 1× Cabochon Sapphire + 500× Spirit Essence |  |
| Mucky Static Map | 9 | 10× Mucky Scroll + 4× Aspen Gall Ink + 2× Aspen Rod + 1× Cabochon Sphene + 500× Spirit Essence |  |
| Mucky Arcane Map | 9 | 10× Mucky Scroll + 4× Aspen Gall Ink + 2× Aspen Rod + 1× Cabochon Spinel + 500× Spirit Essence |  |

**Expedition T2 远征 T2**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Vulcanic Map | 19 | 12× Scrap Scroll + 6× Elm Gall Ink + 2× Elm Rod + 1× Round Garnet + 1000× Spirit Essence |  |
| Scrap Venom Map | 19 | 12× Scrap Scroll + 6× Elm Gall Ink + 2× Elm Rod + 1× Round Peridot + 1000× Spirit Essence |  |
| Scrap Arctic Map | 19 | 12× Scrap Scroll + 6× Elm Gall Ink + 2× Elm Rod + 1× Round Sapphire + 1000× Spirit Essence |  |
| Scrap Static Map | 19 | 12× Scrap Scroll + 6× Elm Gall Ink + 2× Elm Rod + 1× Round Sphene + 1000× Spirit Essence |  |
| Scrap Arcane Map | 19 | 12× Scrap Scroll + 6× Elm Gall Ink + 2× Elm Rod + 1× Round Spinel + 1000× Spirit Essence |  |

**Expedition T3 远征 T3**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Vulcanic Map | 29 | 14× Low Quality Scroll + 8× Spruce Gall Ink + 2× Spruce Rod + 1× Princess Garnet + 1500× Spirit Essence |  |
| Low Quality Venom Map | 29 | 14× Low Quality Scroll + 8× Spruce Gall Ink + 2× Spruce Rod + 1× Princess Peridot + 1500× Spirit Essence |  |
| Low Quality Arctic Map | 29 | 14× Low Quality Scroll + 8× Spruce Gall Ink + 2× Spruce Rod + 1× Princess Sapphire + 1500× Spirit Essence |  |
| Low Quality Static Map | 29 | 14× Low Quality Scroll + 8× Spruce Gall Ink + 2× Spruce Rod + 1× Princess Sphene + 1500× Spirit Essence |  |
| Low Quality Arcane Map | 29 | 14× Low Quality Scroll + 8× Spruce Gall Ink + 2× Spruce Rod + 1× Princess Spinel + 1500× Spirit Essence |  |

**Expedition T4 远征 T4**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Vulcanic Map | 39 | 16× Medium Quality Scroll + 10× Maple Gall Ink + 2× Maple Rod + 1× Emerald Garnet + 2000× Spirit Essence |  |
| Medium Quality Venom Map | 39 | 16× Medium Quality Scroll + 10× Maple Gall Ink + 2× Maple Rod + 1× Emerald Peridot + 2000× Spirit Essence |  |
| Medium Quality Arctic Map | 39 | 16× Medium Quality Scroll + 10× Maple Gall Ink + 2× Maple Rod + 1× Emerald Sapphire + 2000× Spirit Essence |  |
| Medium Quality Static Map | 39 | 16× Medium Quality Scroll + 10× Maple Gall Ink + 2× Maple Rod + 1× Emerald Sphene + 2000× Spirit Essence |  |
| Medium Quality Arcane Map | 39 | 16× Medium Quality Scroll + 10× Maple Gall Ink + 2× Maple Rod + 1× Emerald Spinel + 2000× Spirit Essence |  |

**Expedition T5 远征 T5**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Vulcanic Map | 49 | 18× Quality Scroll + 12× Beech Gall Ink + 2× Beech Rod + 1× Radiant Garnet + 2500× Spirit Essence |  |
| Quality Venom Map | 49 | 18× Quality Scroll + 12× Beech Gall Ink + 2× Beech Rod + 1× Radiant Peridot + 2500× Spirit Essence |  |
| Quality Arctic Map | 49 | 18× Quality Scroll + 12× Beech Gall Ink + 2× Beech Rod + 1× Radiant Sapphire + 2500× Spirit Essence |  |
| Quality Static Map | 49 | 18× Quality Scroll + 12× Beech Gall Ink + 2× Beech Rod + 1× Radiant Sphene + 2500× Spirit Essence |  |
| Quality Arcane Map | 49 | 18× Quality Scroll + 12× Beech Gall Ink + 2× Beech Rod + 1× Radiant Spinel + 2500× Spirit Essence |  |

### Scrolls 卷轴

**Blueprints 蓝图**

- `Mucky Blueprint` ← 1× Mucky Scroll + 1× Aspen Gall Ink
- `Scrap Blueprint` ← 1× Scrap Scroll + 1× Elm Gall Ink
- `Low Quality Blueprint` ← 1× Low Quality Scroll + 1× Spruce Gall Ink
- `Medium Quality Blueprint` ← 1× Medium Quality Scroll + 1× Maple Gall Ink
- `Quality Blueprint` ← 1× Quality Scroll + 1× Beech Gall Ink

**Home Scrolls T1 回城卷轴 T1**

- `El Caspar Home Scroll` ← 1× Mucky Scroll + 1× Aspen Gall Ink + 10× Spirit Essence

**Spell Scrolls 法术卷轴**

- `Identification Scroll` ← 1× Mucky Scroll + 1× Aspen Gall Ink + 20× Spirit Essence

**Home Scrolls T2 回城卷轴 T2**

- `Elundi Home Scroll` ← 1× Scrap Scroll + 1× Elm Gall Ink + 20× Spirit Essence
- `Owranbu Home Scroll` ← 1× Scrap Scroll + 1× Elm Gall Ink + 20× Spirit Essence
- `Vileton Home Scroll` ← 1× Scrap Scroll + 1× Elm Gall Ink + 20× Spirit Essence
- `Drouver Home Scroll` ← 1× Scrap Scroll + 1× Elm Gall Ink + 20× Spirit Essence
- `Sanjuo Home Scroll` ← 1× Scrap Scroll + 1× Elm Gall Ink + 20× Spirit Essence

**Home Scrolls T3 回城卷轴 T3**

- `Bungavik Home Scroll` ← 1× Low Quality Scroll + 1× Spruce Gall Ink + 30× Spirit Essence
- `Saurville Home Scroll` ← 1× Low Quality Scroll + 1× Spruce Gall Ink + 30× Spirit Essence
- `Ururg Home Scroll` ← 1× Low Quality Scroll + 1× Spruce Gall Ink + 30× Spirit Essence

**Home Scrolls T4 回城卷轴 T4**

- `Stogow Home Scroll` ← 1× Medium Quality Scroll + 1× Maple Gall Ink + 40× Spirit Essence
- `Trescan Home Scroll` ← 1× Medium Quality Scroll + 1× Maple Gall Ink + 40× Spirit Essence
- `Caeltys Home Scroll` ← 1× Medium Quality Scroll + 1× Maple Gall Ink + 40× Spirit Essence

**Home Scrolls T5 回城卷轴 T5**

- `Galkathos Home Scroll` ← 1× Quality Scroll + 1× Beech Gall Ink + 50× Spirit Essence
- `Nythrendal Home Scroll` ← 1× Quality Scroll + 1× Beech Gall Ink + 50× Spirit Essence


## Stonemasonry 石工（Berserker）

> 官方 help id=121。制作台见对应 NPC。

### Materials 材料 / 半成品

**Slate 板岩**

- `Slate Bricks` ← 2× Refined Slate
- `Refined Slate` ← 4× Slate
- `Slate Floor Tiles` ← 2× Refined Slate
- `Slate Pillars` ← 2× Refined Slate
- `Slate Gravel` ← 4× Slate

**Fieldstone 原石**

- `Refined Fieldstone` ← 5× Fieldstone
- `Fieldstone Bricks` ← 2× Refined Fieldstone
- `Fieldstone Gravel` ← 5× Fieldstone
- `Fieldstone Floor Tiles` ← 2× Refined Fieldstone
- `Fieldstone Pillars` ← 2× Refined Fieldstone

**Soapstone 皂石**

- `Soapstone Bricks` ← 2× Refined Soapstone
- `Refined Soapstone` ← 6× Soapstone
- `Soapstone Floor Tiles` ← 2× Refined Soapstone
- `Soapstone Pillars` ← 2× Refined Soapstone
- `Soapstone Gravel` ← 6× Soapstone

**Sandstone 砂岩**

- `Sandstone Bricks` ← 2× Refined Sandstone
- `Refined Sandstone` ← 7× Sandstone
- `Sandstone Floor Tiles` ← 2× Refined Sandstone
- `Sandstone Pillars` ← 2× Refined Sandstone
- `Sandstone Gravel` ← 7× Sandstone

**Laterite 红土**

- `Refined Laterite` ← 8× Laterite
- `Laterite Bricks` ← 2× Refined Laterite
- `Laterite Gravel` ← 8× Laterite
- `Laterite Floor Tiles` ← 2× Refined Laterite
- `Laterite Pillars` ← 2× Refined Laterite


## Toolsmithing 工具（Rogue）

> 官方 help id=124。制作台见对应 NPC。

### Materials 材料 / 半成品

**Copper 铜**

- `Copper Ingot` ← 4× Copper Ore
- `Copper Wire` ← 1× Copper Ingot

**Iron 铁**

- `Iron Ingot` ← 5× Iron Ore
- `Iron Wire` ← 1× Iron Ingot

**Bronze 青铜**

- `Bronze Wire` ← 1× Bronze Ingot
- `Bronze Ingot` ← 1× Copper Ingot + 4× Tin Ore

**Steel 钢**

- `Steel Ingot` ← 1× Iron Ingot + 5× Lump of Coal
- `Steel Wire` ← 1× Steel Ingot

**Mithril 秘银**

- `Mithril Ingot` ← 8× Mithril Ore
- `Mithril Wire` ← 1× Mithril Ingot

### Tools 工具

**Copper 铜**

- `Copper Lock` ← 1× Copper Ingot + 1× Copper Wire
- `Copper Socketing Hammer` ← 2× Copper Ingot + 1× Aspen Handle + 1× Lucky Charm
- `Empowered Copper Socketing Hammer` ← 1× Unique Copper Socketing Hammer + 1× Relic Upgrade Token (Tier 1)

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Mining Pick | 1 | 1× Copper Ingot + 1× Aspen Rod |  |
| Copper Farmer Hoe | 1 | 1× Copper Ingot + 1× Aspen Rod |  |
| Copper Chopping Axe | 1 | 1× Copper Ingot + 1× Aspen Rod |  |
| Copper Fishing Rod | 1 | 1× Copper Ingot + 1× Aspen Rod |  |

**Iron 铁**

- `Iron Lock` ← 1× Iron Ingot + 1× Iron Wire
- `Iron Socketing Hammer` ← 3× Iron Ingot + 1× Elm Handle + 1× Lucky Charm
- `Empowered Iron Socketing Hammer` ← 1× Unique Iron Socketing Hammer + 1× Relic Upgrade Token (Tier 2)

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Mining Pick | 10 | 2× Iron Ingot + 1× Elm Rod |  |
| Iron Farmer Hoe | 10 | 2× Iron Ingot + 1× Elm Rod |  |
| Iron Chopping Axe | 10 | 2× Iron Ingot + 1× Elm Rod |  |
| Iron Fishing Rod | 10 | 2× Iron Ingot + 1× Elm Rod |  |

**Bronze 青铜**

- `Bronze Lock` ← 1× Bronze Ingot + 1× Bronze Wire
- `Bronze Socketing Hammer` ← 4× Bronze Ingot + 1× Spruce Handle + 1× Lucky Charm
- `Empowered Bronze Socketing Hammer` ← 1× Unique Bronze Socketing Hammer + 1× Relic Upgrade Token (Tier 3)

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Mining Pick | 20 | 2× Bronze Ingot + 1× Spruce Rod |  |
| Bronze Farmer Hoe | 20 | 2× Bronze Ingot + 1× Spruce Rod |  |
| Bronze Chopping Axe | 20 | 2× Bronze Ingot + 1× Spruce Rod |  |
| Bronze Fishing Rod | 20 | 2× Bronze Ingot + 1× Spruce Rod |  |

**Steel 钢**

- `Steel Lock` ← 1× Steel Ingot + 1× Steel Wire
- `Steel Socketing Hammer` ← 5× Steel Ingot + 1× Maple Handle + 1× Lucky Charm
- `Empowered Steel Socketing Hammer` ← 1× Unique Steel Socketing Hammer + 1× Relic Upgrade Token (Tier 4)

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Mining Pick | 30 | 2× Steel Ingot + 1× Maple Rod |  |
| Steel Farmer Hoe | 30 | 2× Steel Ingot + 1× Maple Rod |  |
| Steel Chopping Axe | 30 | 2× Steel Ingot + 1× Maple Rod |  |
| Steel Fishing Rod | 30 | 2× Steel Ingot + 1× Maple Rod |  |

**Mithril 秘银**

- `Mithril Lock` ← 1× Mithril Ingot + 1× Mithril Wire
- `Mithril Socketing Hammer` ← 6× Mithril Ingot + 1× Beech Handle + 1× Lucky Charm
- `Empowered Mithril Socketing Hammer` ← 1× Unique Mithril Socketing Hammer + 1× Relic Upgrade Token (Tier 5)

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Mining Pick | 40 | 2× Mithril Ingot + 1× Beech Rod |  |
| Mithril Farmer Hoe | 40 | 2× Mithril Ingot + 1× Beech Rod |  |
| Mithril Chopping Axe | 40 | 2× Mithril Ingot + 1× Beech Rod |  |
| Mithril Fishing Rod | 40 | 2× Mithril Ingot + 1× Beech Rod |  |

### Throwing 投掷武器

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Throwing Spikes | 1 | 2× Copper Ingot | 4 Evasion, 4 Hit Rating |
| Copper Throwing Knives | 5 | 6× Copper Ingot | 18 Evasion, 18 Hit Rating |
| Copper Throwing Stars | 9 | 10× Copper Ingot | 32 Evasion, 32 Hit Rating |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Throwing Spikes | 10 | 2× Iron Ingot | 35 Evasion, 35 Hit Rating |
| Iron Throwing Knives | 15 | 6× Iron Ingot | 53 Evasion, 53 Hit Rating |
| Iron Throwing Stars | 19 | 10× Iron Ingot | 67 Evasion, 67 Hit Rating |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Throwing Spikes | 20 | 2× Bronze Ingot | 70 Evasion, 70 Hit Rating |
| Bronze Throwing Knives | 25 | 6× Bronze Ingot | 88 Evasion, 88 Hit Rating |
| Bronze Throwing Stars | 29 | 10× Bronze Ingot | 102 Evasion, 102 Hit Rating |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Throwing Spikes | 30 | 2× Steel Ingot | 105 Evasion, 105 Hit Rating |
| Steel Throwing Knives | 35 | 6× Steel Ingot | 123 Evasion, 123 Hit Rating |
| Steel Throwing Stars | 39 | 10× Steel Ingot | 137 Evasion, 137 Hit Rating |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Throwing Spikes | 40 | 2× Mithril Ingot | 140 Evasion, 140 Hit Rating |
| Mithril Throwing Knives | 45 | 6× Mithril Ingot | 158 Evasion, 158 Hit Rating |
| Mithril Throwing Stars | 49 | 10× Mithril Ingot | 172 Evasion, 172 Hit Rating |

### Weapons 武器（拳刃等）

**Copper 铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Copper Sai Forks 〔双手〕 | 1 | 2× Copper Ingot | 4 Attack Speed, 4 Critical Chance, 4 Hit Rating |
| Copper Katars 〔双手〕 | 5 | 6× Copper Ingot | 18 Attack Speed, 18 Critical Chance, 18 Hit Rating |
| Copper Split Chakram 〔双手〕 | 9 | 10× Copper Ingot + 3× Mucky String | 32 Attack Speed, 32 Critical Chance, 32 Hit Rating |

**Iron 铁**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Iron Sai Forks 〔双手〕 | 10 | 2× Iron Ingot | 35 Attack Speed, 35 Critical Chance, 35 Hit Rating |
| Iron Katars 〔双手〕 | 15 | 6× Iron Ingot | 53 Attack Speed, 53 Critical Chance, 53 Hit Rating |
| Iron Split Chakram 〔双手〕 | 19 | 10× Iron Ingot + 3× Scrap String | 67 Attack Speed, 67 Critical Chance, 67 Hit Rating |

**Bronze 青铜**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Bronze Sai Forks 〔双手〕 | 20 | 2× Bronze Ingot | 70 Attack Speed, 70 Critical Chance, 70 Hit Rating |
| Bronze Katars 〔双手〕 | 25 | 6× Bronze Ingot | 88 Attack Speed, 88 Critical Chance, 88 Hit Rating |
| Bronze Split Chakram 〔双手〕 | 29 | 10× Bronze Ingot + 3× Low Quality String | 102 Attack Speed, 102 Critical Chance, 102 Hit Rating |

**Steel 钢**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Steel Sai Forks 〔双手〕 | 30 | 2× Steel Ingot | 105 Attack Speed, 105 Critical Chance, 105 Hit Rating |
| Steel Katars 〔双手〕 | 35 | 6× Steel Ingot | 123 Attack Speed, 123 Critical Chance, 123 Hit Rating |
| Steel Split Chakram 〔双手〕 | 39 | 10× Steel Ingot + 3× Medium Quality String | 137 Attack Speed, 137 Critical Chance, 137 Hit Rating |

**Mithril 秘银**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mithril Sai Forks 〔双手〕 | 40 | 2× Mithril Ingot | 140 Attack Speed, 140 Critical Chance, 140 Hit Rating |
| Mithril Katars 〔双手〕 | 45 | 6× Mithril Ingot | 158 Attack Speed, 158 Critical Chance, 158 Hit Rating |
| Mithril Split Chakram 〔双手〕 | 49 | 10× Mithril Ingot + 3× Quality String | 172 Attack Speed, 172 Critical Chance, 172 Hit Rating |


## Leatherworking 制皮（Berserker / Druid / Ranger / Rogue）

> 官方 help id=125。制作台见对应 NPC。

### Materials 材料 / 半成品

**Mucky 污秽(T1)**

- `Mucky Cleaned Bone` ← 1× Mucky Bone
- `Mucky Sharpened Chitin` ← 1× Mucky Chitin
- `Mucky Goblin Leather` ← 3× Mucky Goblin Hide
- `Mucky Leather` ← 2× Mucky Hide
- `Mucky Leather Shoe Base` ← 1× Mucky Leather
- `Mucky Leather Glove Base` ← 1× Mucky Leather
- `Mucky Leather Helmet Base` ← 2× Mucky Leather
- `Mucky Leather Belt Base` ← 2× Mucky Leather
- `Mucky Leather Leggings Base` ← 3× Mucky Leather
- `Mucky Leather Chest Base` ← 4× Mucky Leather
- `Mucky Cleaned Scale` ← 1× Mucky Scale
- `Mucky Cleaned Wing` ← 1× Mucky Wing

**Scrap 废料(T2)**

- `Scrap Cleaned Bone` ← 1× Scrap Bone
- `Scrap Sharpened Chitin` ← 1× Scrap Chitin
- `Scrap Goblin Leather` ← 3× Scrap Goblin Hide
- `Scrap Leather` ← 2× Scrap Hide
- `Scrap Leather Shoe Base` ← 1× Scrap Leather
- `Scrap Leather Glove Base` ← 1× Scrap Leather
- `Scrap Leather Helmet Base` ← 2× Scrap Leather
- `Scrap Leather Belt Base` ← 2× Scrap Leather
- `Scrap Leather Leggings Base` ← 3× Scrap Leather
- `Scrap Leather Chest Base` ← 4× Scrap Leather
- `Scrap Cleaned Scale` ← 1× Scrap Scale
- `Scrap Cleaned Wing` ← 1× Scrap Wing

**Low Quality 低品质(T3)**

- `Low Quality Cleaned Bone` ← 1× Low Quality Bone
- `Low Quality Sharpened Chitin` ← 1× Low Quality Chitin
- `Low Quality Goblin Leather` ← 3× Low Quality Goblin Hide
- `Low Quality Leather` ← 2× Low Quality Hide
- `Low Quality Leather Shoe Base` ← 1× Low Quality Leather
- `Low Quality Leather Glove Base` ← 1× Low Quality Leather
- `Low Quality Leather Helmet Base` ← 2× Low Quality Leather
- `Low Quality Leather Belt Base` ← 2× Low Quality Leather
- `Low Quality Leather Leggings Base` ← 3× Low Quality Leather
- `Low Quality Leather Chest Base` ← 4× Low Quality Leather
- `Low Quality Cleaned Scale` ← 1× Low Quality Scale
- `Low Quality Cleaned Wing` ← 1× Low Quality Wing

**Medium Quality 中品质(T4)**

- `Medium Quality Cleaned Bone` ← 1× Medium Quality Bone
- `Medium Quality Sharpened Chitin` ← 1× Medium Quality Chitin
- `Medium Quality Goblin Leather` ← 3× Medium Quality Goblin Hide
- `Medium Quality Leather` ← 2× Medium Quality Hide
- `Medium Quality Leather Shoe Base` ← 1× Medium Quality Leather
- `Medium Quality Leather Glove Base` ← 1× Medium Quality Leather
- `Medium Quality Leather Helmet Base` ← 2× Medium Quality Leather
- `Medium Quality Leather Belt Base` ← 2× Medium Quality Leather
- `Medium Quality Leather Leggings Base` ← 3× Medium Quality Leather
- `Medium Quality Leather Chest Base` ← 4× Medium Quality Leather
- `Medium Quality Cleaned Scale` ← 1× Medium Quality Scale
- `Medium Quality Cleaned Wing` ← 1× Medium Quality Wing

**Quality 高品质(T5)**

- `Quality Cleaned Bone` ← 1× Quality Bone
- `Quality Sharpened Chitin` ← 1× Quality Chitin
- `Quality Goblin Leather` ← 3× Quality Goblin Hide
- `Quality Leather` ← 2× Quality Hide
- `Quality Leather Shoe Base` ← 1× Quality Leather
- `Quality Leather Glove Base` ← 1× Quality Leather
- `Quality Leather Helmet Base` ← 2× Quality Leather
- `Quality Leather Belt Base` ← 2× Quality Leather
- `Quality Leather Leggings Base` ← 3× Quality Leather
- `Quality Leather Chest Base` ← 4× Quality Leather
- `Quality Cleaned Scale` ← 1× Quality Scale
- `Quality Cleaned Wing` ← 1× Quality Wing

### Belts 腰带

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Belt | 1 | 1× Mucky Leather Belt Base + 4× Mucky Cleaned Bone | 2 Attack Speed, 2 Defense, 2 Maximum Life |
| Mucky Scaled Leather Belt | 1 | 1× Mucky Leather Belt Base + 4× Mucky Cleaned Scale | 2 Attack Speed, 2 Life Regeneration, 2 Maximum Life |
| Mucky Winged Leather Belt | 1 | 1× Mucky Leather Belt Base + 4× Mucky Cleaned Wing | 2 Attack Speed, 2 Evasion, 2 Maximum Life |
| Mucky Goblin Leather Belt | 1 | 1× Mucky Leather Belt Base + 4× Mucky Goblin Leather | 2 Magic Find, 2 Extra gold finding |
| Mucky Chitin Leather Belt | 1 | 1× Mucky Leather Belt Base + 4× Mucky Sharpened Chitin | 2 Attack Speed, 2 Maximum Life, 2 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Belt | 10 | 1× Scrap Leather Belt Base + 4× Scrap Cleaned Bone | 15 Attack Speed, 15 Defense, 15 Maximum Life |
| Scrap Scaled Leather Belt | 10 | 1× Scrap Leather Belt Base + 4× Scrap Cleaned Scale | 15 Attack Speed, 15 Life Regeneration, 15 Maximum Life |
| Scrap Winged Leather Belt | 10 | 1× Scrap Leather Belt Base + 4× Scrap Cleaned Wing | 15 Attack Speed, 15 Evasion, 15 Maximum Life |
| Scrap Goblin Leather Belt | 10 | 1× Scrap Leather Belt Base + 4× Scrap Goblin Leather | 15 Magic Find, 15 Extra gold finding |
| Scrap Chitin Leather Belt | 10 | 1× Scrap Leather Belt Base + 4× Scrap Sharpened Chitin | 15 Attack Speed, 15 Maximum Life, 15 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Belt | 20 | 1× Low Quality Leather Belt Base + 4× Low Quality Cleaned Bone | 30 Attack Speed, 30 Defense, 30 Maximum Life |
| Low Quality Scaled Leather Belt | 20 | 1× Low Quality Leather Belt Base + 4× Low Quality Cleaned Scale | 30 Attack Speed, 30 Life Regeneration, 30 Maximum Life |
| Low Quality Winged Leather Belt | 20 | 1× Low Quality Leather Belt Base + 4× Low Quality Cleaned Wing | 30 Attack Speed, 30 Evasion, 30 Maximum Life |
| Low Quality Goblin Leather Belt | 20 | 1× Low Quality Leather Belt Base + 4× Low Quality Goblin Leather | 30 Magic Find, 30 Extra gold finding |
| Low Quality Chitin Leather Belt | 20 | 1× Low Quality Leather Belt Base + 4× Low Quality Sharpened Chitin | 30 Attack Speed, 30 Maximum Life, 30 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Belt | 30 | 1× Medium Quality Leather Belt Base + 4× Medium Quality Cleaned Bone | 45 Attack Speed, 45 Defense, 45 Maximum Life |
| Medium Quality Scaled Leather Belt | 30 | 1× Medium Quality Leather Belt Base + 4× Medium Quality Cleaned Scale | 45 Attack Speed, 45 Life Regeneration, 45 Maximum Life |
| Medium Quality Winged Leather Belt | 30 | 1× Medium Quality Leather Belt Base + 4× Medium Quality Cleaned Wing | 45 Attack Speed, 45 Evasion, 45 Maximum Life |
| Medium Quality Goblin Leather Belt | 30 | 1× Medium Quality Leather Belt Base + 4× Medium Quality Goblin Leather | 45 Magic Find, 45 Extra gold finding |
| Medium Quality Chitin Leather Belt | 30 | 1× Medium Quality Leather Belt Base + 4× Medium Quality Sharpened Chitin | 45 Attack Speed, 45 Maximum Life, 45 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Belt | 40 | 1× Quality Leather Belt Base + 4× Quality Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Quality Scaled Leather Belt | 40 | 1× Quality Leather Belt Base + 4× Quality Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Quality Winged Leather Belt | 40 | 1× Quality Leather Belt Base + 4× Quality Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Quality Goblin Leather Belt | 40 | 1× Quality Leather Belt Base + 4× Quality Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Quality Chitin Leather Belt | 40 | 1× Quality Leather Belt Base + 4× Quality Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |

### Shields 盾牌

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Hide Buckler | 1 | 1× Mucky Leather Belt Base + 3× Mucky Leather | 3 Mana Regeneration, 3 Maximum Life, 3 Resilience |
| Mucky Leather Targe | 5 | 1× Mucky Leather Belt Base + 6× Mucky Leather | 15 Mana Regeneration, 15 Maximum Life, 15 Resilience |
| Mucky Skull Defender | 9 | 1× Mucky Leather Belt Base + 6× Mucky Leather + 6× Mucky Cleaned Bone | 27 Mana Regeneration, 27 Maximum Life, 27 Resilience |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Hide Buckler | 10 | 1× Scrap Leather Belt Base + 3× Scrap Leather | 30 Mana Regeneration, 30 Maximum Life, 30 Resilience |
| Scrap Leather Targe | 15 | 1× Scrap Leather Belt Base + 6× Scrap Leather | 45 Mana Regeneration, 45 Maximum Life, 45 Resilience |
| Scrap Skull Defender | 19 | 1× Scrap Leather Belt Base + 6× Scrap Leather + 6× Scrap Cleaned Bone | 57 Mana Regeneration, 57 Maximum Life, 57 Resilience |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Hide Buckler | 20 | 1× Low Quality Leather Belt Base + 3× Low Quality Leather | 60 Mana Regeneration, 60 Maximum Life, 60 Resilience |
| Low Quality Leather Targe | 25 | 1× Low Quality Leather Belt Base + 6× Low Quality Leather | 75 Mana Regeneration, 75 Maximum Life, 75 Resilience |
| Low Quality Skull Defender | 29 | 1× Low Quality Leather Belt Base + 6× Low Quality Leather + 6× Low Quality Cleaned Bone | 87 Mana Regeneration, 87 Maximum Life, 87 Resilience |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Hide Buckler | 30 | 1× Medium Quality Leather Belt Base + 3× Medium Quality Leather | 90 Mana Regeneration, 90 Maximum Life, 90 Resilience |
| Medium Quality Leather Targe | 35 | 1× Medium Quality Leather Belt Base + 6× Medium Quality Leather | 105 Mana Regeneration, 105 Maximum Life, 105 Resilience |
| Medium Quality Skull Defender | 39 | 1× Medium Quality Leather Belt Base + 6× Medium Quality Leather + 6× Medium Quality Bone | 117 Mana Regeneration, 117 Maximum Life, 117 Resilience |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Hide Buckler | 40 | 1× Quality Leather Belt Base + 3× Quality Leather | 120 Mana Regeneration, 120 Maximum Life, 120 Resilience |
| Quality Leather Targe | 45 | 1× Quality Leather Belt Base + 6× Quality Leather | 135 Mana Regeneration, 135 Maximum Life, 135 Resilience |
| Quality Skull Defender | 49 | 1× Quality Leather Belt Base + 6× Quality Leather + 6× Quality Cleaned Bone | 147 Mana Regeneration, 147 Maximum Life, 147 Resilience |

### Chests 胸甲

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Armor | 1 | 1× Mucky Leather Chest Base + 12× Mucky Cleaned Bone | 6 Attack Speed, 6 Defense, 6 Maximum Life |
| Mucky Scaled Leather Armor | 1 | 1× Mucky Leather Chest Base + 12× Mucky Cleaned Scale | 6 Attack Speed, 6 Life Regeneration, 6 Maximum Life |
| Mucky Winged Leather Armor | 1 | 1× Mucky Leather Chest Base + 12× Mucky Cleaned Wing | 6 Attack Speed, 6 Evasion, 6 Maximum Life |
| Mucky Goblin Leather Armor | 1 | 1× Mucky Leather Chest Base + 12× Mucky Goblin Leather | 6 Magic Find, 6 Extra gold finding |
| Mucky Chitin Leather Armor | 1 | 1× Mucky Leather Chest Base + 12× Mucky Sharpened Chitin | 6 Attack Speed, 6 Maximum Life, 6 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Armor | 10 | 1× Scrap Leather Chest Base + 12× Scrap Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Scrap Scaled Leather Armor | 10 | 1× Scrap Leather Chest Base + 12× Scrap Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Scrap Winged Leather Armor | 10 | 1× Scrap Leather Chest Base + 12× Scrap Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Scrap Goblin Leather Armor | 10 | 1× Scrap Leather Chest Base + 12× Scrap Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Scrap Chitin Leather Armor | 10 | 1× Scrap Leather Chest Base + 12× Scrap Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Armor | 20 | 1× Low Quality Leather Chest Base + 12× Low Quality Cleaned Bone | 120 Attack Speed, 120 Defense, 120 Maximum Life |
| Low Quality Scaled Leather Armor | 20 | 1× Low Quality Leather Chest Base + 12× Low Quality Cleaned Scale | 120 Attack Speed, 120 Life Regeneration, 120 Maximum Life |
| Low Quality Winged Leather Armor | 20 | 1× Low Quality Leather Chest Base + 12× Low Quality Cleaned Wing | 120 Attack Speed, 120 Evasion, 120 Maximum Life |
| Low Quality Goblin Leather Armor | 20 | 1× Low Quality Leather Chest Base + 12× Low Quality Goblin Leather | 120 Magic Find, 120 Extra gold finding |
| Low Quality Chitin Leather Armor | 20 | 1× Low Quality Leather Chest Base + 12× Low Quality Sharpened Chitin | 120 Attack Speed, 120 Maximum Life, 120 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Armor | 30 | 1× Medium Quality Leather Chest Base + 12× Medium Quality Cleaned Bone | 180 Attack Speed, 180 Defense, 180 Maximum Life |
| Medium Quality Scaled Leather Armor | 30 | 1× Medium Quality Leather Chest Base + 12× Medium Quality Cleaned Scale | 180 Attack Speed, 180 Life Regeneration, 180 Maximum Life |
| Medium Quality Winged Leather Armor | 30 | 1× Medium Quality Leather Chest Base + 12× Medium Quality Cleaned Wing | 180 Attack Speed, 180 Evasion, 180 Maximum Life |
| Medium Quality Goblin Leather Armor | 30 | 1× Medium Quality Leather Chest Base + 12× Medium Quality Goblin Leather | 180 Magic Find, 180 Extra gold finding |
| Medium Quality Chitin Leather Armor | 30 | 1× Medium Quality Leather Chest Base + 12× Medium Quality Sharpened Chitin | 180 Attack Speed, 180 Maximum Life, 180 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Armor | 40 | 1× Quality Leather Chest Base + 12× Quality Cleaned Bone | 240 Attack Speed, 240 Defense, 240 Maximum Life |
| Quality Scaled Leather Armor | 40 | 1× Quality Leather Chest Base + 12× Quality Cleaned Scale | 240 Attack Speed, 240 Life Regeneration, 240 Maximum Life |
| Quality Winged Leather Armor | 40 | 1× Quality Leather Chest Base + 12× Quality Cleaned Wing | 240 Attack Speed, 240 Evasion, 240 Maximum Life |
| Quality Goblin Leather Armor | 40 | 1× Quality Leather Chest Base + 12× Quality Goblin Leather | 240 Magic Find, 240 Extra gold finding |
| Quality Chitin Leather Armor | 40 | 1× Quality Leather Chest Base + 12× Quality Sharpened Chitin | 240 Attack Speed, 240 Maximum Life, 240 Thorn Damage |

### Gloves 手套

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Gloves | 1 | 2× Mucky Leather Glove Base + 4× Mucky Cleaned Bone | 2 Attack Speed, 2 Defense, 2 Maximum Life |
| Mucky Scaled Leather Gloves | 1 | 2× Mucky Leather Glove Base + 4× Mucky Cleaned Scale | 2 Attack Speed, 2 Life Regeneration, 2 Maximum Life |
| Mucky Winged Leather Gloves | 1 | 2× Mucky Leather Glove Base + 4× Mucky Cleaned Wing | 2 Attack Speed, 2 Evasion, 2 Maximum Life |
| Mucky Goblin Leather Gloves | 1 | 2× Mucky Leather Glove Base + 4× Mucky Goblin Leather | 2 Magic Find, 2 Extra gold finding |
| Mucky Chitin Leather Gloves | 1 | 2× Mucky Leather Glove Base + 4× Mucky Sharpened Chitin | 2 Attack Speed, 2 Maximum Life, 2 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Gloves | 10 | 2× Scrap Leather Glove Base + 4× Scrap Cleaned Bone | 15 Attack Speed, 15 Defense, 15 Maximum Life |
| Scrap Scaled Leather Gloves | 10 | 2× Scrap Leather Glove Base + 4× Scrap Cleaned Scale | 15 Attack Speed, 15 Life Regeneration, 15 Maximum Life |
| Scrap Winged Leather Gloves | 10 | 2× Scrap Leather Glove Base + 4× Scrap Cleaned Wing | 15 Attack Speed, 15 Evasion, 15 Maximum Life |
| Scrap Goblin Leather Gloves | 10 | 2× Scrap Leather Glove Base + 4× Scrap Goblin Leather | 15 Magic Find, 15 Extra gold finding |
| Scrap Chitin Leather Gloves | 10 | 2× Scrap Leather Glove Base + 4× Scrap Sharpened Chitin | 15 Attack Speed, 15 Maximum Life, 15 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Gloves | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Cleaned Bone | 30 Attack Speed, 30 Defense, 30 Maximum Life |
| Low Quality Scaled Leather Gloves | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Cleaned Scale | 30 Attack Speed, 30 Life Regeneration, 30 Maximum Life |
| Low Quality Winged Leather Gloves | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Cleaned Wing | 30 Attack Speed, 30 Evasion, 30 Maximum Life |
| Low Quality Goblin Leather Gloves | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Goblin Leather | 30 Magic Find, 30 Extra gold finding |
| Low Quality Chitin Leather Gloves | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Sharpened Chitin | 30 Attack Speed, 30 Maximum Life, 30 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Gloves | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Cleaned Bone | 45 Attack Speed, 45 Defense, 45 Maximum Life |
| Medium Quality Scaled Leather Gloves | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Cleaned Scale | 45 Attack Speed, 45 Life Regeneration, 45 Maximum Life |
| Medium Quality Winged Leather Gloves | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Cleaned Wing | 45 Attack Speed, 45 Evasion, 45 Maximum Life |
| Medium Quality Goblin Leather Gloves | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Goblin Leather | 45 Magic Find, 45 Extra gold finding |
| Medium Quality Chitin Leather Gloves | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Sharpened Chitin | 45 Attack Speed, 45 Maximum Life, 45 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Gloves | 40 | 2× Quality Leather Glove Base + 4× Quality Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Quality Scaled Leather Gloves | 40 | 2× Quality Leather Glove Base + 4× Quality Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Quality Winged Leather Gloves | 40 | 2× Quality Leather Glove Base + 4× Quality Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Quality Goblin Leather Gloves | 40 | 2× Quality Leather Glove Base + 4× Quality Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Quality Chitin Leather Gloves | 40 | 2× Quality Leather Glove Base + 4× Quality Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |

### Helmets 头盔

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Helmet | 1 | 1× Mucky Leather Helmet Base + 4× Mucky Cleaned Bone | 3 Attack Speed, 3 Defense, 3 Maximum Life |
| Mucky Scaled Leather Helmet | 1 | 1× Mucky Leather Helmet Base + 4× Mucky Cleaned Scale | 3 Attack Speed, 3 Life Regeneration, 3 Maximum Life |
| Mucky Winged Leather Helmet | 1 | 1× Mucky Leather Helmet Base + 4× Mucky Cleaned Wing | 3 Attack Speed, 3 Evasion, 3 Maximum Life |
| Mucky Goblin Leather Helmet | 1 | 1× Mucky Leather Helmet Base + 4× Mucky Goblin Leather | 3 Magic Find, 3 Extra gold finding |
| Mucky Chitin Leather Helmet | 1 | 1× Mucky Leather Helmet Base + 4× Mucky Sharpened Chitin | 3 Attack Speed, 3 Maximum Life, 3 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Helmet | 10 | 1× Scrap Leather Helmet Base + 4× Scrap Cleaned Bone | 30 Attack Speed, 30 Defense, 30 Maximum Life |
| Scrap Scaled Leather Helmet | 10 | 1× Scrap Leather Helmet Base + 4× Scrap Cleaned Scale | 30 Attack Speed, 30 Life Regeneration, 30 Maximum Life |
| Scrap Winged Leather Helmet | 10 | 1× Scrap Leather Helmet Base + 4× Scrap Cleaned Wing | 30 Attack Speed, 30 Evasion, 30 Maximum Life |
| Scrap Goblin Leather Helmet | 10 | 1× Scrap Leather Helmet Base + 4× Scrap Goblin Leather | 30 Magic Find, 30 Extra gold finding |
| Scrap Chitin Leather Helmet | 10 | 1× Scrap Leather Helmet Base + 4× Scrap Sharpened Chitin | 30 Attack Speed, 30 Maximum Life, 30 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Helmet | 20 | 1× Low Quality Leather Helmet Base + 4× Low Quality Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Low Quality Scaled Leather Helmet | 20 | 1× Low Quality Leather Helmet Base + 4× Low Quality Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Low Quality Winged Leather Helmet | 20 | 1× Low Quality Leather Helmet Base + 4× Low Quality Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Low Quality Goblin Leather Helmet | 20 | 1× Low Quality Leather Helmet Base + 4× Low Quality Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Low Quality Chitin Leather Helmet | 20 | 1× Low Quality Leather Helmet Base + 4× Low Quality Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Helmet | 30 | 1× Medium Quality Leather Helmet Base + 4× Medium Quality Cleaned Bone | 90 Attack Speed, 90 Defense, 90 Maximum Life |
| Medium Quality Scaled Leather Helmet | 30 | 1× Medium Quality Leather Helmet Base + 4× Medium Quality Cleaned Scale | 90 Attack Speed, 90 Life Regeneration, 90 Maximum Life |
| Medium Quality Winged Leather Helmet | 30 | 1× Medium Quality Leather Helmet Base + 4× Medium Quality Cleaned Wing | 90 Attack Speed, 90 Evasion, 90 Maximum Life |
| Medium Quality Goblin Leather Helmet | 30 | 1× Medium Quality Leather Helmet Base + 4× Medium Quality Goblin Leather | 90 Magic Find, 90 Extra gold finding |
| Medium Quality Chitin Leather Helmet | 30 | 1× Medium Quality Leather Helmet Base + 4× Medium Quality Sharpened Chitin | 90 Attack Speed, 90 Maximum Life, 90 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Helmet | 40 | 1× Quality Leather Helmet Base + 4× Quality Cleaned Bone | 120 Attack Speed, 120 Defense, 120 Maximum Life |
| Quality Scaled Leather Helmet | 40 | 1× Quality Leather Helmet Base + 4× Quality Cleaned Scale | 120 Attack Speed, 120 Life Regeneration, 120 Maximum Life |
| Quality Winged Leather Helmet | 40 | 1× Quality Leather Helmet Base + 4× Quality Cleaned Wing | 120 Attack Speed, 120 Evasion, 120 Maximum Life |
| Quality Goblin Leather Helmet | 40 | 1× Quality Leather Helmet Base + 4× Quality Goblin Leather | 120 Magic Find, 120 Extra gold finding |
| Quality Chitin Leather Helmet | 40 | 1× Quality Leather Helmet Base + 4× Quality Sharpened Chitin | 120 Attack Speed, 120 Maximum Life, 120 Thorn Damage |

### Leggings 护腿

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Leggings | 1 | 1× Mucky Leather Leggings Base + 8× Mucky Cleaned Bone | 3 Attack Speed, 3 Defense, 3 Maximum Life |
| Mucky Scaled Leather Leggings | 1 | 1× Mucky Leather Leggings Base + 8× Mucky Cleaned Scale | 3 Attack Speed, 3 Life Regeneration, 3 Maximum Life |
| Mucky Winged Leather Leggings | 1 | 1× Mucky Leather Leggings Base + 8× Mucky Cleaned Wing | 3 Attack Speed, 3 Evasion, 3 Maximum Life |
| Mucky Goblin Leather Leggings | 1 | 1× Mucky Leather Leggings Base + 8× Mucky Goblin Leather | 3 Magic Find, 3 Extra gold finding |
| Mucky Chitin Leather Leggings | 1 | 1× Mucky Leather Leggings Base + 8× Mucky Sharpened Chitin | 3 Attack Speed, 3 Maximum Life, 3 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Leggings | 10 | 1× Scrap Leather Leggings Base + 8× Scrap Cleaned Bone | 30 Attack Speed, 30 Defense, 30 Maximum Life |
| Scrap Scaled Leather Leggings | 10 | 1× Scrap Leather Leggings Base + 8× Scrap Cleaned Scale | 30 Attack Speed, 30 Life Regeneration, 30 Maximum Life |
| Scrap Winged Leather Leggings | 10 | 1× Scrap Leather Leggings Base + 8× Scrap Cleaned Wing | 30 Attack Speed, 30 Evasion, 30 Maximum Life |
| Scrap Goblin Leather Leggings | 10 | 1× Scrap Leather Leggings Base + 8× Scrap Goblin Leather | 30 Magic Find, 30 Extra gold finding |
| Scrap Chitin Leather Leggings | 10 | 1× Scrap Leather Leggings Base + 8× Scrap Sharpened Chitin | 30 Attack Speed, 30 Maximum Life, 30 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Leggings | 20 | 1× Low Quality Leather Leggings Base + 8× Low Quality Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Low Quality Scaled Leather Leggings | 20 | 1× Low Quality Leather Leggings Base + 8× Low Quality Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Low Quality Winged Leather Leggings | 20 | 1× Low Quality Leather Leggings Base + 8× Low Quality Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Low Quality Goblin Leather Leggings | 20 | 1× Low Quality Leather Leggings Base + 8× Low Quality Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Low Quality Chitin Leather Leggings | 20 | 1× Low Quality Leather Leggings Base + 8× Low Quality Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Leggings | 30 | 1× Medium Quality Leather Leggings Base + 8× Medium Quality Cleaned Bone | 90 Attack Speed, 90 Defense, 90 Maximum Life |
| Medium Quality Scaled Leather Leggings | 30 | 1× Medium Quality Leather Leggings Base + 8× Medium Quality Cleaned Scale | 90 Attack Speed, 90 Life Regeneration, 90 Maximum Life |
| Medium Quality Winged Leather Leggings | 30 | 1× Medium Quality Leather Leggings Base + 8× Medium Quality Cleaned Wing | 90 Attack Speed, 90 Evasion, 90 Maximum Life |
| Medium Quality Goblin Leather Leggings | 30 | 1× Medium Quality Leather Leggings Base + 8× Medium Quality Goblin Leather | 90 Magic Find, 90 Extra gold finding |
| Medium Quality Chitin Leather Leggings | 30 | 1× Medium Quality Leather Leggings Base + 8× Medium Quality Sharpened Chitin | 90 Attack Speed, 90 Maximum Life, 90 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Leggings | 40 | 1× Quality Leather Leggings Base + 8× Quality Cleaned Bone | 120 Attack Speed, 120 Defense, 120 Maximum Life |
| Quality Scaled Leather Leggings | 40 | 1× Quality Leather Leggings Base + 8× Quality Cleaned Scale | 120 Attack Speed, 120 Life Regeneration, 120 Maximum Life |
| Quality Winged Leather Leggings | 40 | 1× Quality Leather Leggings Base + 8× Quality Cleaned Wing | 120 Attack Speed, 120 Evasion, 120 Maximum Life |
| Quality Goblin Leather Leggings | 40 | 1× Quality Leather Leggings Base + 8× Quality Goblin Leather | 120 Magic Find, 120 Extra gold finding |
| Quality Chitin Leather Leggings | 40 | 1× Quality Leather Leggings Base + 8× Quality Sharpened Chitin | 120 Attack Speed, 120 Maximum Life, 120 Thorn Damage |

### Boots 靴子

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Bone Leather Boots | 1 | 2× Mucky Leather Shoe Base + 4× Mucky Cleaned Bone | 2 Attack Speed, 2 Defense, 2 Maximum Life |
| Mucky Scaled Leather Boots | 1 | 2× Mucky Leather Shoe Base + 4× Mucky Cleaned Scale | 2 Attack Speed, 2 Life Regeneration, 2 Maximum Life |
| Mucky Winged Leather Boots | 1 | 2× Mucky Leather Shoe Base + 4× Mucky Cleaned Wing | 2 Attack Speed, 2 Evasion, 2 Maximum Life |
| Mucky Goblin Leather Boots | 1 | 2× Mucky Leather Shoe Base + 4× Mucky Goblin Leather | 2 Magic Find, 2 Extra gold finding |
| Mucky Chitin Leather Boots | 1 | 2× Mucky Leather Shoe Base + 4× Mucky Sharpened Chitin | 2 Attack Speed, 2 Maximum Life, 2 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Bone Leather Boots | 10 | 2× Scrap Leather Shoe Base + 4× Scrap Cleaned Bone | 15 Attack Speed, 15 Defense, 15 Maximum Life |
| Scrap Scaled Leather Boots | 10 | 2× Scrap Leather Shoe Base + 4× Scrap Cleaned Scale | 15 Attack Speed, 15 Life Regeneration, 15 Maximum Life |
| Scrap Winged Leather Boots | 10 | 2× Scrap Leather Shoe Base + 4× Scrap Cleaned Wing | 15 Attack Speed, 15 Evasion, 15 Maximum Life |
| Scrap Goblin Leather Boots | 10 | 2× Scrap Leather Shoe Base + 4× Scrap Goblin Leather | 15 Magic Find, 15 Extra gold finding |
| Scrap Chitin Leather Boots | 10 | 2× Scrap Leather Shoe Base + 4× Scrap Sharpened Chitin | 15 Attack Speed, 15 Maximum Life, 15 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Bone Leather Boots | 20 | 2× Low Quality Leather Shoe Base + 4× Low Quality Cleaned Bone | 30 Attack Speed, 30 Defense, 30 Maximum Life |
| Low Quality Scaled Leather Boots | 20 | 2× Low Quality Leather Shoe Base + 4× Low Quality Cleaned Scale | 30 Attack Speed, 30 Life Regeneration, 30 Maximum Life |
| Low Quality Winged Leather Boots | 20 | 2× Low Quality Leather Shoe Base + 4× Low Quality Cleaned Wing | 30 Attack Speed, 30 Evasion, 30 Maximum Life |
| Low Quality Goblin Leather Boots | 20 | 2× Low Quality Leather Shoe Base + 4× Low Quality Goblin Leather | 30 Magic Find, 30 Extra gold finding |
| Low Quality Chitin Leather Boots | 20 | 2× Low Quality Leather Shoe Base + 4× Low Quality Sharpened Chitin | 30 Attack Speed, 30 Maximum Life, 30 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Bone Leather Boots | 30 | 2× Medium Quality Leather Shoe Base + 4× Medium Quality Cleaned Bone | 45 Attack Speed, 45 Defense, 45 Maximum Life |
| Medium Quality Scaled Leather Boots | 30 | 2× Medium Quality Leather Shoe Base + 4× Medium Quality Cleaned Scale | 45 Attack Speed, 45 Life Regeneration, 45 Maximum Life |
| Medium Quality Winged Leather Boots | 30 | 2× Medium Quality Leather Shoe Base + 4× Medium Quality Cleaned Wing | 45 Attack Speed, 45 Evasion, 45 Maximum Life |
| Medium Quality Goblin Leather Boots | 30 | 2× Medium Quality Leather Shoe Base + 4× Medium Quality Goblin Leather | 45 Magic Find, 45 Extra gold finding |
| Medium Quality Chitin Leather Boots | 30 | 2× Medium Quality Leather Shoe Base + 4× Medium Quality Sharpened Chitin | 45 Attack Speed, 45 Maximum Life, 45 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Bone Leather Boots | 40 | 2× Quality Leather Shoe Base + 4× Quality Cleaned Bone | 60 Attack Speed, 60 Defense, 60 Maximum Life |
| Quality Scaled Leather Boots | 40 | 2× Quality Leather Shoe Base + 4× Quality Cleaned Scale | 60 Attack Speed, 60 Life Regeneration, 60 Maximum Life |
| Quality Winged Leather Boots | 40 | 2× Quality Leather Shoe Base + 4× Quality Cleaned Wing | 60 Attack Speed, 60 Evasion, 60 Maximum Life |
| Quality Goblin Leather Boots | 40 | 2× Quality Leather Shoe Base + 4× Quality Goblin Leather | 60 Magic Find, 60 Extra gold finding |
| Quality Chitin Leather Boots | 40 | 2× Quality Leather Shoe Base + 4× Quality Sharpened Chitin | 60 Attack Speed, 60 Maximum Life, 60 Thorn Damage |


## Hunting 狩猎（Berserker / Druid / Ranger / Zealot / Rogue）

> 官方 help id=126。制作台见对应 NPC。

### Bow 弓

**Aspen 白杨**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Aspen Short Bow 〔双手〕 | 1 | 1× Aspen Rod + 2× Mucky String | 4 Attack Speed, 4 Critical Chance, 4 Hit Rating |
| Aspen Compound bow 〔双手〕 | 5 | 1× Aspen Rod + 6× Mucky String | 18 Attack Speed, 18 Critical Chance, 18 Hit Rating |
| Aspen Longbow 〔双手〕 | 9 | 1× Aspen Rod + 10× Mucky String | 32 Attack Speed, 32 Critical Chance, 32 Hit Rating |

**Elm 榆木**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Elm Short Bow 〔双手〕 | 10 | 1× Elm Rod + 2× Scrap String | 35 Attack Speed, 35 Critical Chance, 35 Hit Rating |
| Elm Compound bow 〔双手〕 | 15 | 1× Elm Rod + 6× Scrap String | 53 Attack Speed, 53 Critical Chance, 53 Hit Rating |
| Elm Longbow 〔双手〕 | 19 | 1× Elm Rod + 10× Scrap String | 67 Attack Speed, 67 Critical Chance, 67 Hit Rating |

**Spruce 云杉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Spruce Short Bow 〔双手〕 | 20 | 1× Spruce Rod + 2× Low Quality String | 70 Attack Speed, 70 Critical Chance, 70 Hit Rating |
| Spruce Compound bow 〔双手〕 | 25 | 1× Spruce Rod + 6× Low Quality String | 88 Attack Speed, 88 Critical Chance, 88 Hit Rating |
| Spruce Longbow 〔双手〕 | 29 | 1× Spruce Rod + 10× Low Quality String | 102 Attack Speed, 102 Critical Chance, 102 Hit Rating |

**Maple 枫木**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Maple Short Bow 〔双手〕 | 30 | 1× Maple Rod + 2× Medium Quality String | 105 Attack Speed, 105 Critical Chance, 105 Hit Rating |
| Maple Compound bow 〔双手〕 | 35 | 1× Maple Rod + 6× Medium Quality String | 123 Attack Speed, 123 Critical Chance, 123 Hit Rating |
| Maple Longbow 〔双手〕 | 39 | 1× Maple Rod + 10× Medium Quality String | 137 Attack Speed, 137 Critical Chance, 137 Hit Rating |

**Beech 山毛榉**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Beech Short Bow 〔双手〕 | 40 | 1× Beech Rod + 2× Quality String | 140 Attack Speed, 140 Critical Chance, 140 Hit Rating |
| Beech Compound bow 〔双手〕 | 45 | 1× Beech Rod + 6× Quality String | 158 Attack Speed, 158 Critical Chance, 158 Hit Rating |
| Beech Longbow 〔双手〕 | 49 | 1× Beech Rod + 10× Quality String | 172 Attack Speed, 172 Critical Chance, 172 Hit Rating |

### Materials 材料 / 半成品

**Mucky 污秽(T1)**

- `Mucky Sharpened Claw` ← 1× Mucky Claw
- `Mucky Sharpened Fang` ← 1× Mucky Fang
- `Mucky Shaped Goblin Ear` ← 1× Mucky Goblin Ear
- `Mucky Sharpened Hoof` ← 1× Mucky Hoof
- `Mucky Shaped Skull` ← 1× Mucky Skull
- `Mucky String` ← 2× Mucky Tendon
- `Mucky Sharpened Tooth` ← 1× Mucky Tooth

**Scrap 废料(T2)**

- `Scrap Sharpened Claw` ← 1× Scrap Claw
- `Scrap Sharpened Fang` ← 1× Scrap Fang
- `Scrap Shaped Goblin Ear` ← 1× Scrap Goblin Ear
- `Scrap Sharpened Hoof` ← 1× Scrap Hoof
- `Scrap Shaped Skull` ← 1× Scrap Skull
- `Scrap String` ← 2× Scrap Tendon
- `Scrap Sharpened Tooth` ← 1× Scrap Tooth

**Low Quality 低品质(T3)**

- `Low Quality Sharpened Claw` ← 1× Low Quality Claw
- `Low Quality Sharpened Fang` ← 1× Low Quality Fang
- `Low Quality Shaped Goblin Ear` ← 1× Low Quality Goblin Ear
- `Low Quality Sharpened Hoof` ← 1× Low Quality Hoof
- `Low Quality Shaped Skull` ← 1× Low Quality Skull
- `Low Quality String` ← 2× Low Quality Tendon
- `Low Quality Sharpened Tooth` ← 1× Low Quality Tooth

**Medium Quality 中品质(T4)**

- `Medium Quality Sharpened Claw` ← 1× Medium Quality Claw
- `Medium Quality Sharpened Fang` ← 1× Medium Quality Fang
- `Medium Quality Shaped Goblin Ear` ← 1× Medium Quality Goblin Ear
- `Medium Quality Sharpened Hoof` ← 1× Medium Quality Hoof
- `Medium Quality Shaped Skull` ← 1× Medium Quality Skull
- `Medium Quality String` ← 2× Medium Quality Tendon
- `Medium Quality Sharpened Tooth` ← 1× Medium Quality Tooth

**Quality 高品质(T5)**

- `Quality Sharpened Claw` ← 1× Quality Claw
- `Quality Sharpened Fang` ← 1× Quality Fang
- `Quality Shaped Goblin Ear` ← 1× Quality Goblin Ear
- `Quality Sharpened Hoof` ← 1× Quality Hoof
- `Quality Shaped Skull` ← 1× Quality Skull
- `Quality String` ← 2× Quality Tendon
- `Quality Sharpened Tooth` ← 1× Quality Tooth

### Cestus 拳套

**Mucky 污秽(T1)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Thorned Cestus 〔双手〕 | 1 | 2× Mucky Leather Glove Base + 4× Mucky Sharpened Claw | 4 Blunt Damage, 4 Hit Rating, 4 Thorn Damage |
| Mucky Spiked Cestus 〔双手〕 | 5 | 2× Mucky Leather Glove Base + 6× Mucky Sharpened Claw | 18 Blunt Damage, 18 Hit Rating, 18 Thorn Damage |
| Mucky Earthshaker Cestus 〔双手〕 | 9 | 2× Mucky Leather Glove Base + 7× Mucky Sharpened Claw + 1× Mucky Shaped Skull | 32 Blunt Damage, 32 Hit Rating, 32 Thorn Damage |

**Scrap 废料(T2)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Thorned Cestus 〔双手〕 | 10 | 2× Scrap Leather Glove Base + 4× Scrap Sharpened Claw | 35 Blunt Damage, 35 Hit Rating, 35 Thorn Damage |
| Scrap Spiked Cestus 〔双手〕 | 15 | 2× Scrap Leather Glove Base + 6× Scrap Sharpened Claw | 53 Blunt Damage, 53 Hit Rating, 53 Thorn Damage |
| Scrap Earthshaker Cestus 〔双手〕 | 19 | 2× Scrap Leather Glove Base + 7× Scrap Sharpened Claw + 1× Scrap Shaped Skull | 67 Blunt Damage, 67 Hit Rating, 67 Thorn Damage |

**Low Quality 低品质(T3)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Claw Thorned Cestus 〔双手〕 | 20 | 2× Low Quality Leather Glove Base + 4× Low Quality Sharpened Claw | 70 Blunt Damage, 70 Hit Rating, 70 Thorn Damage |
| Low Quality Claw Spiked Cestus 〔双手〕 | 25 | 2× Low Quality Leather Glove Base + 6× Low Quality Sharpened Claw | 88 Blunt Damage, 88 Hit Rating, 88 Thorn Damage |
| Low Quality Claw Earthshaker Cestus 〔双手〕 | 29 | 2× Low Quality Leather Glove Base + 7× Low Quality Sharpened Claw + 1× Low Quality Shaped Skull | 102 Blunt Damage, 102 Hit Rating, 102 Thorn Damage |

**Medium Quality 中品质(T4)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Thorned Cestus 〔双手〕 | 30 | 2× Medium Quality Leather Glove Base + 4× Medium Quality Sharpened Claw | 105 Blunt Damage, 105 Hit Rating, 105 Thorn Damage |
| Medium Quality Spiked Cestus 〔双手〕 | 35 | 2× Medium Quality Leather Glove Base + 6× Medium Quality Sharpened Claw | 123 Blunt Damage, 123 Hit Rating, 123 Thorn Damage |
| Medium Quality Earthshaker Cestus 〔双手〕 | 39 | 2× Medium Quality Leather Glove Base + 7× Medium Quality Sharpened Claw + 1× Medium Quality Shaped Skull | 137 Blunt Damage, 137 Hit Rating, 137 Thorn Damage |

**Quality 高品质(T5)**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Thorned Cestus 〔双手〕 | 40 | 2× Quality Leather Glove Base + 4× Quality Sharpened Claw | 140 Blunt Damage, 140 Hit Rating, 140 Thorn Damage |
| Quality Spiked Cestus 〔双手〕 | 45 | 2× Quality Leather Glove Base + 6× Quality Sharpened Claw | 158 Blunt Damage, 158 Hit Rating, 158 Thorn Damage |
| Quality Earthshaker Cestus 〔双手〕 | 49 | 2× Quality Leather Glove Base + 7× Quality Sharpened Claw + 1× Quality Shaped Skull | 172 Blunt Damage, 172 Hit Rating, 172 Thorn Damage |

### Necklace 项链

**Mucky String 污秽弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Goblin Necklace | 1 | 1× Mucky String + 10× Mucky Shaped Goblin Ear | 4 Magic Find |
| Mucky Skull Necklace | 1 | 1× Mucky String + 10× Mucky Shaped Skull | 4 Fortitude, 4 Life Regeneration |
| Mucky Claw Necklace | 1 | 1× Mucky String + 10× Mucky Sharpened Claw | 4 Attack Speed, 4 Hit Rating |
| Mucky Fang Necklace | 1 | 1× Mucky String + 10× Mucky Sharpened Fang | 4 Armor Penetration, 4 Life Steal |
| Mucky Hoof Necklace | 1 | 1× Mucky String + 10× Mucky Sharpened Hoof | 4 Evasion, 4 Mana |
| Mucky Tooth Necklace | 1 | 1× Mucky String + 10× Mucky Sharpened Tooth | 4 Critical Strike, 4 Mana Steal |

**Scrap String 废料弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Goblin Necklace | 10 | 1× Scrap String + 10× Scrap Shaped Goblin Ear | 35 Magic Find |
| Scrap Skull Necklace | 10 | 1× Scrap String + 10× Scrap Shaped Skull | 35 Fortitude, 35 Life Regeneration |
| Scrap Claw Necklace | 10 | 1× Scrap String + 10× Scrap Sharpened Claw | 35 Attack Speed, 35 Hit Rating |
| Scrap Fang Necklace | 10 | 1× Scrap String + 10× Scrap Sharpened Fang | 35 Armor Penetration, 35 Life Steal |
| Scrap Hoof Necklace | 10 | 1× Scrap String + 10× Scrap Sharpened Hoof | 35 Evasion, 35 Mana |
| Scrap Tooth Necklace | 10 | 1× Scrap String + 10× Scrap Sharpened Tooth | 35 Critical Strike, 35 Mana Steal |

**Low Quality String 低品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Goblin Necklace | 20 | 1× Low Quality String + 10× Low Quality Shaped Goblin Ear | 70 Magic Find |
| Low Quality Skull Necklace | 20 | 1× Low Quality String + 10× Low Quality Shaped Skull | 70 Fortitude, 70 Life Regeneration |
| Low Quality Claw Necklace | 20 | 1× Low Quality String + 10× Low Quality Sharpened Claw | 70 Attack Speed, 70 Hit Rating |
| Low Quality Fang Necklace | 20 | 1× Low Quality String + 10× Low Quality Sharpened Fang | 70 Armor Penetration, 70 Life Steal |
| Low Quality Hoof Necklace | 20 | 1× Low Quality String + 10× Low Quality Sharpened Hoof | 70 Evasion, 70 Mana |
| Low Quality Tooth Necklace | 20 | 1× Low Quality String + 10× Low Quality Sharpened Tooth | 70 Critical Strike, 70 Mana Steal |

**Medium Quality String 中品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Goblin Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Shaped Goblin Ear | 105 Magic Find |
| Medium Quality Skull Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Shaped Skull | 105 Fortitude, 105 Life Regeneration |
| Medium Quality Claw Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Sharpened Claw | 105 Attack Speed, 105 Hit Rating |
| Medium Quality Fang Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Sharpened Fang | 105 Armor Penetration, 105 Life Steal |
| Medium Quality Hoof Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Sharpened Hoof | 105 Evasion, 105 Mana |
| Medium Quality Tooth Necklace | 30 | 1× Medium Quality String + 10× Medium Quality Sharpened Tooth | 105 Critical Strike, 105 Mana Steal |

**Quality String 高品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Goblin Necklace | 40 | 1× Quality String + 10× Quality Shaped Goblin Ear | 140 Magic Find |
| Quality Skull Necklace | 40 | 1× Quality String + 10× Quality Shaped Skull | 140 Fortitude, 140 Life Regeneration |
| Quality Claw Necklace | 40 | 1× Quality String + 10× Quality Sharpened Claw | 140 Attack Speed, 140 Hit Rating |
| Quality Fang Necklace | 40 | 1× Quality String + 10× Quality Sharpened Fang | 140 Armor Penetration, 140 Life Steal |
| Quality Hoof Necklace | 40 | 1× Quality String + 10× Quality Sharpened Hoof | 140 Evasion, 140 Mana |
| Quality Tooth Necklace | 40 | 1× Quality String + 10× Quality Sharpened Tooth | 140 Critical Strike, 140 Mana Steal |

### Earrings 耳环

**Mucky String 污秽弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Goblin Earring | 1 | 1× Mucky String + 4× Mucky Shaped Goblin Ear | 4 Magic Find |
| Mucky Skull Earring | 1 | 1× Mucky String + 4× Mucky Shaped Skull | 4 Fortitude, 4 Life Regeneration |
| Mucky Claw Earring | 1 | 1× Mucky String + 4× Mucky Sharpened Claw | 4 Attack Speed, 4 Hit Rating |
| Mucky Fang Earring | 1 | 1× Mucky String + 4× Mucky Sharpened Fang | 4 Armor Penetration, 4 Life Steal |
| Mucky Hoof Earring | 1 | 1× Mucky String + 4× Mucky Sharpened Hoof | 4 Evasion, 4 Mana |
| Mucky Tooth Earring | 1 | 1× Mucky String + 4× Mucky Sharpened Tooth | 4 Critical Strike, 4 Mana Steal |

**Scrap String 废料弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Goblin Earring | 10 | 1× Scrap String + 4× Scrap Shaped Goblin Ear | 35 Magic Find |
| Scrap Skull Earring | 10 | 1× Scrap String + 4× Scrap Shaped Skull | 35 Fortitude, 35 Life Regeneration |
| Scrap Claw Earring | 10 | 1× Scrap String + 4× Scrap Sharpened Claw | 35 Attack Speed, 35 Hit Rating |
| Scrap Fang Earring | 10 | 1× Scrap String + 4× Scrap Sharpened Fang | 35 Armor Penetration, 35 Life Steal |
| Scrap Hoof Earring | 10 | 1× Scrap String + 4× Scrap Sharpened Hoof | 35 Evasion, 35 Mana |
| Scrap Tooth Earring | 10 | 1× Scrap String + 4× Scrap Sharpened Tooth | 35 Critical Strike, 35 Mana Steal |

**Low Quality String 低品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Goblin Earring | 20 | 1× Low Quality String + 4× Low Quality Shaped Goblin Ear | 70 Magic Find |
| Low Quality Skull Earring | 20 | 1× Low Quality String + 4× Low Quality Shaped Skull | 70 Fortitude, 70 Life Regeneration |
| Low Quality Claw Earring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Claw | 70 Attack Speed, 70 Hit Rating |
| Low Quality Fang Earring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Fang | 70 Armor Penetration, 70 Life Steal |
| Low Quality Hoof Earring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Hoof | 70 Evasion, 70 Mana |
| Low Quality Tooth Earring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Tooth | 70 Critical Strike, 70 Mana Steal |

**Medium Quality String 中品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Goblin Earring | 30 | 1× Medium Quality String + 4× Medium Quality Shaped Goblin Ear | 105 Magic Find |
| Medium Quality Skull Earring | 30 | 1× Medium Quality String + 4× Medium Quality Shaped Skull | 105 Fortitude, 105 Life Regeneration |
| Medium Quality Claw Earring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Claw | 105 Attack Speed, 105 Hit Rating |
| Medium Quality Fang Earring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Fang | 105 Armor Penetration, 105 Life Steal |
| Medium Quality Hoof Earring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Hoof | 105 Evasion, 105 Mana |
| Medium Quality Tooth Earring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Tooth | 105 Critical Strike, 105 Mana Steal |

**Quality String 高品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Goblin Earring | 40 | 1× Quality String + 4× Quality Shaped Goblin Ear | 140 Magic Find |
| Quality Skull Earring | 40 | 1× Quality String + 4× Quality Shaped Skull | 140 Fortitude, 140 Life Regeneration |
| Quality Claw Earring | 40 | 1× Quality String + 4× Quality Sharpened Claw | 140 Attack Speed, 140 Hit Rating |
| Quality Fang Earring | 40 | 1× Quality String + 4× Quality Sharpened Fang | 140 Armor Penetration, 140 Life Steal |
| Quality Hoof Earring | 40 | 1× Quality String + 4× Quality Sharpened Hoof | 140 Evasion, 140 Mana |
| Quality Tooth Earring | 40 | 1× Quality String + 4× Quality Sharpened Tooth | 140 Critical Strike, 140 Mana Steal |

### Rings 戒指

**Mucky String 污秽弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Mucky Goblin Ring | 1 | 1× Mucky String + 4× Mucky Shaped Goblin Ear | 4 Magic Find |
| Mucky Skull Ring | 1 | 1× Mucky String + 4× Mucky Shaped Skull | 4 Fortitude, 4 Life Regeneration |
| Mucky Claw Ring | 1 | 1× Mucky String + 4× Mucky Sharpened Claw | 4 Attack Speed, 4 Hit Rating |
| Mucky Fang Ring | 1 | 1× Mucky String + 4× Mucky Sharpened Fang | 4 Armor Penetration, 4 Life Steal |
| Mucky Hoof Ring | 1 | 1× Mucky String + 4× Mucky Sharpened Hoof | 4 Evasion, 4 Mana |
| Mucky Tooth Ring | 1 | 1× Mucky String + 4× Mucky Sharpened Tooth | 4 Critical Strike, 4 Mana Steal |

**Scrap String 废料弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scrap Goblin Ring | 10 | 1× Scrap String + 4× Scrap Shaped Goblin Ear | 35 Magic Find |
| Scrap Skull Ring | 10 | 1× Scrap String + 4× Scrap Shaped Skull | 35 Fortitude, 35 Life Regeneration |
| Scrap Claw Ring | 10 | 1× Scrap String + 4× Scrap Sharpened Claw | 35 Attack Speed, 35 Hit Rating |
| Scrap Fang Ring | 10 | 1× Scrap String + 4× Scrap Sharpened Fang | 35 Armor Penetration, 35 Life Steal |
| Scrap Hoof Ring | 10 | 1× Scrap String + 4× Scrap Sharpened Hoof | 35 Evasion, 35 Mana |
| Scrap Tooth Ring | 10 | 1× Scrap String + 4× Scrap Sharpened Tooth | 35 Critical Strike, 35 Mana Steal |

**Low Quality String 低品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Low Quality Goblin Ring | 20 | 1× Low Quality String + 4× Low Quality Shaped Goblin Ear | 70 Magic Find |
| Low Quality Skull Ring | 20 | 1× Low Quality String + 4× Low Quality Shaped Skull | 70 Fortitude, 70 Life Regeneration |
| Low Quality Claw Ring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Claw | 70 Attack Speed, 70 Hit Rating |
| Low Quality Fang Ring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Fang | 70 Armor Penetration, 70 Life Steal |
| Low Quality Hoof Ring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Hoof | 70 Evasion, 70 Mana |
| Low Quality Tooth Ring | 20 | 1× Low Quality String + 4× Low Quality Sharpened Tooth | 70 Critical Strike, 70 Mana Steal |

**Medium Quality String 中品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Medium Quality Goblin Ring | 30 | 1× Medium Quality String + 4× Medium Quality Shaped Goblin Ear | 105 Magic Find |
| Medium Quality Skull Ring | 30 | 1× Medium Quality String + 4× Medium Quality Shaped Skull | 105 Fortitude, 105 Life Regeneration |
| Medium Quality Claw Ring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Claw | 105 Attack Speed, 105 Hit Rating |
| Medium Quality Fang Ring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Fang | 105 Armor Penetration, 105 Life Steal |
| Medium Quality Hoof Ring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Hoof | 105 Evasion, 105 Mana |
| Medium Quality Tooth Ring | 30 | 1× Medium Quality String + 4× Medium Quality Sharpened Tooth | 105 Critical Strike, 105 Mana Steal |

**Quality String 高品质弓弦**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Quality Goblin Ring | 40 | 1× Quality String + 4× Quality Shaped Goblin Ear | 140 Magic Find |
| Quality Skull Ring | 40 | 1× Quality String + 4× Quality Shaped Skull | 140 Fortitude, 140 Life Regeneration |
| Quality Claw Ring | 40 | 1× Quality String + 4× Quality Sharpened Claw | 140 Attack Speed, 140 Hit Rating |
| Quality Fang Ring | 40 | 1× Quality String + 4× Quality Sharpened Fang | 140 Armor Penetration, 140 Life Steal |
| Quality Hoof Ring | 40 | 1× Quality String + 4× Quality Sharpened Hoof | 140 Evasion, 140 Mana |
| Quality Tooth Ring | 40 | 1× Quality String + 4× Quality Sharpened Tooth | 140 Critical Strike, 140 Mana Steal |


## Petbreeding 养宠（Druid）

> 官方 help id=132。制作台见对应 NPC。

### Pets 宠物

**Tier 1 阶级 1**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Hare Pet | 1 | 1× Hare Pet Egg + 20× Mucky Pet Food | 4 Hit Rating, 4 Maximum Life, 4 Mana |
| Beaver Pet | 5 | 1× Beaver Pet Egg + 40× Mucky Pet Food | 18 Hit Rating, 18 Maximum Life, 18 Mana |
| Wild Hog Pet | 9 | 1× Wild Hog Pet Egg + 60× Mucky Pet Food | 32 Hit Rating, 32 Maximum Life, 32 Mana |

**Tier 2 阶级 2**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Scorpion Pet | 10 | 1× Scorpion Pet Egg + 80× Scrap Pet Food | 35 Hit Rating, 35 Maximum Life, 35 Mana |
| Myconid Pet | 15 | 1× Myconid Pet Egg + 100× Scrap Pet Food | 53 Hit Rating, 53 Maximum Life, 53 Mana |
| Troll Boar Pet | 19 | 1× Troll Boar Pet Egg + 120× Scrap Pet Food | 67 Hit Rating, 67 Maximum Life, 67 Mana |

**Tier 3 阶级 3**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Blood Queen Pet | 20 | 1× Blood Queen Pet Egg + 140× Low Quality Pet Food | 70 Hit Rating, 70 Maximum Life, 70 Mana |
| Cougar Pet | 25 | 1× Cougar Pet Egg + 160× Low Quality Pet Food | 88 Hit Rating, 88 Maximum Life, 88 Mana |
| Hydra Pet | 29 | 1× Hydra Pet Egg + 180× Low Quality Pet Food | 102 Hit Rating, 102 Maximum Life, 102 Mana |

**Tier 4 阶级 4**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Warg Pet | 30 | 1× Warg Pet Egg + 200× Medium Quality Pet Food | 105 Hit Rating, 105 Maximum Life, 105 Mana |
| Tiger Pet | 35 | 1× Tiger Pet Egg + 220× Medium Quality Pet Food | 123 Hit Rating, 123 Maximum Life, 123 Mana |
| Yak Pet | 39 | 1× Yak Pet Egg + 240× Medium Quality Pet Food | 137 Hit Rating, 137 Maximum Life, 137 Mana |

**Tier 5 阶级 5**

| 成品 | Lv | 材料 | 属性 |
|---|---|---|---|
| Werebat Pet | 40 | 1× Werebat Pet Egg + 260× Quality Pet Food | 140 Hit Rating, 140 Maximum Life, 140 Mana |
| Rust Monster Pet | 45 | 1× Rust Monster Pet Egg + 280× Quality Pet Food | 158 Hit Rating, 158 Maximum Life, 158 Mana |
| Armored Ram Pet | 49 | 1× Armored Ram Pet Egg + 300× Quality Pet Food | 172 Hit Rating, 172 Maximum Life, 172 Mana |

### Materials 材料 / 半成品

**Pet Food Tier 1**

- `Mucky Pet Food` ← 4× Minnow + 1× Red Poppy Seed + 1× Blue Poppy Seed + 3× Spirit Essence
- `Mucky Pet Food` ← 4× Mucky Fruits + 1× Red Poppy Seed + 1× Blue Poppy Seed + 3× Spirit Essence
- `Mucky Pet Food` ← 4× Mucky Meat + 1× Red Poppy Seed + 1× Blue Poppy Seed + 3× Spirit Essence
- `Mucky Pet Food` ← 4× Mucky Vegetables + 1× Red Poppy Seed + 1× Blue Poppy Seed + 3× Spirit Essence

**Pet Food Tier 2**

- `Scrap Pet Food` ← 4× Scrap Fruits + 1× Red Lily Seed + 1× Blue Lily Seed + 6× Spirit Essence
- `Scrap Pet Food` ← 4× Scrap Meat + 1× Red Lily Seed + 1× Blue Lily Seed + 6× Spirit Essence
- `Scrap Pet Food` ← 4× Scrap Vegetables + 1× Red Lily Seed + 1× Blue Lily Seed + 6× Spirit Essence
- `Scrap Pet Food` ← 4× Shrimp + 1× Red Lily Seed + 1× Blue Lily Seed + 6× Spirit Essence

**Pet Food Tier 3**

- `Low Quality Pet Food` ← 4× Low Quality Fruits + 1× Red Bensil Seed + 1× Blue Bensil Seed + 9× Spirit Essence
- `Low Quality Pet Food` ← 4× Low Quality Meat + 1× Red Bensil Seed + 1× Blue Bensil Seed + 9× Spirit Essence
- `Low Quality Pet Food` ← 4× Low Quality Vegetables + 1× Red Bensil Seed + 1× Blue Bensil Seed + 9× Spirit Essence
- `Low Quality Pet Food` ← 4× White Bass + 1× Red Bensil Seed + 1× Blue Bensil Seed + 9× Spirit Essence

**Pet Food Tier 4**

- `Medium Quality Pet Food` ← 4× Medium Quality Fruits + 1× Red Kerria Seed + 1× Blue Kerria Seed + 12× Spirit Essence
- `Medium Quality Pet Food` ← 4× Medium Quality Meat + 1× Red Kerria Seed + 1× Blue Kerria Seed + 12× Spirit Essence
- `Medium Quality Pet Food` ← 4× Medium Quality Vegetables + 1× Red Kerria Seed + 1× Blue Kerria Seed + 12× Spirit Essence
- `Medium Quality Pet Food` ← 4× Smallmouth Bass + 1× Red Kerria Seed + 1× Blue Kerria Seed + 12× Spirit Essence

**Pet Food Tier 5**

- `Quality Pet Food` ← 4× Largemouth Bass + 1× Red Penta Seed + 1× Blue Penta Seed + 15× Spirit Essence
- `Quality Pet Food` ← 4× Quality Fruits + 1× Red Penta Seed + 1× Blue Penta Seed + 15× Spirit Essence
- `Quality Pet Food` ← 4× Quality Meat + 1× Red Penta Seed + 1× Blue Penta Seed + 15× Spirit Essence
- `Quality Pet Food` ← 4× Quality Vegetables + 1× Red Penta Seed + 1× Blue Penta Seed + 15× Spirit Essence

