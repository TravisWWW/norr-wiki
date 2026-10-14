---
title: 生活技能总览
description: 生活技能分类、经验来源、工具耐久、材料 Tier 与等级门槛。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（职业 / 工具耐久 / 采集点 / Tier 与材料）
  - type: observed
    reference: 游戏内实测
---

官方确认正式版有**采集、制作与职业成长**；下列具体分类与数量为 **EA 版**数据，**1.0 待验证**。

EA 版生活技能共 **20 个** = **7 个采集** + **13 个制作**；进度**账号共享**，删角色不丢失。
升级效率上，制作高于采集；工具只决定**能采多久**（耐久），**不影响速度与产量**。

## 生活技能分类（EA 版）

**7 个采集**（所有职业都能学）：Chopping（伐木）、Farming（种植）、Fishing（钓鱼）、Foraging（采集）、
Mining（采矿）、Quarrying（采石）、Scavenging（拾荒）。

**13 个制作**：Alchemy、Armorsmithing、Carpentry、Cartography、Cooking、Hunting、Jeweling、
Leatherworking、Petbreeding、Stonemasonry、Tailoring、Toolsmithing、Weaponsmithing。

**13 项制作技能按战斗职业设置使用限制**：每个战斗职业可使用其中 **5 项**，部分制作技能由多个职业共享。

| 职业 | 可使用的制作技能 |
|---|---|
| Archmage 法师 | Alchemy、Cartography、Cooking、Jeweling、Tailoring |
| Berserker 狂战士 | Cooking、Hunting、Leatherworking、Weaponsmithing、Stonemasonry |
| Druid 德鲁伊 | Cooking、Hunting、Leatherworking、Petbreeding、Tailoring |
| Ranger 游侠 | Cartography、Cooking、Hunting、Leatherworking、Carpentry |
| Rogue 盗贼 | Toolsmithing、Cartography、Cooking、Hunting、Leatherworking |
| Zealot 狂热者 | Armorsmithing、Cartography、Cooking、Hunting、Jeweling |

> Cooking、Cartography、Hunting、Leatherworking 等制作技能由多个职业共享；使用某项制作技能需要账号内有对应职业。

## 制作配方图鉴

每个制作专业**具体能做什么**（可制作的物品类型与配方数量）见 **[制作配方图鉴](/norr-wiki/professions/crafting-catalog/)**：
支持按**专业、物品类型、Tier、等级**筛选，并可**反查材料**的用途与来源。

## 经验来源

| 来源 | 经验 | 冷却 | 前置 |
|---|---|---|---|
| 采集 | 约 +10 | 18 秒 | 站在采集点 + 装备对应工具 |
| 制作 | 约 +36~40 | 10 秒（全局共享） | 站在制作台 / NPC 处 |
| 野外杂物点 | 约 +32~66 | 每格一次 | 职业等级达标（材料不灰显） |
| 开容器 / 宝箱 | 0 | — | 不给生活技能经验 |

- 制作约 **240 经验/分钟**（40 经验配方），是可持续的升级方式。
- 采集约 **33 经验/分钟**；杂物点经验更高但为一次性、顺路收益。
- 经验曲线约 **×1.8 / 级**，等级越高升级越慢。

## 工具与耐久

- 每次采集尝试消耗 `2 × max(工具 Tier, 区域 Tier)` 点耐久；一次采集（run）= 3 次尝试。
- 例：T4 工具在 T4 区域 = 8/次、24/次采集；T2 工具进 T5 区域按 T5 算 = 10/次、30/次采集。
- 工具 Tier 只在**高于区域 Tier** 时才生效；带高阶工具去低级图反而更费耐久。
- 工具只决定**能采多少次才损坏**，不影响速度与产量（品质 / 稀有度同理）。
- 工具损坏后在城市铁匠处修理，或使用 Item Repair Kit。

## 材料 Tier 与等级

| Tier | 角色等级范围 | 石头 | 其他代表材料 |
|---|---|---|---|
| T1 | Lv 1-9 | Slate | Mucky、Copper、Aspen、Cotton、Minnow、Potato |
| T2 | Lv 10-19 | Fieldstone | Scrap、Iron、Elm、Silkworm Cocoon、Shrimp、Common Mushroom |
| T3 | Lv 20-29 | Soapstone | Low Quality、Tin、Spruce、Jute、White Bass |
| T4 | Lv 30-39 | Sandstone | Medium Quality、Coal、Maple、Nettle、Smallmouth Bass |
| T5 | Lv 40-49 | Laterite | Quality、Mithril、Beech、Ramie、Largemouth Bass |
| T6 | Lv 50-59 | Travertine | Graded、Valentaal、Ash、Bamboo、Northern Pike |

上表是**材料 Tier 与角色等级范围的对应**，并非采集技能的解锁门槛。**采集技能另有独立门槛**：
材料灰显并显示 `Lv.N` 时，说明该采集技能的等级不足。例：T2 石头（Fieldstone）需要 **Quarrying Lv10**。
EA 版地图及材料按 Tier 划分，角色等级与地图等级存在推荐范围；各采集技能的具体解锁门槛待逐项核对。

## 1.0 变化【官方已公布】

- **Paragon 等级**：**所有生活技能**（采集 + 制作）在原有等级之上新增 **Paragon 等级**。
- **大师制作（Masterworking）**：每个制作职业 1 个专属配方 + 1 种专属材料，解锁需完成任务线（见[大师制作](/norr-wiki/professions/masterworking/)）。
- **Gather Queue**：离线采集改为 3 槽队列（见[采集](/norr-wiki/professions/gathering/)）。
- **从银行直接制作**：制作 / 强化 / 精炼 / 升级窗口可直接取用银行材料。

> 详见 [1.0 机制变更](/norr-wiki/release/v1-changes/)。以上为官方公告口径，**未实测**。

## 相关

- [采集](/norr-wiki/professions/gathering/)
- [制作](/norr-wiki/professions/crafting/)
- [制作配方图鉴](/norr-wiki/professions/crafting-catalog/)
- [职业自给自足矩阵](/norr-wiki/guides/crafting-matrix/)

## 资料来源

- 官方帮助文档：职业列表、工具耐久、采集点、Tier 与材料。
- 游戏内实测（EA 版）：经验数值、冷却、杂物点产出、工具产量对比。