---
title: "1.0 官方 Wiki 详细变更记录"
description: "逐项对照官方 1.0 Wiki 与本站 EA 资料：专业结构、1418 条配方、图鉴、采集点、公式与页面级改动，并分析每类变动的影响。"
gameVersion: "1.0"
verifiedDate: "2026-10-15"
versionStatus: "mixed"
sources:
  - type: official
    reference: 官方 1.0 Wiki
    url: https://wiki.norroth.com/
    date: "2026-10-15"
---

> 对照基准：**官方 1.0 Wiki**（2026-10-15 抓取，169 页） vs **本站 EA（Legacy）资料**（2026-10-13/14 采集）。
> 差异只说明「官方 1.0 与 EA 不同」，**不代表本站 EA 数据有误**，也不代表 1.0 已在正式服实测。
> 逐条明细（含全部 1154 条配方差异）见仓库 `data/wiki_official_1.0/CHANGELOG-1.0.md`。

## 1. 总览

| 类别 | EA（本站） | 官方 1.0 | 变化 |
|---|---|---|---|
| 帮助 / 说明页面 | 88 | 169 | 新增 85、删除 4、清空 5、内容重写 44 |
| 角色绑定制作专业 | 13 | 10 | **移除 Toolsmithing、Petbreeding** |
| 制作配方 | 1216 | 1418 | 新增 390、移除 358、材料/数量变动 406 |
| 怪物图鉴 | 141 | 132 | 新增 16、移除 25、等级区间变动 30 |
| Boss | 15 | 16 | 新增 1（Drazhul, The Demon Smith） |
| 采集点 | 112 | 141 | 新增 15 |
| 城镇 | 未整理 | 12 | 新增整理 |
| 成就 | 未整理 | 526 | 新增整理 |
| 属性公式 | EA 实测拟合 | 官方完整公式（54 项） | 全部替换 |

## 2. 制作专业与配方

### 2.1 专业结构：13 → 10

| 变化 | 具体内容 |
|---|---|
| **移除 Toolsmithing（工具锻造）** | 帮助页 `124` 整页删除；工具配方**并入 Weaponsmithing**（1.0 铸武含 `Tools` 类 **24 条**：镐 / 斧 / 锄 / 钓竿等） |
| **移除 Petbreeding（养宠）** | 不再是制作专业；孵蛋改为 **Petbreeder NPC**（付费 + 计时，3 槽队列），捕获改为 **Hunting 的陷阱系统** |
| **专业归属改为角色绑定** | 采集 + 烹饪为**账号绑定**（8 项）；10 个制作专业为**角色绑定**，每角色最多 **3 个**（Ironman **6 个**，2026-10-16 官方页已统一） |

**影响分析**

- **工具制作门槛转移**：工具原本是 Rogue 专属（Toolsmithing），1.0 改为 **Berserker 专属（Weaponsmithing）**。Rogue 玩家想自给工具需靠交易 / 公会；反之 Berserker 的工具自给能力大幅提升。
- **Rogue 的制作技能只剩 4 项**（Cartography / Cooking / Hunting / Leatherworking），职业自给矩阵需重排。
- **宠物不再是 Druid 独占产出**：捕获只要 Hunting 等级与陷阱达标，孵蛋是 NPC 服务，因此宠物经济从「职业垄断」变为「服务 + 材料」驱动。
- **3 个角色绑定专业上限**让「一个角色全专业」不再可能，账号内角色分工（谁练铸武、谁练制皮）成为硬约束。

### 2.2 各专业配方数量对照

| 专业 | EA | 1.0 官方 | 差异 |
|---|---|---|---|
| Tailoring 裁缝 | 150 | 157 | 7 |
| Alchemy 炼金 | 75 | 136 | 61 |
| Weaponsmithing 铸武 | 120 | 187 | 67 |
| Armorsmithing 铸甲 | 130 | 151 | 21 |
| Cooking 烹饪 | 86 | 132 | 46 |
| Jeweling 珠宝 | 55 | 151 | 96 |
| Carpentry 木工 | 40 | 49 | 9 |
| Cartography 制图 | 60 | 93 | 33 |
| Stonemasonry 石雕 | 25 | 30 | 5 |
| Toolsmithing 工具 | 75 | 并入铸武 | — |
| Leatherworking 制皮 | 225 | 193 | -32 |
| Hunter 狩猎 | 155 | 139 | -16 |
| Petbreeding 养宠 | 20 | 移除 | — |
| **合计** | **1216** | **1418** | **+202** |

**影响分析**：Jeweling（55 → 151）、Alchemy（75 → 136）、Cartography（60 → 93）、Cooking（86 → 132）增幅最大，说明 1.0 大幅扩充了**宝石 / 药水 / 制图 / 烹饪**的品类；Leatherworking（225 → 193）与 Hunter（155 → 139）反而减少，是**材料链简化**的结果。

### 2.3 新增配方（390）

**Tailoring 裁缝（42）**：Bamboo Fleece、Bamboo Padding、Bamboo Spool、Bamboo Cord、High Quality Scroll、Masterweave Fleece、Bamboo Sandals、Bamboo Boots、Bamboo Brogans、Bamboo Bracers、Bamboo Gloves、Bamboo Manifers、Bamboo Wrap、Bamboo Sash、Bamboo War Cinch、Bamboo Legwraps、Bamboo Breeches、Bamboo Leg Guards、Bamboo Headband、Bamboo Cap、Bamboo Hood、Bamboo Drape、Bamboo Tunic、Bamboo Cloak、Mucky Pouch、Mucky Satchel、Mucky Backpack、Scrap Pouch、Scrap Satchel、Scrap Backpack、Low Quality Pouch、Low Quality Satchel、Low Quality Backpack、Medium Quality Pouch、Medium Quality Satchel、Medium Quality Backpack、Quality Pouch、Quality Satchel、Quality Backpack、High Quality Pouch、High Quality Satchel、High Quality Backpack

**Alchemy 炼金（61）**：Tiny Magic Damage Potion、Tiny Evasion Potion、Tiny Life Steal Potion、Tiny Thorn Damage Salve、Tiny Defense Salve、Tiny Resistance Salve、Tiny Bleed Damage Salve、Small Magic Damage Potion、Small Evasion Potion、Small Life Steal Potion、Small Thorn Damage Salve、Small Defense Salve、Small Resistance Salve、Small Bleed Damage Salve、Medium Magic Damage Potion、Medium Evasion Potion、Medium Life Steal Potion、Medium Thorn Damage Salve、Medium Defense Salve、Medium Resistance Salve、Medium Bleed Damage Salve、Large Magic Damage Potion、Large Evasion Potion、Large Life Steal Potion、Large Thorn Damage Salve、Large Defense Salve、Large Resistance Salve、Large Bleed Damage Salve、Greater Magic Damage Potion、Greater Evasion Potion、Greater Life Steal Potion、Greater Thorn Damage Salve、Greater Defense Salve、Greater Resistance Salve、Greater Bleed Damage Salve、Grand Health Potion、Grand Mana Potion、Grand Rejuvenation Potion、Grand Magic Damage Potion、Grand Attack Speed Potion、Grand Evasion Potion、Grand Life Steal Potion、Grand Thorn Damage Salve、Grand Defense Salve、Grand Resistance Salve、Grand Bleed Damage Salve、Mucky Bone Dust、Scrap Bone Dust、Low Quality Bone Dust、Medium Quality Bone Dust、Quality Bone Dust、Octagon Orb、High Quality Fish Oil、High Quality Bone Dust、Masterbound Core、Ash Novice Wand、Ash Initiate Wand、Ash Grandmaster Wand、Ash Novice Staff、Ash Initiate Staff、Ash Grandmaster Staff

