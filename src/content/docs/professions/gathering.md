---
title: 采集
description: 采集机制与经验、采集点分布、杂物点、工具耐久、离线采集与拾荒。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: official
    reference: 游戏内帮助文档（采集点 / 工具耐久 / Tier 与材料）
  - type: observed
    reference: 游戏内实测
---

## 结论速览

- 采集每次约 **+10 经验**，**冷却 18 秒**；一次采集 = **3 次尝试**，消耗工具耐久。
- 必须装备**对应工具**（钓鱼要钓竿、采矿要镐……）。
- 野外**杂物点**（Crate / Plant 等）也直接给生活技能经验，且经验更高，但为**一次性**。
- 工具只决定**能采多久**（耐久），**不影响速度与产量**；带与区域同阶的工具更省耐久。
- 采集节点另有**职业等级门槛**（材料灰显并显示 `Lv.N`）。

## 采集机制

- 每次采集约 **+10 经验**（与职业无关）。
- **一次采集（run）冷却 18 秒**；冷却未到无法再采。
- **一次 run = 3 次尝试**，每次尝试扣 `2 × max(工具Tier, 区域Tier)` 点耐久。
- 必须装备**对应工具**。
- 采集物直接进背包（不像战斗那样需要额外拾取）。

## 采集点分布【官方】

帮助文档列出 **Chopping / Farming / Fishing / Foraging / Mining / Quarrying** 六类采集点，
每类给出 `地点名 + Tier + 地图等级`。要点：

- 世界地图上**蓝点 = 有采集点**，但**未探索过的地图不显示蓝点**。
- Tier 1 采集点集中在 Arodas 新手区；Tier 2 从 Lv7-10 的 Owranbu River / Arodas Beach / Elundi 开始。

## 生活技能经验的第三个来源：地图杂物点

除了「采集 +10 / 制作 +36~40」，野外的**杂物点（Crate / Plant 等）**也直接给生活技能经验：

| 来源 | 生活技能经验 | 冷却 | 备注 |
|---|---|---|---|
| 采集 | +10 | 18 秒 | 需要对应工具 |
| 制作 | 约 +36~40 | 10 秒（全局共享） | 必须站在制作台 / NPC 处 |
| 杂物点 | 约 +32~66 | 每格一次 | 同时给材料 + 金币 |

> **统一口径**：制作的冷却为 **10 秒全局共享**（跨配方共享），不同配方单次经验可能不同。
> 杂物点为**一次性**（采完消失），不能长期刷。

杂物点流程：

1. 站上杂物点格 → 开始开启，**格子未消耗**；
2. 约 7 秒后再触发一次 → 结算并打开掉落窗；
3. 领取材料。

**生活技能经验在第二次触发时结算。**

| 杂物点 | 对应职业 | 实测经验 | 产出 | 所需职业等级 |
|---|---|---|---|---|
| Plant | Farming | +42 | Mucky Soil Lump / Cotton Boll / 66 币 / 鉴定卷轴 | Farming 2 |
| Log | Chopping | +32 | Aspen Log、Mucky Hollowed Log | Chopping 2 |
| Mushroom | Foraging | +32 | Mucky Fruits、Mucky Birdnest | Foraging 2 |
| Barrel / Shell | Fishing | 待验证 | — | Fishing 10 |
| Rock | Quarrying | 待验证 | — | Quarrying 10 |

> **等级不足时材料名变灰且拿不到。**

## 采集点补充

- 采集界面里的 `Lvl. N` = **你当前该职业的等级**（不是节点等级）。
- 一次采集 = **3 次尝试**，Tier-1 节点共扣 **6 耐久**，产出约 2 份材料，**+10 经验**，18 秒冷却。
- 工具耐久耗尽前，界面会显示剩余耐久与还能采几次。

## 工具耐久

- **每次采集消耗 6 点工具耐久**（Tier-1 节点）。
- 界面里的「Remaining Durability: N (M turns)」是**工具**的剩余耐久，`M = N / 6` 就是还能采几次。
- **工具耐久归零后采集会静默失败**——不是节点枯竭，是工具坏了。
- **城市铁匠可以修工具**（站在 smith 格子上修理），所以长挂采集要定期回城修工具。
- 一次采集循环约 160~330 次，之后必须回城修工具。

## Idle Mode（离线采集）

采集框左上角有 **idle_mode** 图标。进入 Idle Mode 后角色会自动登出，再次登录时按离线期间完成的
turns 结算材料。

- 面板显示三项：工具剩余次数（turns）、背包空位（space）、可挂时长。
- **换算：1 turn = 30 秒**。离线采集比在线慢（30s/次 vs 18s/次），但**不用登录**。
- 想挂更久：提高工具耐久（turns）、背包格子、堆叠上限。

## 拾荒（Scavenging）与尸块材料

**制皮材料 = 尸块（Hide / Bone / Chitin / Scale / Wing / Goblin Hide 等），主要靠「拾尸 Scavenging」从尸体上搜刮**，
不是普通掉落。打怪本身只掉金币 / 药水 / 装备；尸块要在**尸体还挂着**的时候额外搜一次。

- 每次拾尸产出 **1 个尸块**（从该怪的尸块表里随机抽 1 种）。
- 拾尸经验 **= 该怪的基础战斗经验**（星级怪不翻倍）。
- 无独立冷却，受打怪节奏限制。
- 材料 Tier **跟随区域 Tier**：T1 区 → `Mucky X`，T2 区 → `Scrap X`。

其它来源：**批量分解皮甲**、**商人购买**（Cartographer 卖 Mucky Hide；Leatherworker 卖 T2 制皮材料）、
**Trading Post**。想快速攒量去商人扫货，想免费攒 Hide 就边打怪边拾尸。

> **食物 buff**（成品菜 vs 原料）见[制作](/norr-wiki/professions/crafting/)。

## 相关

- [生活技能总览](/norr-wiki/professions/overview/)
- [制作](/norr-wiki/professions/crafting/)
- [怪物图鉴](/norr-wiki/world/bestiary/)

## 资料来源

- 官方帮助文档：采集点、工具耐久、Tier 与材料。
- 游戏内实测（EA 版）：采集经验与冷却、杂物点流程、工具耐久、Idle Mode、食物 buff。