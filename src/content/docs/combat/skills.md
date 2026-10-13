---
title: 技能系统
description: 技能点机制、技能解锁与阵营、Zealot 与 Ranger 技能全表。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（职业页 / Skillbook / Alignment）
  - type: observed
    reference: 游戏内实测
---

## 技能点与技能升级

- 角色面板顶部显示**未分配技能点**。
- **升级时获得 5 点属性点 + 2 点技能点**。
- 技能等级上限 **20**（职业页数值均为 Lv.20 口径）；**单个技能等级 ≤ 角色等级 − 1**。
- 解锁门槛是「角色等级 + 武器/盾前置」，与技能点无关。例：`smite` / `shield_bash` / `phalanx` 需要盾，
  `hammer_mastery` 需要锤类武器。
- 技能点可**免费重洗**（Reset Skills，第一次免费），因此技能实验成本为零。
- 属性点与技能点不同：属性点需付费洗点，建议先测量再分配。

## 技能解锁与阵营

- 技能按**角色等级分批解锁**（不是一次性全开）。
- **阵营门槛**：带 `Alignment: Light/Dark` 的技能（如 Zealot 的光明/黑暗两系、Berserker 的 Enchanted/Sinister 系、
  Rogue 的 Radiant/Shadow 系）**同一角色只能选一边**，对立阵营的技能锁定。换阵营 = 重练。
- 技能数值通常以 **Lv.20** 口径公布；面板 tooltip 会给出当前等级效果与「Added with next Level」的每级增量。

## Zealot 完整技能树【官方】

数值均为 **Lv.20** 口径。`Requires:` = 武器/盾前置；`Alignment:` = 阵营限定。

### 武器精通（Weapon Mastery）

| 技能 | 前置 | 类型 | Lv.20 数值 |
|---|---|---|---|
| **Blade Mastery** | Shortsword / Scimitar / Warblade | 被动 | +43% Weapon Damage、+24% Hit Rating |
| **Hammer Mastery** | Great Club / Heavy Flail / Warhammer | 被动 | +43% Weapon Damage、+24% Critical Strike |

### 光明系（Light Mastery，需 Light 阵营）

| 技能 | 蓝/lvl | CD | 类型 | Lv.20 数值 |
|---|---|---|---|---|
| **Lighting Of Spirit** | — | — | 被动 | +5 Light Damage、+86% Light Damage |
| **Bright Strike** | 5 | 2 回合 | Attack | +200 Weapon Damage、+10 Light、+220% Light |
| **Overwhelming Light** | 20 | 9 回合（持续 5） | Buff | +20 Light Damage、+96% Light Damage |
| **Light Aura** | 15 | 7 回合（持续 4） | Buff | +29 Block Chance、+10 Block Rating、+95% Block Rating |
| **Holy Blast** | 10 | 6 回合 | Spell | +125% 致盲、+210 Light、+210% Light |
| **Blinding Touch** | 20 | 9 回合 | Attack（3 段） | +30 Weapon、+190% Weapon、+30 Light、+228% Light、+58% 致盲 |
| **Holy Body Armor** | 15 | 10 回合（持续 4） | Buff | +300 Base Defense、+95% Base Defense、+30 Base Resist、+57% Base Resist |
| **Holy Light Bubble** | — | 10 回合（持续 7） | Buff | +100 Evasion、+38% Evasion、+10 Attack Speed、+38% Attack Speed |

### 黑暗系（Dark Mastery，需 Dark 阵营）

结构与光明系**完全对称**，只换元素与副效果：

`Shadow Strike`（=Bright Strike，改 Dark）、`Overwhelming Dark`、`Dark Leech Aura`
（+125 Life Steal / +57%、+4 Mana Steal / +28.5%）、`Unholy Shroud`（致 Fear）、
`Fearing Touch`（3 段 + Fear）、`Unholy Barrier`（+300 Def / +95%、+210 Thorn / +19%、+50 Fortitude / +95%）、
`Spirit Breaker`（Debuff：−100 Max Life / −19%、−15 Mana / −95%）、`Darkening Of Spirit`（被动 +5 Dark / +86%）。

### 杂项（Misc）

| 技能 | 蓝/lvl | CD | 前置 | Lv.20 数值 |
|---|---|---|---|---|
| **Shield Mastery** | — | — | Round/Kite/Tower Shield | 被动 +20 Block Rating、+38% Block Rating、+6.75 Block Chance |
| **Balanced Strike** | 10 | 4 | — | Attack +10 Weapon/+190%、+10 Dark/+190%、+10 Light/+190% |
| **Smite** | — | 3 | 盾 | Attack +100% 眩晕、+162% Weapon |
| **Shield Bash** | — | 3 | 盾 | Attack +200% Weapon |
| **Phalanx** | 10 | 6 | 盾 | Spell +1500 Shield、+133% Shield |
| **Balanced Touch** | 20 | 9 | — | Attack（2 段）+30 Weapon/+190%、+30 Light/+228%、+30 Dark/+190% |
| **Shield Throw** | 10 | 3 | 盾 | Ranged +10 Weapon/+95%、+100% 沉默、+38% 眩晕 |
| **Invigoration** | — | — | — | 被动 +100 Maximum Life、+95% Maximum Life |
| **Mana Influx** | — | — | — | 被动 +20 Mana、+95% Mana |
| **Royal Blood** | — | — | — | 被动 +10 Magic Find/+38%、+10 Gold Find/+38% |
| **True Vigor** | — | 7（持续 4） | — | Buff +100 Hit Rating、+38% Hit Rating |