**Weaponsmithing 铸武（32）**：Valentaal Ingot、Valentaal Hilt、Valentaal Blade、Valentaal Point、Valentaal Nails、Valentaal Axe Blade、Mastersteel Ingot、Valentaal Spear、Valentaal Pike、Valentaal Trident、Valentaal Shortsword、Valentaal Scimitar、Valentaal Warblade、Valentaal Berserker Axe、Valentaal Battle Axe、Valentaal Twin-bladed Axe、Valentaal Great Club、Valentaal Heavy Flail、Valentaal Warhammer、Valentaal Shiv Dagger、Valentaal Dirk Dagger、Valentaal Kris Dagger、Valentaal Mining Pick、Valentaal Farmer Hoe、Valentaal Chopping Axe、Valentaal Fishing Rod、Valentaal Sai Forks、Valentaal Katars、Valentaal Split Chakram、Valentaal Throwing Spikes、Valentaal Throwing Knives、Valentaal Throwing Stars

**Armorsmithing 铸甲（25）**：Valentaal Wire、Valentaal Buckle、Valentaal Plating、Masterforged Ingot、Valentaal Boots、Valentaal Greaves、Valentaal Plated Greaves、Valentaal Gloves、Valentaal Gauntlets、Valentaal Plated Gauntl…、Valentaal Belt、Valentaal Girdle、Valentaal Plated Girdle、Valentaal Leggings、Valentaal Chausses、Valentaal Plated Chausses、Valentaal Kettle Helmet、Valentaal Barbute、Valentaal Great Helmet、Valentaal Round Shield、Valentaal Kite Shield、Valentaal Tower Shield、Valentaal Chainmail、Valentaal Plated Mail、Valentaal Breast Plate

**Cooking 烹饪（24）**：Quality Pet Food 、High Quality Meat Stick、High Quality Tart、High Quality Steak、Smoked Northern Pike、Northern Pike Sausage、Grilled Northern Pike Fillets、High Quality Vegetable Salad、High Quality Vegetable Pie、High Quality Vegetable Stew、High Quality Fruit Skewer、High Quality Fruit Jam、High Quality Fruit Salad、High Quality Beef Stew、High Quality Fish And Chips、High Quality Peasant Salad、High Quality Sweet Wheat Salad、High Quality Pet Food、Delver Pie、Growth Meal、Farmer Stew、Sailor Soup、Woodland Skewers、Gravelroot Roast

**Jeweling 珠宝（49）**：Valentaal Socketing Hammer、Mastercrafted Wire、Octagon Sphene、Octagon Spinel、Octagon Sapphire、Octagon Peridot、Octagon Garnet、Octagon Quartz、Octagon Onyx、Octagon Jewel、Copper Studs、Copper Signet、Copper Pendant、Copper Seal、Copper Hoops、Copper Amulet、Iron Studs、Iron Signet、Iron Pendant、Iron Seal、Iron Hoops、Iron Amulet、Bronze Studs、Bronze Signet、Bronze Pendant、Bronze Seal、Bronze Hoops、Bronze Amulet、Steel Studs、Steel Signet、Steel Pendant、Steel Seal、Steel Hoops、Steel Amulet、Mithril Studs、Mithril Signet、Mithril Pendant、Mithril Seal、Mithril Hoops、Mithril Amulet、Valentaal Ring、Valentaal Studs、Valentaal Necklace、Valentaal Signet、Valentaal Earrings、Valentaal Pendant、Valentaal Seal、Valentaal Hoops、Valentaal Amulet

**Carpentry 木工（8）**：Ash Rod、Ash Club、Ash Handle、Ash Planks、Mastergrove Planks、Ash Pistol Crossbow、Ash Repeating Crossbow、Ash Arbalest

**Cartography 制图（27）**：Cotton Tome、Cotton Lexicon、Cotton Grimoire、Silk Tome、Silk Lexicon、Silk Grimoire、Jute Tome、Jute Lexicon、Jute Grimoire、Nettle Tome、Nettle Lexicon、Nettle Grimoire、Ramie Tome、Ramie Lexicon、Ramie Grimoire、Bamboo Tome、Bamboo Lexicon、Bamboo Grimoire、Ash Gall Ink、High Quality Blueprint、Laen Dorei Home Scroll、Medium Quality Vulcanic…、High Quality Arctic Map、High Quality Vulcanic …、High Quality Venom Map、High Quality Arcane Map、High Quality Static Map

**Stonemasonry 石雕（5）**：Refined Travertine、Travertine Bricks、Travertine Floor Tiles、Travertine Gravel、Travertine Pillars

**Leatherworking 制皮（51）**：Mucky Pet Collar、Scrap Pet Collar、Low Quality Pet Collar、Medium Quality Pet Collar、Quality Pet Collar、High Quality Leather、High Quality Leather Shoe Base、High Quality Leather Chest Base、High Quality Leather Helmet Base、High Quality Leather Glove Base、High Quality Leather Belt Base、High Quality Leather Leggings Base、Masterprime Leather、High Quality Pet Collar、Mucky Leather Boots、Scrap Leather Boots、Low Quality Leather Boots、Medium Quality Leather …、Quality Leather Boots、High Quality Leather Bo…、Mucky Leather Gloves、Scrap Leather Gloves、Low Quality Leather Glo…、Quality Leather Gloves、High Quality Leather Gl…、Mucky Leather Belt、Scrap Leather Belt、Low Quality Leather Belt、Quality Leather Belt、High Quality Leather Belt、Mucky Leather Helmet、Scrap Leather Helmet、Low Quality Leather Hel…、Quality Leather Helmet、High Quality Leather He…、Mucky Leather Leggings、Scrap Leather Leggings、Low Quality Leather Leg…、Quality Leather Leggings、High Quality Leather Le…、Mucky Leather Armor、Scrap Leather Armor、Low Quality Leather Armor、Quality Leather Armor、High Quality Leather Ar…、Low Quality Skull Defen…、Medium Quality Hide Buc…、Medium Quality Skull De…、High Quality Hide Buckler、High Quality Leather Ta…、High Quality Skull Defe…

**Hunter 狩猎（66）**：Mucky Shaped Eye、Mucky Cleaned Tail、Snare Loop、Twig Trap、Critter Cage、Biteproof Box、Beast Shackles、Capture Crate、Scrap Shaped Eye、Scrap Cleaned Tail、Low Quality Shaped Eye、Low Quality Cleaned Tail、Medium Quality Shaped Eye、Medium Quality Cleaned Tail、Quality Shaped Eye、Quality Cleaned Tail、High Quality Sharpened Chitin、High Quality Cleaned Bone、High Quality Cleaned Scale、High Quality Cleaned Wing、High Quality Sharpened Claw、High Quality Sharpened Fang、High Quality Sharpened Tooth、High Quality Sharpened Hoof、High Quality Shaped Goblin Ear、High Quality Shaped Skull、High Quality Shaped Eye、High Quality Cleaned Tail、High Quality String、Masterweave String、Low Quality Thorned Ces…、Low Quality Spiked Cestus、Low Quality Earthshaker…、Medium Quality Thorned …、Medium Quality Spiked C…、Medium Quality Earthsha…、Quality Earthshaker Ces…、High Quality Thorned Ce…、High Quality Spiked Ces…、High Quality Earthshake…、Aspen Compound Bow、Elm Compound Bow、Spruce Compound Bow、Maple Compound Bow、Beech Compound Bow、Ash Short Bow、Ash Compound Bow、Ash Longbow、Mucky Fletch Pouch、Mucky Quiver、Mucky Bolt Carrier、Scrap Fletch Pouch、Scrap Quiver、Scrap Bolt Carrier、Low Quality Fletch Pouch、Low Quality Quiver、Low Quality Bolt Carrier、Medium Quality Fletch P…、Medium Quality Quiver、Medium Quality Bolt Car…、Quality Fletch Pouch、Quality Quiver、Quality Bolt Carrier、High Quality Fletch Pouch、High Quality Quiver、High Quality Bolt Carrier

