---
title: 1.0 职业技能变化详解
description: 逐职业对照 EA 与 1.0 官方 Wiki 的技能树：分组重构、技能增删、解锁等级、机制变化与影响分析。
gameVersion: "1.0"
verifiedDate: 2026-10-16
versionStatus: mixed
sources:
  - type: official
    reference: 官方 1.0 Wiki 职业页（Archmage 136 / Berserker 137 / Druid 138 / Ranger 139 / Rogue 140 / Zealot 141）
    url: https://wiki.norroth.com/p/139/ranger
    date: "2026-10-15"
  - type: game-client
    reference: 游戏客户端技能数据 tooltip_texts.js（P20250820，含 skill_json 全量技能定义）
    url: https://www.norroth.com/includes/js/P20250820/tooltip_texts.js
    date: "2026-10-15"
---

> **本文用途**：把 1.0 官方 Wiki / 客户端技能数据与我们的 EA 版技能树逐条对照，说明**每个职业到底改了哪些地方**，并分析改动带来的玩法影响。
> 数据来源为**官方 1.0 Wiki 职业页** + **游戏客户端技能定义**（`skill_json`），非测试服爆料。
> EA 基线来自游戏内帮助文档（`skills.json`，**EA 技能上限 20 级**口径）。

## 0. 阅读说明与口径

- **技能总数口径**：按"技能条目"计数；同一技能若同时属于两个职业（如 `natural_resistance` 属于 Druid + Ranger），在各自职业内各计一次。
- **效果口径**：1.0 客户端把攻击类技能的伤害基数由 EA 的 **Weapon Damage %** 统一改称 **Base Damage %（基础伤害）**；被动类则由 **Weapon Damage** 改称 **Physical Damage（物理伤害）**。这是**全局术语/公式口径变化**，下文的"新增/移除"已剔除这类系统性改名，只保留真实的技能增删与机制变化。
- **技能等级上限：1.0 = 10（EA = 20）**。官方 Wiki 六个职业页把**全部 170 个技能**都标为 `skill-level=10`，页面即以 **Lv.10 口径**展示（`wiki.js` 把 `skill-level` 当作 tooltip 的显示等级）。1.0 客户端 `skillbook.min.js`（P20250820）的加点逻辑把上限**硬编码为 `0xa`（=10）**：`divideSkillPoint` 在结果 >10 时拒绝并提示 `Skill Maxed`，「+」按钮在等级 ≥10 时禁用。旁证：1.0 客户端每级增量约为 EA 帮助页的 **2 倍**（如 Blade Mastery EA Lv.20 = +43% / +24%，1.0 Lv.10 = +41% / +23%），即「等级数减半、每级增量加倍、满级值基本不变」。EA 帮助页以 `(Lv. 20)` 展示，实测 Lv17 角色可点到 16 → EA 上限 20。
  > 仍待确认：1.0 是否保留 EA 的「技能等级 ≤ 角色等级 − 1」限制（1.0 客户端加点逻辑里未见该判断）。

## 1. 总览

| 职业 | EA 技能数 | 1.0 技能数 | 净变化 | 新增 | 移除 | 分组重构 |
|---|---|---|---|---|---|---|
| Archmage 法师 | 27 | 26 | −1 | 1 | 2 | Misc → Mana / Offensive |
| Berserker 狂战士 | 30 | 30 | 0 | 4 | 4 | Misc → Offense / Rage / Defense |
| Druid 德鲁伊 | 27 | 27 | 0 | 0 | 0 | Misc → Defense / Thorns / Spirit |
| Ranger 游侠 | 27 | 25 | −2 | 10 | 12 | 新增弩系/陷阱/精准/狩猎，**删除整套匕首系** |
| Rogue 盗贼 | 29 | 29 | 0 | 1 | 1 | Misc → Mobility / Trickery / Sabotage |
| Zealot 狂热者 | 29 | 33 | +4 | 7 | 3 | 武器精通拆分 + 新增盾系/Spirit/Zeal |

> **一句话结论**：1.0 的职业改动以**"分组重构 + 专精化"**为主——把 EA 里笼统的 `Misc（杂项）` 拆成有主题的流派组；其中 **Ranger 被彻底重塑为纯远程**（砍掉匕首系）、**Zealot 扩充最多**（盾系独立 + 锤系补全）、**Berserker 新增怒气（Rage）机制**。

---

## 2. Archmage 法师（27 → 26）

