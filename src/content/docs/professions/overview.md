---
title: 生活技能总览
description: 生活技能分类、账号/角色绑定、经验来源、工具耐久、材料 Tier 与等级门槛。
gameVersion: "1.0"
verifiedDate: 2026-10-15
versionStatus: mixed
sources:
  - type: official
    reference: 官方 1.0 Wiki（专业概述 / 层级与材料 / 工具耐久度）
    url: https://wiki.norroth.com/p/37/
    date: "2026-10-15"
  - type: official
    reference: 游戏内帮助文档（EA 版）
  - type: observed
    reference: 游戏内实测（EA 版）
---

1.0 官方 Wiki 确认：生活技能按**账号绑定**与**角色绑定**分为两类，共 **18 项** = **7 采集 + 烹饪**（账号绑定）+ **10 制作**（角色绑定）。
1.0 **移除了 Toolsmithing（工具锻造）与 Petbreeding（养宠）两个独立制作专业**：工具并入 Weaponsmithing，宠物相关并入 Hunting 与 Petbreeder NPC。

> 本页同时包含 **1.0 官方 Wiki** 与 **EA 实测** 两类内容，逐条标注。EA 实测数值（经验、冷却、产量）在 1.0 尚未重新实测。

## 生活技能分类【1.0 官方】

**账号绑定（8）**——同一账号下所有角色共享进度：
Cooking 烹饪、Chopping 伐木、Farming 农耕、Fishing 钓鱼、Foraging 采集、Mining 挖矿、Quarrying 采石、Scavenging 搜寻。

**角色绑定（10）**——按单个角色分别保存：
Alchemy 炼金、Armorsmithing 铸甲、Carpentry 木工、Cartography 制图、Hunting 狩猎、Jeweling 珠宝、Leatherworking 制皮、Stonemasonry 石雕、Tailoring 裁缝、Weaponsmithing 铸武。

- 每个角色最多可学习 **3 个角色绑定专业**（**Ironman 角色为 5 个**；官方「专业概述」页写作 6，游戏模式页写作 5，以游戏内为准）。
- 要学新专业必须先**遗忘**一个当前的角色绑定专业。
- 采集与烹饪为账号共享，不占角色绑定名额。

### 与 EA 的差异

| 项 | EA 版 | 1.0 官方 Wiki |
|---|---|---|
| 制作专业数 | 13 | **10**（移除 Toolsmithing、Petbreeding） |
| 工具制作 | Toolsmithing（Rogue 专属） | 并入 **Weaponsmithing**（Tools 24 条配方） |
| 宠物 | Petbreeding 独立专业 | 并入 **Hunting**（陷阱/捕获）与 Petbreeder NPC（孵蛋） |
| 进度归属 | 全部账号共享 | 采集/烹饪账号绑定，制作**角色绑定**，每角色限 3 个 |

## 职业与制作技能

| 职业 | 可使用的制作技能（1.0） |
|---|---|
| Archmage 法师 | Alchemy、Cartography、Cooking、Jeweling、Tailoring |
| Berserker 狂战士 | Cooking、Hunting、Leatherworking、Weaponsmithing、Stonemasonry |
| Druid 德鲁伊 | Cooking、Hunting、Leatherworking、Tailoring（+ 宠物相关） |
| Ranger 游侠 | Cartography、Cooking、Hunting、Leatherworking、Carpentry |
| Rogue 盗贼 | Cartography、Cooking、Hunting、Leatherworking（Toolsmithing 已移除，第 5 项待官方补充） |
| Zealot 狂热者 | Armorsmithing、Cartography、Cooking、Hunting、Jeweling |

> Cooking、Cartography、Hunting、Leatherworking 由多个职业共享；使用某项制作技能需要账号内有对应职业。

## 制作配方图鉴

每个制作专业**具体能做什么**（可制作的物品类型与配方数量）见 **[制作配方图鉴](/norr-wiki/professions/crafting-catalog/)**：
支持按**专业、物品类型、Tier、等级**筛选，并可**反查材料**的用途与来源。

## 经验来源【EA 实测】

| 来源 | 经验 | 冷却 | 前置 |
|---|---|---|---|
| 采集 | 约 +10 | 18 秒 | 站在采集点 + 装备对应工具 |
| 制作 | 约 +36~40 | 10 秒（全局共享） | 站在制作台 / NPC 处 |
| 野外杂物点 | 约 +32~66 | 每格一次 | 职业等级达标（材料不灰显） |
| 开容器 / 宝箱 | 0 | — | 不给生活技能经验 |