**影响分析**

- **Bamboo（竹）整条阶梯**：T6 新增木材，配套 Bamboo 布甲 / 材料（Fleece / Padding / Spool / Cord）与整套装备，把制作链延长到 T6。
- **背包类（Pouch / Satchel / Backpack）**：Tailoring 与 Leatherworking 各新增 18 条，背包从「商店 / 掉落」变为**可制作**，直接影响负重与采集挂机时长。
- **箭袋 Quivers（Hunter 18 条）**：狩猎新增副手品类。
- **拳刃 Katars（铸武 18 条）**：近战武器新增品类。
- **法书 Tomes（Cartography 18 条）**：法书从 Tailoring 转到 **Cartography**，法师副手的产出职业改变。
- **High Quality Scroll / Masterweave**：制图与裁缝的高阶材料补充。

### 2.4 移除配方（358）

**Tailoring 裁缝（35）**：Cotton Garnet Tome、Cotton Onyx Tome、Cotton Peridot Tome、Cotton Quartz Tome、Cotton Sapphire Tome、Cotton Sphene Tome、Cotton Spinel Tome、Silk Garnet Tome、Silk Onyx Tome、Silk Peridot Tome、Silk Quartz Tome、Silk Sapphire Tome、Silk Sphene Tome、Silk Spinel Tome、Jute Garnet Tome、Jute Onyx Tome、Jute Peridot Tome、Jute Quartz Tome、Jute Sapphire Tome、Jute Sphene Tome、Jute Spinel Tome、Nettle Garnet Tome、Nettle Onyx Tome、Nettle Peridot Tome、Nettle Quartz Tome、Nettle Sapphire Tome、Nettle Sphene Tome、Nettle Spinel Tome、Ramie Garnet Tome、Ramie Onyx Tome、Ramie Peridot Tome、Ramie Quartz Tome、Ramie Sapphire Tome、Ramie Sphene Tome、Ramie Spinel Tome

**Alchemy 炼金（15）**：Tiny Spell Damage Potion、Tiny Armor Penetration Potion、Tiny Critical Strike Potion、Small Spell Damage Potion、Small Armor Penetration Potion、Small Critical Strike Potion、Medium Spell Damage Potion、Medium Armor Penetration Potion、Medium Critical Strike Potion、Large Spell Damage Potion、Large Armor Penetration Potion、Large Critical Strike Potion、Greater Spell Damage Potion、Greater Armor Penetration Potion、Greater Critical Strike Potion

**Weaponsmithing 铸武（15）**：Copper Caduceus、Copper Scepter、Copper Crozier、Iron Caduceus、Iron Scepter、Iron Crozier、Bronze Caduceus、Bronze Scepter、Bronze Crozier、Steel Caduceus、Steel Scepter、Steel Crozier、Mithril Caduceus、Mithril Scepter、Mithril Crozier

**Armorsmithing 铸甲（5）**：Copper Chain、Iron Chain、Bronze Chain、Steel Chain、Mithril Chain

**Cartography 制图（1）**：Medium Quality Vulcanic Map

**Toolsmithing 工具（10）**：Copper Lock、Empowered Copper Socketing Hammer、Iron Lock、Empowered Iron Socketing Hammer、Bronze Lock、Empowered Bronze Socketing Hammer、Steel Lock、Empowered Steel Socketing Hammer、Mithril Lock、Empowered Mithril Socketing Hammer

**Leatherworking 制皮（159）**：Mucky Goblin Leather、Scrap Goblin Leather、Low Quality Goblin Leather、Medium Quality Goblin Leather、Quality Goblin Leather、Mucky Bone Leather Belt、Mucky Scaled Leather Belt、Mucky Winged Leather Belt、Mucky Goblin Leather Belt、Mucky Chitin Leather Belt、Scrap Bone Leather Belt、Scrap Scaled Leather Belt、Scrap Winged Leather Belt、Scrap Goblin Leather Belt、Scrap Chitin Leather Belt、Low Quality Bone Leather Belt、Low Quality Scaled Leather Belt、Low Quality Winged Leather Belt、Low Quality Goblin Leather Belt、Low Quality Chitin Leather Belt、Medium Quality Bone Leather Belt、Medium Quality Scaled Leather Belt、Medium Quality Winged Leather Belt、Medium Quality Goblin Leather Belt、Medium Quality Chitin Leather Belt、Quality Bone Leather Belt、Quality Scaled Leather Belt、Quality Winged Leather Belt、Quality Goblin Leather Belt、Quality Chitin Leather Belt、Low Quality Skull Defender、Medium Quality Hide Buckler、Medium Quality Leather Targe、Medium Quality Skull Defender、Mucky Bone Leather Armor、Mucky Scaled Leather Armor、Mucky Winged Leather Armor、Mucky Goblin Leather Armor、Mucky Chitin Leather Armor、Scrap Bone Leather Armor、Scrap Scaled Leather Armor、Scrap Winged Leather Armor、Scrap Goblin Leather Armor、Scrap Chitin Leather Armor、Low Quality Bone Leather Armor、Low Quality Scaled Leather Armor、Low Quality Winged Leather Armor、Low Quality Goblin Leather Armor、Low Quality Chitin Leather Armor、Medium Quality Bone Leather Armor、Medium Quality Scaled Leather Armor、Medium Quality Winged Leather Armor、Medium Quality Goblin Leather Armor、Medium Quality Chitin Leather Armor、Quality Bone Leather Armor、Quality Scaled Leather Armor、Quality Winged Leather Armor、Quality Goblin Leather Armor、Quality Chitin Leather Armor、Mucky Bone Leather Gloves、Mucky Scaled Leather Gloves、Mucky Winged Leather Gloves、Mucky Goblin Leather Gloves、Mucky Chitin Leather Gloves、Scrap Bone Leather Gloves、Scrap Scaled Leather Gloves、Scrap Winged Leather Gloves、Scrap Goblin Leather Gloves、Scrap Chitin Leather Gloves、Low Quality Bone Leather Gloves、Low Quality Scaled Leather Gloves、Low Quality Winged Leather Gloves、Low Quality Goblin Leather Gloves、Low Quality Chitin Leather Gloves、Medium Quality Bone Leather Gloves、Medium Quality Scaled Leather Gloves、Medium Quality Winged Leather Gloves、Medium Quality Goblin Leather Gloves、Medium Quality Chitin Leather Gloves、Quality Bone Leather Gloves、Quality Scaled Leather Gloves、Quality Winged Leather Gloves、Quality Goblin Leather Gloves、Quality Chitin Leather Gloves、Mucky Bone Leather Helmet、Mucky Scaled Leather Helmet、Mucky Winged Leather Helmet、Mucky Goblin Leather Helmet、Mucky Chitin Leather Helmet、Scrap Bone Leather Helmet、Scrap Scaled Leather Helmet、Scrap Winged Leather Helmet、Scrap Goblin Leather Helmet、Scrap Chitin Leather Helmet、Low Quality Bone Leather Helmet、Low Quality Scaled Leather Helmet、Low Quality Winged Leather Helmet、Low Quality Goblin Leather Helmet、Low Quality Chitin Leather Helmet、Medium Quality Bone Leather Helmet、Medium Quality Scaled Leather Helmet、Medium Quality Winged Leather Helmet、Medium Quality Goblin Leather Helmet、Medium Quality Chitin Leather Helmet、Quality Bone Leather Helmet、Quality Scaled Leather Helmet、Quality Winged Leather Helmet、Quality Goblin Leather Helmet、Quality Chitin Leather Helmet、Mucky Bone Leather Leggings、Mucky Scaled Leather Leggings、Mucky Winged Leather Leggings、Mucky Goblin Leather Leggings、Mucky Chitin Leather Leggings、Scrap Bone Leather Leggings、Scrap Scaled Leather Leggings、Scrap Winged Leather Leggings、Scrap Goblin Leather Leggings、Scrap Chitin Leather Leggings、Low Quality Bone Leather Leggings、Low Quality Scaled Leather Leggings、Low Quality Winged Leather Leggings、Low Quality Goblin Leather Leggings、Low Quality Chitin Leather Leggings、Medium Quality Bone Leather Leggings、Medium Quality Scaled Leather Leggings、Medium Quality Winged Leather Leggings、Medium Quality Goblin Leather Leggings、Medium Quality Chitin Leather Leggings、Quality Bone Leather Leggings、Quality Scaled Leather Leggings、Quality Winged Leather Leggings、Quality Goblin Leather Leggings、Quality Chitin Leather Leggings、Mucky Bone Leather Boots、Mucky Scaled Leather Boots、Mucky Winged Leather Boots、Mucky Goblin Leather Boots、Mucky Chitin Leather Boots、Scrap Bone Leather Boots、Scrap Scaled Leather Boots、Scrap Winged Leather Boots、Scrap Goblin Leather Boots、Scrap Chitin Leather Boots、Low Quality Bone Leather Boots、Low Quality Scaled Leather Boots、Low Quality Winged Leather Boots、Low Quality Goblin Leather Boots、Low Quality Chitin Leather Boots、Medium Quality Bone Leather Boots、Medium Quality Scaled Leather Boots、Medium Quality Winged Leather Boots、Medium Quality Goblin Leather Boots、Medium Quality Chitin Leather Boots、Quality Bone Leather Boots、Quality Scaled Leather Boots、Quality Winged Leather Boots、Quality Goblin Leather Boots、Quality Chitin Leather Boots