- **分组**：`Arcane / Lightning / Fire Mastery + Misc` → 三系精通 **+ Mana（法力）+ Offensive（进攻）**，Misc 仅保留 `magic_orb`、`treasure_finder`。
- **新增 1 个**：`lightning_thrust`（闪电穿刺，Lv.5）。
- **移除 2 个**：`lightning_attack`（EA 闪电直伤）、`mana_armor`（EA 法力换防御）。

**新增**

| 技能 | 分组 | 解锁（角色等级） | 消耗 | Lv.1 效果 |
|---|---|---|---|---|
| lightning_thrust | Lightning Mastery | 角色 Lv.5 | 30 MP · CD3 | 基础伤害 55%、闪电伤害 25、混乱 10 |

**移除（EA 口径）**

| 技能 | 原分组 | 类型 | EA Lv.1 效果 |
|---|---|---|---|
| lightning_attack | Lightning Mastery | 法术 | +25% 闪电伤害、+10% 致混乱 |
| mana_armor | Misc | 被动 | +70 基础防御、+50 基础抗性、+30 坚韧、−25 法力 |

**影响分析**

- 三系（奥术/闪电/火焰）技能结构**完全对称化**：每系都是 `精通 → 弹 → 穿刺 → 风暴 → 衰弱 → 光束` 六级递进；`lightning_thrust` 正是补齐闪电系缺失的"穿刺"位。
- **失去 `mana_armor`**：法师少了"以法力换防御"的生存手段，生存压力转向 `glass_cannon`（玻璃大炮）与 `mana_shield`（法力护盾）的取舍。
- **Mana 独立成组**（`mana_pool / mana_recovery / mana_shield`）：法力管理由杂项升级为**显式流派**，法师 build 开始区分"蓝量续航"与"爆发输出"。

---

## 3. Berserker 狂战士（30 → 30）

- **分组**：`Sword / Axe / Mace Mastery + Misc` → 三系精通 **+ Offense（进攻）+ Rage（怒气）+ Defense（防御）**。
- **新增 4 个**：`seismic_leap`、`primal_rage`、`ancestral_fury`、`blood_rage`。
- **移除 4 个**：`ancestral_assistance`、`war_god_shout`、`ancestral_seismic_leap`、`natural_resistance`。

**新增**

| 技能 | 分组 | 解锁（角色等级） | 消耗 | Lv.1 效果 |
|---|---|---|---|---|
| seismic_leap | Offense | 角色 Lv.8 | 10 MP · CD8 | 基础伤害 60%、闪电伤害 50、眩晕 50 |
| primal_rage | Rage | 角色 Lv.7 | 30 MP · CD7 | 格挡几率 −100%、基础防御 −2%、攻速 100、命中 150、暴击伤害 50 |
| ancestral_fury | Rage | 角色 Lv.9 | 被动 | 奥术伤害 5%、闪电伤害 5% |
| blood_rage | Defense | 角色 Lv.9 | 被动 | 生命偷取 15、生命偷取 4% |

**移除（EA 口径）**

| 技能 | 原分组 | 类型 | EA Lv.1 效果 |
|---|---|---|---|
| ancestral_assistance | Misc | 被动 | +5% 奥术伤害、+5% 闪电伤害 |
| war_god_shout | Misc | 增益 | +10% 武器伤害、+10 暴击几率 |
| ancestral_seismic_leap | Misc | 攻击 | +30 武器伤害、+100 闪电伤害、+50% 致眩晕 |
| natural_resistance | Misc | 被动 | +20 基础抗性 |

**影响分析**

- 新增 **Rage（怒气）** 独立机制组，是本次狂战士最核心的设计变化：`primal_rage` 是**自我减益换爆发**（格挡几率 −100%、基础防御 −2%，换攻速/命中/暴击伤害），把狂战士"高风险高输出"的定位写进技能机制。
- `ancestral_seismic_leap`（EA）→ `seismic_leap`（1.0）为**同思路位移+眩晕技能的重做**，从杂项移入 Offense 组。
- `blood_rage` 归入 **Defense 组**，生命偷取成为狂战士的**续航核心**（与官方 dev-blog "Blood Rage +4%、Life Steal 公式 ÷5" 的调整一致）。
- **移除 `war_god_shout`（团队增益）与 `ancestral_assistance`（被动增伤）**：狂战士的团队辅助属性被削弱，整体转向**自我强化**。

