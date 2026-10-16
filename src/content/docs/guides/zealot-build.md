---
title: 狂热者配装攻略
description: Zealot 的属性、技能与技能栏配置思路（以官方 1.0 Wiki 为准）。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: "1.0-official"
sources:
  - type: official
    reference: 官方 1.0 Wiki 职业页 Zealot（p/141）、技能书（p/94）
    url: https://wiki.norroth.com/p/141/
    date: "2026-10-16"
---

## 定位

Zealot（狂热者）是**近战 + 法术混合**职业，**光明 / 黑暗双阵营互斥**。角色面板把 **Power / Spirit / Toughness** 标为 `RECOMMENDED`。

## 属性成长（1.0 官方 Wiki）

| 属性 | 初始 | 每级 |
|---|---|---|
| Power | 8 | +0.6 |
| Agility | 1 | +0.2 |
| Dexterity | 8 | +0.6 |
| Spirit | 7 | +1.45 |
| Toughness | 17 | +1.2 |
| Intellect | 13 | +0.7 |
| Wisdom | 6 | +0.25 |
| Luck | 0 | +0 |

> 除每级自动获得的属性外，你还可**自由分配 5 点属性点**。

## 属性加点思路

| 属性 | 收益 | 建议 |
|---|---|---|
| Power | +5 Physical Damage、+5 Critical Strike | 主加：`bright_strike` 等近战吃武器伤害 |
| Spirit | +25 Max Life、+15 Max Mana | 次加：血蓝续航 |
| Toughness | +5 Defense、+5 Fortitude | 次加：同时减物理伤害与敌方暴击 |
| Wisdom | +5 Armor Pen、+5 Base Resistance | 备选：破甲与全系抗性 |
| Dexterity | +5 Hit Rating、+5 Critical Chance | 备选：命中一旦成为瓶颈就补 |

**推荐顺序：Power（伤害）→ Spirit（血蓝）→ Toughness（减伤）→ 命中不够再补 Dexterity。** 属性点需付费洗点，**先测量再分配**。

## 技能加点思路（1.0）

- **技能上限为 10 级**（1.0 由 EA 的 20 级下调，但每级增量约为原来 2 倍，满级数值基本不变）。
- 优先**被动 + 低 CD 主动**：被动持续生效；CD 短的主动基本每回合都能触发。
- `bright_strike`（Sword Mastery）是核心主动技，每级都是纯伤害。
- `lighting_of_spirit` / `blade_mastery` 是被动，无蓝耗无 CD，最适合无人值守挂机。
- 长 CD 大招（`overwhelming_light`、`phalanx`）手动用，挂机收益低。
- 技能点可洗（Reset Skills）；技能实验成本较低。

## 技能分组（1.0）

Zealot 技能分组：**Sword Mastery / Hammer Mastery / Shield Mastery / Light Mastery / Dark Mastery / Spirit / Zeal**。

- 三系武器精通（剑 / 锤 / 盾）各有对应的被动与主动。
- **Light / Dark 互斥**：`lighting_of_spirit` 与 `darkening_of_spirit`、`overwhelming_light` 与 `overwhelming_dark` 等成对，只能走一线。
- **Spirit / Zeal** 为续航与增益组（`mana_influx`、`true_vigor`、`invigoration`、`royal_blood` 等）。

完整技能树见 [Zealot 职业页](/norr-wiki/classes/zealot/)。

## 装备与词条

| 阶段 | 武器 | 防具 | 词条优先 |
|---|---|---|---|
| 前期 Lv1–19 | 剑 / 锤（单手）+ 盾 | 金属重甲或皮甲 | Defense / 抗性 → Max Life |
| 中期 Lv20–39 | 铜/铁 剑锤 + 盾 | 对应档重甲 | 命中 / 暴击 / 破甲 |
| 后期 Lv40+ | 秘银 剑锤 + 盾 | 秘银重甲 | 先保减伤，再堆伤害 |

- Zealot 可用 **剑 / 锤 + 盾**；盾系技能（`smite` / `shield_bash` / `phalanx`）**必须装备盾**。
- 防具来源：**Armorsmithing 铸甲**（金属重甲，含盾），或市场 / 掉落。
- 词条取舍：**先保证 Defense / 抗性够用**，再堆 Power 相关词条；命中不足优先补 Hit Rating。
- 可制作装备见[制作配方图鉴](/norr-wiki/professions/crafting-catalog/?prof=armorsmithing)。

## 技能栏与自动战斗

- 开启**自动战斗（Auto Combat）**后，游戏会自动使用**战斗快捷栏**中的技能，并按优先级、生命、法力等因素选择最合适的技能或动作。
- 主攻技（`bright_strike`）放在快捷栏靠前位置。
- **把多个主动技放进快捷栏**能提高战斗能力（多一个技能 = 多一套伤害 / 冷却）。
- 技能提示（tooltip）右下角图标显示**冷却（⏳）/ 法力消耗（💧）/ 持续回合（♻️）**。

## 战斗日志里的常见字段

- `N Mana Used` = 该技能本次消耗的蓝。
- `N Mana Stolen / Gained / Regenerated` = 吸蓝（来自装备词条）+ 回蓝。
- `You missed the attack` = 本次未命中。
- `敌人名 took N Thorn Damage` = 荆棘反伤打到了敌人。

## 相关

- [技能系统](/norr-wiki/combat/skills/)
- [角色属性](/norr-wiki/combat/attributes/)
- [Zealot 狂热者](/norr-wiki/classes/zealot/)

## 资料来源

- 官方 1.0 Wiki：Zealot 职业页（/p/141）、技能书（/p/94），2026-10-16 抓取。