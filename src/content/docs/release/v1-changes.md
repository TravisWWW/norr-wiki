---
title: 1.0 机制变更
description: EA(v0.8.x) → 1.0 的系统差异总表，含状态、来源与关联玩法页。
gameVersion: "1.0"
verifiedDate: 2026-10-14
versionStatus: 1.0-announced
sources:
  - type: official
    reference: 官方 Discord #dev-blog（2026-04 ~ 2026-09）
    nature: 开发日志
    appliesTo: 1.0 测试服
    status: 已公布
---

> **本页回答「与旧版相比改了什么」；「这个系统现在怎么用」请看对应的玩法页。**
> 以下均为**开发日志口径**，1.0 实际实现**尚未实测**，部分改动在测试期被反复调整，**以 1.0 上线版本为准**。

## EA → 1.0 差异总表

| 系统 | EA 规则 | 1.0 已公布的变化 | 关联页面 |
|---|---|---|---|
| **副本入场** | 进入需消耗对应钥匙 | **免费入场**，击败 Boss 后**可选**用钥匙开 Lootbox | [副本与 Boss](/norr-wiki/quests/dungeons/) |
| **副本难度** | 无重生门槛 | Normal 重生 0+ / Nightmare 5+ / Chaos 10+；掉落次数随难度 | [副本与 Boss](/norr-wiki/quests/dungeons/) |
| **队伍** | 无正式队伍系统 | **Party 系统**：同图 + 等级差 ≤10 才有加成 | [社交机制](/norr-wiki/systems/social/) |
| **自动战斗** | 旧版技能选择机制 | **Impact Score** 决策系统，PvE / PvP 通用 | [战斗机制](/norr-wiki/combat/mechanics/) |
| **闪避上限** | 通常为 60% | 调整至 **50%**（Rogue 满级被动可达 60%） | [角色属性](/norr-wiki/combat/attributes/) |
| **攻速 / 额外打击** | 阈值 1400 | 阈值 **1900**，上限 **3 额外打击** | [战斗机制](/norr-wiki/combat/mechanics/) |
| **暴击** | — | Critical Chance **+33%**；敌人暴击 **-33%** | [角色属性](/norr-wiki/combat/attributes/) |
| **吸血公式** | 分母 ÷4 | 分母 **÷5** | [1.0 职业平衡](/norr-wiki/release/v1-class-balance/) |
| **逃跑** | 固定约 80% | 按**敌人等级与稀有度**计算 | [战斗机制](/norr-wiki/combat/mechanics/) |
| **珠宝** | 3 组（每组 7 属性） | **6 子组 + core 组**（每组 5 属性），新增 Life Steal | [宝石与镶嵌](/norr-wiki/equipment/jewels/) |
| **生活技能等级** | 常规等级 | 新增 **Paragon 等级**（全部生活技能） | [生活技能总览](/norr-wiki/professions/overview/) |
| **制作** | 基础配方 | 新增 **Masterworking / Trophy Enhancing / Exalting / Jewel Imbuing** | [大师制作](/norr-wiki/professions/masterworking/) |
| **采集挂机** | 离线采集 | 新 **Gather Queue**，3 槽队列 | [采集](/norr-wiki/professions/gathering/) |
| **银行 / 储物** | Stash | 更名 **Bank** 并大幅扩容；**可从银行直接制作** | [住房系统](/norr-wiki/systems/housing/) |
| **住房** | 无 | **Personal Estates**：额外存储 + Dock / Charter Box / Jewelry Box | [住房系统](/norr-wiki/systems/housing/) |
| **分线** | 无 | **Layer 系统**：按地图类型限制每层人数 | [地图、移动与传送](/norr-wiki/world/movement/) |
| **聊天** | 基础频道 | **Local 聊天 + 头顶气泡 + 表情 + 聊天翻译** | [社交机制](/norr-wiki/systems/social/) |
| **帮助文件** | 88 页 | **171 页**，公式与信息基本齐全 | [游戏帮助文档](/norr-wiki/reference/help-index/) |
| **成长** | 等级上限 40 | **上限 60** + **重生（Rebirth）** + **Codex** | [重生与进阶成长](/norr-wiki/combat/rebirth/) |
| **事件 / 日常** | 常规日常 | **事件日历** + 每日服务器事件（每周轮换）；日常 22 选 12 | [世界事件日历](/norr-wiki/quests/world-events/) |
| **物品 / 装备** | — | **Item Power**、新 tooltip、属性账号共享、**掉落率透明化** | [鉴定与装备](/norr-wiki/equipment/identify/) |
| **自管理 / 客服** | 联系 staff | **Unstuck 角色下拉**、**Bug 报告追踪**、游戏内 **Support / Ticket** | — |
| **UI / QoL** | — | 缩放上限 200%、世界地图战争迷雾、角色拖拽排序、职业总览窗口 | — |

> **状态说明**：上表所有 1.0 条目均为「**已公布（测试期口径）**」，**正式服待核实**。

## 需要单独说明的改动

### 银行 / 储物

- 原 **Stash 更名 Bank**，**大幅扩容**；制作、Trophy Enhancing、Refining、Ship / House / Guild 升级窗口均可**直接从银行取料**。

### 分线（Layer）

- 每类地图（**Fight Map / City Map / Overlord Map**）各有**每层玩家上限**；城市层上限更高。

### 自管理 / 客服

- **Unstuck 扩展**：新增角色下拉，可用**其他角色**解救卡住的角色（无需联系 staff）。
- **Bug 报告追踪**：可查看自己提交的 bug 报告并跟踪状态。
- **Level Up 奖励直接发放**（不再经邮件）。

### UI / QoL

- **缩放**：清晰像素，上限 **140% → 200%**。
- **世界地图**：tooltip 改进、**战争迷雾**、显示某活动的全部地点、地图不再越界滚动。
- **角色选择**：支持**拖拽排序**；**职业总览窗口**可随时查看职业、制作队列、采集队列。
- **药水阈值 HP / MP 分开**；屏幕抖动开关即时生效。
- **聊天不再重复消息**；修复大量视觉 / UI bug。

### 其他

- **移除会与真人混淆的 NPC 冒险者**。
- **Ship 大炮**：命中即秒杀敌人，掉落战利品并生成可拾取节点。
- **AFK / 离线采集经验**数值修正；**非战斗 HP / MP 回复**恢复。
- **Hardcore / Softcore**：共享银行问题修复；硬核市场不再列出软核物品。

## 存疑

- 以上均为**开发日志口径**，1.0 实际数值与实现**未实测**。
- 官方称「还有很多没列出的改动」——**完整变更清单不存在**。

## 相关

- [1.0 发布与开服](/norr-wiki/release/v1-overview/)
- [1.0 职业平衡](/norr-wiki/release/v1-class-balance/)
- [1.0 内容清单](/norr-wiki/release/v1-content/)
- [资料来源与证据等级](/norr-wiki/reference/sources/)

## 资料来源

- 官方 Discord：`#🔧dev-blog`（2026-04 ~ 2026-09 逐条开发日志）、`#📣announcements`、`#🔔game-updates`。