---

## 4. Druid 德鲁伊（27 → 27）

- **技能零增删**，仅把 `Misc` 拆为 **Defense（4）/ Thorns（2）/ Spirit（3）**。
- **影响分析**：玩法基本不变，属**结构清理**；`Thorns`（荆棘）独立成组，说明**荆棘反伤流被正式承认为独立流派**；`Spirit` 组集中了生命/回复类被动。

---

## 5. Ranger 游侠（27 → 25）—— 本次改动最大

- **分组**：`Bow Mastery / Dagger Mastery / Misc` → **Bow Mastery / Crossbow Mastery / Traps / Precision / Hunting / Defense**。
- **新增 10 个**：`venom_barrage`、`piercing_bolt`、`boltnet_shot`、`crimson_volley`、`snare_trap`、`dazing_trap`、`poison_cloud_trap`、`bear_trap`、`perfect_shot`、`choking_spores`。
- **移除 12 个**：整套 **Dagger Mastery（9 个匕首技能）** + 弓系 `bodkin_arrow`、`sharp_arrow`、`arrow_barrage`。

**新增**

| 技能 | 分组 | 解锁（角色等级） | 消耗 | Lv.1 效果 |
|---|---|---|---|---|
| venom_barrage | Bow Mastery | 角色 Lv.20 | 30 MP · CD7 | 基础伤害 110%、毒素伤害 20、毒素伤害 30%、感染 20 |
| piercing_bolt | Crossbow Mastery | 角色 Lv.2 | 5 MP · CD2 | 基础伤害 45%、致流血 15、暴击伤害 5%、破甲 10 |
| boltnet_shot | Crossbow Mastery | 角色 Lv.12 | 20 MP · CD4 | 基础伤害 85%、定身 55、致流血 20 |
| crimson_volley | Crossbow Mastery | 角色 Lv.20 | 30 MP · CD6 | 基础伤害 100%、攻速 50、攻速 20% |
| snare_trap | Traps | 角色 Lv.2 | 14 MP · CD3 | 基础伤害 45%、定身 40 |
| dazing_trap | Traps | 角色 Lv.6 | 16 MP · CD3 | 基础伤害 45%、混乱 40 |
| poison_cloud_trap | Traps | 角色 Lv.8 | 25 MP · CD4 | 基础伤害 50%、毒素伤害 25、混乱 40 |
| bear_trap | Traps | 角色 Lv.11 | 25 MP · CD4 | 基础伤害 55%、流血伤害 50、定身 45 |
| perfect_shot | Precision | 角色 Lv.11 | 20 MP · CD4 | 命中 100、暴击几率 50 |
| choking_spores | Traps | 角色 Lv.16 | 30 MP · CD5 | 基础伤害 50%、毒素伤害 100、感染 50 |

**移除（EA 口径）**

| 技能 | 原分组 | 类型 | EA Lv.1 效果 |
|---|---|---|---|
| bodkin_arrow | Bow Mastery | 远程 | +20% 武器伤害、+15% 致眩晕 |
| sharp_arrow | Bow Mastery | 远程 | +10% 武器伤害、+20% 致流血、+5% 暴击伤害 |
| arrow_barrage | Bow Mastery | 远程 | +1.2 打击段数、+10 武器伤害 |
| dagger_mastery | Dagger Mastery | 被动 | +5% 武器伤害、+5.25% 致流血 |
| double_dagger_throw | Dagger Mastery | 远程 | +20 武器伤害、+20 攻速 |
| jagged_dagger_throw | Dagger Mastery | 远程 | +20 武器伤害、+10 流血伤害、+10% 致流血 |
| poison_dagger_throw | Dagger Mastery | 远程 | +20 武器伤害、+10 毒素伤害、+10% 感染 |
| boomerang_dagger | Dagger Mastery | 远程 | +20% 武器伤害、+15% 致眩晕 |
| back_stab | Dagger Mastery | 攻击 | +25% 武器伤害、+20% 暴击几率 |
| knee_cutter | Dagger Mastery | 攻击 | +30% 武器伤害、+20% 定身、+20% 致流血 |
| throat_cutter | Dagger Mastery | 攻击 | +10% 武器伤害、+20% 致流血、+15% 沉默 |
| serpentine_strike | Dagger Mastery | 攻击 | +20% 武器伤害、+20 暴击几率、+30% 毒素伤害、+100% 感染 |

