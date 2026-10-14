---
title: 社交机制
description: 队伍系统、Local 聊天与气泡、表情、右键交互，以及交易与邮件入口。
gameVersion: "mixed"
verifiedDate: 2026-10-14
versionStatus: mixed
sources:
  - type: official
    reference: 官方 Discord #dev-blog / #the-inn / #questions
---

> **资料状态**：以下为**开发者官方口径**，队伍与聊天多为 **1.0** 信息，**尚未在 1.0 正式服实测**。

## 队伍系统（Party）【1.0 已公布】

- **实时同步**：邀请 / 踢人 / 离开 / 转让队长均即时更新到所有成员的 Party UI。
- **队伍加成条件**：**所有在线成员必须在同一张地图**，且**最高与最低等级差 ≤ 10**，加成才生效。
- **副本邀请**需满足对应**重生等级**（Normal 重生 0+ / Nightmare 5+ / Chaos 10+，见[副本与 Boss](/norr-wiki/quests/dungeons/)）。
- 官方口径：队伍系统属于 1.0 的多人内容，与**世界 Boss、远征、公会 vs 公会（GvG）**并列。

## 右键交互【1.0 已公布】

- **右键角色**可进行**组队 / 交易 / 私聊**等操作。
- **移除了会与真人混淆的 NPC 冒险者**（1.0），避免误判。

## 聊天与表情

- **Local 聊天标签**：与**同一张地图**的玩家聊天，副本 / 远征内也可用；发言会在角色头顶弹出**文字气泡**。
- **表情**：可使用任意 emoji；另有文字码（如 `(C)`=🍪、`(L)`=❤️ 等），`/emojis` 命令快速打开对应帮助页。
- **聊天翻译选项**（1.0 新增）。
- **Reactive NPCs / Guards / Town Crier**：NPC 会对玩家行为做出反应。

## 交易与邮件

- 玩家之间的**挂单市场**是 [Trading Post](/norr-wiki/equipment/vendors/)（不是 NPC 商店）。
- 玩家之间**转移物品**用[邮件](/norr-wiki/systems/mail/)（游戏内没有直接交易 / 赠送窗口，交易依赖 TP 挂单与邮件）。

## 相关

- [角色与账号](/norr-wiki/systems/characters/)
- [公会系统](/norr-wiki/systems/guilds/)
- [邮件](/norr-wiki/systems/mail/)
- [副本与 Boss](/norr-wiki/quests/dungeons/)

## 资料来源

- 官方 Discord：`#🔧dev-blog`、`#🍺the-inn`、`#🗿questions`。
