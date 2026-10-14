---
title: 游戏介绍与入门
description: Norroth 是什么、两个站点、版本说明，以及从登录到第一次战斗的新手步骤。
gameVersion: "EA"
verifiedDate: 2026-10-13
versionStatus: mixed
sources:
  - type: official
    reference: 游戏内帮助文档与官方商店页
  - type: observed
    reference: 游戏内实测
---

## 结论速览

- Norroth（Steam 上名为 **Norroth Online**）是一款**手绘风、格子制（tile-based）**的 MMORPG。
- **EA 版**（`legacy.norroth.com`）目前支持浏览器运行，是当前可玩的版本；`www.norroth.com` 是新前端 / 官网。
- **1.0 正式版**计划通过 **Steam** 发行，官方商店页已列出 **Windows / macOS / Linux** 系统需求，并提供简体中文与繁体中文界面。
- 游戏内知识库是官方**帮助文档**（Help File）。
- **同一账号只能有一个活动会话**：第二个客户端登录会让第一个掉登录。

## 游戏简介

| 项 | 内容 |
|---|---|
| 名称 | Norroth（Steam 上叫 Norroth Online） |
| 类型 | 手绘风、格子制 MMORPG |
| 官网 | https://www.norroth.com/ |
| Steam | [Norroth Online（appid 2503480）](https://store.steampowered.com/app/2503480/Norroth_Online/) |
| 运行方式 | EA 版支持浏览器运行；1.0 将通过 Steam 发行 |
| 中文 | Steam 版提供简体 / 繁体中文界面；网页版无中文 |

游戏以格子（tile）为单位移动与战斗，包含 6 个职业、生活技能、副本、宠物、公会、住房与航海等系统。

## 两个站点

| 站点 | 用途 | 说明 |
|---|---|---|
| **legacy.norroth.com** | 可玩的游戏（EA 版） | 目前唯一能进入的服务器 |
| www.norroth.com | 新版前端 / 官网 / 帮助文档 | 与 legacy 为不同前端 |

> **版本说明**：`legacy.norroth.com` 是 **EA（Early Access）版本**，也是目前唯一能进的服务器。
> 正式版（**1.0 / Steam**）上线后，端点、数值与内容都可能变化，相关规则需重新核验。

## 新手第一步：从登录到第一次战斗

下面按实际游玩顺序列出上手步骤。具体数值随版本可能变化，机制以游戏内为准。

### 1. 进入游戏与创建角色

1. 浏览器打开 **`legacy.norroth.com`**，注册 / 登录账号。
2. 创建角色时从 **6 个职业**中选一个（见[职业总览](/norr-wiki/classes/)）；职业决定可用的武器与制作技能，创建后不易更改，建议先看职业页。
3. **同一账号只能有一个活动会话**：在别处再登录会把当前会话挤掉。

### 2. 认识界面

- **地图**：主画面就是当前格子地图，可拖动查看。
- **技能栏**：位于界面下方。**第 1 格固定为普通攻击**，自动战斗只会用到 **第 2~5 格**。
- **Mailbox 按钮**：界面下方，随时打开邮局，任何地图都能收发（见[邮件](/norr-wiki/systems/mail/)）。
- **任务日志**：记录 Main / Side / Daily / Order / Bounty 五类任务。

### 3. 移动

- **拖动地图 → 点目的地**，角色会自己寻路；角色出屏时看屏幕边缘的箭头。
- 服务器一次只走一格，等角色站上目标格后再发下一格。
- **换图是显式的**：站到 gate 格上**不会自动换图**，需要触发换图操作。详见[地图、移动与传送](/norr-wiki/world/movement/)。

### 4. 战斗

- 走到**怪物格**上即触发**回合制战斗**；双方每回合各行动一次，先手由攻速决定。
- **敌人名字颜色 = 相对你的等级**：灰名不给经验，黄名同级，红名危险但经验最多。
- 战斗结束后角色恢复可移动状态，可继续前往下一个战斗格。
- 详细规则见[战斗机制](/norr-wiki/combat/mechanics/)。

### 5. 拾取与拾荒

- 战斗掉落会进**掉落窗**，需要**手动领取**。
- 制皮材料（Hide / Bone / Chitin 等）主要靠**拾尸（Scavenging）**：在**尸体还挂着**时额外搜一次。
- 详细见[采集](/norr-wiki/professions/gathering/)。

### 6. 接任务与交任务

- **接任务**：任何地点都能接，不必站在 NPC 前。
- **交任务**：在任务日志里点 **Finish / 完成**；奖励进掉落窗，需手动领取。
- **主线不在任务板上**，靠任务链逐环推进。详见[主线任务链](/norr-wiki/quests/main-story/)。

### 7. 生活技能（采集 / 制作）

- **采集**：装备对应工具（钓竿 / 镐……），站在采集点上操作。
- **制作**：必须站在**制作台 / 对应 NPC 处**才能制作，野外无法制作。
- 生活技能进度**账号共享**，删角色不丢失。详见[生活技能总览](/norr-wiki/professions/overview/)。

### 8. 死亡与复活

- 死亡后回到 **Fountain of Rebirth（泉水图）**，该图只有一个传送门。
- 实测 **HP 回满、经验没有损失**；PvE 死亡的真实代价是**装备耐久损耗、宠物 energy 损耗与跑图时间**。

## 新手村与第一张地图

- 起点是 **El Caspar**（Lv.1 城镇，Arodas 新手区）。
- **出不了新手村**：新手村最左侧有一格宽的门。
- 适合 Lv1-10 的新手区地图链（→ 表示 gate 连通）：

```
El Caspar(1) → Elena's Crossroad(1-3) → Akelay Foothills(4-6) → Akelay Cave L1(4-6) → Akelay Cave L2(6-9)
El Caspar(1) → Brisban Pond(1-3) → Arodas Lakeshore(4)
El Caspar(1) → Southern Foothill(1-3) → Bay's Alley(4-6)
```

完整城镇与地图列表见[地图清单](/norr-wiki/world/maps/)。

## 常见问题（登录 / 入口）

- **找不到入口 / 出不了新手村**：新手村最左侧有一格宽的门。
- **登录后卡界面**：把网址后缀改为 `login` 重新登录。
- **注册卡住**：尝试切换到 `legacy` 旧版。
- **频繁掉登录**：通常为同一账号在别处登录所致。

## 相关

- [职业与技能](/norr-wiki/classes/)
- [战斗机制](/norr-wiki/combat/mechanics/)
- [地图、移动与传送](/norr-wiki/world/movement/)

## 资料来源

- 官方商店页（Steam）：<https://store.steampowered.com/app/2503480/Norroth_Online/>
- 游戏内帮助文档。
- 游戏内实测（EA 版）：站点差异、登录与会话行为、新手区地图链。
