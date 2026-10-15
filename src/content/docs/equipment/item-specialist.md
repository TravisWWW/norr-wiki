---
title: 物品专家：精炼/镶嵌/重铸
description: Item Specialist 的六个功能、规则与配套商店。
gameVersion: "1.0"
verifiedDate: 2026-10-15
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（Refining Items / Max Sockets / Item Specialist / Jewel Stats / Item Stats）
  - type: observed
    reference: 游戏内实测
---

## 位置

- **Elundi（Lv10 城）** 有 Item Specialist。官方写「Items can be refined at the Item Specialist in almost any City」，
  但 **El Caspar 没有**，所以要精炼 / 镶嵌 / 开孔需前往 Elundi（或其它大城）。
- 到 Elundi 的方式：Waygate（消耗 **Spirit Essence**）。Spirit Essence 来源：日常任务奖励、拆解装备、许愿井。

## 六个功能

| 功能 | 作用 |
|---|---|
| **Refine Items**（精炼） | 提升最大耐久 + 护甲 Defense / 武器 Damage |
| **Upgrade Rarity**（升稀有度） | 提升稀有度，增加属性条数 |
| **Jewel Imbuing**（镶嵌宝石） | 给已开孔装备镶嵌宝石 |
| **Jewel Extraction**（取回宝石） | 取回已镶嵌的宝石 |
| **Reroll Attributes**（重铸词条） | 重 roll 装备词条 |
| **Unlock Sockets**（开孔） | 给装备开孔 |

## Refine（精炼）

- 规则【官方，2026-10-14 帮助页重新核对】：提升**最大耐久 + 护甲 Defense / 武器 Damage**；**Quality 上限 200**；帮助页明确写出 **Quality 32 起可能损毁**，并建议持有 Safety Charm。
- **成功率随 Quality 递减**（面板直接给出）。历史 EA 面板记录曾在 Q31 起出现约 1% 碎裂率，与帮助页阈值有口径差异；本次没有进行精炼实验，不能据此保证某个 Quality 区间安全，操作前以当次面板概率为准。
- **成本按物品价值**，实测 5~100 币/次。
- 效果：武器每点 Quality ≈ +1.5 Damage，同时最大耐久上升。
- **两种失败必须区分**：① **未提升**（Quality 不变，只损失本次金币，无其它代价）；② **碎裂**（装备损毁）。
  是否使用 **Safety Charm** 应结合当次碎裂率与装备价值决定，不把历史单次概率当作永久固定值。

![EA Refining Items 帮助中的精炼规则与品质范围表](/norr-wiki/img/research/2026-10-14/refining.png)

*2026-10-14 官方帮助截图；帮助规则与实际面板仍应分别核对。*

## 其它功能

### Upgrade Rarity（升稀有度）

- 面板显示当前稀有度与成功率，执行后按成功率升稀有度。
- 官方：升稀有度会**增加物品的属性条数**；建议带 Safety Charm。
- 稀有度顺序：`Magic < Rare < Epic < Mystical < Ascended < Legendary < Relic`。

### Jewel Imbuing（镶嵌）

- 选装备 + 选宝石，面板显示成功率；**每个 Lucky Charm +10%**（最多 5 个 = 100%）。
- 宝石分组：`Physical / Caster / Utility / Hit / Sustain / Protection / Swift`，每组可选 3 个词条。
- 需要**已开孔的装备**。

### Jewel Extraction（取回宝石）

- 三种 Extractor：**No Extractor（0% 保住）**、**Jewel Extractor（60%）**、**Golden Jewel Extractor（100%）**。
- 取回失败则宝石损毁。

### Unlock Sockets（开孔）

- 面板显示成功率与碎裂率。
- **需要 Socketing Hammer**（由 Toolsmithing 制作，或市场购买）。
- 每件装备的**最大孔数**见[鉴定与装备](/norr-wiki/equipment/identify/)。

### Reroll Attributes（重铸词条）

- 消耗 **Reroll Dice（与物品 Tier 相同）**。
- 流程：先预览新词条 → **确认后才锁定**（不满意可以放弃）。
- 官方：重铸时**有几率额外开一个孔**。

## 稀有度 → Quality 区间【官方】

| 稀有度 | Min Quality | Max Quality |
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

