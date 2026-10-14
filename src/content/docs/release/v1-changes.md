---
title: 1.0 机制变更
description: Norroth 1.0 相对 EA(v0.8.x) 的系统与机制改动：副本、队伍、自动战斗、珠宝、制作、银行、分线、成长与 UI。
gameVersion: "1.0"
verifiedDate: 2026-10-14
versionStatus: 1.0-announced
sources:
  - type: official
    reference: 官方 Discord #dev-blog / #announcements（2026-04 ~ 2026-09）
---

> **资料状态**：以下为**开发日志口径**，1.0 实际数值与实现**尚未实测**；部分改动在测试期被反复调整，**以 1.0 上线版本为准**。
> 职业数值见[1.0 职业平衡](/norr-wiki/release/v1-class-balance/)，内容清单见[1.0 内容清单](/norr-wiki/release/v1-content/)。

## 1. 副本（Dungeon）机制重做【2026-05-20】

- **进入副本永久免费**（不再消耗钥匙进入）。
- 击败 Boss 后生成 **Loot Box**，**可选**用钥匙开启。
- **难度决定掉落次数**：**Normal** 1× ／ **Nightmare** 1× + 50% 概率第二次 ／ **Chaos** 2×。
- **不再自动传出**：可用进入时的门离开，或按 Leave 按钮。
- **难度入场门槛**（队伍邀请进本）：**Normal 重生 0+ / Nightmare 重生 5+ / Chaos 重生 10+**（不达标不能加入）。
- **Emberdust** 作为 Nightmare / Chaos 副本掉落（按副本 Tier 与难度缩放）。

## 2. 队伍系统（Party）【2026-05-14 / 06-15】

- 实时同步：**邀请 / 踢人 / 离开 / 转让队长**均即时更新到所有成员的 Party UI。
- **队伍加成条件**：**所有在线成员必须在同一张地图**，且**最高与最低等级差 ≤ 10**，加成才生效。
- 副本邀请需满足对应重生等级（见上）。
- 社交：v1.0 可**右键角色**进行组队 / 交易 / 私聊等操作。

## 3. 自动战斗（Auto-Combat）重做【2026-06-11】

- 改为 **impact-score（影响分）决策系统**：更聪明地选择技能与药水。
- **只从当前技能栏取技能**；该技能栏同样复制进 Battle Arena。
- 同时适用于 **PvE 与 PvP**。
- 因敌人也变聪明，**敌人整体强度略微下调**以保持平衡。
- 药水使用滑块随新系统调整（HP / MP 阈值**分开设置**，2026-09-27）。

## 4. 珠宝（Jewel）系统重做【2026-07-28 / 07-29】

- 由旧 **3 组**（Defensive / Offensive / Utility，每组 7 属性）改为 **6 个子组、每组 5 属性**，另有一个 core-group：
  - **Power**（进攻）、**Precision**（进攻）
  - **Siphon**（防御）、**Bulwark**（防御）、**Aegis**（防御）
  - **Fortune**（辅助）
- 目的：让同组堆叠更易出现，珠宝制作更有价值。
- 新增 **Life Steal** 到珠宝 → 相应下调 Berserker Blood Rage 与 Life Steal 公式（见[职业平衡](/norr-wiki/release/v1-class-balance/)）。
- 测试期所有旧珠宝已移除；可在 Build Tester NPC 免费生成。

## 5. 制作系统扩展

- **Masterworking（大师制作）**：**每个职业 1 个专属配方 + 1 种专属材料**；解锁需完成**任务线**（要求各 Tier 材料，利于低阶材料经济）。已实装任务线的职业：**Armorsmithing、Weaponsmithing、Hunting、Tailoring、Jeweling**（Carpenter 等陆续）。
- **Trophy Enhancing（战利品强化）**：消耗材料，图标为骨头。
- **Exalting（升华）**：图标为金色翅膀。
- **Jewel Imbuing（珠宝灌注）**：图标为绿色箭头。
- **从银行直接制作 / 强化 / 精炼 / 升级**：制作、Trophy Enhancing、Refining、Ship / House / Guild 升级窗口均可**直接从银行取料**。
- 配方可见性：**高至 +9 级的配方**会以半透明显示（点击提示错误，表明配方存在但未解锁）。
- 材料可**锁定**（与装备锁定类似）。

## 6. AFK / 采集队列【2026-07-18】

- 旧「10 个 AFK 槽」被否决（像负担）。
- 改为 **Gather Queue（采集队列，3 槽）**，类似 Craft Queue；**恢复采集计时器**（"Zzz" 按钮 + 弹窗显示耗时）。
- **Noble 玩家额外第 3 槽**（保持非 P2W）。
- 与 Craft Queue 一样，队列**离线 / 换角色仍继续**（Legacy v0.8.2 只能 1 角色挂机）。

## 7. 银行 / 储物

- **超大银行存储**（原 Stash 更名 Bank）。
- **从银行直接制作**（省去来回搬运）。
- **Housing（房屋）**：提供大量额外存储；Dock / Charter Box、Jewelry Box 等可从个人庄园直接访问。

## 8. 分线（Layer）系统【2026-09-30】

- 因开服人数超预期（Steam 愿望单数周破 2000），为缓解同图拥挤引入 **layer 分层**。
- 每类地图（**Fight Map / City Map / Overlord Map**）各有**每层玩家上限**；城市层上限更高，普通图更低。

## 9. 社交与聊天