**Hunter 狩猎（102）**：Aspen Compound bow、Elm Compound bow、Spruce Compound bow、Maple Compound bow、Beech Compound bow、Low Quality Claw Thorned Cestus、Low Quality Claw Spiked Cestus、Low Quality Claw Earthshaker Cestus、Medium Quality Thorned Cestus、Medium Quality Spiked Cestus、Medium Quality Earthshaker Cestus、Quality Earthshaker Cestus、Mucky Goblin Necklace、Mucky Skull Necklace、Mucky Claw Necklace、Mucky Fang Necklace、Mucky Hoof Necklace、Mucky Tooth Necklace、Scrap Goblin Necklace、Scrap Skull Necklace、Scrap Claw Necklace、Scrap Fang Necklace、Scrap Hoof Necklace、Scrap Tooth Necklace、Low Quality Goblin Necklace、Low Quality Skull Necklace、Low Quality Claw Necklace、Low Quality Fang Necklace、Low Quality Hoof Necklace、Low Quality Tooth Necklace、Medium Quality Goblin Necklace、Medium Quality Skull Necklace、Medium Quality Claw Necklace、Medium Quality Fang Necklace、Medium Quality Hoof Necklace、Medium Quality Tooth Necklace、Quality Goblin Necklace、Quality Skull Necklace、Quality Claw Necklace、Quality Fang Necklace、Quality Hoof Necklace、Quality Tooth Necklace、Mucky Goblin Earring、Mucky Skull Earring、Mucky Claw Earring、Mucky Fang Earring、Mucky Hoof Earring、Mucky Tooth Earring、Scrap Goblin Earring、Scrap Skull Earring、Scrap Claw Earring、Scrap Fang Earring、Scrap Hoof Earring、Scrap Tooth Earring、Low Quality Goblin Earring、Low Quality Skull Earring、Low Quality Claw Earring、Low Quality Fang Earring、Low Quality Hoof Earring、Low Quality Tooth Earring、Medium Quality Goblin Earring、Medium Quality Skull Earring、Medium Quality Claw Earring、Medium Quality Fang Earring、Medium Quality Hoof Earring、Medium Quality Tooth Earring、Quality Goblin Earring、Quality Skull Earring、Quality Claw Earring、Quality Fang Earring、Quality Hoof Earring、Quality Tooth Earring、Mucky Goblin Ring、Mucky Skull Ring、Mucky Claw Ring、Mucky Fang Ring、Mucky Hoof Ring、Mucky Tooth Ring、Scrap Goblin Ring、Scrap Skull Ring、Scrap Claw Ring、Scrap Fang Ring、Scrap Hoof Ring、Scrap Tooth Ring、Low Quality Goblin Ring、Low Quality Skull Ring、Low Quality Claw Ring、Low Quality Fang Ring、Low Quality Hoof Ring、Low Quality Tooth Ring、Medium Quality Goblin Ring、Medium Quality Skull Ring、Medium Quality Claw Ring、Medium Quality Fang Ring、Medium Quality Hoof Ring、Medium Quality Tooth Ring、Quality Goblin Ring、Quality Skull Ring、Quality Claw Ring、Quality Fang Ring、Quality Hoof Ring、Quality Tooth Ring

**Petbreeding 养宠（16）**：Hare Pet、Beaver Pet、Wild Hog Pet、Scorpion Pet、Myconid Pet、Troll Boar Pet、Blood Queen Pet、Cougar Pet、Hydra Pet、Warg Pet、Tiger Pet、Yak Pet、Werebat Pet、Rust Monster Pet、Armored Ram Pet、Quality Pet Food

**影响分析**

- **Goblin Leather（哥布林皮革）系列 159 条**（Leatherworking）：整套哥布林皮革材料与装备下线，制皮材料链大幅收缩。
- **Compound bow（复合弓）与 Cestus 系列 102 条**（Hunter）：狩猎的远程与拳套线重构，旧配方对应的装备在 1.0 不再是可制作项。
- **Toolsmithing 全部 10 条**：随专业移除（工具转入铸武）。
- **Petbreeding 全部 16 条**：宠物不再是制作产物。
- **Caduceus / Scepter / Crozier 15 条**（铸武）、**Chain 5 条**（铸甲）、**Tome 35 条**（裁缝）：部分装备类型下线或转移。
- **Alchemy 15 条**（Spell Damage / Armor Penetration / Critical Strike 药水）：部分药水效果类型取消。
- **Cartography 1 条**（Medium Quality Vulcanic Map）。

> 影响：依赖这些配方升级的玩家需要**改换升级路线**；以哥布林皮革 / 复合弓为核心的配装思路在 1.0 不再成立。

### 2.5 材料与数量调整（406）

按变动性质分类：

| 变动性质 | 条数 | 说明 |
|---|---|---|
| 仅数量调整 | 366 | 材料种类不变，只改数量 |
| 仅移除材料 | 5 | 去掉了某个输入材料 |
| 材料增减混合 | 35 | 同时有增有减（含命名差异） |

出现频率最高的具体变动：