- 制作约 **240 经验/分钟**（40 经验配方），是可持续的升级方式。
- 采集约 **33 经验/分钟**；杂物点经验更高但为一次性、顺路收益。
- 经验曲线约 **×1.8 / 级**，等级越高升级越慢。

## 工具与耐久【1.0 官方】

**耐久消耗公式：地图阶级 + 两者中的最高阶级**（每次采集动作）。

> 与地图同阶或更低阶的工具，按 2 × 地图阶级计算；高阶工具在低阶区域消耗小于其自身阶级的 2 倍，因此保有价值，但仍比专用工具磨损更快。

| 每次动作耐久消耗 | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| 铜质工具 | 2 | 4 | 6 | 8 | 10 | 12 |
| 铁质工具 | 3 | 4 | 6 | 8 | 10 | 12 |
| 青铜工具 | 4 | 5 | 6 | 8 | 10 | 12 |
| 钢质工具 | 5 | 6 | 7 | 8 | 10 | 12 |
| 秘银工具 | 6 | 7 | 8 | 9 | 10 | 12 |
| 瓦伦塔尔工具 | 7 | 8 | 9 | 10 | 11 | 12 |

- **剩余次数 = 当前耐久度 ÷ 每次动作消耗**，显示工具损坏前大约还能采几次。
- 损坏的工具在修复前无法使用：在**城镇铁匠**处修复，或使用**物品修复工具包**。
- 示例：T1 地图用 T4 工具 → 最高阶级 4 + 地图阶级 1 = 每次 5 点；T5 地图用 T2 工具 → 5 + 5 = 每次 10 点。

> EA 实测补充：一次采集（run）= 3 次尝试，所以 T1 节点共扣 6 点耐久、约 +10 经验、18 秒冷却。

## 材料 Tier 与等级【1.0 官方】

| Tier | 角色等级范围 | 石头 | 其他代表材料 |
|---|---|---|---|
| T1 | Lv 1-9 | Slate | Mucky、Copper、Aspen、Cotton、Minnow、Potato |
| T2 | Lv 10-19 | Fieldstone | Scrap、Iron、Elm、Silkworm Cocoon、Shrimp、Common Mushroom |
| T3 | Lv 20-29 | Soapstone | Low Quality、Tin、Spruce、Jute、White Bass、**Beans** |
| T4 | Lv 30-39 | Sandstone | Medium Quality、Coal、Maple、Nettle、Smallmouth Bass、**Sugar Beet** |
| T5 | Lv 40-49 | Laterite | Quality、Mithril、Beech、Ramie、Largemouth Bass、**Corn** |
| T6 | Lv 50-59 | Travertine | Graded、Valentaal、Ash、**Bamboo**、Northern Pike、**Wheat** |

> 1.0 在 T3~T6 各补了一种农作物（Beans / Sugar Beet / Corn / Wheat），T6 新增木材 **Bamboo（竹）**，对应整套 Bamboo 装备与材料配方。

上表是**材料 Tier 与角色等级范围的对应**，并非采集技能的解锁门槛。**采集技能另有独立门槛**：
材料灰显并显示 `Lv.N` 时，说明该采集技能的等级不足。例：T2 石头（Fieldstone）需要 **Quarrying Lv10**。

## 1.0 变化【官方已公布】

- **Paragon 等级**：**所有生活技能**（采集 + 制作）在原有等级之上新增 **Paragon 等级**。
- **大师制作（Masterworking）**：每个制作职业 1 个专属配方 + 1 种专属材料，解锁需完成任务线（见[大师制作](/norr-wiki/professions/masterworking/)）。
- **Gather Queue**：离线采集改为 3 槽队列（见[采集](/norr-wiki/professions/gathering/)）。
- **从银行直接制作**：制作 / 强化 / 精炼 / 升级窗口可直接取用银行材料。
- **专业名额**：角色绑定专业每角色 3 个（Ironman 5 个）。

> 详见 [1.0 机制变更](/norr-wiki/release/v1-changes/)。

## 相关

- [采集](/norr-wiki/professions/gathering/)
- [制作](/norr-wiki/professions/crafting/)
- [制作配方图鉴](/norr-wiki/professions/crafting-catalog/)
- [职业自给自足矩阵](/norr-wiki/guides/crafting-matrix/)

## 资料来源

- 官方 1.0 Wiki：专业概述（/p/37）、层级与材料（/p/104）、工具耐久度（/p/44），2026-10-15 抓取。
- 官方帮助文档：职业列表、工具耐久、采集点、Tier 与材料。
- 游戏内实测（EA 版）：经验数值、冷却、杂物点产出、工具产量对比。
