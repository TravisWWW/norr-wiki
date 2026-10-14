---
title: 属性公式与数值计算
description: 官方每点收益、派生属性的百分比曲线与等级依赖。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（Attributes & Stats）
  - type: observed
    reference: 游戏内实测（换装对比拟合）
---

> 本页回答「各项属性到底怎么算」。分三层：① 官方帮助文档的每点收益（权威）；
> ② 派生属性的**数值 → 百分比**换算曲线（EA 版实测拟合）；③ 已确认的数值规则。

## 1. 官方口径：每 1 点属性给什么【官方】

| 属性 | 每点收益 |
|---|---|
| **Power** | +5 Base Damage、+5 Critical Strike |
| **Agility** | +5 Evasion、+5 Attack Speed |
| **Dexterity** | +5 Hit Rating、+5 Critical Chance |
| **Spirit** | +25 Maximum Life、+15 Maximum Mana |
| **Toughness** | +5 Defense、+5 Fortitude |
| **Intellect** | +5 Spell Damage、+5 Critical Cast |
| **Wisdom** | +5 Armor Penetration、+5 全元素抗性 |
| **Luck** | +2 Magic Find、+2 Gold Find |

> 官方只写「每点给 5 点某属性」，**不写「5 点某属性 = 百分之几」**；下面的百分比曲线来自 EA 版实测。

## 2. 派生属性的百分比曲线

游戏内的详细属性面板会把每个派生属性的**数值**与**实际百分比效果**一并列出，且百分比是
「against level N enemies」（相对你的等级）。据此拟合出统一曲线：

```
% = 130 · r / ( r + K · L )        # L = 敌人等级（= 你的等级），r = 属性数值
```

**实测常数**（EA 版）：

| 属性 | K | 说明 |
|---|---|---|
| Defense / 全抗性 / Fortitude / Critical Chance / Attack Speed | **≈ 40** | 共用一条曲线 |
| Critical Strike | ≈ 30 | 暴击伤害族 |
| Hit Rating | ≈ 13.3 | 命中率另有一套算法 |
| Evasion / Armor Penetration | **≈ 100** | 共用一条曲线 |
| Mana Steal | ≈ 160 | |

- 公式在 **130%** 处渐近，但这只是**拟合公式的数学性质**，**不等于游戏设置了 130% 硬上限**；
  官方仅明确 **Evasion 上限 60%**，其余属性的真实上限未公布。
- **升级会稀释同样的属性数值**：所有百分比都是「对同等级敌人」，等级越高，同样百分比需要的属性越多（`r ∝ L`）。
- 反推：达到目标百分比 p 所需属性 `r = K·L·p / (130 − p)`。

> **验证边界**：第 2 节的百分比曲线为 **EA 版实测拟合**（样本：Zealot 角色换装对比，Lv1–19），
> 常数 K 为近似值（约 ±10% 量级误差），**仅适用于 EA 版本**；1.0 上线后需重新拟合。

## 3. Magic Find / Gold Find

| 属性 | 面板 |
|---|---|
| Magic Find 0 | 90.91% |
| Magic Find 17 | 106.36% |
| Gold Find 0 | 9.09% |

→ 线性：`MagicFind% ≈ (100 + MF) / 1.1`，`GoldFind% ≈ (GF + 10) / 1.1`，**与等级无关**。

> 【存疑】实测 Magic Find / Gold Find 在某一等级段后**减半**，疑似按等级段（Tier）分档，规则未明。

## 4. 其它已确认的数值规则【官方】

| 规则 | 内容 |
|---|---|
| **Critical Strike** | 最低 +20%（`1.2x CRIT!`），最高 +100%（`2x CRIT!`） |
| **Evasion** | 默认**上限 60%**；闪避成功则本次伤害**全部**免除 |
| **Fortitude** | 抵消 `Critical Strike` / `Critical Chance` / `Blunt Damage` |
| **Armor Penetration** | 近战/远程无视 `Defense`、法术无视 `Resistance`；**DoT 不吃破甲** |
| **Defense** | 减「破甲之后」的物理/流血伤害 |
| **Thorn Damage** | 把总荆棘的 **30%** 以真伤反给攻击者，**仅近战、且防守方未闪避时** |
| **Spell Damage** | 多元素法术时**平均分摊**到各元素 |
| **Life Regeneration** | 每回合回血 `= round(值 / 10)`，脱战 `= 每回合 / 6` 每秒 |
| **Mana Steal / Life Steal** | 按造成伤害的百分比吸取，且有「每回合不超过 Max Mana/Life 的 X%」上限 |
| **Resilience** | 只减 Life Steal / Mana Steal / Silence / Fear，**不减 Root / Stun** |
| **Block Chance / Block Rating** | 只有物理攻击和法术能被格挡；AoE/Buff/Debuff/DoT 不可格挡 |

### Attack Speed 的真实含义

属性面板的 tooltip 显示 Attack Speed 是 **「先手率」**：`X% chance of Striking First` + `Adds N Bonus Strikes`。
额外的打击段数（Bonus Strikes）来自**装备词条**，**不是**从 Attack Speed 堆出来的。
因此换装时通常不优先为 Attack Speed 牺牲 Defense。

### Attack Speed → 额外打击数【社区，未独立验证】

```
额外打击数 = (AttackSpeed − 100) / (800 − 等级 × 5)      # 上限 3
```

> 该公式来自社区资料，**1.0 待验证**；正式版上线前不宜据此做精确预算。

## 5. 怎么用（结论）

1. **以百分比为准，而非仅看数值**：详细属性面板直接给出「这个属性现在等于多少 %」。
2. **堆减伤要算边际**：Defense/抗性 200 点 ≈ 50%，274 点 ≈ 60%，374 点 ≈ 70%——越往后越贵。
3. **等级会稀释**：升级后同样的属性数值，百分比会下降。
4. **面板是权威**：帮助文档只给「每点给 5 点」，真正的「5 点 = 几 %」只有面板有。

## 相关

- [角色属性](/norr-wiki/combat/attributes/)
- [战斗机制](/norr-wiki/combat/mechanics/)

## 资料来源

- 官方帮助文档：Attributes & Stats。
- 游戏内实测（EA 版）：派生属性百分比曲线、等级依赖、Magic/Gold Find。