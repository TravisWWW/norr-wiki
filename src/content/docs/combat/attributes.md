---
title: 角色属性
description: 八项属性每点收益、六职业每级成长、技能点上限与加点规则。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: "1.0-official"
sources:
  - type: official
    reference: 官方 1.0 Wiki（属性与数值 / 各职业页）
    url: https://wiki.norroth.com/p/6/
    date: "2026-10-16"
---

## 八项属性与每点收益【官方】

| 属性 | 每点收益 | 定位 |
|---|---|---|
| **Power** | +5 Physical Damage、+5 Critical Strike | 近战/远程伤害主属性 |
| **Agility** | +5 Evasion、+5 Attack Speed | 闪避 + 先手/额外打击 |
| **Dexterity** | +5 Hit Rating、+5 Critical Chance | 命中 + 暴击率 |
| **Spirit** | +25 Maximum Life、+15 Maximum Mana | 血 + 蓝 |
| **Toughness** | +5 Defense、+5 Fortitude | 物理减伤 + 抗暴击/抗钝击 |
| **Intellect** | +5 Spell Damage、+5 Critical Strike | 法伤 + 法术暴击 |
| **Wisdom** | +5 Armor Penetration、+5 全元素抗性 | 破甲 + 抗性 |
| **Luck** | +5 Magic Find、+5 Gold Find | 掉落品质 + 金币 |

### 关键联动

- **Fortitude** 抵消 `Critical Strike` / `Critical Chance` / `Blunt Damage`。
- **Critical Strike** 最低 +20%（日志显示 `1.2x CRIT!`），最高 +100%（`2x CRIT!`）。
- **Evasion** 默认上限 **60%**；闪避成功则本次伤害**全部**免除。
- **Maximum Life** 是平坦值，会被装备/被动的「+X% Maximum Life」放大 → Spirit 与百分比生命是**乘法**关系。
- **Armor Penetration**：让近战/远程无视 `Defense`、法术无视 `Resistance`；**DoT 不吃破甲**。
- **Defense** 减的是「破甲之后」的物理/流血伤害。
- **Thorn Damage**：把总荆棘值的 **30%** 以真伤反给攻击者，**仅近战、且防守方未闪避时**。
- **Spell Damage** 遇到多元素法术时**平均分摊**，再各自加到对应元素上。
- **Life Regeneration**：每点每 5 秒回 0.1 血（战斗外）/ 每回合 0.1 血（战斗中）。
- **Resilience** 只减 Life Steal / Mana Steal / **Silence / Fear**，**不减 Root / Stun**。

### 属性 tooltip 的读法【官方】

- 属性 tooltip **行末的 `(x%)`** 表示**命中该属性的概率**（不是数值加成）。例如某词条写作 `+5 Fire Damage (30%)`，指有 30% 概率命中该属性。
- **伤害加成只放大对应类型的技能**：`+ Fire Damage` **只作用于火系技能**，`+ Bleed Damage` **只作用于会造成 Bleed 的技能**——不是通用增伤。

## 六职业每级成长【1.0 官方 Wiki 职业页】

每级自动获得的属性（`基础值 + 每级增量`），**此外每级还有 5 点自由属性点**。

| 属性 | Archmage 法师 | Berserker 狂战 | Druid 德鲁伊 | Ranger 游侠 | Rogue 盗贼 | **Zealot 狂热者** |
|---|---|---|---|---|---|---|
| Power | 4 + 0.2 | 17 + 1.2 | 10 + 0.75 | 11 + 0.6 | 9 + 0.5 | 8 + 0.6 |
| Agility | 8 + 0.5 | 9 + 0.6 | 0 | 9 + 0.5 | 17 + 1.2 | 1 + 0.2 |
| Dexterity | 7 + 0.45 | 13 + 0.8 | 10 + 0.5 | 14 + 1.2 | 13 + 0.8 | 8 + 0.6 |
| Spirit | 4 + 1.25 | 5 + 1.35 | 10 + 1.75 | 3 + 1.4 | 5 + 1.2 | 7 + 1.45 |
| Toughness | 1 + 0.2 | 8 + 0.5 | 10 + 0.5 | 3 + 0.2 | 3 + 0.2 | **17 + 1.2** |
| Intellect | **17 + 1.2** | 2 + 0.2 | 10 + 0.75 | 11 + 0.6 | 3 + 0.3 | 13 + 0.7 |
| Wisdom | 13 + 0.7 | 5 + 0.25 | 10 + 0.75 | 9 + 0.5 | 5 + 0.3 | 6 + 0.25 |
| Luck | 6 + 0.5 | 1 + 0.1 | 0 | 0 | 5 + 0.5 | 0 |
| 职业定位 | 法系（Int/Wis） | 纯物理（Power） | 全能肉奶 | 命中/闪避（Dex/Agi） | 闪避/攻速（Agi/Dex） | **坦克 + 混合（Tough/Int）** |

- **每级 5 点自由属性点**：Lv.50 约 49×5 = **245 点**可自由分配。
- 上表为 **1.0 官方 Wiki 职业页**数值（已按官方页面核对，取代 EA 期的近似值）。
- **取整规则**：表中 `基础值 + 每级增量` 为小数，实际面板按**整数**累计取整，逐级累加后与理论值可能有 ±1~2 的差；跨多级推算时**以游戏内面板为准**。
- **推荐属性 ≠ 最佳配点**：面板上的 `RECOMMENDED` 只是官方给的**倾向提示**，不代表该属性一定最优；实际配点取决于玩法与装备。
- Zealot 的角色面板会把 **Power / Spirit / Toughness** 标成 `RECOMMENDED`。

## 加点规则

- **技能等级上限 = 10**（1.0 客户端硬上限）；**属性点一次可加多点**，技能逐级点。
- 属性点与技能点洗点都收费、价格动态、**第一次免费**；Noble 订阅可让洗点**便宜 20%**（见[洗点](/norr-wiki/combat/respec/)）。

## 派生属性公式【1.0 官方】

各项派生属性的「数值 → 百分比」换算，官方 1.0 Wiki 已给出完整公式，见[属性公式与数值计算](/norr-wiki/combat/formulas/)。要点：

- 绝大多数属性共用 `属性 ÷ (属性 + 485 × 等级)` 形式的曲线（Defense、抗性、刚毅、抵抗力、暴击几率/伤害等）。
- **Evasion** 与 **Armor Penetration** 用 `(属性 ÷ 2.5) ÷ (属性 ÷ 2.5 + 485 × 等级)`。
- **Hit Rating** 用 `(命中 × 4) ÷ (命中 × 4 + 485 × 敌人等级) × 2`（下限 5%、上限 100%）。

## 相关

- [属性公式与数值计算](/norr-wiki/combat/formulas/)
- [技能系统](/norr-wiki/combat/skills/)
- [洗点](/norr-wiki/combat/respec/)

## 资料来源

- 官方 1.0 Wiki：属性与数值（/p/6）、各职业页（/p/136~141），2026-10-16 抓取。