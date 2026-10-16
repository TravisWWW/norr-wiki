---
title: 采集
description: 采集点分布、工具耐久、拾荒材料与采集队列。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: "1.0-official"
sources:
  - type: official
    reference: 官方 1.0 Wiki（Gathering Spots / 工具耐久度 / Hunter）
    url: https://wiki.norroth.com/p/49/
    date: "2026-10-16"
---

## 采集点分布【官方 1.0 Wiki】

官方 1.0 Wiki 的 **Gathering Spots** 页按采集技能列出每张地图的 `地点 + Tier + 地图等级`，共 **141 条**。
分技能条数：Fishing 37、Chopping 27、Mining 21、Farming 19、Foraging 19、Quarrying 18。完整清单见[采集点分布](/norr-wiki/professions/gathering-locations/)。

要点：

- 世界地图上**蓝点 = 有采集点**，但**未探索过的地图不显示蓝点**。
- Tier 1 采集点集中在 Arodas 新手区；Tier 2 从 Lv7-10 的 Owranbu River / Arodas Beach / Elundi 开始。
- 采集界面里的 `Lvl. N` = **你当前该职业的等级**（不是节点等级）。
- 必须装备**对应工具**（钓鱼要钓竿、采矿要镐……）。

## 工具耐久【官方 1.0 Wiki】

**耐久消耗公式：地图阶级 + 两者中的最高阶级**（每次采集动作）。

| 每次动作耐久消耗 | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| 铜质工具 | 2 | 4 | 6 | 8 | 10 | 12 |
| 铁质工具 | 3 | 4 | 6 | 8 | 10 | 12 |
| 青铜工具 | 4 | 5 | 6 | 8 | 10 | 12 |
| 钢质工具 | 5 | 6 | 7 | 8 | 10 | 12 |
| 秘银工具 | 6 | 7 | 8 | 9 | 10 | 12 |
| 瓦伦塔尔工具 | 7 | 8 | 9 | 10 | 11 | 12 |

- **剩余次数 = 当前耐久度 ÷ 每次动作消耗**；界面显示「Remaining Durability: N (M turns)」。
- 损坏的工具在修复前无法使用：在**城镇铁匠**处修复，或使用**物品修复工具包**。
- 示例：T1 地图用 T4 工具 → 4 + 1 = 每次 5 点；T5 地图用 T2 工具 → 5 + 5 = 每次 10 点。
- 工具只决定**能采多久**（耐久），**不影响速度与产量**。

## 拾荒（Scavenging）与尸块材料【官方 1.0 Wiki】

制皮 / 狩猎材料 = **尸块**（Hide / Bone / Chitin / Scale / Wing / Claw / Fang / Tooth / Hoof / Goblin Ear 等），
主要靠**拾尸（Scavenging）**从尸体上搜刮，而不是普通掉落。

- Hunter 专业把尸块加工成 **Cleaned / Sharpened / Shaped** 半成品，再做成首饰 / 弓 / 箭袋（见[制作](/norr-wiki/professions/crafting/)）。
- 材料 Tier **跟随区域 Tier**：T1 区 → `Mucky X`，T2 区 → `Scrap X`。
- 其它来源：**批量分解皮甲**、**商人购买**、**Trading Post**。

## 采集队列（Gather Queue）【官方公告】

- 旧「AFK 槽」改为 **Gather Queue（采集队列，3 槽）**，类似 Craft Queue。
- 与 Craft Queue 一样，队列**离线 / 换角色仍继续**。
- **Noble 玩家额外第 3 槽**（官方称保持非 P2W）。
- **采集点可直接搜索**（无需翻帮助），属于 1.0 的 UI 改进。

> 来源：官方开发日志 / 公告（官方 1.0 Wiki 未单列该条目）。

## 相关

- [生活技能总览](/norr-wiki/professions/overview/)
- [制作](/norr-wiki/professions/crafting/)
- [怪物图鉴](/norr-wiki/world/bestiary/)

## 资料来源

- 官方 1.0 Wiki：采集点（/p/49）、工具耐久度（/p/44）、Hunter（/p/126），2026-10-16 抓取。
- 官方开发日志 / 公告：Gather Queue。
