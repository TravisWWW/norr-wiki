---
title: 宠物系统
description: 动物狩猎、孵蛋与喂养（以官方 1.0 Wiki 为准）。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: "1.0-official"
sources:
  - type: official
    reference: 官方 1.0 Wiki 动物狩猎（p/157）、Petbreeding（p/132）、Feed Pet（p/198）
    url: https://wiki.norroth.com/p/157/
    date: "2026-10-16"
---

宠物来源有两条：**Animal Hunting（动物狩猎，战斗捕获）** 与 **Petbreeding（孵蛋）**。捕获 / 孵化得到的是**宠物物品**，装备后作为永久同伴。

## Animal Hunting（动物狩猎）【1.0 官方 Wiki】

在战斗中捕获可成为宠物的敌人（通常是 **Animals**），把它们变成永久同伴宠物。使用名为 **Cage（笼子）** 的特殊陷阱道具。

### 捕获条件（全部满足）

- 拥有 **Hunting** 专业。
- **Hunting 技能等级 ≥ 敌人等级**。
- **陷阱 Tier ≥ 敌人 Tier**。
- 敌人生命 **≤ 20%**。
- 敌人是**可捕获的动物（仅 Animals）**。
- 背包中有**陷阱道具（Cage）**。

### 操作

1. 与可成为宠物的敌人（通常是 Animal）战斗。
2. 把其生命降到 **20% 或以下**。
3. 在你的回合打开 **Use Item**，选择 **Trap（Cage）**。

条件满足则消耗陷阱并掷捕获判定：

- **成功**：获得一个**随机稀有度**的宠物物品；**不获得**正常战利品与经验。
- **失败**：陷阱消耗，动物逃跑消失；不获得宠物、战利品与经验。

### 捕获几率

```
50% + (10% × 陷阱 Tier) − (0.5% × 敌人等级)
```

- 陷阱 Tier 越高、敌人等级越低，越容易捕获。
- 捕获几率限制在 **5%~95%**。

### 宠物稀有度

由敌人**阶级（rank）**决定：

| 敌人阶级 | 可能的宠物稀有度 |
|---|---|
| Normal | Normal / Magic |
| Champion | Normal / Magic / Rare |
| Rare | Normal / Magic / Rare / Epic |
| Elite | Normal / Magic / Rare / Epic / Mystical |

## Petbreeding（孵蛋）【1.0 官方 Wiki】

把 **Pet Egg** 放进孵化槽 + 付金币，由 **Amelie Papillon** 孵化；队列最多 **3 个槽位**。

- **费用 = `tier² × 500` 金币**；**时间 = `tier²` 小时**：
  - T1 = **5 银 / 1 小时**；T4 = **80 银 / 16 小时**；T6 = **1 金 80 银 / 36 小时**。
- 孵化时显示宠物及其**稀有度**；**Hatchglow 事件期间**，稀有度与品质在**放蛋时**决定。
- **掉蛋怪**：Snake、Woodland Spider、Scorpion、Myconid、Cassowary、Bog Worm、Blood Queen、Hydra、Werebat、Rust Monster、Komodo Basilisk。

## Feed Pet（喂养）【1.0 官方 Wiki】

用背包里的 **Pet Food**，或在查看已装备宠物时按 **Feed**（必须先装备宠物）打开喂养窗口。

### Pet Food

- 饲料分不同 Tier，**按宠物等级自动选择**：Lv1-9 用 T1、Lv10-19 用 T2，依此类推。
- 可从 **Petbreeder 购买**或由 **Cooking** 制作。
- **公会宠物**不能用此系统喂养。

### Energy

- 宠物消耗 **Energy**，战斗后可能减少。
- 宠物**未满 Energy** 时，每块饲料回复 **150 Energy × 饲料 Tier**。
- **0 Energy** 的宠物**不再提供战斗加成**，直到再次喂养。
- 回能方式：喂养，或让宠物在自家庄园的 **Pet Shelter** 休息。

### Growth

- **Growth 提高宠物伤害与最大 Energy**。
- **仅在 Energy 已满时**才可能触发 Growth 提升。
- 每块饲料给**一次 +1 Growth 的机会**，成功率显示在窗口中，**Growth 越高成功率越低**。
- **最大 Growth 由稀有度决定**。
- 涨 Growth 时，最大 Energy 同时提高并**回满**。

### 日常目标

- 成功喂养计入 **Feed Your Pet** 日常目标，**每天喂一次**即可完成。

## 相关

- [生活技能总览](/norr-wiki/professions/overview/)
- [制作](/norr-wiki/professions/crafting/)

## 资料来源

- 官方 1.0 Wiki：动物狩猎（/p/157）、Petbreeding（/p/132）、Feed Pet（/p/198），2026-10-16 抓取。