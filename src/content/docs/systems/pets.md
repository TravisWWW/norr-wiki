---
title: 宠物系统
description: 宠物总览、饲料配方、掉蛋怪、繁殖孵化与喂养。
gameVersion: "1.0"
verifiedDate: 2026-10-15
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（Petbreeding / Feed Pet）
  - type: observed
    reference: 游戏内实测
---

## 宠物总览【官方】

15 种宠物，**5 档 × 3 种**。繁殖配方 = `1x 同名宠物蛋 + Nx 对应档位饲料`。

| 档 | 宠物（Level） | 饲料数量 |
|---|---|---|
| T1 | Hare 兔(1) / Beaver 河狸(5) / Wild Hog 野猪(9) | 20 / 40 / 60x Mucky Pet Food |
| T2 | Scorpion 蝎(10) / Myconid 蘑菇人(15) / Troll Boar 巨魔野猪(19) | 80 / 100 / 120x Scrap Pet Food |
| T3 | Blood Queen 血后(20) / Cougar 美洲狮(25) / Hydra 九头蛇(29) | 140 / 160 / 180x Low Quality Pet Food |
| T4 | Warg 战狼(30) / Tiger 虎(35) / Yak 牦牛(39) | 200 / 220 / 240x Medium Quality Pet Food |
| T5 | Werebat 蝙蝠(40) / Rust Monster 锈怪(45) / Armored Ram 装甲羊(49) | 260 / 280 / 300x Quality Pet Food |

- 官方名称为 **Beaver（河狸）**。
- 面板字段：Growth / Energy / Damage，附 `+X Hit Rating / +X Maximum Life / +X Mana`。

## 宠物饲料配方【官方】

每档 Pet Food = `4x 肉/果/菜/鱼 + 1 红种 + 1 蓝种 + Nx Spirit Essence`：

| 档 | 材料（任选其一） | 种子 | Spirit Essence |
|---|---|---|---|
| T1 Mucky | Minnow / Mucky Fruits / Mucky Meat / Mucky Vegetables | Red + Blue Poppy Seed | 3 |
| T2 Scrap | Scrap Fruits / Meat / Vegetables / Shrimp | Red + Blue Lily Seed | 6 |
| T3 Low Quality | Low Quality Fruits / Meat / Vegetables / White Bass | Red + Blue Bensil Seed | 9 |
| T4 Medium Quality | Medium Quality Fruits / Meat / Vegetables / Smallmouth Bass | Red + Blue Kerria Seed | 12 |
| T5 Quality | Largemouth Bass / Quality Fruits / Meat / Vegetables | Red + Blue Penta Seed | 15 |

## 掉蛋怪【官方点名，11 种】

> Snake / Woodland Spider / Scorpion / Myconid / Cassowary / Bog Worm /
> Blood Queen / Hydra / Werebat / Rust Monster / Komodo Basilisk

**掉率官方未公布**；「等级差越大越容易出蛋」为社区说法，尚未经官方确认。

## 繁殖 / 孵化【官方】

- 费用 **`tier² × 500 Coins`**、时长 **`tier² 小时`**（例：T1 = 5 银 / 1 小时；T6 = 1 金 80 银 / 36 小时）。
- 孵化队列最多 **3 个槽位**，由 **Amelie Papillon** 负责；费用照扣，计时跑完取蛋。
- **Hatchglow 事件**期间：稀有度与品质在**放蛋那一刻**就决定（非事件期间是孵化时决定）。
- **德鲁伊是唯一能孵蛋 + 带宠的职业**（也能替别人孵）。

## 喂养：Growth / Energy【官方】

- 打开方式：背包直接用 **Pet Food**，或宠物面板按 **Feed**；**必须先装备宠物**。
- **只有 Energy 已满时喂食才有机会涨 Growth**；每块饲料 = 一次机会，一次 **+1 Growth**；
  成功率显示在窗口里，**Growth 越高成功率越低**；**上限由稀有度决定**。
- 涨 Growth 会同时提高**最大 Energy 并直接回满**；Growth 本身提升宠物伤害与最大 Energy。
- **Energy**：每块饲料回 **150 Energy × 饲料档位**；0 Energy 的宠物不再提供战斗加成；
  也可放自家 estate 的 **Pet Shelter** 回能。
