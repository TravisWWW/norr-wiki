---
title: 鉴定与装备
description: 先鉴定再判断、装备槽位与词条、品质与稀有度。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（Item Stats / Jewel Stats / Max Sockets）
  - type: observed
    reference: 游戏内实测
---

## 先鉴定，再判断一件装备

掉落的装备常常显示 `Quality: [?]` 和 `+N Unidentified Modifier`。**未鉴定前品质和隐藏词条都是未知的**，
面板上的 `Damage: 83 (+68)` 这类绿/红差值也**没有意义**。两种鉴定方式：

| 方式 | 费用 |
|---|---|
| Identification Scroll（掉落 / 商人） | 每件 1 张卷轴 |
| 城里的 Item Specialist NPC | 金币（件数多时更便宜） |

**鉴定成本较低，建议先全部鉴定再判断。** 鉴定会一次性揭示真实数值，甚至加上一大截隐藏主属性：

| 装备 | 鉴定前 | 鉴定后 |
|---|---|---|
| Copper Plated Chausses (Magic) | Defense 54 / Res 18 | **Quality 47，Defense 106 (+43) / Res 48** |
| Mucky Chitin Leather Belt (Magic) | Defense 10 / Res 10 | **Quality 35，Defense 27 (+27) / Res 27** |

→ **鉴定前不应按面板数字出售装备**；`+N` 的浮动可以接近翻倍。

## 装备

- 槽位：`weapon`、`shield`、`armor`、`leggings`、`boots`、`helmet`、`gloves`、`belt`、`necklace`、
  `ring`、`earrings`、`pet`，以及工具槽 `fishing_rod` / `farmer_hoe` / `mining_pick` / `chopping_axe`。
- **Tome 占 `shield` 槽**。部分 Tome 带 **`Bonus Strikes: N`**，即每回合多打一段，通常收益较高。
- **职业限制生效**：`Class: Berserker,Zealot` 能穿，`Class: Ranger` / `Class: Druid` 等不能。
  护甲重量（`Class: Medium`）**不**阻挡 Zealot。
- 换装会把被替换的装备退回背包，**不会丢**。

## 装备槽位与词条【官方】

- **可 roll 词条按部位分**：
  - 武器通用：Physical/Spell Damage、Hit Rating、六元素伤害、Magic/Gold Find、Max Durability、Life/Mana Steal、Crit Strike/Chance。
  - 斧 → Bleed；匕首 → Attack Speed + Bleed；矛 → Armor Pen + Bleed；剑 → Attack Speed；
    钝器 → Blunt；弓 → Attack Speed；弩 → Armor Pen + Bleed；法杖 → Armor Pen + Crit Chance；
    魔杖 → Armor Pen + Crit Strike；拳套 → Counter Strike + Attack Speed；Cestus → Blunt + Thorn。
  - 首饰（戒指/耳环/项链）：范围最广，含各类抗性、Mana、Max Life、Attack Speed、Armor Pen、
    Life/Mana Steal、Regen、Resilience、Fortitude、Evasion。
  - 护甲（胸/头/腿/手/腰带/脚）：Defense、七种抗性、Mana、Max Life、Regen、Magic/Gold Find、Fortitude、Resilience、Evasion。
  - 盾：Defense、Block Rating、抗性、Mana、Max Life、Magic/Gold Find、Max Durability、Regen、Resilience、Fortitude。
- **宝石（Jewel）属性组**：Physical / Caster / Utility / Hit / Sustain / Protection / Swift。
- **最大插槽**：腰带 2 · 靴 2 · 胸 3 · 手 2 · 头 2 · 腿 2 · 盾 无 · 双手武器 3 ·
  单手武器 2 · 戒指 1 · 项链 1 · 耳环 1。

## 品质与稀有度（两个独立维度）

- **Quality（品质）**：0–200，影响主属性强度（Defense/Damage/Resistance）。在 Item Specialist 处 **Refine** 提升，
  **Quality ≥ 32 起有几率碎装备**（建议带 Safety Charm）。各稀有度上限【官方】：

| Rarity | Min Quality | Max Quality |
|---|---|---|
| Normal | 0 | 60 |
| Magic | 0 | 70 |
| Rare | 10 | 80 |
| Epic | 20 | 90 |
| Mystical | 30 | 100 |
| Ascended | 40 | 120 |
| Legendary | 50 | 150 |
| Relic | 60 | 200 |
| Unique | 70 | 200 |

- **Rarity（稀有度）**：决定词条数量。顺序【官方】：
  `Magic → Rare → Epic → Mystical → Ascended → Legendary → Relic`。
  用 **Rarity Token** 尝试升稀有度（有失败/损毁风险，配合 Safety Charm）。
- 相关道具【官方】：**Lucky Charm**（每次 +10% 镶嵌成功率，最多 5 个/次 = 100%）、
  **Safety Charm**（保装备不碎）、**Reroll Dice**（重 roll 词条，需同 Tier）、
  **Relic Upgrade Token**（Legendary → Relic，100% 成功）。

## 1.0 变化【官方已公布】

> 以下为 1.0 官方公告口径，**未实测**；本页上方为 **EA 版**规则。

- **Item Power**：新增指标，综合**品质 / 伤害 / 属性 / 孔位**等评估装备好坏。
- **新 item tooltip**：重设计，**稀有度名称写入 tooltip**（色盲友好）。
- **属性 Account-wide**：大量属性改为**账号共享**，并加入 Overview 页。
- **锁定**：可锁定**装备**，也可锁定**材料**。
- **掉落透明化**：每个 mob 的掉落表**显示掉率 %**。
- **Pathfinder's Crate**：改为**每类各 1 件**（防重复）。
- **等级 55 / 59 配方**、Tier 6 物品图标补齐。

详见 [1.0 机制变更](/norr-wiki/release/v1-changes/)。

## 相关

- [物品与容器](/norr-wiki/equipment/items/)
- [物品专家：精炼/镶嵌/重铸](/norr-wiki/equipment/item-specialist/)

## 资料来源

- 官方帮助文档：Item Stats、Jewel Stats、Max Sockets。
- 游戏内实测（EA 版）：鉴定前后数值差异。