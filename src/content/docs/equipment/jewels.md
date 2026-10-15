---
title: 宝石与镶嵌
description: 珠宝分组（EA 3 组 / 1.0 6 组）、镶嵌与孔位、珠宝灌注与提取。
gameVersion: "mixed"
verifiedDate: 2026-10-15
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（Jewel Stats / Max Sockets）
  - type: official
    reference: 官方 Discord #dev-blog（1.0 珠宝重做）
---

> **资料状态**：分组与灌注为 **1.0 已公布**；孔位与镶嵌基础规则为 **EA 实测**。

## 珠宝分组

**EA（Legacy）**：**3 组**，每组 7 属性。

| 组 | 定位 |
|---|---|
| Defensive | 防御 |
| Offensive | 进攻 |
| Utility | 辅助 |

**1.0（已公布）**：改为 **6 个子组、每组 5 属性**，另有一个 core-group：

| 子组 | 定位 |
|---|---|
| **Power** | 进攻 |
| **Precision** | 进攻 |
| **Siphon** | 防御 |
| **Bulwark** | 防御 |
| **Aegis** | 防御 |
| **Fortune** | 辅助 |

- 目的：让**同组堆叠更易出现**，珠宝制作更有价值。
- **新增 Life Steal** 到珠宝 → 相应下调 Berserker Blood Rage 与 Life Steal 公式（见[1.0 职业平衡](/norr-wiki/release/v1-class-balance/)）。
- 测试期**所有旧珠宝已移除**；可在 Build Tester NPC 免费生成。

> **EA 提示**：Legacy Jewels 若**未设置 Stat Class**，只给该宝石颜色的 **2 个属性**；需设置 Stat Class 才有更广属性范围。

## 孔位与镶嵌

**最大插槽数【官方】**

| 部位 | 孔位 | 部位 | 孔位 |
|---|---|---|---|
| 腰带 | 2 | 盾 | 无 |
| 靴子 | 2 | 双手武器 | 3 |
| 胸甲 | 3 | 单手武器 | 2 |
| 手套 | 2 | 戒指 | 1 |
| 头盔 | 2 | 项链 | 1 |
| 护腿 | 2 | 耳环 | 1 |

**相关道具【官方】**

- **Lucky Charm**：每次 **+10% 镶嵌成功率**，最多 5 个 / 次 = 100%。
- **Safety Charm**：保装备不碎。
- **Jewel Extractor**：副本 Lootbox 可能产出，用于提取宝石。

## 珠宝灌注（Jewel Imbuing）【1.0 已公布】

- 图标为**绿色箭头**。
- **装备需有已解锁孔位**才能灌注：先在 **Item Specialist → Unlock Sockets** 解锁。
- 与[物品专家](/norr-wiki/equipment/item-specialist/)的精炼 / 镶嵌 / 重铸并列。

## 宝石分组与稀有度【1.0 官方 Wiki】

制作宝石时可选择一个**分组**，在宝石自身加成（元素伤害 / 抗性）之外追加一组固定属性；**宝石分组必须与物品类型匹配**才能镶嵌。

| 分组 | 类型 | 追加属性 |
|---|---|---|
| Power | 进攻 | 物理 / 魔法 / 钝击 / 流血 / 元素伤害 |
| Precision | 进攻 | 攻速 / 命中 / 暴击几率 / 暴击伤害 / 元素伤害 |
| Siphon | 进攻 | 破甲 / 生命偷取 / 法力偷取 / 生命回复 / 元素伤害 |
| Bulwark | 防御 | 防御 / 生命 / 刚毅 / 韧性 / 元素抗性 |
| Aegis | 防御 | 法力 / 闪避 / 格挡值 / 荆棘 / 元素抗性 |
| Fortune | 功能 | 最大耐久 / 法力回复 / 寻宝率 / 淘金率 / 元素抗性 |

| 物品类型 | 进攻 | 防御 | 功能 |
|---|---|---|---|
| 武器 | ✔ | ✘ | ✘ |
| 护甲 | ✘ | ✔ | ✔ |
| 首饰 | ✔ | ✔ | ✔ |
| 宠物 | ✔ | ✔ | ✔ |

**最大稀有度**：制作最多到 **Mystical**，掉落 / 容器最多到 **Ascended**，且不超过该 Tier 上限。每 Tier 上限：Lv1 Rare(2 词条)、Lv10 Epic(3)、Lv20 Mystical(4)、Lv30+ Mystical/Ascended(5)。普通宝石每个词条 roll 50%~100%，**独特宝石**总是满值。
**Infusion Stones（灌注石）**：存放在 Currency Pouch，可在 Infusions 窗口换成 **Teleport Charges** 或 **Spirit Essence**；来源包括精英 / 稀有 / 冠军 / Boss 的保底特殊掉落与普通怪的小概率掉落。

## 相关

- [鉴定与装备](/norr-wiki/equipment/identify/)
- [物品专家：精炼/镶嵌/重铸](/norr-wiki/equipment/item-specialist/)
- [1.0 机制变更](/norr-wiki/release/v1-changes/)

## 资料来源

- 官方 1.0 Wiki（wiki.norroth.com），2026-10-15 抓取。

- 官方帮助文档：Jewel Stats、Max Sockets。
- 官方 Discord：`#🔧dev-blog`（1.0 珠宝重做）。