| 变动 | 涉及配方数 |
|---|---|
| Spirit Essence 20→1 | 5 |
| Aspen Gall Ink 4→10 | 5 |
| Aspen Rod 2→10 | 5 |
| Spirit Essence 500→10 | 5 |
| Elm Gall Ink 6→12 | 5 |
| Elm Rod 2→12 | 5 |
| Spirit Essence 1000→12 | 5 |
| Spirit Essence 1500→14 | 5 |
| Spruce Gall Ink 8→14 | 5 |
| Spruce Rod 2→14 | 5 |
| Beech Gall Ink 12→18 | 5 |
| Beech Rod 2→18 | 5 |
| Spirit Essence 2500→18 | 5 |
| 移除 Red Poppy Seed | 4 |
| 新增 Red Poppy Seeds | 4 |
| 移除 Blue Poppy Seed | 4 |
| 新增 Blue Poppy Seeds | 4 |
| 移除 Red Lily Seed | 4 |
| 新增 Red Lily Seeds | 4 |
| 移除 Blue Lily Seed | 4 |
| 新增 Blue Lily Seeds | 4 |
| 移除 Red Bensil Seed | 4 |
| 新增 Red Bensil Seeds | 4 |
| 移除 Blue Bensil Seed | 4 |

**影响分析**

- **Spirit Essence 大幅下调**：Home Scroll `20 → 1`；远征地图 `500 / 1000 / 1500 / 2500 → 10 / 12 / 14 / 18`。**传送与远征的材料成本显著降低**，配合 Waygate（`Tier² × 50` Spirit Essence）意味着 Spirit Essence 从稀缺资源变为常规消耗品。
- **武器锭用量下调**：多款金属武器 `6x / 12x 锭 → 1x 锭`，**武器制作成本大幅下降**，金属武器更容易量产。
- **布甲 / 皮甲 Cord 上调**：靴子 / 腰带的 Cord `1 → 3`、部分 `2 → 4`，**轻甲成本上升**。
- **护甲 Plating 上调**：`2 → 6`（Chausses / Barbute / Kite Shield 等），**重甲成本上升**。
- **远征地图材料上调**：Gall Ink 与 Rod 用量成倍提高（如 `4 → 10`、`2 → 12`），与 Spirit Essence 下调形成对冲。
- **命名修正（非玩法变动）**：`Poppy Seed → Poppy Seeds`、`Lily Seed → Lily Seeds` 等种子单复数差异，属于官方命名规范，**不是数值改动**。
- **卷轴类去掉原木输入**：Mucky / Scrap / Low Quality / Medium Quality / Quality Scroll 不再需要 Aspen / Elm / Spruce / Maple / Beech Log。

## 3. 怪物图鉴（141 → 132）

### 3.1 新增（16）

| 怪物 | 类型 | 等级区间 | 群系 |
|---|---|---|---|
| Cute Bunny | Animal | 1 - 60 | Frozen Float,Bunny Remote |
| Derro Miner | Humanoid | 50 - 60 | Underground |
| Derro Pitwarden | Humanoid | 50 - 60 | Underground |
| Derro Stalker | Humanoid | 50 - 60 | Underground |
| Girtablilu | Humanoid | 50 - 60 | Red Desert |
| Grell | Creature | 50 - 60 | Underground |
| Mountain Giant | Humanoid | 50 - 60 | Mountain,Vulcanic Underground,Rocky Ridge |
| Mummy | Undead | 10 - 19 | Temple |
| Roc | Creature | 50 - 60 | Red Desert |
| Sand Golem | Construct | 50 - 60 | Red Desert,Rocky Ridge |
| Sandworm | Insect | 50 - 60 | Red Desert |
| Seafallen Oracle | Humanoid | 50 - 60 | Coastal |
| Seafallen Reaver | Humanoid | 50 - 60 | Coastal |
| Seafallen Stalker | Humanoid | 50 - 60 | Coastal |
| Stone Dragon | Creature | 50 - 60 | Mountain,Rocky Ridge |
| Terramancer | Humanoid | 50 - 60 | Mountain,Vulcanic Underground |

### 3.2 移除（25）

| 怪物 | 类型 | 等级区间 | 群系 |
|---|---|---|---|
| Cockatrice | Magical Creature | 31 - 40 | Dark Forest |
| Drow | Humanoid | 31 - 49 | Dark Forest、Sinister Isle、Underground |
| Forest Guardian | Magical Creature | 31 - 40 | Dark Forest、Guardian Queen Hive、Roots Isle |
| Ghost Pirate | Undead | 1 - 100 | Shipwreck、Hollow Forest、Pirate Ship |
| Goblin Engineer | Humanoid | 40 - 49 | Underground |
| Goblin Pyro | Humanoid | 5 - 20 | Mountain、Underground、Deep Forest、Goblin Camp、Urban |
| Goblin Soldier | Humanoid | 4 - 20 | Mountain、Deep Forest、Goblin Camp |
| Knight | Humanoid | 40 - 49 | Magic Plains |
| Light Elemental | Elemental | 19 - 50 | Elysian Isle |
| Lizardman | Humanoid | 11 - 20 | Coastal、Oasis |
| Miner | Humanoid | 4 - 6 | Underground |
| Mutated Lizardman | Humanoid | 21 - 30 | Swamp |
| Nomadic Cleric | Humanoid | 10 - 30 | Dry Desert、Spring Fields |
| Peasant | Humanoid | 2 - 10 | Temperate Forest、Urban |
| Phantom Miner | Undead | 40 - 49 | Underground |
| Phoenix | Magical Creature | 16 - 20 | Dry Desert、Vulcanic Isle |
| Purifier | Humanoid | 10 - 19 | Temple、Elysian Isle |
| Skeleton Archer | Undead | 21 - 30 | Haunted Forest、Underground |
| Skeleton Mage | Undead | 21 - 30 | Haunted Forest、Underground、Pumpkin Skerry |
| Skeleton Warrior | Undead | 21 - 30 | Haunted Forest、Underground |
| Sphinx | Magical Creature | 18 - 22 | Temple、Elysian Isle |
| Troglodyte | Humanoid | 5 - 10 | Underground、Urban |
| Valkyrie | Humanoid | 25 - 50 | Taiga、Love Island |
| Wraith | Undead | 31 - 40 | Sinister Isle |
| Zombie Pirate | Undead | 1 - 100 | Shipwreck、Pirate Ship |

### 3.3 等级区间变动（30）

| 怪物 | EA | 1.0 官方 |
|---|---|---|
| Angry Egg | 1 - 100 | 1 - 60 |
| Armored Ram | 40 - 49 | 40 - 52 |
| Badger | 1 - 20 | 1 - 10 |
| Decaying Worm | 11 - 20 | 10 - 19 |
| Deer | 2 - 5 | 4 - 6 |
| Dryad | 11 - 20 | 10 - 19 |
| Dwarven Caster | 40 - 49 | 40 - 52 |
| Dwarven Guard | 40 - 49 | 40 - 52 |
| Dwarven Hunter | 40 - 49 | 40 - 52 |
| Fire Elemental | 1 - 100 | 1 - 60 |
| Killer Centipede | 11 - 15 | 10 - 15 |
| Komodo Basilisk | 40 - 49 | 40 - 52 |
| Loot Goblin | 1 - 100 | 1 - 60 |
| Mothman | 11 - 20 | 10 - 19 |
| Ooze | 1 - 100 | 1 - 60 |
| Orc Warlock | 14 - 40 | 18 - 40 |
| Orc Warrior | 14 - 40 | 18 - 40 |
| Pirate | 1 - 100 | 1 - 60 |
| Polar Bear | 1 - 100 | 1 - 60 |
| Skeleton | 1 - 100 | 1 - 60 |
| Snow Rabbit | 1 - 100 | 1 - 60 |
| Succubus | 1 - 100 | 1 - 60 |
| Tiger | 31 - 50 | 30 - 49 |
| Toad | 1 - 10 | 4 - 10 |
| Troll Boar | 11 - 20 | 10 - 19 |
| Venomous Viper | 1 - 100 | 1 - 60 |
| Wasp | 1 - 10 | 4 - 6 |
| Woodland Snake | 1 - 10 | 4 - 10 |
| Wyvern | 1 - 100 | 1 - 60 |
| Zombie | 1 - 100 | 1 - 60 |

