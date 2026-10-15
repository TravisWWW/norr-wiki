---
title: 物品与容器
description: 开容器、宝箱档次、修理、批量分解与背包扩容。
gameVersion: "1.0"
verifiedDate: 2026-10-15
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（Inventory and Stash / Equipment）
  - type: observed
    reference: 游戏内实测
---

背包里带 `use_name` 的物品可以「使用」，**宝箱需要对应钥匙**才能开；开出的东西进**掉落窗**，需要再领一次才到手。
**批量分解（Mass Salvage）** 按装备材质给对应制作材料，产出同样进掉落窗。
背包初始 50 格，最大可扩到 100；**背包快满时采集会失败**，长挂前先清空间。

## 每次打怪后的固定流程

1. 查看背包，找出新装备与 `[UNIDENTIFIED]` 标记。
2. **全部鉴定**（见[鉴定与装备](/norr-wiki/equipment/identify/)）。
3. 比当前好的就换上（**比数值与词条，不看稀有度颜色**）。
4. 到城里商人处，把替换下来的和用不了的处理掉。
5. 到炼金师处补药。
6. 磨损的装备去铁匠处修理（磨损装备耐久显示为红色）。

## 开容器（Use）

背包里带 `use_name` 的物品可以「使用」，开出的内容进**掉落窗**，需要再领取一次。

- 普通容器（Birdnest / Soil Lump / Hollowed Log / Conglomerate / Fishing Net / Spirit Berry 等）可直接开。
- **宝箱（Strongbox）必须用对应钥匙**才能开。

### 宝箱档次与固定产出

| 宝箱 | 需要钥匙 | 保底 Spirit Essence | 保底 Rarity Token | 保底 Reroll Dice | 保底随机装备 |
|---|---|---|---|---|---|
| Copper Strongbox | **Copper Key** | 100 | 5（T1） | 5（T1） | **2 件** |
| Iron Strongbox | Iron Key | 200 | 5 | 5 | 2 件 |
| Bronze Strongbox | Bronze Key | 300 | 5 | 5 | 2 件 |
| Steel Strongbox | Steel Key | 400 | 5 | 5 | 2 件 |

外加「Chance of extra」：Safety Charm / Lucky Charm / 钥匙 / 额外装备等（概率掉落）。

- 固定产出按数量线性叠加；装备品质从 Magic / Rare 到 Epic 都有。
- **宝箱不给战斗经验**。
- 结论：宝箱是 **Spirit Essence（传送货币）+ 代币 + 装备**的高效来源，钥匙用 Achievement Tokens 或
  Golden Laurels 在代币商店换，性价比很高。

### 野外容器产出

| 容器 | 产出 |
|---|---|
| Mucky Soil Lump | Sweet Potato、Spirit Seed |
| Mucky Birdnest | Red Poppy Seed、Blue Poppy Seed |
| Mucky Hollowed Log | Aspen Gall、Spirit Log |
| Spirit Berry | **Spirit Essence x6** |
| Mucky Conglomerate | **Spirit Stone x1** |
| Mucky Abandoned Fishing Net | Mucky Oily Fish Carcass、Spirit Fish |

全部**不给战斗经验**，只给 loot。

## 修理

- 到城市铁匠处可**一键修理全部装备**，费用从金币里扣。
- 修理同时完成日常「Repair Item(s)」。

> **卖出价格**（NPC 收购价）见[商人与药水](/norr-wiki/equipment/vendors/)。

## 批量分解（Mass Salvage）

铁匠 / 珠宝商处有 **Mass Salvage** 页签，勾选要分解的装备后执行。

- **产出进掉落窗**，需要再领一次才到手。
- 产出规律：**按装备的材质给对应制作材料**。

| 拆的东西 | 产出 |
|---|---|
| Copper 武器 | **Copper Ore**（主）、Copper Ingot、Copper Point / Copper Blade |
| Mucky 皮甲 | **Mucky Cleaned Scale** |
| 混合装备 | Cabochon Garnet、Cotton Fleece、**Spirit Essence**、**Rarity Token**、Ingot、Ore、Log |

- 单件产出量 0~5 个，随机；偶尔会给 Spirit Essence / Rarity Token。
- **Lock**（Toolsmith 造）可以**保护装备不被拆解或删除**。
- 拆解同时完成日常「Mass Salvage Item(s)」。

## 背包格子与扩容

- 背包容量显示在库存框标题：`Inventory (已用/上限)`。
- **初始上限 50，最大可扩到 100**。每用 1 个 **Inventory Slot Expander** +1 格。
- **Inventory Slot Expander 在 Achievement Market 卖 50 成就代币**。
- **资源堆叠上限默认 100/格**；用 Infusion Stone 可提升（账号共享）。
- **背包快满时采集会失败**（材料进不去），长挂前要先清空间。

> **药水**（效果、价格、自动喝药）见[商人与药水](/norr-wiki/equipment/vendors/)。

## 物品词条与插槽上限【1.0 官方 Wiki】

**最大插槽数**：

| 部位 | 插槽 |
|---|---|
| 腰带 / 靴子 / 手套 / 头盔 / 护腿 | 2 |
| 胸甲 | 3 |
| 副手 / 背包 | 无 |
| 双手武器 | 3 |
| 单手武器 | 2 |
| 戒指 / 项链 / 耳环 | 1 |

**可 roll 的词条**（按物品类别）：武器通用词条（物理 / 法术伤害、命中、各元素伤害、Magic/Gold Find、最大耐久、生命 / 法力偷取、暴击伤害 / 几率），并按武器类型追加专属词条（斧 / 匕首 / 长矛 / 剑 / 钝器 / 弓 / 弩 / 法杖 / 魔杖 / 拳 / 拳套）；首饰与护甲各有独立词条池；盾牌另有格挡值。

## 战利品背包 Loot Bag【1.0 官方 Wiki】

- 战斗掉落的物品会先进**战利品背包（Loot Bag）**，抓取你需要 / 想要的一切。
- **某些操作可能会清空战利品背包**，因此**不建议**把它当作额外储藏空间；有价值的物品请及时转入背包 / 银行。

## 相关

- [鉴定与装备](/norr-wiki/equipment/identify/)
- [商人与药水](/norr-wiki/equipment/vendors/)
- [物品专家：精炼/镶嵌/重铸](/norr-wiki/equipment/item-specialist/)

## 资料来源

- 官方帮助文档：Inventory and Stash、Equipment。
- 游戏内实测（EA 版）：开容器、宝箱产出、修理、批量分解、背包扩容、药水数值。