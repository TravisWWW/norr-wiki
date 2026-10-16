---
title: 商人与药水
description: 交易行（官方 1.0）与 EA 版商人价格参考。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: mixed
sources:
  - type: official
    reference: 官方 1.0 Wiki Trading Post（p/63）、Market - Post Order（p/61）
    url: https://wiki.norroth.com/p/63/
    date: "2026-10-16"
  - type: observed
    reference: EA 版游戏内实测（商人价格表）
---

## 交易行 Trading Post【1.0 官方 Wiki】

- 玩家之间的**挂单市场**（不是 NPC 商店）；分 **Equipment Post**（装备、宝石、宠物、工具）与 **Materials Post**（原材料、制作材料、消耗品）。
- **手续费**：挂买单 / 卖单收**买卖价的 2.5%**；当买卖价**超过商店价 10 倍**时收 **10%**。
- **价格标签**（基于商店价）：**买材料** `A` 划算（< 2x）、`E` 贵（> 10x）、`F` 天价（> 20x）；**卖材料** `F` 亏（≤ 商店价）、`B` 尚可（10x–20x）、`A` 极佳（> 20x）。
- **Post Order**：设自定义数量与价格的买单；**金币会被冻结**直到卖家成交或你取消。
- 买到的东西进**邮箱**，需要领取。

## 卖东西（EA 版参考）

- **材料按资源名卖，装备按槽位卖**。
- **必须站在 NPC 格子上**：否则商人对不了话、无法交易。
- 卖材料会同时完成日常「Sell Resource to Vendor」。

## 买东西与药水（EA 版参考）

资源名必须**完全匹配**。**Alchemist 库存（El Caspar）单价参考**：

| 物品 | 单价 | 用途 |
|---|---|---|
| Tiny Health Potion | 20 | 回血 |
| Tiny Mana Potion | 20 | 回蓝 |
| Tiny Rejuvenation Potion | 16-32 | 回血 + 回蓝 |
| Tiny Attack Speed / Critical Strike / Armor Penetration / Spell Damage Potion | 20 | 战斗增益 |
| Mucky Fish Oil | 4 | 炼金材料 |

游戏会按「低于 X% 血量」**自动喝血药**，所以常备几百瓶 Tiny Health Potion 是较经济的防死手段。

## El Caspar 全 NPC 商人买入价（EA 版参考）

> 下列为**玩家向 NPC 购买**的价格，采集于 EA 版某次实测；商店库存动态、价格相对稳定。**1.0 是否一致待核实。**

| NPC | 主要商品（实测价） |
|---|---|
| **Cook** | Mucky Vegetables/Fruits/Meat 各 **4**、Minnow **4** |
| **Fisherman** | Copper Fishing Rod **64**、Minnow 4、Mucky Abandoned Fishing Net 16 |
| **Cartographer** | Aspen Gall 4、Aspen Gall Ink 4、**Identification Scroll 88**、Mucky Blueprint 8、Mucky Hide 4、Mucky Scroll 4 |
| **Stonemason** | Mucky Conglomerate 16、Slate 4、Slate Bricks 32、Slate Floor Tiles 32、Slate Gravel 16、Slate Pillars 32 |
| **Jeweler** | Cabochon 宝石各 **12**、Mucky Geode 16、Cabochon Jewel 16 |
| **Carpenter** | Aspen Gall 4、Aspen Handle 16、Copper Chopping Axe 64、Aspen Pistol Crossbow 48 |
| **Toolsmith** | Copper Mining Pick / Farmer Hoe / Chopping Axe / Fishing Rod 各 **64** |
| **Alchemist** | Cabochon Orb 28、Mucky Fish Oil、Aspen Novice Wand/Staff 56 |
| **Armorsmith** | Copper Boots/Gloves（Heavy）等装备 + 材料 |
| **Leatherworker** | Mucky Bone Leather Boots/Gloves/Belt（Medium）各 **48** |
| **Hunter** | Mucky Skull Ring **32**、Mucky Skull Necklace、Aspen Short Bow 48 |
| **Tailor** | Cotton Sandals/Bracers（Light）各 **64** |
| **Weaponsmith** | Copper Spear（Druid）/ Copper Shortsword（Berserker,Zealot）等 |
| **Inn** | Buy / Sell / **Rest at the inn（1 币）** |
| **Stash** | Switch to Inventory / Stack to Stash |
| **Trading Post** | Collect Coin Balance、市场挂单 |
| **Wishing Well** | 投 **3 币** → Possible Loot（抽奖） |

**比价要点**：鉴定卷轴在 **Weaponsmith = 22**，在 **Cartographer = 88**（同一物品，差价 4 倍）——**买前先比价**。

## 商店库存是动态的（EA 版参考）

> NPC 商店的**库存数量随机、约每 2 小时刷新一次、且有限额**，可能被其他玩家买空；但**档次是固定的**（1 级城市只卖 T1 材料，10 级城市卖 T2 档）。记录的「库存数字」仅为某一时刻快照。

## 相关

- [物品与容器](/norr-wiki/equipment/items/)
- [经济与货币](/norr-wiki/systems/economy/)
- [代币商店](/norr-wiki/systems/token-shops/)

## 资料来源

- 官方 1.0 Wiki：Trading Post（/p/63）、Market - Post Order（/p/61），2026-10-16 抓取。
- 游戏内实测（EA 版）：商人价格表、动态库存。