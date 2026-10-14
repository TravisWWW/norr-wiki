---
title: 公会职业分配方案
description: 6 人满编的职业/专业分工与供应链。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（Professions / 各制作职业）
  - type: observed
    reference: 游戏内实测
---

> 配套阅读：[职业自给自足矩阵](/norr-wiki/guides/crafting-matrix/)（材料来源明细）

## 0. 三条前提

1. **制作技能由职业决定，不能自由分配。**
   每个职业固定可使用「5 项制作技能」，玩家只能选职业，不能单独选技能。
   → 所以「公会分配专业」= **分配职业**。
2. **7 个采集专业所有职业都能学**，而且**进度账号共享**：一个角色练过，同账号其它角色同样可用。
   → 采集**不需要分配**，每个成员自己练即可。
3. **13 个制作专业里，有 7 个只由单一职业可制作**：

| 制作专业 | 可制作职业 |
|---|---|
| Alchemy 炼金（做 Orb/药水） | **Archmage** |
| Armorsmithing 铸甲（做 Wire/重甲） | **Zealot** |
| Carpentry 木工（做 Rod/Handle/Club） | **Ranger** |
| Weaponsmithing 铸武（做 Nails/武器） | **Berserker** |
| Stonemasonry 石工 | **Berserker** |
| Toolsmithing 工具（做镐/打孔锤） | **Rogue** |
| Petbreeding 养宠 | **Druid** |

→ **要覆盖全部 13 个制作专业，需要 6 个职业各有一名成员。**

## 1. 推荐方案：6 人满编（全覆盖）

| 成员 | 职业 | 可使用制作专业 | 公会定位 |
|---|---|---|---|
| 1 | **Ranger 游侠** | **Carpentry**、Cartography、Cooking、Hunting、Leatherworking | 木料：出 Rod/Handle/Club，多个职业都需要 |
| 2 | **Archmage 法师** | **Alchemy**、Cartography、Cooking、Jeweling、Tailoring | 药水与宝珠，兼布甲 |
| 3 | **Berserker 狂战** | **Weaponsmithing**、**Stonemasonry**、Cooking、Hunting、Leatherworking | 武器，兼石料 |
| 4 | **Zealot 狂热者** | **Armorsmithing**、Jeweling、Cartography、Cooking、Hunting | 重甲与金属线，兼珠宝 |
| 5 | **Rogue 盗贼** | **Toolsmithing**、Cartography、Cooking、Hunting、Leatherworking | 工具与打孔锤 |
| 6 | **Druid 德鲁伊** | **Petbreeding**、Tailoring、Cooking、Hunting、Leatherworking | 宠物与布甲 |

建议：每人把 **7 个采集专业**都练起来（进度账号共享，只需练一次）。采集**不是硬性门槛**——原材料也可以直接从 **Trading Post** 购买，只是自采更省金币。

## 2. 人不够时的优先级

### 4 人核心（推荐下限）
**Ranger + Archmage + Berserker + Zealot**
覆盖 11/13，缺 Toolsmithing、Petbreeding（都能从 Trading Post 买）。
四个关键专业 Carpentry / Alchemy / Weaponsmithing / Jeweling 都在。

### 3 人
**Ranger + Archmage + Berserker**
缺 **Armorsmithing、Toolsmithing、Petbreeding** —— 缺口偏大，不推荐。

### 2 人及以下
只能靠 Trading Post 补料，建议至少保证 **Ranger（木工）** 和 **Archmage（炼金 + 珠宝）**。

## 3. 供应链：谁给谁供货

```
Chopping ──Log──► Carpentry ──Rod/Handle/Club──► Weaponsmithing / Toolsmithing / Hunting / Cartography
Mining ──Ore──► Armorsmithing / Weaponsmithing / Toolsmithing ──Ingot/Wire──► Jeweler ──Gem──► Cartography / Tailoring
Mining ──Geode──► Jeweler ──Gem──► Cartography / Tailoring / Weaponsmithing
Foraging ──Birdnest──► Seed ──► Alchemy ──Orb──► Weaponsmithing
Scavenging ──Tendon──► Hunting ──String──► Carpentry
Scavenging ──Hide──► Leatherworking ──Glove Base──► Hunting
Quarrying ──Stone──► Stonemasonry
Fishing ──Oily Fish Carcass──► Alchemy ──Fish Oil──► 药水
```

**四个关键环节**：Carpentry（木杆）、Jeweler（宝石）、Alchemy（宝珠）、Weaponsmithing（钉子）。
若缺少对应职业，下游制作会受影响，建议优先安排。

## 4. 每人怎么练（效率）

- **制作升级快于采集**：制作约 +36~40 经验、冷却 10 秒（全局共享）；采集只有 +10 经验、冷却 18 秒。
- 搓**低阶、材料便宜的 T1 配方**刷等级，例如 Cooking 的 Mucky Vegetable Salad（1x Mucky Vegetables）。
- 采集主要在**需要材料**或**工具耐久富余**时做，单纯刷经验效率较低。
- 工具耐久：`2 × max(工具Tier, 区域Tier)` / attempt，一次 run 3 attempts；坏了去城里 Smith 修。

## 5. 小结

> **采集人人自己练；制作按职业分。**
> 6 个人各选一个不同职业 → 13 个制作专业全覆盖；
> 人少时优先保 **Ranger（木工）、Archmage（炼金）、Berserker（铸武）、Zealot（珠宝/铸甲）**。

## 相关

- [职业自给自足矩阵](/norr-wiki/guides/crafting-matrix/)
- [生活技能总览](/norr-wiki/professions/overview/)

## 资料来源

- 官方帮助文档：Professions、各制作职业条目。
- 游戏内实测（EA 版）：制作/采集经验与冷却。