- 饲料档位按宠物等级自动选（Lv1-9=T1，10-19=T2…）；**Petbreeder 处可买，或由 Petbreeding（养宠）制作**；
  **公会宠物不能喂**。
- 成功喂食算「Feed Your Pet」日常目标（每天一次）。

## 社区资料补充【社区】

- 蛋不能堆叠（一格一个）；孵前词条未定；基数大才出紫/金宠。
- T2 饲料只有德鲁伊能做、全服限额、卖店 20 银；蝎子蛋可当饲料吃。
- 宠物升级约等于 10 多个饲料的经验；孵蛋给的生活经验比搓饲料多；一阶宠只吃一阶粮。

## 结论

- **只有 Druid 能孵蛋 / 带宠**；想玩宠物需要练一个 **Druid** 角色
  （账号共享生活技能进度，但 Petbreeding 需要 Druid 职业）。
- 其它职业可通过交易 / 购买获得成品蛋或宠物。

## 动物狩猎（陷阱捕获）【1.0 官方 Wiki】

1.0 新增：在战斗中**捕获动物类敌人**并转化为永久宠物。

- 需要道具**笼子 / 陷阱（Cage）**；只有**动物类**敌人可被捕获。
- 条件（全部满足）：拥有 **Hunting 职业**、**狩猎技能等级 ≥ 敌人等级**、**陷阱阶级 ≥ 敌人阶级**、**敌人生命 ≤ 20%**、背包中有陷阱。
- 使用：把敌人打到 20% 以下 → 自己回合打开道具选陷阱 → 判定。
- **成功**：获得一个随机稀有度的宠物道具，**不获得正常战利品与经验**。**失败**：陷阱消耗、动物逃跑消失。
- **捕获几率**：`50% + 10% × 陷阱阶级 − 0.5% × 敌人等级`，限制在 **5%~95%**。
- **宠物稀有度**由敌人阶级决定：普通→(普通/魔法)；勇士→(普通/魔法/稀有)；稀有→(普通/魔法/稀有/史诗)；精英→(普通/魔法/稀有/史诗/神秘)。

## Petbreeding（孵蛋）【1.0 官方 Wiki】

- 把 **Pet Egg** 放进孵化槽 + 付金币，由 **Amelie Papillon** 孵化；队列最多 **3 个槽位**。
- **费用 = `tier² × 500` 金币**；**时间 = `tier²` 小时**（T1 = 5 银 / 1 小时；T4 = 80 银 / 16 小时；T6 = 1 金 80 银 / 36 小时）。
- 孵化时显示宠物与其稀有度；**Hatchglow 事件期间**稀有度与品质在**放蛋时**决定。
- **掉蛋怪**：Snake、Woodland Spider、Scorpion、Myconid、Cassowary、Bog Worm、Blood Queen、Hydra、Werebat、Rust Monster、Komodo Basilisk。

## 喂养 Feed Pet【1.0 官方 Wiki】

- 用背包里的 **Pet Food**，或在宠物面板按 **Feed**（必须先装备宠物）。
- **饲料档位按宠物等级自动选择**（Lv1-9=T1，10-19=T2…）；可从 **Petbreeder 购买**或由 **Cooking** 制作。
- **Energy**：每块饲料回 `150 Energy × 档位`；0 Energy 的宠物不再提供战斗加成；也可放在自家 estate 的 **Pet Shelter** 回能。
- **Growth**：仅在 Energy 已满时喂食才有机会 +1；成功率随 Growth 提高而下降；上限由稀有度决定；涨 Growth 会提高最大 Energy 并回满。
- 成功喂食计入 **Feed Your Pet** 日常目标（每天一次）；**公会宠物不能喂**。

## 相关

- [生活技能总览](/norr-wiki/professions/overview/)
- [制作](/norr-wiki/professions/crafting/)

## 资料来源

- 官方帮助文档：Petbreeding、Feed Pet。
- 游戏内实测（EA 版）：宠物面板字段、喂养规则。