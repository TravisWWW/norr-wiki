---
title: 商人与药水
description: 买卖、商人价格表、动态库存、交易站。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: ea-verified
sources:
  - type: observed
    reference: 游戏内实测
---

## 卖东西

- **材料按资源名卖，装备按槽位卖**。
- **必须站在 NPC 格子上**：否则商人对不了话、无法交易。
- 卖材料会同时完成日常「Sell Resource to Vendor」。

## 买东西与药水

资源名必须**完全匹配**。**Alchemist 库存（El Caspar）单价参考**：

| 物品 | 单价 | 用途 |
|---|---|---|
| Tiny Health Potion | 20 | 回血 |
| Tiny Mana Potion | 20 | 回蓝 |
| Tiny Rejuvenation Potion | 16-32 | 回血 + 回蓝 |
| Tiny Attack Speed / Critical Strike / Armor Penetration / Spell Damage Potion | 20 | 战斗增益 |
| Mucky Fish Oil | 4 | 炼金材料 |

游戏会按「低于 X% 血量」**自动喝血药**，所以常备几百瓶 Tiny Health Potion 是较经济的防死手段。

## El Caspar 全 NPC 商人 **买入价**（玩家购买，参考）

> 下列为**玩家向 NPC 购买**的价格，采集于 EA 版某次实测；商店库存动态、价格相对稳定。

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

## 卖出价（NPC 收购，参考）

| 物品 | 单价（coin） |
|---|---|
| Identification Scroll | **22** |
| Tiny Rejuvenation Potion | 8 |
| Tiny Health / Mana Potion | 5 |
| Mucky Soil Lump | 4 |
| Minnow / Mucky Meat / Slate / 各类 Mucky 材料 | **1** |

> 同一物品的**买入价与卖出价不同**（例如鉴定卷轴买入 88、卖出 22），比较时勿混用。

## 商店库存是动态的

> **说明**：NPC 商店的**库存数量随机、约每 2 小时刷新一次、且有限额**，可能被其他玩家买空。
> 但**档次是固定的**：**1 级城市只卖 T1 材料**，10 级城市（Elundi）卖 T2 档。
>
> 记录的「库存数字」仅为某一时刻的快照，**不代表固定值**；价格（4 币/个等）相对稳定，库存不稳定。

→ 需要大量材料时通常无法一次买足，可分批购买、自行采集/制作，或使用 Trading Post。

## 交易站（Trading Post）

- 交易站是**玩家之间的挂单市场**（不是 NPC 商店）。**购买必须在交易站格子上才生效**。
- 买到的东西进**邮箱**，需要领取；同时完成日常「Buy on the Trading Post」。
- 挂单卖出后钱先进入 **Coin Balance**，要在面板上点 **Collect** 才进钱包。
- 用途：Order 任务要的冷门材料在这里能买到；用不上的材料也可挂单出售，价格通常高于 NPC 的 1 币/个。

## Trading Post 经济改动【官方 · 2025-03-01】

| 项 | 改动 |
|---|---|
| 挂单手续费 | **5% → 2.5%**，且**按每单**收取 |
| 标准槽位 | **25 → 50** |
| Noble 玩家 | **无限槽位** |
| 最低买单价 | **= 商店价 × 2**（鼓励用 TP 而非直接卖商店） |

> 目的：让玩家更愿意通过 Trading Post 交易，而不是把材料直接卖给 NPC。

## 相关

- [物品与容器](/norr-wiki/equipment/items/)
- [经济与货币](/norr-wiki/systems/economy/)
- [代币商店](/norr-wiki/systems/token-shops/)

## 资料来源

- 游戏内实测（EA 版）：商人价格表、动态库存、交易站行为。