**影响分析**

- **游侠不再能玩匕首流**：整套 `Dagger Mastery`（9 个技能，含被动与近战攻击）被移除，匕首精通改为**盗贼专属**（`dagger_mastery` 现在 `for_class=rogue`）。游侠从 EA 的"弓 + 匕首"近远混合，重塑为**纯远程专精**。
- **新增弩系（Crossbow Mastery）**：与弓系并列的第二条远程武器线，走**破甲 / 流血**路线，与弓系的**中毒 / 感染**路线形成两条 build 分支。
- **新增陷阱系（Traps）**：`snare / dazing / poison_cloud / bear / choking_spores` 提供定身、混乱、中毒等控制，游侠获得**区域控制 / 埋伏**玩法（官方 dev-blog 亦确认 Bear Trap 由眩晕改为定身、Poison Cloud Trap 改为混乱）。
- **Precision / Hunting 独立成组**：命中暴击（精准）与对动物/人形增伤、鹰/鸦召唤（狩猎）从杂项升格为显式流派。
- **代价**：失去全部近战手段后，游侠**被贴脸时更脆弱**，生存完全依赖 `improved_reflexes` / `natural_resistance` / `bandage` 等 Defense 组技能与走位。

---

## 6. Rogue 盗贼（29 → 29）

- **分组**：`Dagger / Throwing / Fists Mastery + Misc` → 三系精通 **+ Mobility（机动）+ Trickery（诡计）+ Sabotage（破坏）**。
- **新增 1 个**：`ghost_spikes`；**移除 1 个**：`shadow_spikes`。

**新增**

| 技能 | 分组 | 解锁（角色等级） | 消耗 | Lv.1 效果 |
|---|---|---|---|---|
| ghost_spikes | Throwing Mastery | 角色 Lv.10 | 15 MP · CD2 | 基础伤害 75%、暗影伤害 50、恐惧 15 |

**移除（EA 口径）**

| 技能 | 原分组 | 类型 | EA Lv.1 效果 |
|---|---|---|---|
| shadow_spikes | Throwing Mastery | 远程 | +25 武器伤害、+25 暗影伤害、+10% 致恐惧 |

**影响分析**

- `shadow_spikes` → `ghost_spikes` 属**同定位技能替换**（暗影投掷），机制与数值升级（新增恐惧）。
- `Mobility / Trickery / Sabotage` 三组独立，把 EA 杂项里的**机动（闪避/位移）、诡计（偷窃/减益）、破坏（炸弹/破防）**三条副流派显式化，盗贼的"工具人/控制"定位更清晰。

---

## 7. Zealot 狂热者（29 → 33）—— 扩充最多

- **分组**：`Weapon Mastery + Light / Dark Mastery + Misc` → **Sword Mastery / Hammer Mastery（武器精通拆分）+ Shield Mastery + Light / Dark Mastery + Spirit + Zeal**。
- **新增 7 个**：`divine_wrath`、`parry_stance`、`faithbreaker`、`down_to_earth`、`iron_reckoning`、`hammer_of_justice`、`hammer_of_doom`。
- **移除 3 个**：`light_aura`、`holy_light_bubble`、`spirit_breaker`。

**新增**

| 技能 | 分组 | 解锁（角色等级） | 消耗 | Lv.1 效果 |
|---|---|---|---|---|
| hammer_of_justice | Hammer Mastery | 角色 Lv.3 | 20 MP · CD3 | 基础伤害 40%、光明伤害 30 |
| hammer_of_doom | Hammer Mastery | 角色 Lv.3 | 20 MP · CD3 | 基础伤害 40%、暗影伤害 30 |
| iron_reckoning | Hammer Mastery | 角色 Lv.10 | 30 MP · CD5 | 物理伤害 50 |
| down_to_earth | Hammer Mastery | 角色 Lv.20 | 50 MP · CD7 | 基础伤害 80%、眩晕 10 |
| parry_stance | Sword Mastery | 角色 Lv.10 | CD10 | 闪避 100、格挡几率 10 |
| faithbreaker | Zeal | 角色 Lv.7 | 24 MP · CD8 | 命中 −100、攻速 −50、暴击伤害 −50 |
| divine_wrath | Zeal | 角色 Lv.15 | 40 MP · CD7 | 基础伤害 60%、光明伤害 20、光明伤害 20%、光辉 10 |

**移除（EA 口径）**

