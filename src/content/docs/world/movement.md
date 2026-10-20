---
title: 地图、移动与传送
description: 世界地图、走格移动、传送与快速旅行、走私路线与死亡复活（以官方 1.0 Wiki 为准）。
gameVersion: "1.0"
verifiedDate: 2026-10-21
versionStatus: "1.0-official"
sources:
  - type: official
    reference: 官方 1.0 Wiki 世界地图（p/35）、基础移动（p/40）、地图详情（p/168）、路标（p/201）、传送与快速旅行（p/55）、传送门（p/179）、走私路线（p/189）、城镇（p/38）
    url: https://wiki.norroth.com/p/35/
    date: "2026-10-21"
---

## 结论速览

- 三类地图：**局部格子地图**（走格战斗）、**世界地图**（区域总览）、**远征地图**（开船探险）。
- 移动是**点选 + 自动寻路**（不能用 WASD 移动角色）。
- 传送 / 快速旅行用 **Waygate**，计价单位是 **Spirit Essence**（不是金币）。
- 死亡后回到 **Fountain of Rebirth**。

## 移动【1.0 官方 Wiki】

- **拖动地图，点你要去的地方**，角色会自己找最佳路线；角色出屏时看屏幕边缘的箭头。
- 服务器每发一次只走一格；需等角色站上目标格后再发下一格。
- **不能用 WASD 移动角色**：WASD / 方向键用于**移动地图视野**。
- 换图是显式的：站到 gate 格上**不会自动换图**，需要触发换图操作。

## 世界地图 World Map【1.0 官方 Wiki】

- 左下角有**图例**；悬停任意点显示：**采集节点、是否有敌人、地图编号、地图等级与生物群系、敌人等级与兴趣点**。
- **蓝色地图 = 有采集资源**（悬停会显示具体采集节点）；**红星 = 有任务**。
- 点击地图点会打开窗口，**去过且有传送卷轴**即可传送。
- **Lore Bubbles（背景气泡）**：地图上的兴趣点，带一段风味文本、彩蛋或玩笑。

## 地图详情 Map Details【1.0 官方 Wiki】

显示：区域**小地图预览**、地图名、**推荐等级**、**生物群系**、可点的 `Link to chat` 位置标签、可用的**采集图标**。底部按钮随情况变化：

- **Noble 订阅**免费传送城市；
- 用 **City Home Scroll**（有对应卷轴时）；
- 用 **World Teleport Scroll** 传送到任意地点。

## 路标 Waysign【1.0 官方 Wiki】

地图上的指示牌（常在城镇），点击后列出本图**兴趣点**：商店与 NPC（银行、旅店、铁匠等）、**通往其它地图的门**（带目的地名）、**Waygate** 等；按名称排序。点名称后地图会移动到该格并**闪烁标出**。

## 传送与快速旅行【1.0 官方 Wiki】

| 方式 | 说明 | 费用 |
|---|---|---|
| **Waygate** | 城市与部分野外图上的快速旅行网络；站在 Waygate（或用公会传送门）选择目的地传送 | **Spirit Essence**，`Tier² × 50`（T1 50 / T2 200 / T3 450 / T4 800 / T5 1250 / T6 1800） |
| **Home Scrolls** | Cartography 制作，传送到已访问过的特定城镇 | 卷轴 |
| **Teleportation Scrolls** | 传送到任何去过的地图（副本与秘密地图除外）；来自 Event Merchant 换票、Party Popper 礼物、特殊 Order Board 任务、Celestial Market | 卷轴 |
| **Infusion Stones** | 升级 Teleport 技能；每块石头可跳 200 个节点，点视野内任意节点直接传送，每跳一格扣 1 | 石头 |
| **Guild Portal** | 公会建筑，可传送到每个已解锁城市 | — |

- **Waygate 细节**（p/179）：目的地按**地图 Tier** 计费；**传送到 El Caspar 永远免费**；**Noble 订阅者**可免费传送到任何已发现城市（野外 Waygate 仍收费）；目的地需**已发现**才出现；若因城市盗窃欠 City Guard 保释金，则无法 Waygate 进入该城；技术性失败会**退还** Spirit Essence。
- **Spirit Essence** 来自战斗掉落、Geodes 等；数量显示在 Waygate 窗口顶部与 Currency Pouch。

## 走私路线 Smugglers' Routes【1.0 官方 Wiki】

- 隐藏的运输网络，连接远处区域；站在**走私路线格**上打开界面，按 **Ride** 付费**直达**。
- **费用 = 目的地等级 × 80 金币**（Lv1 = 80，Lv20 = 1600）；金币不足则取消行程、留在原地。
- 已发现的路线在**世界地图上以商队图标**标记；未探索过的地图不显示路线标记。

## 城镇 Towns & Cities【1.0 官方 Wiki】

共 **16 座**城镇（2026-10-21 官方复核）：

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
| Galkhatos | 45 | 5 | 3180/1890 |
| Dominion Spire | 50 | 6 | 2680/1547 |
| Laen Dorei | 50 | 6 | 3153/1085 |

**城镇 Tier 决定**：Client Order Board 的订单 Tier、商人卖的东西、可用的服务等级。

## 死亡

- 死亡后回到 **Fountain of Rebirth（泉水图）**。
- **PvE 死亡的真实代价**：装备耐久损耗、宠物 energy 损耗、被送回泉水图的跑图时间。
- **竞技场（Battle Arena）失败会扣战斗经验**。

## 相关

- [地图清单](/norr-wiki/world/maps/)
- [怪物图鉴](/norr-wiki/world/bestiary/)
- [副本与 Boss](/norr-wiki/quests/dungeons/)
- [船只与航海](/norr-wiki/systems/sailing/)

## 资料来源

- 官方 1.0 Wiki：世界地图（/p/35）、基础移动（/p/40）、地图详情（/p/168）、路标（/p/201）、传送与快速旅行（/p/55）、传送门（/p/179）、走私路线（/p/189）、城镇（/p/38），2026-10-21 抓取。