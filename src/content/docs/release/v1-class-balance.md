---
title: 1.0 职业平衡
description: 1.0 通用战斗规则改动、各职业调整、敌人调整与历史迭代时间线。
gameVersion: "1.0"
verifiedDate: 2026-10-14
versionStatus: 1.0-announced
sources:
  - type: official
    reference: 官方 Discord #dev-blog（2026-05 ~ 2026-07）
    nature: 开发日志
    appliesTo: 1.0 测试服
    status: 已公布
---

> **资料状态**：以下为**测试期口径**，1.0 上线版本可能再调；本项目**未在 1.0 实测**。
> 系统机制见 [1.0 机制变更](/norr-wiki/release/v1-changes/)；各职业技能树见[职业与技能](/norr-wiki/classes/)。

## 1. 官方平衡方法论【2026-06-17】

职业平衡围绕以下维度进行：控制（CC）技能数量、多段 vs 单段技能、AoE 技能数量、主动 / 被动比例、冷却数量。

> 官方说明：因测试反馈不足，**部分职业在 1.0 上线后可能仍有较大 buff / nerf**。

## 2. 通用战斗规则

### 2.1 伤害与异常状态（Ailments）重做【2026-06-17】

伤害重新分配为 **即时伤害（instant）** 与 **异常 / DoT 伤害** 两部分：命中时先结算一部分，其余通过 Burn / Poison / Bleed 等异常触发。

| 元素 | 定位 |
|---|---|
| **Fire** | 即时与 DoT 大致均分 |
| **Poison** | 偏长时 DoT |
| **Bleed** | 全部伤害通过 Bleed 效果结算 |
| **Dark / Light / Chaos** | 更依赖异常而非爆发 |
| **Arcane / Cold / Lightning / Blunt** | 仍为**全额即时伤害**（其异常是状态效果而非 DoT） |

- Character 面板悬停伤害属性可查看：即时伤害 / DoT 伤害 / 异常几率与持续。
- 背景：Bleed Berserker 偏弱（Bleed 只在 Wounded 触发时生效）；Ranger 因物理 + Poison 过强。

### 2.2 通用数值改动

| 项 | 改动 |
|---|---|
| **Attack Speed** | Bonus Strikes 阈值 1400 → **1900**（上限先 4，后回退并**降为 3 额外打击**） |
| **Max Evasion** | 上限 **60% → 50%**（Rogue 满级被动可达 60%） |
| **Critical Chance** | 效果 **+33%** |
| **敌人暴击** | **-33%** |
| **Counter Strike** | **属性移除**，相关职业被动改写 |
| **Life Steal 公式** | `(LS ÷ 4) ÷ (LS ÷ 4 + 400 + 85×level)` → **`(LS ÷ 5) ÷ (LS ÷ 5 + 400 + 85×level)`** |
| **Blind** | **Boss 免疫** |
| **Flee（逃跑）** | 由固定约 80% 改为**按敌人等级与稀有度**计算；高等级 / Elite / Boss 更难逃 |
| **Bonus Strike 惩罚伤害** | 由第 1 回合后开始下降 → **第 2 回合后** |
| **Key 掉率** | **+300%**（0.50% → 2.00%） |
| **Ducats 价格** | Rush Merchant 5 → **10** |
| **Shadow Coins 堆叠** | 999 → **9999** |
| **Cassowary / Scorpion** | 类型改为 **Animal**（原 creature） |

## 3. 各职业改动

### Ranger 游侠
- **Hawk / Crow Attack**：Blind / Fear 由 100% 改为 **15% + 每级 +5%**；冷却 8 → **7**。
- **Bear Trap**：Stun → **Root**。
- **Poison Cloud Trap**：Stun + Blind → **Confuse**。
- **Pin Down**：改为 **Ranger** 类型（原 Direct），可多段打击并使用**物理伤害**。
- **Natural Resistance**：改归属（更适合 Ranger / Druid）。

### Berserker 狂战士
- **冷却缩减**：Enchanted / Sinister Axes 4→3、Hemorrhaging Swing 6→5；Maces 4→3、Enveloping Blow 6→5；Blades 4→3、Perforating Strike 6→5。
- **Frenzy Focus**：每级 Counter Strike → **+0.2 额外打击**；新增每级 **turns +0.1**。
- **Ancestral Transformation**：每级 Counter Strike → **+5% arcane_damage +5% lightning_damage**；新增 **turns +0.2**。
- **Stunning Blow**：`+8% Stun` → **`+2% Stun`**（每级）。
- **Blood Rage**：`+5% Life Steal` → **`+4%`**（因珠宝新增 Life Steal）。