## 配套商店

### Laurel Market（Elundi）

物品专家的消耗品在这里买，货币是 **Golden Laurels**（日常任务 / 成就奖励）。

| 商品 | 价格（Laurels） |
|---|---|
| Safety Charm（防碎裂） | 90 |
| Lucky Charm（镶嵌 +10%） | 25 |
| Copper Key | 40 |
| Rarity Token (Tier 1) | 5 |
| Reroll Dice (Tier 1) | 5 |
| Copper Socketing Hammer | 50 |

面板顶部显示 **Achievement Lvl** —— **成就等级解锁更高档商品**。

### Event Gate（Sacred Wilds）

- 需要**累计上交 100 个 Fragment** 才能开启事件。
- 开启后是 20 分钟窗口：战斗或大厅采集，**总分 ≥ 500 才有奖励**。

## 实用结论

1. **El Caspar 没有 Item Specialist**，要精炼 / 镶嵌 / 开孔去 Elundi。
2. **精炼 Q30 及以下无碎裂风险**（纯金币投入）；**Q31 起有约 1% 碎裂率**，贵重装备务必带 Safety Charm。
3. **开孔要先买 Socketing Hammer**。
4. **重铸可以预览再决定**（不确认不生效）。
5. Spirit Essence 主要来自**日常任务**，所以每天做日常是维持传送开销的关键。

## 精炼与护符【1.0 官方 Wiki】

**精炼（Refining）**：在城市物品专家处精炼，提升**最大耐久**，护甲提升**防御**、武器提升**伤害**；**最高 Quality 100**；**Quality 16 起有几率碎裂**，建议携带 **Safety Charm**。

| 稀有度 | 最低 Quality | 最高 Quality |
|---|---|---|
| Normal | 1 | 30 |
| Magic | 1 | 35 |
| Rare | 5 | 40 |
| Epic | 10 | 45 |
| Mystical | 15 | 50 |
| Ascended | 20 | 60 |
| Legendary | 25 | 80 |
| Relic | 30 | 100 |
| Unique | 按 Tier | T1=40 / T3=50 / T5=80 / T6=100（可精炼，但不可升稀有度） |

**Lucky Charm**：镶嵌宝石时每个 **+10%** 成功率，单次最多用 **5 个**（5 个 = 100%）。
**Safety Charm**：**保护物品不被销毁**，销毁时由护符顶替；两者都来自敌人掉落与 Laurel Market。

## 余烬熔炉与升阶代币【1.0 官方 Wiki】

**Ember Forge（余烬熔炉）**：仅可用于**未 Exalted 的武器与护甲**，操作后物品**账号绑定**。
- **Upgrade Rarity**：把 Ascended / Legendary 升到下一稀有度；升到 Legendary / Relic 需要对应 **Token**；成功率 **100%**。
- **Perfect Reroll**：把所有词条重掷为**最大值**，消耗与普通重铸相同。
- **Exalt**：追加一条随机 **Exalted** 词条；Exalted 物品**永久锁定，不能重铸**。

**Legendary / Relic Upgrade Token**：Legendary Token 把 Ascended 升为 Legendary，Relic Token 把 Legendary 升为 Relic。来源：Overlord、Legendary 远征、Strongbox、商人（10 个碎片）。升级方式：**Ember Forge 100% 成功**，或 **Item Specialist** 从 25% 起、每次失败 +5% 直到 100%（每次尝试都消耗 Token）。

## 战利品强化 Trophy Enhancing【1.0 官方 Wiki】

- 在 Hunter **Artemas Fletcher** 处选 **Enhance**，用**精炼后的战利品材料**给装备附加一条**随机属性**。
- 每件装备同时只能有 **1 条** Trophy 强化；对已有强化的装备再次强化会**替换**旧词条；被强化的属性在 tooltip 上带**战利品图标**。
- **任何角色都能用，不需要 Hunting 专业。**

## 相关

- [鉴定与装备](/norr-wiki/equipment/identify/)
- [代币商店](/norr-wiki/systems/token-shops/)

## 资料来源

- 官方帮助文档：Refining Items、Max Sockets、Item Specialist、Jewel Stats、Item Stats。
- 游戏内实测（EA 版）：成功率、碎裂率、成本、配套商店价格。
