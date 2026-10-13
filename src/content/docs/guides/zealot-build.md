---
title: 狂热者配装攻略
description: Zealot 的属性、技能与技能栏配置思路。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（Zealot 职业页 / 自动战斗）
  - type: observed
    reference: 游戏内实测
---

## 定位

Zealot（狂热者）是**近战 + 法术混合**职业，**光明 / 黑暗双阵营互斥**。
角色面板把 **Power / Spirit / Toughness** 标为 `RECOMMENDED`。

## 属性加点思路

| 属性 | 收益 | 建议 |
|---|---|---|
| Power | +5 Base Damage、+5 Critical Strike | 主加：`Bright Strike` 是 Attack，吃 Weapon Damage |
| Spirit | +25 Max Life、+15 Max Mana | 次加：血蓝续航 |
| Toughness | +5 Defense、+5 Fortitude | 次加：同时减物理伤害与敌方暴击 |
| Dexterity | +5 Hit Rating、+5 Critical Chance | 备选：命中一旦成为瓶颈就补 |

**推荐顺序：Power（伤害）→ Spirit（血蓝）→ Toughness（减伤）→ 命中不够再补 Dexterity。**
属性点需付费洗点，**先测量再分配**。

## 技能加点思路

- 优先**被动 + 低 CD 主动**：被动持续生效；CD 短的主动基本每回合都能触发。
- `Bright Strike` 是核心主动技（Attack、CD 2），每级都是纯伤害。
- `Lighting Of Spirit` / `Blade Mastery` 是被动，无蓝耗无 CD，最适合无人值守挂机。
- 长 CD 大招（`Overwhelming Light` CD9、`Phalanx` CD6）手动用，挂机收益低。
- 技能点可**免费重洗**，技能实验成本较低。

## 技能栏与自动战斗

- **自动战斗只读技能栏第 2–5 格**；第 1 格是写死的普通攻击，改不了。
- 主攻技（`Bright Strike`）放在**第 2 格**。
- 服务器会挑「冷却已好」的技能施放，所以**把多个主动技放进槽位 2-5**能提高战斗能力
  （多一个技能 = 多一套伤害 / 冷却）。
- 技能 tooltip 里有 **`Added with next Level:`** 一行，直接告诉你下一级的增量——**加点前先看这一行**。

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

- 官方帮助文档：Zealot 职业页、自动战斗。
- 游戏内实测（EA 版）：加点效果、技能栏轮换。