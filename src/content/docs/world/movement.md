---
title: 地图、移动与传送
description: 两种地图、城镇坐标、走格、传送与快速旅行、死亡复活。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档（Worldmap / Basic Movement / Teleport and Fast Travel / Expeditions）
  - type: observed
    reference: 游戏内实测
---

## 结论速览

- 官方确认正式版有**超过 300 个手工制作的区域**；EA 版实测为 **323 张地图 + 14 个城镇**，两者**不能直接认定为同一批**。
- 两种「地图」：**世界地图**（区域）与**格子地图**（走格）。
- 走格移动；城镇有等级与坐标。
- 传送 / 快速旅行用 **Waygate**，计价单位是 **Spirit Essence**（不是金币）。
- 死亡有惩罚（见下）。

## 两种「地图」的区分【官方】

| 类型 | 说明 |
|---|---|
| **世界地图区域** | 鼠标悬停每个点显示：采集点、是否有怪、地图编号、地图等级与生物群系、怪等级、兴趣点。**蓝点 = 有采集资源，红星 = 有任务**。点开后若去过且有传送卷轴可传送。**未探索过的地图不显示蓝点。** |
| **Expedition Map** | 开船探险用的地图物品，按 **Tier** 分；能做的 Tier = 船体 Hull 等级。每 Tier 的 Magic 稀有度图可在制图师做；探险可能出高一档的图，终极目标是 **Relic Map**。地图稀有度越高，岛上怪附加属性越多；回程可能遇海盗。 |

常见说法「15 级 / 20 级地图」多指**世界地图区域**的等级。

## 城镇等级与坐标【官方】

| 城镇 | Level | Tier | 世界坐标 |
|---|---|---|---|
| El Caspar | 1 | 1 | 871/1551 |
| Elundi | 10 | 2 | 585/1250 |
| Owranbu | 10 | 2 | 1285/1561 |
| Drouver | 15 | 2 | 1577/1124 |
| Vileton | 15 | 2 | 1263/1835 |
| Sanjuo | 19 | 2 | 1533/2204 |
| Bungavik | 20 | 3 | 1433/705 |
| Saurville | 20 | 3 | 1873/866 |
| Ururg | 20 | 3 | 2410/1256 |
| Caeltys | 30 | 4 | 1059/929 |
| Trescan | 30 | 4 | 2752/890 |
| Stogow | 30 | 4 | 1656/342 |
| Nythrendal | 40 | 5 | 353/926 |
| Galkathos | 45 | 5 | 3180/1890 |

**城镇 Tier 决定**：Client Order Board 的订单 Tier、商人卖的东西、可用的服务等级。

## 移动【官方】

官方口径很简单：**拖动地图，点你要去的地方，角色会自己找路**；角色出屏时看屏幕边缘的箭头。

- 服务器每发一次只走一格；需等角色站上目标格后再发下一格。
- 换图是显式的：站到 gate 格上**不会自动换图**，需要触发换图操作。

## 传送与快速旅行【官方】

| 方式 | 说明 |
|---|---|
| **Home Scrolls** | Cartography 制作，传送到**已访问过的特定城镇** |
| **Teleportation Scrolls** | Celestial Market / Event Merchant 购买，传送到**任何去过的地图** |
| **Infusion Stones** | 升级 Teleport 技能；每块石头 = 可跳固定数量节点，点视野内任意节点直接传送 |
| **Waygate** | 站在 waygate 格子上打开，列出 Cities / wilderness，费用是 **Spirit Essence**；**只限已发现地图** |
| **Guild Portal** | 公会建筑，可传送到每个已解锁城市，省卷轴 |

## 死亡

- 死亡后回到 **Fountain of Rebirth（泉水图）**，该图只有一个传送门。
- 实测 **HP 回满、经验没有损失**。
- **PvE 死亡的真实代价**：装备耐久损耗、宠物 energy 损耗、被送回泉水图的跑图时间。
- **竞技场（Battle Arena）失败会扣战斗经验**【官方】。

## 世界勘察数据（EA 版）

- EA 版全量扫描为 **323 张地图**（含 14 个城镇），含 id / 名称 / 等级 / 群系 / 世界坐标 / 采集图标 / 传送站。
- 地图之间通过 **gate** 连接（双向，坐标通常不同），可据此推算任意两图之间的最短路线。
- **El Caspar 城内设施坐标**（Arodas 新手城）：

```
Mailbox@36-20 | Fisherman@19-21 | Hunter@41-21 | Minnow Pier@13-22 | Client Order Board@29-22
Stonemason@23-23 | Leatherworker@44-23 | Bounty Hunter Board@47-24 | Cartographer@26-29
Toolsmith@33-29 | Tailor@13-30 | Armorsmith@35-30 | Weaponsmith@37-30 | Personal Stash@20-32
Trading Post@34-35 | Jeweler@39-37 | Carpenter@45-37 | Wishing Well@41-39 | Alchemist@14-40
the Inn@21-41 | Cook@31-42 | Mailbox@19-44 | Petbreeder@39-44 | Mucky Patch@26-48
出口: Elena's Crossroad@38-16 | Sewers@39-28 | Windy Fields@53-31 | Brisban Pond@11-32
      Waygate@28-32 | Upper Fountain's Descent@18-49 | Southern Foothill@41-50
```

- **Arodas 新手区地图链**（适合 Lv1-10）：

```
El Caspar(1) → Elena's Crossroad(1-3) → Akelay Foothills(4-6) → Akelay Cave L1(4-6) → Akelay Cave L2(6-9) → The Cult Tunnel(7-9)
El Caspar(1) → Brisban Pond(1-3) → Arodas Lakeshore(4) / Akelay Foothills(4)
El Caspar(1) → Southern Foothill(1-3) → Bay's Alley(4-6) → Bay's Alley(7-10) → Pirate Wreck Foothill(11-13)
Elena's Crossroad → Forested Canyon(4-5) → Tree of Life(5-6) → Grasping Maze(6-7)
```

## 相关

- [地图清单](/norr-wiki/world/maps/)
- [怪物图鉴](/norr-wiki/world/bestiary/)
- [副本、爬塔与世界 Boss](/norr-wiki/quests/dungeons/)

## 资料来源

- 官方帮助文档：Worldmap、Basic Movement、Teleport and Fast Travel、Expeditions。
- 游戏内实测（EA 版）：城镇坐标、移动机制、死亡规则、地图勘察数据。