## Ranger 游侠技能全表【官方】

数值为 **Lv.20** 口径（个别技能官方标 Lv.5）。两组武器精通 + 杂项共 27 个技能，技能等级上限 20。

### 弓精通组（Bow Mastery，10 个）

| 技能 | 类型 | 蓝/lvl | CD | 前置武器 | Lv.20 |
|---|---|---|---|---|---|
| Bow Mastery | 被动 | — | — | Slingshot/Short Bow/Recurve/Compound/Longbow | +43% Weapon Dmg、+24% Atk Speed |
| Crossbow Mastery | 被动 | — | — | Pistol/Recurve/Repeating/Compound Crossbow/Arbalest | +43% Weapon Dmg、+24% Armor Pen |
| Double Shot | Ranged(2段) | 2 | 3 | 弓/弩 | +60% Weapon Dmg |
| Splintering Shot | Ranged | 5 | 2 | 弓/弩 | +10 Bleed、+125% Bleed、+72% 致流血 |
| Poison Shot | Ranged | 5 | 2 | 弓/弩 | +10 Poison、+125% Poison、+72% 感染 |
| Bodkin Arrow | Ranged | 5 | 5 | 弓/弩 | +134% Weapon Dmg、+72% 眩晕 |
| Rapid Fire | Ranged(3段) | 10 | 4 | 弓/弩 | +40% Weapon Dmg、+115% Atk Speed |
| Pin Down | Ranged | 10 | 4 | 弓/弩 | +144% Weapon Dmg、+115% Root、+115% 感染 |
| Sharp Arrow | Ranged | 5 | 3 | 弓/弩 | +67% Weapon Dmg、+58% 致流血、+24% Crit Strike |
| Arrow Barrage | Ranged(5段) | 25 | 12 | 弓/弩 | +5 Strikes、+10 Weapon Dmg、+152% Weapon Dmg |

### 匕首精通组（Dagger Mastery，9 个）

| 技能 | 类型 | 蓝/lvl | CD | 前置武器 | Lv.20 |
|---|---|---|---|---|---|
| Dagger Mastery | 被动 | — | — | Shiv/Dirk/Kris Dagger | +43% Weapon Dmg、+10% 致流血 |
| Double Dagger Throw | Ranged(2段) | 2 | 3 | 匕首 | +20 Weapon Dmg、+152% Weapon Dmg、+20 Atk Speed、+95% Atk Speed |
| Jagged Dagger Throw | Ranged | 5 | 3 | 匕首 | +20 Weapon Dmg、+152% Weapon Dmg、+10 Bleed、+57% Bleed、+67% 致流血 |
| Poison Dagger Throw | Ranged | 5 | 3 | 匕首 | +20 Weapon Dmg、+152% Weapon Dmg、+10 Poison、+57% Poison、+67% 感染 |
| Boomerang Dagger | Ranged | 5 | 5 | 匕首 | +134% Weapon Dmg、+72% 眩晕 |
| Back Stab | Attack | — | 3 | 匕首 | +120% Weapon Dmg、+77% Crit Chance |
| Knee Cutter | Attack | 10 | 4 | 匕首 | +163% Weapon Dmg、+115% Root、+115% 致流血 |
| Throat Cutter | Attack | 5 | 3 | 匕首 | +105% Weapon Dmg、+20% 致流血、+72% 沉默、+57% Bleed |
| Serpentine Strike | Attack(2段) | 25 | 12 | 匕首 | +153% Weapon Dmg、+20 Crit Chance、+95% Crit Chance、+315% Poison、+100% 感染 |

### 杂项组（Misc，8 个）

| 技能 | 类型 | 蓝/lvl | CD | 限制 | Lv.20 |
|---|---|---|---|---|---|
| Bandage | AoE | 25 | 7 | — | +2000 Healing |
| Improved Sight | 被动 | — | — | — | +86% Hit Rating、+24% Crit Strike |
| Improved Reflexes | 被动 | — | — | — | +67% Evasion |
| Animal Hunter | 被动 | — | — | — | +40% 对动物伤害 |
| Bounty Hunter | 被动 | — | — | — | +40% 对人形伤害 |
| Hawk Attack | Spell(2段) | 20 | 15 | **Light** 阵营 | +20 Light、+190% Light、+100% 致盲、+43% 致流血 |
| Crow Attack | Spell(2段) | 20 | 15 | **Dark** 阵营 | +20 Dark、+190% Dark、+100% 致恐惧、+43% 致流血 |
| Natural Resistance | 被动 | — | — | 官方标 **Lv.5** | +20 Base Resist、+4% Base Resist（每级 +1%） |

> Ranger 定位：**Dexterity（命中/暴击）+ Agility（闪避/攻速）**，武器为弓/弩/飞刀；
> 专属生活技能 Cartography / Cooking / Hunting / Leatherworking / **Carpentry**。

## 其它职业的技能树

6 个职业的技能数（EA 版）：**Archmage 27、Berserker 30、Druid 27、Ranger 27、Rogue 29、Zealot 29**。
其余职业的完整技能表可在游戏内**职业页**（帮助文档的职业条目）查看，含名称 / 类型 / 蓝耗 / CD / 前置武器 / 打击数 / 阵营 + Lv.20 数值。

## 相关

- [职业总览](/norr-wiki/classes/)
- [角色属性](/norr-wiki/combat/attributes/)
- [技能天赋模拟器（旧版）](/norr-wiki/tools/talent/)

## 资料来源

- 官方帮助文档：各职业页、Skillbook、Alignment。
- 游戏内实测（EA 版）：技能解锁与等级上限。