### Zealot 狂热者
- **Lightning / Darkening of Spirit**：`+8% Light/Dark Damage` → **`+15 Light/Dark Damage, +6% Light/Dark Damage`**（每级）。
- **Overwhelming Light / Dark**：`+8%` → **`+20 Light/Dark Damage, +7%`**（每级）。
- **Blinding / Fearing Touch**：`+24% Light/Dark +4% Fear` → **`+15% Light/Dark +5% Fear`**；`+25% +10% Blind/Fear` → **`+20% +5% Radiant/Defile`**（每级）。

### Druid 德鲁伊
- **Owl Peck**：新增 **+2% Blind**（每级）。
- **Brute Maul**：新增 **+4% Blunt Damage**（每级）。
- **Lacerate**：`+38% Base Damage` → **`+40%`**。
- **Nature's Fury**：Thorn Damage 修复（现**单独结算**，不再混入物理伤害）。
- **Claw Strike**：加入攻击栏，可手动使用。

### Rogue 盗贼
- **Nimble Guard**：`+3% Fortitude` → **`+10 Fortitude, +4% Fortitude`**。
- **Thief's Fortune**：buff 到 **20**（原 10），每级 **+5%**（原 +2%）。
- **Light 路线**：可在不点 Tar Bomb 的情况下学习 **Defortification**；Light 阵营可学 fortification 技能（修复）。
- **Execute**：显示问题修复。

### Archmage 法师
- **Magic Orb**：改为以 **Weapon Damage + Magic Damage** 为基数。
- 元素技能显示（元素 / 魔法伤害拆分）修复。

## 4. 敌人 / Boss 调整

### Drahzul（敌人）
- **Ember Chain**：`100% Fire Damage` → **`90%`**。
- **Smoldering Hammer**：`20% Silence` → **`10%`**。
- **Anvil of Ruin**：`65% Base Damage` → **`50%`**。

## 5. 历史迭代时间线

<details>
<summary>展开逐条时间线（2026-05 ~ 2026-07）</summary>

| 日期 | 改动 |
|---|---|
| 2026-05-29 | Open Playtest part 1：Druid Claw Strike 入栏；Ranger Pin Down 改类型；Archmage Magic Orb 基数 |
| 2026-06-01 | part 2：Key 掉率 +300%；Cassowary / Scorpion→Animal；Shadow Coins 9999；Ducats 10；Rogue 强化与修复 |
| 2026-06-08 | part 3：大量 bug 修复（远征 / 深渊塔 / 制作队列 / 珠宝 / 银行 / 掉率） |
| 2026-06-11 | **自动战斗重做**（impact-score）；敌人整体略削弱 |
| 2026-06-15 | 队伍加成条件（同图 + 等级差 ≤10）；副本入场重生门槛 |
| 2026-06-17 | **Flee 重平衡**；**伤害与异常重做**（元素定位） |
| 2026-06-18 | Ranger：Hawk / Crow、Bear Trap(Root)、Poison Cloud Trap(Confuse) |
| 2026-07-11 | Natural Resistance 归属；**Berserker 冷却缩减** |
| 2026-07-21 | Nature's Fury Thorn Damage 修复 |
| 2026-07-22 | **Berserker 修复**（Frenzy Focus / Ancestral Transformation / Stunning Blow） |
| 2026-07-26 | Attack Speed（阈值 1900，上限 4）；**Max Evasion 50%** |
| 2026-07-27 | **Zealot 数值调整**；**Blind 对 Boss 免疫**；Attack Speed 回退（上限 3）；**Drahzul**；**Druid**；**Critical Chance +33%**；Rogue Nimble Guard |
| 2026-07-28 | **敌人暴击 -33%**；珠宝分组重做 |
| 2026-07-29 | **Life Steal**（Blood Rage +4%；公式 ÷5） |
| 2026-07-30 | Bonus Strike 惩罚伤害改到第 2 回合后 |

> **注意**：Attack Speed 的额外打击上限曾**先调为 4 再回退为 3**，上表按**最新有效结论**（上限 3）表述。

</details>

## 存疑

- 上述数值均为**测试服口径**，1.0 上线后可能再调；**未在 1.0 实测**。
- 各职业完整技能树与最终数值需以 1.0 游戏内 tooltip / 帮助文件（171 页）为准。

## 相关

- [1.0 机制变更](/norr-wiki/release/v1-changes/)
- [战斗机制](/norr-wiki/combat/mechanics/)
- [角色属性](/norr-wiki/combat/attributes/)

## 资料来源

- 官方 Discord：`#🔧dev-blog`（2026-05 ~ 2026-07 逐条）、`#🔔game-updates`。