- **Local 聊天标签**：与同图玩家聊天，副本 / 远征内也可用；发言会在角色头顶弹出**文字气泡**。
- **表情**：可使用任意 emoji；另有文字码（如 `(C)`=🍪、`(L)`=❤️），`/emojis` 命令快速打开帮助页。
- **聊天翻译选项**（1.0 新增）。
- **Reactive NPCs / Guards / Town Crier**：NPC 会对玩家行为做出反应。

## 10. 帮助文件（Help File）【2026-09-17】

- 6 个月内从 **88 页扩到 171 页**。
- 新增 / 完善：Personal Estates、Crafting Queue、Support（Account / Payments / Technical 三类）、Gathering 地点总览、Emojis 等。
- 官方称「所有公式与信息都写进帮助文件了」。

## 11. 成长系统

- **重生系统（Rebirth）**：重生后可获得更多属性与内容；重生等级是副本难度门槛。
- **Paragon Levels**：**所有生活技能**均有 Paragon 等级。
- **战斗等级上限提升到 60**（EA 为 40；早期曾计划 100）。
- **Codex（图鉴）**：**Bestiary（怪物）/ Artifacts（神器）/ Augments（强化）**；Augments 可通过分解收集入 Codex。
- **成就**：新增大量成就与分类，**每个成就解锁一个称号（cosmetic title）**。

## 12. 事件与日常

- **事件日历（Event Calendar）**：显示每日不同事件与节日 Overlord 名称。
- **每日服务器事件**：如 **Wandering Merchant、Starlit Hunt、Hidden Hoard** 等，且**每周轮换**。
- **Overlord 每天刷新 3 次**（01:00 / 10:00 / 19:00 servertime）。
- **日常任务**：22 个任务可选，**只需完成 12 个**即可拿满每日奖励（官方澄清「非强制」）。

## 13. 战斗与数值规则（1.0 口径）

| 项 | 1.0 口径 |
|---|---|
| **Attack Speed** | Bonus Strikes 阈值 1400 → **1900**，**上限 3 额外打击** |
| **Max Evasion** | 上限 **60% → 50%**（Rogue 满级被动可达 60%） |
| **Critical Chance** | 效果 **+33%**；**敌人暴击 -33%** |
| **Counter Strike** | **属性移除**（易混淆），相关职业被动改写 |
| **Life Steal 公式** | `(LS ÷ 5) ÷ (LS ÷ 5 + 400 + 85 × level)`（分母由 ÷4 改 ÷5） |
| **Blind** | **Boss 免疫** |
| **伤害类型** | 伤害加成**只放大对应类型的技能**（如 +Fire Damage 只作用于火系技能） |
| **Flee（逃跑）** | 重新平衡（原约 80% 固定成功率） |

## 14. 物品与装备

- **Item Power**：新增指标，综合品质 / 伤害 / 属性 / 孔位等评估装备好坏。
- **新 item tooltip**：重设计；稀有度名称写入 tooltip（色盲友好）。
- **属性 Account-wide**：大量属性改为账号共享，并加入 Overview 页。
- **锁定**：可锁定装备，也可**锁定材料**。
- **Trading Post**：新增分类；交易历史（Trade History）。
- **掉落透明化**：每个 mob 的掉落表透明化，**显示掉率 %**。
- **Pathfinder's Crate**：改为**每类各 1 件**（防重复）。
- **等级 55 / 59 配方**、Tier 6 物品图标补齐。

## 15. 自管理 / 客服

- **Unstuck 扩展**：新增角色下拉，可用**其他角色**解救卡住的角色（无需联系 staff）。
- **Bug 报告追踪**：可查看自己提交的 bug 报告并跟踪状态。
- **游戏内 Support 页 + Ticket 系统**。
- **Level Up 奖励直接发放**（不再经邮件）。

## 16. UI / QoL

- **缩放（Zoom）**：清晰像素，**上限 140% → 200%**。
- **世界地图**：tooltip 改进、**战争迷雾（Fog of War）**、显示某活动的全部地点、地图不再越界滚动。
- **角色选择**：支持**拖拽排序**。
- **职业总览窗口**：可随时查看职业、制作队列、采集队列。
- **采集点筛选**：可直接搜索采集点（无需翻帮助）。
- **药水阈值 HP / MP 分开**；**屏幕抖动开关**即时生效。
- **Steam 客户端**：分辨率 / 窗口 / 全屏设置；**语言选择**（官网首页）。
- **聊天不再重复消息**；修复大量视觉 / UI bug。

## 17. 其他变更

- **移除会与真人混淆的 NPC 冒险者**。
- **Ship 大炮**：命中即秒杀敌人，**掉落战利品并生成可拾取节点**（v0.8 会漏掉 mob 掉落）。
- **AFK / 离线采集经验**数值修正；**非战斗 HP / MP 回复**恢复。
- **Hardcore / Softcore**：共享银行问题修复（现可共享）；硬核市场不再列出软核物品。

## 存疑

- 以上均为**开发日志口径**，1.0 实际数值与实现**未实测**。
- 官方称「还有很多没列出的改动」——**完整变更清单不存在**。

## 相关

- [1.0 发布与开服](/norr-wiki/release/v1-overview/)
- [1.0 职业平衡](/norr-wiki/release/v1-class-balance/)
- [1.0 内容清单](/norr-wiki/release/v1-content/)
- [副本与 Boss](/norr-wiki/quests/dungeons/)

## 资料来源

- 官方 Discord：`#🔧dev-blog`（2026-04 ~ 2026-09 逐条开发日志）、`#📣announcements`、`#🔔game-updates`。