**影响分析**

- 新增的 **Derro 系（Miner / Pitwarden / Stalker）、Seafallen 系（Oracle / Reaver / Stalker）、Sand 系（Sand Golem / Sandworm）、Girtablilu、Roc、Mummy、Stone Dragon、Terramancer、Mountain Giant、Grell、Cute Bunny** 指向新的区域 / 怪群，是 1.0 新地图内容的线索。
- 移除的 **Skeleton 三件套、Goblin 三件套、Ghost / Zombie Pirate、Phoenix、Sphinx、Valkyrie、Wraith、Cockatrice、Drow** 等在 1.0 图鉴中不再出现，旧攻略里的刷怪点可能失效。
- **30 个怪物的等级区间变化**意味着**练级路线、拾荒材料 Tier、经验收益**都要重新核对；沿用 EA 路线可能打到等级不匹配的怪。

## 4. Boss / 副本（15 → 16）

| Boss | 等级 | 坐标 |
|---|---|---|
| Marious, Lord of Ratdom | 5 | 826/1537 |
| Tree of Life | 7 | 799/1208 |
| The Baron | 9 | 1074/1426 |
| The Devourer | 10 | 624/1130 |
| Spider Queen | 15 | 1387/1728 |
| Arcelia | 19 | 1135/1837 |
| Medusa | 20 | 1303/1096 |
| Kraken Mother | 25 | 1006/1683 |
| The Leech Demon | 29 | 1530/1854 |
| Yurk, the Ogre | 30 | 2487/1127 |
| Amosh, the Yeti | 35 | 1752/266 |
| Queen Acasia | 39 | 1169/843 |
| Ape King Goliathor | 40 | 3316/1712 |
| Grimble | 45 | 2735/654 |
| Ghrorak | 49 | 581/900 |
| Drazhul, The Demon Smith | 59 | 2213/1482 |

**影响分析**：新增 **Drazhul, The Demon Smith**；同时 1.0 副本机制改为「**免费进入 + 击败 Boss 后用钥匙开 Lootbox**」（EA 为「进门即消耗钥匙」），并引入 **Nightmare / Chaos** 难度（需 Rebirth 5 / 10）。**钥匙的用途与价值发生转移**：从「入场券」变成「开箱券」，囤钥匙的意义改变。

## 5. 采集点（112 → 141，新增 15）