| 技能 | 原分组 | 类型 | EA Lv.1 效果 |
|---|---|---|---|
| light_aura | Light Mastery | 增益 | +10 格挡几率、+10 格挡值 |
| holy_light_bubble | Light Mastery | 增益 | +100 闪避、+10 攻速 |
| spirit_breaker | Dark Mastery | 减益 | −100 生命上限、−15 法力 |

**影响分析**

- **盾系（Shield Mastery）独立成组**：`shield_mastery / shield_throw / phalanx / shield_bash` 从 EA 的杂项升格为独立武器线，**盾战（坦克）成为独立流派**。
- **锤系（Hammer Mastery）大幅补全**：新增 `hammer_of_justice`（光）、`hammer_of_doom`（暗）、`iron_reckoning`（增伤）、`down_to_earth`（AoE 眩晕），锤从"单一武器"变成**完整武器线**，且光暗双修路线明确。
- **新增 Zeal（狂热）组**：`faithbreaker`（强力减益：命中 −100 / 攻速 −50 / 暴击伤害 −50）、`balanced_touch`、`divine_wrath`、`dark_leech_aura`，代表狂热者的**光暗均衡 / 爆发**流派。
- **新增 Spirit 组**：`mana_influx / true_vigor / invigoration / royal_blood`（法力、命中、生命、寻宝），补齐续航与收益。
- **移除 `light_aura` / `holy_light_bubble`（光系防御增益）与 `spirit_breaker`（暗系减益）**：光暗系从"辅助/防御"进一步**偏向输出**，防御职能交给独立的盾系承接。

---

## 8. 其他发现

### 8.1 全局术语口径变化（非技能增删）

- 攻击类技能伤害基数：EA **Weapon Damage %** → 1.0 **Base Damage %（基础伤害）**。
- 被动类增伤：EA **Weapon Damage** → 1.0 **Physical Damage（物理伤害）**。
- 部分技能属性重命名：EA `Base Resist` → 1.0 `base_resistance`；EA `Extra gold finding` → 1.0 `gold_find`；`Counter Strike` 属性在 1.0 被移除（相关被动改写，见[1.0 职业平衡](/norr-wiki/release/v1-class-balance/)）。

### 8.2 客户端存在但官方 Wiki 未收录的职业

游戏客户端技能数据（`skill_json`，P20250820）中除上述 6 个职业外，还包含 **Stormherald（风暴使者，约 30 技能：锤/枪精通 + 风暴/寒冰魔法 + 盾）** 与 **Plaguebringer（瘟疫使者，约 29 技能：瘟疫/暗影魔法 + 药剂 + 虹吸）** 的完整技能定义，但**官方 1.0 Wiki 的 Classes 分类下仅有 6 个职业页**，未收录这两个职业。

> **状态待确认**：二者可能是 1.0 新增/即将上线职业，也可能是客户端遗留数据。本文按"客户端已实装、官方 Wiki 未收录"如实记录，**不将其计入 6 职业对比**。

### 8.3 技能等级上限

**技能等级上限：1.0 = 10（EA = 20）**。官方 1.0 Wiki 六个职业页把**全部 170 个技能**都标为 `skill-level=10`（页面即以 Lv.10 口径展示）；1.0 客户端 `skillbook.min.js`（P20250820）的加点逻辑把上限**硬编码为 `0xa`（=10）**。详见[技能系统](/norr-wiki/combat/skills/)。

---

## 相关

- [1.0 职业平衡（测试期口径）](/norr-wiki/release/v1-class-balance/)
- [1.0 官方 Wiki 详细变更记录](/norr-wiki/release/v1-official-wiki-changes/)
- [职业总览](/norr-wiki/classes/)
- [技能系统](/norr-wiki/combat/skills/)

## 资料来源

- 官方 1.0 Wiki 职业页：`/p/136/archmage`、`/p/137/berserker`、`/p/138/druid`、`/p/139/ranger`、`/p/140/rogue`、`/p/141/zealot`（2026-10-15 抓取）。
- 游戏客户端技能数据：`https://www.norroth.com/includes/js/P20250820/tooltip_texts.js`（`skill_json` 全量技能定义，2026-10-15 抓取）。
- EA 基线：游戏内帮助文档技能树（`skills.json`，EA 技能上限 20 级口径）。
- 官方 Discord `#🔧dev-blog`（2026-05 ~ 2026-07）职业平衡条目（用于交叉验证）。