| 技能 | 地图 | Tier | 等级 | 坐标 |
|---|---|---|---|---|
| Chopping | Southern Foothill | Tier 1 | Level 1-3 | 925/1672 |
| Chopping | Bay’s Alley | Tier 1 | Level 4-6 | 974/1729 |
| Chopping | Windy Fields | Tier 1 | Level 1-3 | 1026/1539 |
| Chopping | Forest Of Owranbu | Tier 1 | Level 4-6 | 1093/1584 |
| Chopping | Owranbu River | Tier 2 | Level 7-10 | 1182/1558 |
| Chopping | Dead Leaves Tiara | Tier 2 | Level 12-13 | 1323/1681 |
| Chopping | Elundi Garden | Tier 2 | Level 11-12 | 624/1130 |
| Chopping | Deep Forest | Tier 2 | Level 14-15 | 790/1052 |
| Chopping | Oasis | Tier 2 | Level 16-17 | 1753/1234 |
| Chopping | Dying Forest | Tier 2 | Level 18-19 | 1539/1633 |
| Chopping | Marsh | Tier 3 | Level 19-20 | 1552/1718 |
| Chopping | Shrubland | Tier 3 | Level 21-22 | 2248/1304 |
| Chopping | Haunted Forest | Tier 3 | Level 27-28 | 2056/691 |
| Chopping | Yurk’s Yard | Tier 4 | Level 30 | 2527/1147 |
| Chopping | Swamp | Tier 4 | Level 29-30 | 1447/1907 |
| Chopping | Caeltys’ Causeway | Tier 4 | Level 31-33 | 875/1011 |
| Chopping | Caeltys’ Yarden | Tier 4 | Level 38-39 | 1165/883 |
| Chopping | Taiga | Tier 4 | Level 29-30 | 1736/496 |
| Chopping | Shrubland | Tier 4 | Level 31-33 | 2506/1072 |
| Chopping | Rainforest | Tier 4 | Level 31-32 | 3163/1554 |
| Chopping | Rainforest | Tier 4 | Level 35-36 | 3169/1644 |
| Chopping | Taiga | Tier 5 | Level 45-46 | 1157/1217 |
| Chopping | Orc’s Bone Road | Tier 5 | Level 43-44 | 2449/1454 |
| Chopping | Rainforest | Tier 5 | Level 41-42 | 3130/1820 |
| Chopping | Dark Boreal | Tier 5 | Level 45-46 | 2727/594 |
| Chopping | Dark Boreal | Tier 5 | Level 48-49 | 3028/1114 |
| Chopping | Dark Boreal | Tier 6 | Level 51-52 | 3200/1240 |
| Farming | Elena’s Crossroad | Tier 1 | Level 1-3 | 869/1435 |
| Farming | Arodas Lakeshore | Tier 1 | Level 4-6 | 625/1464 |
| Farming | Southern Foothill | Tier 1 | Level 1-3 | 925/1672 |
| Farming | Windy Fields | Tier 1 | Level 1-3 | 1026/1539 |
| Farming | Elundi | Tier 2 | Level 10 | 585/1250 |
| Farming | Owranbu River | Tier 2 | Level 7-10 | 1182/1558 |
| Farming | Dust Outskirts | Tier 2 | Level 14-15 | 1549/1221 |
| Farming | Dying Forest | Tier 2 | Level 18-19 | 1539/1633 |
| Farming | Marsh | Tier 3 | Level 19-20 | 1552/1718 |
| Farming | Shrubland | Tier 3 | Level 21-22 | 2301/1245 |
| Farming | Haunted Forest | Tier 3 | Level 27-28 | 2056/691 |
| Farming | Caeltys’ Causeway | Tier 4 | Level 31-33 | 875/1011 |
| Farming | Shrubland | Tier 4 | Level 31-33 | 2506/1072 |
| Farming | Trescan | Tier 4 | Level 30 | 2752/890 |
| Farming | Taiga | Tier 5 | Level 43-44 | 1144/1257 |
| Farming | Orc’s Bone Road | Tier 5 | Level 40-41 | 2438/1353 |
| Farming | Rainforest | Tier 5 | Level 43-45 | 3123/1877 |
| Farming | Dark Boreal | Tier 5 | Level 47-48 | 2975/1122 |
| Farming | Wardens’ Bridge | Tier 6 | Level 52-53 | 3260/1247 |
| Fishing | El Caspar | Tier 1 | Level 1 | 871/1551 |
| Fishing | Brisban Pond | Tier 1 | Level 1-3 | 721/1499 |
| Fishing | Tree of Life | Tier 1 | Level 5-6 | 804/1231 |
| Fishing | Arodas Lakeshore | Tier 1 | Level 4-6 | 625/1464 |
| Fishing | Southern Foothill | Tier 1 | Level 1-3 | 925/1672 |
| Fishing | Bay’s Alley | Tier 1 | Level 4-6 | 974/1729 |
| Fishing | Windy Fields | Tier 1 | Level 1-3 | 1026/1539 |
| Fishing | Arodas Beach | Tier 2 | Level 7-10 | 583/1367 |
| Fishing | Elundi | Tier 2 | Level 10 | 585/1250 |
| Fishing | Bay’s Alley | Tier 2 | Level 7-10 | 1047/1754 |
| Fishing | Owranbu River | Tier 2 | Level 7-10 | 1182/1558 |
| Fishing | Dead Leaves Tiara | Tier 2 | Level 12-13 | 1323/1681 |
| Fishing | Pirate Wreck Beach | Tier 2 | Level 14-15 | 1135/1837 |
| Fishing | Deep Forest | Tier 2 | Level 14-15 | 754/1065 |
| Fishing | Oasis | Tier 2 | Level 16-17 | 1753/1234 |
| Fishing | Marsh | Tier 2 | Level 17-18 | 1547/1804 |
| Fishing | Marsh | Tier 3 | Level 19-20 | 1552/1718 |
| Fishing | Marsh | Tier 3 | Level 19-20 | 1530/1854 |
| Fishing | Marsh | Tier 3 | Level 19-20 | 1479/2073 |
| Fishing | Haunted Forest | Tier 3 | Level 21-22 | 1860/951 |
| Fishing | Shrubland | Tier 3 | Level 21-22 | 2301/1245 |
| Fishing | Taiga | Tier 3 | Level 27-28 | 1715/554 |
| Fishing | Haunted Forest | Tier 3 | Level 27-28 | 2056/691 |
| Fishing | Yurk’s Yard | Tier 4 | Level 30 | 2527/1147 |
| Fishing | Swamp | Tier 4 | Level 29-30 | 1447/1907 |
| Fishing | Caeltys’ Yarden | Tier 4 | Level 38-39 | 1165/883 |
| Fishing | Shrubland | Tier 4 | Level 31-33 | 2506/1072 |
| Fishing | Itham’s Crator | Tier 4 | Level 34-35 | 1977/1767 |
| Fishing | Itham’s Anchorage | Tier 4 | Level 36-37 | 1975/1895 |
| Fishing | Rainforest | Tier 4 | Level 31-32 | 3163/1554 |
| Fishing | Trescan’s Dock | Tier 4 | Level 34-35 | 2605/900 |
| Fishing | Abandoned Mine | Tier 5 | Level 41-42 | 618/935 |
| Fishing | Rainforest | Tier 5 | Level 39-40 | 3173/1767 |
| Fishing | Dark Boreal | Tier 5 | Level 43-44 | 2735/654 |
| Fishing | Magic Plains | Tier 5 | Level 40-42 | 1666/2299 |
| Fishing | Wardens’ Bridge | Tier 6 | Level 52-53 | 3260/1247 |
| Fishing | Wardens’ Bridge | Tier 6 | Level 54-55 | 3415/1247 |
| Foraging | Upper Fountain’s Descent | Tier 1 | Level 1 | 814/1683 |
| Foraging | El Caspar | Tier 1 | Level 1 | 871/1551 |
| Foraging | Arodas Lakeshore | Tier 1 | Level 4-6 | 625/1464 |
| Foraging | Southern Foothill | Tier 1 | Level 1-3 | 925/1672 |
| Foraging | Owranbu River | Tier 2 | Level 7-10 | 1182/1558 |
| Foraging | Dust Outskirts | Tier 2 | Level 14-15 | 1549/1221 |
| Foraging | Marsh | Tier 2 | Level 17-18 | 1547/1804 |
| Foraging | Dying Forest | Tier 2 | Level 18-19 | 1539/1633 |
| Foraging | Marsh | Tier 3 | Level 19-20 | 1530/1854 |
| Foraging | Swamp | Tier 3 | Level 26-28 | 1430/1949 |
| Foraging | Shrubland | Tier 3 | Level 21-22 | 2301/1245 |
| Foraging | Haunted Forest | Tier 3 | Level 27-28 | 2056/691 |
| Foraging | Swamp | Tier 4 | Level 29-30 | 1447/1907 |
| Foraging | Caeltys’ Causeway | Tier 4 | Level 31-33 | 875/1011 |
| Foraging | Shrubland | Tier 4 | Level 31-33 | 2506/1072 |
| Foraging | Trescan | Tier 4 | Level 30 | 2752/890 |
| Foraging | Rainforest | Tier 5 | Level 43-45 | 3123/1877 |
| Foraging | Dark Boreal | Tier 5 | Level 47-48 | 2975/1122 |
| Foraging | Wardens’ Bridge | Tier 6 | Level 52-53 | 3260/1247 |
| Mining | Akelay Cave Level 1 | Tier 1 | Level 4-6 | 738/1440 |
| Mining | Southern Foothill | Tier 1 | Level 1-3 | 925/1672 |
| Mining | Owranbu River | Tier 2 | Level 7-10 | 1182/1558 |
| Mining | Mesa Mine Area | Tier 2 | Level 11-12 | 1396/1445 |
| Mining | Scorpion`s Nest | Tier 2 | Level 14-15 | 1385/1133 |
| Mining | Dry Mirage | Tier 2 | Level 16-17 | 1335/1108 |
| Mining | Desert of Lost Hope | Tier 2 | Level 14-15 | 1746/1452 |
| Mining | Savanna | Tier 3 | Level 19-20 | 1463/836 |
| Mining | Red Desert | Tier 3 | Level 20-21 | 2114/1790 |
| Mining | Taiga | Tier 3 | Level 27-28 | 1680/600 |
| Mining | Haunted Forest | Tier 3 | Level 27-28 | 2056/691 |
| Mining | Caeltys’ Yarden | Tier 4 | Level 34-37 | 1173/923 |
| Mining | Necropolis | Tier 4 | Level 29-30 | 2138/844 |
| Mining | Ancient Worm Tunnel | Tier 4 | Level 34-35 | 2625/995 |
| Mining | Itham’s Anchorage | Tier 4 | Level 36-37 | 1975/1895 |
| Mining | Rainforest | Tier 4 | Level 33-34 | 3210/1580 |
| Mining | Taiga | Tier 5 | Level 41-42 | 1141/1306 |
| Mining | Dark Boreal | Tier 5 | Level 41-42 | 2720/723 |
| Mining | Magic Plains | Tier 5 | Level 40-42 | 1666/2299 |
| Mining | Mountain | Tier 6 | Level 55-56 | 3460/1271 |
| Mining | Moldrir Depths | Tier 6 | Level 51-52 | 3066/477 |
| Quarrying | Brisban Pond | Tier 1 | Level 1-3 | 721/1499 |
| Quarrying | Akelay Cave Level 2 | Tier 1 | Level 6-9 | 738/1440 |
| Quarrying | Mount Akelay | Tier 1 | Level 4-6 | 767/1413 |
| Quarrying | Way to Morwen | Tier 2 | Level 14-15 | 778/998 |
| Quarrying | Mesa Mine Area | Tier 2 | Level 11-12 | 1396/1445 |
| Quarrying | The Living Desert | Tier 2 | Level 16-17 | 1931/1490 |
| Quarrying | Savanna | Tier 3 | Level 19-20 | 1463/836 |
| Quarrying | Red Desert | Tier 3 | Level 20-21 | 2114/1790 |
| Quarrying | Necropolis | Tier 4 | Level 29-30 | 2138/844 |
| Quarrying | Taiga | Tier 4 | Level 31-32 | 1676/420 |
| Quarrying | Abandoned Mine | Tier 5 | Level 41-42 | 724/960 |
| Quarrying | Abandoned Mine | Tier 5 | Level 41-42 | 667/937 |
| Quarrying | Abandoned Mine | Tier 5 | Level 41-42 | 618/935 |
| Quarrying | Abandoned Mine | Tier 5 | Level 41-42 | 565/949 |
| Quarrying | Dark Boreal | Tier 5 | Level 47-48 | 2975/1122 |
| Quarrying | Dark Boreal | Tier 6 | Level 49-50 | 2894/581 |
| Quarrying | Red Desert | Tier 6 | Level 57-59 | 2171/1510 |
| Quarrying | Wardens’ Bridge | Tier 6 | Level 54-55 | 3415/1247 |

**影响分析**：新增 15 条采集点；1.0 采集点总数按技能为 **Fishing 37 / Chopping 27 / Mining 21 / Farming 19 / Foraging 19 / Quarrying 18**，**钓鱼资源最丰富**。结合「工具耐久 = 地图阶级 + 最高阶级」的公式，跨 Tier 采集的成本需要重新计算。

## 6. 城镇（12）

| 城镇 | 等级 | Tier | 坐标 |
|---|---|---|---|
| El Caspar | Level 1 | Tier 1 | 871/1551 |
| Elundi | Level 10 | Tier 2 | 585/1250 |
| Owranbu | Level 10 | Tier 2 | 1285/1561 |
| Drouver | Level 15 | Tier 2 | 1577/1124 |
| Vileton | Level 15 | Tier 2 | 1263/1835 |
| Sanjuo | Level 19 | Tier 2 | 1533/2204 |
| Bungavik | Level 20 | Tier 3 | 1433/705 |
| Saurville | Level 20 | Tier 3 | 1873/866 |
| Ururg | Level 20 | Tier 3 | 2410/1256 |
| Caeltys | Level 30 | Tier 4 | 1059/929 |
| Trescan | Level 30 | Tier 4 | 2752/890 |
| Stogow | Level 30 | Tier 4 | 1656/342 |

**影响分析**：官方 1.0 Wiki 首次给出**城镇等级 / Tier / 世界坐标**的完整表。城镇 Tier 决定 **Client Order Board 的订单 Tier、商人库存与服务等级**，因此「去哪个城镇」直接影响日常收益。

## 7. 成就（526）

官方 1.0 Wiki 一次性列出 **526** 个成就（名称 / 描述 / Achievement Token 奖励），**代币合计 91,940**。

**影响分析**：成就数量与代币总量决定 **Achievement Market 的解锁档位**与可兑换物品；成就 Tier 还影响 **Overlord 战利品中保险箱 / 钥匙 / 代币的阶级**，因此做成就的收益从「纯收集」变为**影响掉落质量**。

## 8. 属性与公式

官方 1.0 Wiki「属性与数值」页给出 **54 项属性**的完整公式，取代本站 EA 期实测拟合曲线。

**关键差异**

| 项 | EA（本站记录） | 1.0 官方 |
|---|---|---|
| Luck 每点 | +2 Magic Find / +2 Gold Find | **+5 Magic Find / +5 Gold Find** |
| Power 每点 | +5 Base Damage | **+5 Physical Damage** |
| 减伤曲线 | EA 拟合 `130·r/(r+K·L)` | 官方 `r ÷ (r + 485 × 等级)` |
| 暴击几率 | 未给公式 | `(CC×1.5) ÷ (CC×1.5 + 485×等级)`，5%~80% |
| 命中几率 | 未给公式 | `(Hit×4) ÷ (Hit×4 + 485×敌人等级) × 2`，5%~100% |
| 生命 / 法力偷取 | 未给公式 | `(LS÷5) ÷ (LS÷5 + 485×等级)` |

**影响分析**：**Luck 的实际价值此前被低估约 2.5 倍**（EA 记录 +2/+2，官方为 +5/+5），寻宝 / 淘金流的配点需要重估；官方公式让「堆多少属性 = 多少百分比」可以直接计算，不再依赖实测拟合。

## 9. 页面级变更

- **新增 85 页**：集中在 1.0 新系统 —— Housing（9）、Technical（11）、Payments（6）、Account（6）、Events（9）、Socials 补充（5）、Codices / Artifacts / Augments / Ember Forge、Rebirth、Waygates、Smugglers Routes、Elite Prefixes、Game Modes、Cosmetics、Crafting Queue、Personal Estate 等。
- **删除 4 页**：`78`、`95`、`105`、`124`（124 = Toolsmithing）。
- **清空 5 页**：`90` Guild Panel、`92` Guild Temple、`96` Overview Character、`112` Currencies、`133` What is a Pet —— 官方 1.0 Wiki 中**没有正文**。
- **内容重写 44 页**：相似度最低的是新手指南（0，EA 只有 4 词 → 1.0 有 319 词）、Inventory（0.15）、六职业页（0.3 左右，技能明细改为游戏内 tooltip）、各制作专业页（0.15~0.25，配方重构）。

**影响分析**：**新手指南是 1.0 全新撰写的**（EA 帮助里几乎没有内容），说明官方把「入门引导」提到了正式版的重点；**职业页不再列出逐级技能数值**，改为游戏内 tooltip 呈现，因此本站的 EA 逐级技能表在 1.0 需要重新采集。

## 10. 影响总结

| 维度 | 主要变化 | 对玩家的影响 |
|---|---|---|
| **职业分工** | 专业改角色绑定、上限 3；Toolsmithing / Petbreeding 移除 | 一个角色无法全专业，需按账号规划分工；Rogue 失去工具自给 |
| **经济** | Spirit Essence 成本大降；武器锭用量下调；轻甲 / 重甲成本上升 | 传送与远征更便宜，金属武器更易量产，布甲 / 皮甲更贵 |
| **制作链** | 新增 Bamboo / 背包 / 箭袋 / 拳刃 / 法书；移除哥布林皮革 / 复合弓 | 升级路线与配装需重排，旧配方可能已不存在 |
| **练级** | 25 个怪移除、30 个怪等级区间变化 | 旧刷怪点与经验路线需重新核对 |
| **副本** | 钥匙改为开箱券；新增 Nightmare / Chaos（Rebirth 5 / 10） | 钥匙价值转移，Rebirth 成为高阶副本门槛 |
| **属性** | 官方给出完整公式；Luck 每点 +5/+5 | 配点可以精确计算，寻宝流价值上升 |
| **成就** | 526 个成就，代币 91,940 | 成就 Tier 影响 Overlord 掉落阶级 |
| **本站** | 44 页并入 1.0 官方内容、新增 39 页 | EA 实测内容保留并标注，未与 1.0 官方口径混用 |

## 相关

- [1.0 机制变更](/norr-wiki/release/v1-changes/)
- [官方 1.0 Wiki 抓取与对照](/norr-wiki/reference/official-wiki-2026-10-15/)
- [制作](/norr-wiki/professions/crafting/)、[生活技能总览](/norr-wiki/professions/overview/)
- [怪物图鉴](/norr-wiki/world/bestiary/)、[副本与 Boss](/norr-wiki/quests/dungeons/)
- [属性公式与数值计算](/norr-wiki/combat/formulas/)
