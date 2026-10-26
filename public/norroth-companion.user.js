// ==UserScript==
// @name         norroth小伴侣
// @namespace    https://www.norroth.com/
// @version      2.6.161
// @description  Norroth 挂机助手：自动战斗与采集、跨图导航、自动补给、维修清包、多角色轮转、运行统计。
// @author       TravisWWW
// @updateURL    https://traviswww.github.io/norr-wiki/norroth-companion.user.js
// @downloadURL  https://traviswww.github.io/norr-wiki/norroth-companion.user.js
// @supportURL   https://traviswww.github.io/norr-wiki/
// @match        *://norroth.com/*
// @match        *://*.norroth.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/* ============================================================================
 * 游戏接口速查（实测 · 2026-10 新前端 www.norroth.com 校对）
 *   站点      登录/游戏都在 www.norroth.com（legacy 为旧 EA 前端，DOM/接口基本一致）
 *   移动      walkTo(x, y)                服务端寻路，逐格；走到带 action 的格子自动触发
 *             （新前端另有 WebSocket 同步：sendWalkQueue / applyRemoteWalkQueue / continueWalking，
 *               以及 findClosestEnemyTile / walkToEnemy 等寻敌辅助，本脚本按需调用）
 *   怪物      #players_container span.enemy#enemy{x}-{y}（另有 data-anchor="{x}-{y}"）
 *             星级 = .char_name_tag.text_small 的文本/图标（Normal / Champion / Rare / Elite）
 *             名称 = b.char_name_tag，形如 "Sasquatch (1)"
 *   资源      .map_table [action="collect_scrap"|"pick_up"][coords]
 *   采集点    .map_table .tile_poi[action="gathering"][name]
 *   出口      .map_table .tile_poi[action="gate"][name] = 目标地图名（新前端可 useGate() / execTileAction('gate')）
 *   工匠      .map_table .tile_poi[action]，名字里带 smith 的才能修（Stonemason 不行）
 *   战斗      #frame_Combat 出现即开战。★ 新前端「自动战斗」是一个开关：
 *             #frame_Combat 里的 input#auto_combat（onchange=changeOpt('combat')）。
 *             脚本会在开战瞬间确保它处于勾选状态（否则角色只会挨打、永远打不死怪）。
 *   拾取      #frame_Loot 里的 input[name=loot_all]（= takeLoot('all')）★ 经验只在拾取时结算
 *   用药      updateInventory('Use', key)
 *   背包占用  GET /modal/inventory 里的 "Inventory (X/Y)"
 *   宠物状态  GET /modal/character 里 class="pet" 那段 tooltip
 *   CSRF      新前端有防护：window.NORROTH_CSRF_TOKEN，
 *             游戏的 $.ajaxSetup 会自动给 POST 带上 csrf_token；本脚本只用 GET，不受影响
 * ========================================================================== */

(function () {
  'use strict';

  /* ======================= 1. 常量 / 默认配置 ======================= */

  const RANKS = ['Elite', 'Rare', 'Champion', 'Normal'];   // ★ 默认优先级：3星 > 2星 > 1星 > 普通
  const RANK_CN = { Elite: '精英', Rare: '稀有', Champion: '冠军', Normal: '普通' };
  const RANK_STAR = { Elite: '★★★', Rare: '★★', Champion: '★', Normal: '—' };
  const RANK_STARS = { Elite: 3, Rare: 2, Champion: 1, Normal: 0 };   // ★ 星级数值（用于「采集中断条件」过滤）
  /* ★ v2.6.19：采集点类型 —— 直接用游戏自己的 data-poi → 采集技能 映射
     （travel.min.js 的 gathering_names，实测：poi_1 fishing / poi_2 mining / poi_3 chopping / poi_4 farming / poi_61 quarrying / poi_81 foraging）。
     注：poi_81 = foraging，界面上显示为「觅食」（原来叫「拾荒」容易和 Scavenging 混）。
     这样「采集点是什么类型」完全不看界面文案，中英文一致。 */
  const POI_PROF = { poi_1: 'fishing', poi_2: 'mining', poi_3: 'chopping', poi_4: 'farming', poi_61: 'quarrying', poi_81: 'foraging' };
  const PROF_POI = { fishing: 'poi_1', mining: 'poi_2', chopping: 'poi_3', farming: 'poi_4', quarrying: 'poi_61', foraging: 'poi_81' };
  /* ★ 模式名称（v1.7.1 起模式由勾选项推导） */
  const MODE_CN = { auto: '一键挂机', battle: '只打怪', gather: '只采集', tower: '爬塔' };
  const TASK_CN = { battle: '战斗', gather: '采集', tower: '爬塔' };

  const DEFAULTS = {
    /* 战斗 */
    rankOrder: RANKS.slice(),// 星级优先级（下标越小越优先）
    rankOff: [],             // 不打勾的星级
    monsterFilter: '',       // 指定怪物名单（每行一个）；空 = 全打
    monsterBlacklist: '',    // ★ v2.6.55：怪物黑名单（每行一个）—— 这里面的怪一律不打
    mobListMode: 'white',    // ★ v2.6.55：怪物名单输入框当前编辑哪个名单：'white' 优先名单 / 'black' 黑名单
    targetMode: 'priority',  // ★ v2.6.74：战斗索敌模式 —— 'priority' 优先任务 / 'distance' 优先距离 / 'all' 全图列表（三选一）
    questMonsters: false,    // 派生（= targetMode 为 priority/all）：把「未完成的任务怪」并入名单
    nameFirst: false,        // 派生（= targetMode 为 all）：不做名单过滤（名单外也打），名单内的排前面
    zoomUnlock: true,        // ★ 地图缩放解锁（新前端）：Ctrl+滚轮交给浏览器缩放；滚轮范围放宽到 0.4×~4×
    worldMapUnlock: true,    // ★ v2.6.80：世界地图解锁 —— 补齐所有未访问地图点 + 去掉战争迷雾（显示上解锁）
    monsterLvMin: 0,         // ★ 融合：只打等级 ≥ 此值的怪（0 = 不限）
    monsterLvMax: 0,         // ★ 融合：只打等级 ≤ 此值的怪（0 = 不限）

    /* 补给 */
    autoPotion: true,
    hpPotion: '', mpPotion: '',
    hpPct: 70, mpPct: 30,
    potionDelayMs: 1500,     // ★ 两瓶药之间的最小间隔（避免连点浪费）
    bagList: [],
    bagScanned: false,       // ★ v2.6.117：背包至少扫描过一次（否则不能判「没吃的」，不暂停）
    pauseNoSupply: true,     // ★ v2.6.117：需要补血/补蓝但背包里没物品了 → 暂停挂机

    /* 宠物 */
    petFeedOn: false,
    petEnergyPct: 50,

    /* 采集 */
    gatherPoint: '',
    gatherInterrupt: true,      // ★ 采集时优先打怪：有合适目标就中断采集去打（勾=一键挂机，不勾=只采集）
    gatherInterruptRank: 'any', // 'any'=任意怪；'r1'=★1星以上；'r2'=★2星以上；'r3'=★3星（精英）
    gatherScrap: true,          // ★ 捡地面资源（Crate / Mushroom / …）唯一开关：战斗/挂机/采集 都看它
    gatherFlee: false,          // ★ 融合：只采集模式下遇怪自动逃跑（点游戏自带「逃跑」，不打断采集）
    highlightSelf: true,        // ★ 融合：给自己精灵加一圈描边，人多时一眼找到自己

    /* 动画加速（合并自「动画加速器」） */
    speedK: 1,                  // 加速倍率 1~5（支持 1 位小数），1 = 原速（★ v2.6.154：默认改为 1）
    speedCombatOnly: true,      // ★ 固定「只加速战斗动画」：生产/搜刮/采集/走格/UI 都有服务器校验，一律不加速
    winScale: 100,              // ★ 高级：游戏弹窗（战斗 / 背包 / professions / activities / bank …）缩放百分比（20~100）
    /* ★ 真人化动作间隔：每个动作（走格 / 点游戏按钮 / 开窗口）之间随机等 min~max 毫秒 */
    humanDelay: false,          // 开关（默认关）
    humanDelayMin: 200,         // 最小间隔(ms)
    humanDelayMax: 1000,        // 最大间隔(ms)
    humanRhythm: true,          // ★ 节拍抖动：内部定时器/节流阈值也加同一个 min~max 随机波动
    humanJitter: true,          // ★ 阈值抖动：血量/耐久/背包/卡死 阈值每次随机漂移
    humanJitterPct: 10,         // 阈值抖动幅度（%）
    humanMicroOn: false,        // ★ 微停顿：以一定概率在动作前插一段更长的停顿
    humanMicroPct: 5,           // 微停顿概率（%）
    humanMicroMin: 1000,        // 微停顿最短(ms)
    humanMicroMax: 4000,        // 微停顿最长(ms)
    humanRotWaitOn: false,      // ★ 多角色轮转：任务完成后随机等一段再切
    humanRotWaitMin: 60,        // 等待最短（秒）
    humanRotWaitMax: 600,       // 等待最长（秒）
    humanIdleActOn: false,      // ★ 无用操作：定期随机开一个面板再关掉
    humanIdleActMin: 3,         // 间隔最短（分钟）
    humanIdleActMax: 12,        // 间隔最长（分钟）
    humanMistakeOn: false,      // ★ 移动偶发失误：先走错一格再走真目标
    humanMistakePct: 3,         // 失误概率（%）
    navSegOn: false,            // ★ 分段导航（v2.6.129）：长距离移动改两段式（先到目标前一格，再到目标点位）
    navSegDist: 5,              // 多少格算「长距离」（超过才启用两段式；默认 5）
    /* ★ v2.6.133：段间停顿（固定值，不随机）*/
    navSegPauseMs: 300,         // 段间停顿(ms)


    /* 维修 / 清包 */
    repairOn: false,
    /* ★ v1.8.1：维修规则 = 「真实耐久低于维修阈值就去修」。
       为什么不能只看 HUD 图标：#hud_Equipment 只反映「破损（属性失效）」，
       采集工具在还剩几十点时就采不动了，图标根本不亮。
       真实耐久来源：/modal/character（含全部工具）+ 采集弹窗实时值。 */
    repairDurPct: 15,        // ★ 维修阈值(%) —— 唯一的耐久设置：任一装备 耐久 ≤ max×该百分比 就去维修。
    repairPath: '',          // 旧版手填路径（未选城镇时的回退）
    serviceTown: '',         // ★ 维修/清包城镇（拜访过的 City 的 id）
    useWaygateCity: false,   // ★ 城市传送点：导航时考虑「传送到城市」（Noble 走世界地图免费传；非 Noble 走传送站 Cities 页）
    useWaygateWild: false,   // ★ 野外传送点：导航时考虑「传送到野外锚点」（只能走传送站 Wilderness 页）
    farmMap: '',             // ★ 挂机地图（阵亡回图 / 切图判断都用它）
    farmMapLocked: false,    // ★ v2.6.54：锁定挂机地图 —— 锁上后「开始挂机」不再改写它；释放 = 清空，回到「开始那一刻所在地图」
    sellOn: false,
    sellFreeMin: 5,
    sellEquipMaxLv: 0,       // ★ 出售/拆解等级上限（0 = 不限等级）
    clearAction: 'sell',     // ★ 自动清包方式：'sell' 出售 / 'salvage' 拆解
    sellRarity: '',          // ★ 自动清包品质：'' = 不限；否则只处理「低于该品质」的装备（normal<magic<rare<epic<mystical<ascended<legendary<relic<unique）
    /* ★ 自动存仓：背包快满时去银行点「快速存入」（可与「自动清包」同开；休整顺序：出售/拆解 → 存仓 → 修理） */
    autoDeposit: false,

    /* ★ 多角色轮转（1 主 + 最多 3 副，各自 idle 采集） */
    multiChar: false,        // 多角色轮转总开关
    mcChars: [],             // [{id,name,role,enabled,gatherMap,nodeX,nodeY,profession,serviceTown,repairOn,depositOn}]

    /* 挂机模式 */
    task: 'battle',             // ★ 任务：battle(战斗) / gather(采集) / tower(爬塔)
    towerDiff: 1,               // ★ 爬塔难度：1=Normal / 2=Nightmare / 3=Chaos
    towerTown: '',              // ★ 爬塔出发城镇（空 = 自动选最近的城镇）
    towerStopDeath: false,      // ★ 爬塔停止条件：阵亡即停
    towerStopSupply: false,     // ★ 爬塔停止条件：补血/补蓝药耗尽即停
    towerStopFloor: 0,          // ★ 爬塔停止条件：爬到第 N 层停（0 = 不限）
    runMode: 'auto',            // ★ 只读派生值（由 task + autoGather 推导，见 normalizeCfg）；不再有下拉
    stuckSec: 45,               // 卡住自愈：连续 N 秒无任何进展就复位一次；0 = 关闭
    notifyOnStop: true,         // 异常停止时发浏览器通知 + 改标题提醒
    autoRespawn: true,          // 阵亡后自动点「Continue」复活并继续挂机
    autoGather: true,           // ★ 无怪时自动去采集点（关 = 只打怪，打完就等刷新 / 切图）
    autoMapSwitch: false,       // ★ 无怪时自动切图刷怪（去隔壁图打怪，清完回挂机图刷新；等级/名单/黑名单/星级按当前筛选）
    mapSwitchIdleSec: 6,        // 连续无目标多少秒后触发切图
    autoEvent: false,           // ★ 活动自动进入：检测到活动开启就进活动图采集，结束后回原图继续（战斗/采集/爬塔都生效）
    eventRes: '',               // ★ 活动图里要采的资源类型（'' = 自动，按外面的采集点类型匹配）
    autoOverlord: false,        // ★ v2.6.135：自动打 Overlord（世界 Boss，服务器时间 01:00 / 10:00 / 19:00 刷新）
    ovlLeadSec: 20,             // 刷新前多少秒开始尝试进入（以最新倒计时为准）
    ovlLeaveSec: 600,           // ★ v2.6.159：进房后多久还没开打就兜底离场（秒；不影响已开打的长战斗）
    sweepFrames: true,          // ★ 自动关闭「意外弹窗」（挂机踩到 NPC/服务格时游戏自动弹的）；真人手动打开的窗口不受影响

    /* 其它 */
    moveTimeout: 15,
    autoResume: true,

    /* ★ 工作外观（v1.9.0）：把游戏配色换成中性灰 / 工程图，元素照常可见可点 */
    skin: 'grid',            // 'off' 原版 | 'gray' 灰阶 | 'grid' 工程图（默认）
    skinLast: 'grid',        // 热键切回来时用哪个
    skinMute: true,          // 工作外观开启时静音

    /* UI */
    uiFold: false,
    uiTab: 'idle',
    uiX: null,               // 面板左上角（null = 首次自动放到右下角）
    uiY: null
  };

  const CFG_KEY = 'norroth_autofarm_cfg';
  const RUN_KEY = 'norroth_autofarm_run';
  const RUN_TTL = 10 * 60 * 1000;
  const LOG_KEY = 'norroth_autofarm_log';          // ★ 操作日志落盘（刷新/掉线后还能看）
  const STOP_KEY = 'norroth_autofarm_laststop';    // ★ 上次为什么停
  const RESPAWN_MAP = 1000;                        // ★ 重生泉水（Fountain of Rebirth）：只有传送站、没怪，绝不能当挂机地图
  const CFG_VER = 2;         // 配置结构版本：升级时做一次迁移
  const SCRIPT_VER = '2.6.161';   // 与 @version 保持一致

  /* ★ 图鉴数据放在一个【只放图鉴数据】的专用仓库里，绝不放网站代码。
     原因：GitHub 细粒度令牌只能按仓库授权、不能按路径授权。要让令牌「只能传图鉴数据」，
     唯一可靠的做法就是让它只够得着一个纯数据仓库 —— 这样它碰不到 norr-wiki，
     也碰不到 TravisWWW 下任何其它项目（尤其是共用 traviswww.github.io 同源域名的 Pages）。 */
  var GH_REPO = 'TravisWWW/nor-database';
  var GH_BRANCH = 'main';
  var GH_CONTRIB_DIR = 'contrib';
  var GH_TOKEN_KEY = 'norroth_gh_token';
  /* ★ 社区令牌【不写进脚本】—— GitHub 会拦截（push protection）甚至吊销提交进公开仓库的 PAT。
     改由 CI 从仓库 Secret 生成一个纯文本文件放到 Pages 上，脚本运行时拉取（带缓存）。
     好处：令牌不进 git、不会被 secret scanning 拦；轮换只要改 Secret 重新部署，不用发新版脚本。 */
  var GH_COMMUNITY_TOKEN = '';
  var GH_TOKEN_URL = '';
  var _ghTokLoaded = false;

  /* 通知 norr-wiki 立刻合并（尽力而为；需要该令牌对 norr-wiki 有 Actions: write。
     没有也不影响 —— norr-wiki 每 5 分钟会自己拉一次兜底）。 */
  var GH_WIKI_REPO = 'TravisWWW/norr-wiki';
  var GH_WIKI_BRANCH = 'main';
  var GH_WIKI_MERGE_WF = 'bestiary-merge.yml';
  /* ★ v2.6.77：在线更新。
     脚本托管在 GitHub Pages（和中文 Wiki 同一个仓库 / 同一次部署），元数据块里的
     @updateURL / @downloadURL 都指向下面这个地址 —— Tampermonkey 会按自己的周期
     （默认每天，可在设置里改成更短）静默拉取并自动升级。
     这里再补一层「每次进游戏都查一次」的轻量检查：只读同目录的 norroth-companion.json
     （几百字节，带 CORS 头），发现远端版本更高就把右上角版本号变成可点的升级角标。
     注意：只有「从网址安装」的脚本才会自动更新；本地文件 / 复制粘贴安装的不会。 */
  const UPD_BASE   = 'https://traviswww.github.io/norr-wiki/';
  const UPD_SCRIPT = UPD_BASE + 'norroth-companion.user.js';
  const UPD_META   = UPD_BASE + 'norroth-companion.json';
  const UPD_MIN_MS = 5 * 60 * 1000;   // 同一浏览器 5 分钟内只查一次，避免刷页面刷请求

  const _iconCache = new Map();   // ★ 融合：物品图标缓存（key -> 图片 URL）
  const TICK = 400;
  const ACTION_MIN = 900;

  /* ======================= 2. 状态 ======================= */

  /* ★ 装备品质顺序（低 → 高，官方 refining 页口径）：normal < magic < rare < epic < mystical < ascended < legendary < relic < unique */
  const RARITY_ORDER = ['normal', 'magic', 'rare', 'epic', 'mystical', 'ascended', 'legendary', 'relic', 'unique'];
  const RARITY_CN2 = { normal: '普通', magic: '魔法', rare: '稀有', epic: '史诗', mystical: '神秘', ascended: '飞升', legendary: '传说', relic: '遗物', unique: '独特' };
  let cfg = loadCfg();
  let running = false;
  let runSeq = 0;             // 每次运行/暂停/停止换代，旧的异步结果不得发起新动作
  let walkSeq = 0;            // abortWalk 使尚未发出的旧走位失效，独立于挂机开关
  let navCancelSeq = 0;       // 暂停/停止/取消导航，使整个旧行程失效（内部重寻路不换代）
  let _walkRequestOwner = null;
  const _walkRequests = new Set();
  let timer = null;

  const st = {
    phase: 'idle', mode: null,
    move: null, lastAction: 0, lastUse: 0,
    kills: 0, gathers: 0, roundKills: 0,
    map: null,
    blacklist: {},
    reach: null,
    inCollect: false,
    lootSince: 0,
    potionFail: {},
    pet: { lastCheck: 0, lastFeed: 0, level: 0, energy: 0, max: 0, food: 0, tier: 0 },
    pendingCheck: null,
    healing: false,          // ★ 正在补血/补蓝（补到阈值前不寻敌）
    lastStats: 0,
    gatherRetryAt: 0,
    gatherIdleSince: 0, gatherResync: 0,   // ★ 采集看门狗：进度条不转的累计时间 / 重试次数
    gatherQuickAt: 0,                      // ★ v2.6.158：本次「到位」后已做过一次快速主动开采的时间戳
    /* ★ 活动自动进入（采集）：phase = idle | enter | in | return */
    event: { on: false, phase: 'idle', busy: false, homeMap: 0, homePoint: '', homeRes: '', homeType: '', pointName: '', enteredAt: 0, lastCheckAt: 0, timeLeft: null, score: null,
             busyAt: 0, checkAt: 0, checkFails: 0, combatSkipAt: 0, lastLogAt: 0, lastHas: null,
             gateBusy: false, gateLogAt: 0, combatMap: 0 },   /* ★ v2.6.101：战斗型活动的「进战斗区」状态 */
    /* ★ v2.6.135：Overlord（世界 Boss）自动参战 */
    ovl: { on: false, phase: 'idle', nextEpoch: 0, boss: '', lastPoll: 0, logAt: 0, joinedAt: 0, fought: false, idleLogAt: 0, leaveBusy: false, leaveAt: 0, leaveTries: 0, roomMap: 0, joinMap: 0, enteredAt: 0, goneAt: 0 },
    tripManual: false, tripOrigin: null,
    gatherFighting: false,   // 采集模式里"正在打怪"的标记
    repair: { active: false, cooldownUntil: 0, failCount: 0, smith: null, route: null },
    sell: { active: false, cooldownUntil: 0, lastCheck: 0, free: 0, cap: 0, force: false, freeAt: 0 },   // ★ v2.6.78：freeAt = 触发本次行程时用的阈值
    bank: { active: false, cooldownUntil: 0, lastCheck: 0, free: 0, cap: 0, force: false },
    target: null,            // 当前锁定的目标（面板展示用）
    statusText: '就绪',
    scanAt: 0, scanCache: null,
    runStart: 0,                                   // 本次挂机开始时间
    runMarkAt: 0,                                  // ★ 运行标记心跳（刷新/掉线后能续挂）
    nudging: 0,                                    // ★ 卡死强恢复进行中（此期间主循环让路）
    settling: 0,                                   // ★ 兜底[落位] 正在「走开一格再走回」强制同步服务端位置（此期间主循环让路）
    pos: { at: 0, x: 0, y: 0, hits: 0 },           // ★ 兜底[落位] 上一次「走路被打断」的时间/位置（= 可能失同步）
    mapload: { at: 0, hits: 0 },                   // ★ 兜底[切图卡住] 加载页开始停留的时间 / 连续重试次数
    render: { map: 0, at: 0, hits: 0 },            // ★ 兜底[换图没重画] 上次检查的图 / 开始停留时间 / 连续重画次数
    entity: { at: 0 },                             // ★ 兜底[怪物列表过期] 上次强制拉取实体列表的时间
    userActAt: 0, userFrames: {},                  // ★ 真人操作时间 / 真人手动打开的窗口（自动关弹窗 + 游戏 closeFrames 都要跳过）
    log: [], logOpen: false,                       // 操作日志（环形缓冲）
    perf: { samples: [], lastAt: 0, lastExp: 0, total: 0 },   // 收益统计
    /* ── 兜底 / 看门狗状态（写法约定见下面「兜底机制总表」）───────────────
       watch    卡住自愈      frozen  走位卡死      gather*  采集看门狗
       return*  回图看门狗    move.*  走位重试      repair/sell/bank.* 休整冷却
       约定：at = 上次判定/动作时间 · hits = 连续触发次数 · nextAt = 下次允许触发 · fails = 连续失败次数 */
    watch: { x: 0, y: 0, exp: 0, kills: 0, at: 0, heals: 0 }, // 兜底[卡住自愈] 位置/经验/击杀快照 + 连续触发次数
    frozen: { pos: '', at: 0, hits: 0 },                      // 兜底[走位卡死] 位置快照 + 连续触发次数
    returnRetryAt: 0, returnFails: 0,                         // 兜底[回图] 下次重试时间 / 连续失败次数
    homeOffSince: 0, homeGuardAt: 0,                          // ★ v2.6.160 兜底[回图] 离开挂机图的起始时间 / 上次登记回图待办的时间
    /* ── 爬塔 / 随机浏览面板（v2.6.66：原来只靠动态赋值，这里显式声明便于阅读；初始值都取「未设置」）── */
    towerFloor: 0, towerGateSeen: false, towerEntered: 0,       // 爬塔：层数 / 本层已见塔门 / 进入塔的时间
    towerGateAt: 0, towerOff: null, tq: null,                   // 爬塔：塔门重触发时间 / 走开再走回 / 前置任务跟随
    towerNavAt: 0, towerOpenAt: 0, towerQuestLogAt: 0,          // 爬塔：去城镇节流 / 开塔节流 / 任务提示日志节流
    towerRoomTries: 0, towerDoorAt: 0, towerRemainLogAt: 0,     // ★ v2.6.107：过房间门次数 / 房间门重触发节流 / 「还剩 N 只」日志节流
    towerDoorsUsed: {}, towerDoorLogAt: 0,                      // ★ v2.6.108：本层已走过的房间门 / 「门都试过了」日志节流
    idleActAt: 0, idleActBusy: false,                           // 随机浏览面板：下次允许 / 正在浏览
    mapSwitch: { active: false, lastAt: 0, idleSince: 0 },    // 自动切图刷怪
    roam: { idx: 0, bad: {} },                                // ★ v2.6.151：切图刷怪 —— 邻图轮转下标 / 不合格邻图（id→过期时间）
    paused: false,                                            // ★ 已暂停（统计保留，可继续）
    returning: false,                                         // 阵亡后正在导航回挂机地图
    retargetHist: {},                                         // ★ v2.6.121：本次移动期间已锁定过的怪（禁止切回去，避免 A→B→A→B 横跳）
    visitedAt: 0,                                             // 拜访地图记录节流
    killsByName: {},                                          // ★ 详细统计：每种怪击杀数
    gathersByKind: {},                                        // ★ 详细统计：各类采集次数
    soldByRarity: {},                                         // ★ 详细统计：卖出装备按稀有度
    bagByRarity: {},                                          // 背包当前装备按稀有度（内部用）
    gainedByKey: {},                                          // ★ 详细统计：本次挂机获得的物品（按名称）
    gainedByRarity: {},                                       // ★ 详细统计：本次挂机获得的装备（按稀有度）
    bagSnap: {}, bagSnapReady: false, bagReadAt: 0,           // 背包快照（用于算「获得」）
    runElapsed: 0,                                            // 已挂机累计时长（暂停不计）
    deaths: 0,                                                // ★ 详细统计：死亡次数
    gatherKind: '',                                           // 当前采集类型（用于归类）
    dur: null, durBusy: false, gatherDur: null,               // ★ v1.8.0 耐久：装备缓存 / 采集弹窗实时读数
    detOpen: false,                                           // 详细统计是否展开
    mcBusy: false, tripTown: '', tripHome: '',                // ★ 多角色：行程进行中 / 临时维修城镇 / 临时返程地图
    altTrip: false,                                           // ★ 多角色：正在副角色页做行程（此期间关自动战斗 + 遇怪逃跑）
  };

  /* ======================= 2.1 兜底 / 看门狗机制总表 =======================
   * 本脚本里所有「因为网络抖动 / 服务器不同步 / 游戏卡住」而加的兜底都列在这里。
   * 动任何一个之前先看这张表 —— 它们互相影响（尤其：别往热路径里再加一层）。
   *
   *  [位置同步] syncServerPos()        · 状态 _posSyncAt              · 判据「没有正在走的队列」            · 动作「重发空 walk queue（零移动）」 · 节流 800ms（便宜但通常不够）
   *  [落位]     settleServerPos()      · 状态 st.pos / st.settling    · 判据「走位被打断过 或 调用方 force」· 动作「走开一格再走回（重发寻路）」 · 单次上限 walkTileCore 超时
   *  [换图没重画] scheduleRenderCheck()· 状态 st.render             · 判据「换图后 2.2s .map_table 底图 id != current_map」· 动作「调游戏 loadTravel() 只重画画面 + 对准镜头」 · 看门狗 8s/4 次 → 整页刷新
   *  [怪物列表过期] checkEntityFresh()· 状态 st.entity.at            · 判据「距上次强制拉取 >20s」          · 动作「调游戏 fetchTravelData() 重拉实体」 · 不停止（节流 20s）
   *  [抢怪·出发前确认] startMove 入口  · 状态 st.entity.at            · 判据「去打 >3 格外的怪 且 距上次刷新 >6s」· 动作「先 fetchTravelData() 重拉实体，本 tick 不动」 · 不停止（节流 6s）
   *  [到位没触发动作] scheduleArriveAction()· 状态 无（一次性）        · 判据「到位 1.3s 后格子还有 action 且没出对应窗口」· 动作「补一次 execTileAction(action)」；敌人格无 action 则改用 walkTo(同格) 重触发战斗 · 每次到位 1 次
   *  [切图卡住] checkMapLoad()         · 状态 st.mapload              · 判据「#transition_container 停留 >12s」 · 动作「点游戏 [RETRY] / 预热底图」  · 3 次 → 整页刷新
   *  [活动]     eventTick 步骤④        · 状态 st.event.busy/busyAt    · 判据「检查卡住 >20s 或 fetch 超时 8s」 · 动作「AbortController 中断 + 强制释放 busy 重查」 · 不停止（节流 30s）
   *  [走位重试] checkMove !started    · 状态 st.move.retryAt/retries · 判据「900ms 还没发起」               · 动作「abortWalk + 重发 walkTo」     · 上限 8 次 → 拉黑该格 30s
   *  [走位无进展] checkMove 已发起     · 状态 st.move.lastPos/lastPosAt· 判据「4s 位置没变且 walk_to 已空」   · 动作「abortWalk + 重发 walkTo」     · 上限 8 次 → 拉黑该格 30s
   *  [走位卡死] checkFrozen()          · 状态 st.frozen               · 判据「8s 位置不动且 walk_to 还挂着」 · 动作 nudgeRecover()                 · 上限 8 次 → 整页刷新
   *  [卡住自愈] checkStuck()           · 状态 st.watch                · 判据「stuckSec 内 位置/经验/击杀 全没变」· 动作 nudgeRecover + 拉黑目标格      · 上限 40 次 → stop()
   *  [导航卡住] walkTileCore() 内部     · 状态 局部 stuck/lastMove      · 判据「位置不变 / 2.5s 无进展」        · 动作 onStuck()（默认 nudgeRecover） · 上限 超时 或 paused>5min
   *  [采集]     stepGather 分支        · 状态 st.gatherIdleSince/Resync· 判据「8s 进度条不转」                · 动作 关掉重开 → 走开一格再走回     · 上限 不停止（循环）
   *  [休整]     runRestock / pollSmith · 状态 st.repair/sell/bank.cooldownUntil · 判据「失败 / 损坏图标残留」 · 动作 冷却期内不再出发            · 上限 60s / 20s / 120s
   *  [回图]     step() 看门狗          · 状态 st.returnRetryAt/Fails   · 判据「复活后还在重生泉水」            · 动作 returnToFarm()                · 上限 不停止，退避 30s→300s
   *  [多角色]   mcDue()                · 状态 rot.idle[id].failAt      · 判据「副角色任务失败」                · 动作 180s 内不重试                 · 上限 180s
   *  [传送站]   navWaygateOut()        · 状态 局部 order/TP_BUDGET     · 判据「点了按钮没换图」                · 动作 换下一个候选                   · 上限 4 个候选 / 总预算 35s
   *  [安装器]   install*Patch()        · 状态 spdTries 等              · 判据「游戏对象还没就绪」              · 动作 轮询重装                       · 上限 600 次
   *
   * ★ 写法约定（新增机制请照这个来）：
   *   1) 一个机制 = 一个 st.<域> 对象，字段固定为
   *        at      上次判定 / 上次动作的时间
   *        hits    连续触发次数（一旦有进展就清零）
   *        nextAt  下次允许触发的时间（冷却 / 退避用）
   *        fails   连续失败次数（失败退避用）
   *      松散的 st.xxxAt / st.xxxFails 只允许出现在「只有一个字段」的极简场景（如 [回图]）。
   *   2) 常量放在机制旁边，命名 <域>_<含义>_MS / <域>_<含义>_COOLDOWN。
   *   3) 每个机制上方用统一注释模板：症状 / 判据 / 动作 / 上限 / 高级参数。
   *   4) 每次动作都写一条日志，带「第 N 次」；失败必须写清原因（否则只能靠猜）。
   *   5) 上限到了要 stop() 或刷新页面 —— 绝不无限重试。
   *   6) 热路径（每 tick / 400ms）里只做纯计算：不分配对象、不写 DOM、不打日志。
   * ====================================================================== */

  /* ======================= 3. 工具 ======================= */

  const $q = s => document.querySelector(s);
  const $$q = (s, root) => Array.prototype.slice.call((root || document).querySelectorAll(s));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const now = () => Date.now();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const jq = () => window.jQuery || window.$;

  /* 配置归一化：把任意来源的对象（localStorage / 导入的 JSON）整理成合法配置 */
  function normalizeCfg(o) {
    o = (o && typeof o === 'object') ? o : {};
    const c = Object.assign({}, DEFAULTS, o);
    // 与现有输入控件范围一致；损坏的持久化值不能直接进入补给决策。
    [['hpPct', 1, 100], ['mpPct', 1, 100], ['petEnergyPct', 1, 100], ['potionDelayMs', 700, 10000]].forEach(function (r) {
      const n = Number(c[r[0]]);
      c[r[0]] = Number.isFinite(n) ? Math.min(r[2], Math.max(r[1], n)) : DEFAULTS[r[0]];
    });
    delete c.panelSkin; // 清理旧版本配置：面板不再使用游戏边框皮肤
    // 归一化：星级顺序必须是 RANKS 的一个排列，且不能丢项
    const seen = [];
    (Array.isArray(o.rankOrder) ? o.rankOrder : []).forEach(r => {
      if (RANKS.indexOf(r) >= 0 && seen.indexOf(r) < 0) seen.push(r);
    });
    RANKS.forEach(r => { if (seen.indexOf(r) < 0) seen.push(r); });
    c.rankOrder = seen;
    c.rankOff = (Array.isArray(o.rankOff) ? o.rankOff : []).filter(r => RANKS.indexOf(r) >= 0);
    c.monsterLvMin = Math.max(0, Math.min(999, Math.round(+c.monsterLvMin || 0)));   // ★ 融合
    c.monsterLvMax = Math.max(0, Math.min(999, Math.round(+c.monsterLvMax || 0)));
    c.bagList = Array.isArray(o.bagList) ? o.bagList : [];
    c.uiTab = ['idle', 'mc', 'food', 'service', 'speed'].indexOf(o.uiTab) >= 0 ? o.uiTab
            : ((o.uiTab === 'repair' || o.uiTab === 'sell') ? 'service'
            : (o.uiTab === 'battle' ? 'idle' : (o.uiTab === 'gather' ? 'mc' : (o.uiTab === 'potion' ? 'food' : 'idle'))));   // ★ 老标签页迁移
    c.speedK = Math.min(5, Math.max(1, Math.round((+c.speedK || 1) * 10) / 10));   // 1~5，保留 1 位小数（此处不能调 clamp，还没定义）
    /* ★ v2.6.154：加速默认改为 1 —— 老配置一次性归 1（之后用户改了就不再动） */
    if (!c.speedKDefault1) { c.speedK = 1; c.speedKDefault1 = true; }
    c.speedCombatOnly = true;                       // ★ 固定「只加速战斗」
    c.winScale = Math.min(100, Math.max(20, Math.round(+c.winScale || 100)));   // ★ 弹窗缩放 20~100%
    delete c.speedMoveAccel;                        // ★ 已删除「移动也加速」选项
    /* ★ 真人化动作间隔 */
    c.humanDelay = !!c.humanDelay;
    c.humanDelayMin = Math.max(0, Math.min(60000, Math.round(+c.humanDelayMin || 0)));
    c.humanDelayMax = Math.max(0, Math.min(60000, Math.round(+c.humanDelayMax || 0)));
    if (c.humanDelayMax < c.humanDelayMin) c.humanDelayMax = c.humanDelayMin;
    c.humanRhythm = (c.humanRhythm === undefined) ? true : !!c.humanRhythm;
    c.humanJitter = (c.humanJitter === undefined) ? true : !!c.humanJitter;
    c.humanJitterPct = Math.max(0, Math.min(50, Math.round(+c.humanJitterPct || 0)));
    c.humanMicroOn = !!c.humanMicroOn;
    c.humanMicroPct = Math.max(0, Math.min(100, Math.round(+c.humanMicroPct || 0)));
    c.humanMicroMin = Math.max(0, Math.min(600000, Math.round(+c.humanMicroMin || 0)));
    c.humanMicroMax = Math.max(c.humanMicroMin, Math.min(600000, Math.round(+c.humanMicroMax || 0)));
    c.humanRotWaitOn = !!c.humanRotWaitOn;
    c.humanRotWaitMin = Math.max(0, Math.min(86400, Math.round(+c.humanRotWaitMin || 0)));
    c.humanRotWaitMax = Math.max(c.humanRotWaitMin, Math.min(86400, Math.round(+c.humanRotWaitMax || 0)));
    c.humanIdleActOn = !!c.humanIdleActOn;
    c.humanIdleActMin = Math.max(1, Math.min(1440, Math.round(+c.humanIdleActMin || 0)));
    c.humanIdleActMax = Math.max(c.humanIdleActMin, Math.min(1440, Math.round(+c.humanIdleActMax || 0)));
    c.humanMistakeOn = !!c.humanMistakeOn;
    c.humanMistakePct = Math.max(0, Math.min(50, Math.round(+c.humanMistakePct || 0)));
    c.navSegOn = !!c.navSegOn;
    c.navSegDist = Math.max(3, Math.min(200, Math.round(+c.navSegDist || 5)));
    delete c.navSegMin;   /* ★ v2.6.129：分段导航改成「目标前一格」两段式，不再按段长 */
    delete c.navSegMax;
    /* ★ v2.6.133：段间停顿 = 固定值（默认 300ms）*/
    delete c.navSegPauseOn; delete c.navSegPauseMin; delete c.navSegPauseMax;
    { const _p = +c.navSegPauseMs; c.navSegPauseMs = Math.max(0, Math.min(60000, Math.round(isFinite(_p) ? _p : 300))); }
    /* ★ v2.6.17：打断门槛由「任意怪 / ★1星以上 / ★2星以上 / ★3星」四档；旧值 champion 迁移为 r1 */
    {
      const _gir = c.gatherInterruptRank;
      c.gatherInterruptRank = (_gir === 'champion') ? 'r1' : (['any', 'r1', 'r2', 'r3'].indexOf(_gir) >= 0 ? _gir : 'any');
    }
    /* ★ v1.7.1：「模式」不再由下拉决定，而是由勾选项推导（用户 2026-10-17 指出下拉是冗余的）：
         不勾「自动采集」              → 只打怪
         勾「自动采集」+ 勾「采集时优先打怪」 → 一键挂机
         勾「自动采集」+ 不勾打断        → 只采集 */
    c.autoGather = (c.autoGather === undefined) ? true : !!c.autoGather;
    c.gatherInterrupt = (c.gatherInterrupt === undefined) ? true : !!c.gatherInterrupt;
    c.gatherScrap = (c.gatherScrap === undefined) ? true : !!c.gatherScrap;
    c.gatherFlee = !!c.gatherFlee;                                    // ★ 融合：默认关
    c.autoEvent = !!c.autoEvent;                                      // ★ 自动进活动（默认关；战斗/采集/爬塔都生效）
    c.eventRes = (['fishing', 'mining', 'chopping', 'farming', 'quarrying', 'foraging', 'combat'].indexOf(String(o.eventRes || '')) >= 0) ? String(o.eventRes) : '';
    c.autoOverlord = !!c.autoOverlord;
    c.ovlLeadSec = Math.max(0, Math.min(600, Math.round(+c.ovlLeadSec || 0)));
    c.ovlLeaveSec = Math.max(30, Math.min(3600, Math.round(+c.ovlLeaveSec || 600)));
    c.highlightSelf = (c.highlightSelf === undefined) ? true : !!c.highlightSelf;   // ★ 融合：默认开
    /* ★ 旧版「顺路拾取」(collectInBattle) 已并入「拾取地面资源」：显式关过它 → 地面拾取一起关（一次性迁移） */
    if (c.collectInBattle === false) c.gatherScrap = false;
    delete c.collectInBattle;
    /* ★ v2.6.0：任务（战斗 / 采集 / 爬塔）→ 运行模式
         采集任务              → gather（只采集）
         战斗任务 + 无怪采集   → auto（有怪打怪、无怪采集）
         战斗任务 + 不采集     → battle（只打怪）
         爬塔任务              → 占位（UI 会拦住开始） */
    c.task = (o.task === 'gather' || o.task === 'tower' || o.task === 'battle') ? o.task
           : ((c.autoGather && !c.gatherInterrupt) ? 'gather' : 'battle');   // 老配置迁移
    c.runMode = (c.task === 'tower') ? 'tower' : ((c.task === 'gather') ? 'gather' : (c.autoGather ? 'auto' : 'battle'));
    c.towerDiff = (c.towerDiff === 2 || c.towerDiff === 3) ? c.towerDiff : 1;
    c.towerTown = c.towerTown ? String(c.towerTown) : '';
    c.towerStopDeath = !!o.towerStopDeath;
    c.towerStopSupply = !!o.towerStopSupply;
    c.towerStopFloor = Math.max(0, Math.min(9999, Math.round(+o.towerStopFloor || 0)));
    c.farmMap = c.farmMap ? String(c.farmMap) : '';
    c.monsterBlacklist = String(c.monsterBlacklist || '');
    c.mobListMode = (c.mobListMode === 'black') ? 'black' : 'white';
    /* ★ v2.6.74：战斗索敌模式（优先任务 / 优先距离 / 全图列表，三选一）。
       老配置迁移：没存过 targetMode 时按旧的 nameFirst 推导（nameFirst=true → 全图列表，否则优先任务）。
       questMonsters / nameFirst 保留为「派生字段」，供原有筛选 / 排序代码继续使用，逻辑不变。 */
    c.targetMode = (['priority', 'distance', 'all'].indexOf(String(o.targetMode)) >= 0) ? String(o.targetMode)
                 : (o.nameFirst ? 'all' : 'priority');
    c.nameFirst = (c.targetMode === 'all');
    c.questMonsters = (c.targetMode === 'priority' || c.targetMode === 'all');
    c.farmMapLocked = !!c.farmMapLocked;
    /* ★ v2.6.13：「查看中的任务」= 任务按钮当前选中的那个（运行中只切查看、不切正在跑的任务） */
    c.uiTask = (o.uiTask === 'gather' || o.uiTask === 'tower' || o.uiTask === 'battle') ? o.uiTask : c.task;
    c.stuckSec = Math.max(0, Math.min(600, Math.round(+c.stuckSec || 0)));
    c.repairDurPct = Math.max(1, Math.min(100, Math.round(+c.repairDurPct || 15)));
    delete c.repairTurnsMin;   /* v1.8.1 已合并成单一的「维修阈值(%)」 */
    c.autoRespawn = !!c.autoRespawn;
    c.pauseNoSupply = (c.pauseNoSupply === undefined) ? true : !!c.pauseNoSupply;
    c.bagScanned = !!c.bagScanned;
    c.sweepFrames = (c.sweepFrames === undefined) ? true : !!c.sweepFrames;
    c.worldMapUnlock = (c.worldMapUnlock === undefined) ? true : !!c.worldMapUnlock;
    if (c.skin === 'gray') c.skin = 'grid';                 // ★ 去掉「灰阶」，游戏界面只剩 原版 / 工作台
    c.skin = ['off', 'grid'].indexOf(c.skin) >= 0 ? c.skin : 'off';
    c.skinLast = 'grid';
    c.skinMute = (c.skinMute === undefined) ? true : !!c.skinMute;
    /* ★ 拆分：老的 useWaygate → useWaygateCity（保持兼容） */
    c.useWaygateCity = (o.useWaygateCity !== undefined) ? !!o.useWaygateCity : !!o.useWaygate;
    c.useWaygateWild = !!o.useWaygateWild;
    delete c.ignorePriority;   // ★ 已删除「距离最近」功能：清掉旧配置残留
    c.autoResume = true;      // ★ 断线续挂改为默认功能，不再提供开关
    /* ★ 自动存仓可与「自动清包」同时开（休整顺序：出售/拆解 → 存仓 → 修理） */
    c.autoDeposit = !!c.autoDeposit;
    c.clearAction = (c.clearAction === 'salvage') ? 'salvage' : 'sell';
    c.sellRarity = (RARITY_ORDER.indexOf(String(o.sellRarity || '').toLowerCase()) >= 0) ? String(o.sellRarity).toLowerCase() : '';
    /* ★ 多角色轮转：角色名单归一化 */
    c.multiChar = !!c.multiChar;
    c.mcChars = (Array.isArray(o.mcChars) ? o.mcChars : []).filter(function (x) {
      return x && typeof x === 'object' && !Array.isArray(x);
    }).map(function (x) {
      return {
        id: +x.id || 0, name: String(x.name || ''),
        role: (x.role === 'main' ? 'main' : 'alt'),
        enabled: x.enabled !== false,
        gatherMap: String(x.gatherMap || ''), nodeX: +x.nodeX || 0, nodeY: +x.nodeY || 0,
        res: String(x.res || ''),
        profession: String(x.profession || ''), serviceTown: String(x.serviceTown || ''),
        repairOn: !!x.repairOn, depositOn: !!x.depositOn
      };
    }).filter(function (x) { return x.id > 0; });
    /* ★ 主角色恒为启用（界面上勾选框置灰不可改） */
    c.mcChars.forEach(function (x) { if (x.role === 'main') x.enabled = true; });
    c.__ver = CFG_VER;
    return c;
  }

  function loadCfg() {
    let o = {};
    try { o = JSON.parse(localStorage.getItem(CFG_KEY) || '{}') || {}; } catch (e) { o = {}; }
    return normalizeCfg(o);
  }

  /* 配置写入防抖：拖滑块时 input 事件会连发，直接写 localStorage 会造成写风暴 */
  let _saveTimer = null;
  function saveCfgNow() {
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
  }
  function saveCfg() {
    if (_saveTimer) return;
    _saveTimer = setTimeout(() => { _saveTimer = null; try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ } }, 150);
  }
  window.addEventListener('beforeunload', saveCfgNow);   // 关页面/刷新前把最后一次改动落盘

  function inGame() {
    try { return typeof character === 'object' && character && character.id && !!document.getElementById('players_container'); }
    catch (e) { return false; }
  }

  function hasFrame(id) { return !!document.getElementById(id); }

  function closeFrameById(id) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const $j = jq();
      if (typeof window.closeFrame === 'function' && $j) window.closeFrame($j(el));
      else el.remove();
    } catch (e) { try { el.remove(); } catch (e2) { /* ignore */ } }
  }

  function canAct() { return now() - st.lastAction >= ACTION_MIN; }
  function markAct() { st.lastAction = now(); }

  /* ======================= ★ 真人化动作间隔（全局） =======================
   * 作用：脚本每发出一个「动作」之前，先随机等 min~max 毫秒，模拟真人手速。
   * 覆盖：走格/寻路（safeWalkTo）、点游戏按钮（humanClick）、开游戏窗口（humanDialog）。
   * 0/0 或关闭开关 = 不加任何延迟（与旧行为完全一致）。
   * ================================================================= */
  function humanDelayOn() { return !!cfg.humanDelay && (+cfg.humanDelayMax || 0) > 0; }
  function humanDelayMs() {
    const a = Math.max(0, Math.round(+cfg.humanDelayMin || 0));
    const b = Math.max(a, Math.round(+cfg.humanDelayMax || 0));
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  /* 同步调用点：把「发出动作」推到随机间隔之后 */
  function humanDefer(fn, alive) {
    const d = (humanDelayOn() ? humanDelayMs() : 0) + humanMicroMs();   /* ★ 含微停顿 */
    const go = function () { try { if (!alive || alive()) fn(); } catch (e) { /* ignore */ } };
    if (d <= 0) { go(); return; }
    setTimeout(go, d);
  }
  /* 异步流程用：等一个随机间隔 */
  function humanPause() { const d = (humanDelayOn() ? humanDelayMs() : 0) + humanMicroMs(); return d > 0 ? sleep(d) : Promise.resolve(); }
  /* 点一个元素（带随机间隔） */
  function humanClick(el) { if (!el) return false; humanDefer(function () { try { el.click(); } catch (e) { /* ignore */ } }); return true; }
  /* 开一个游戏窗口（带随机间隔） */
  function humanDialog(title, sub, mode, url, modal, alive) {
    humanDefer(function () { try { if (typeof window.createDialog === 'function') window.createDialog(title, sub, mode, url, modal); } catch (e) { /* ignore */ } }, alive);
  }
  /* ★ 节拍抖动：内部定时器 / 节流阈值也加同一个 min~max 随机波动 */
  function humanRhythmOn() { return !!cfg.humanDelay && !!cfg.humanRhythm && (+cfg.humanDelayMax || 0) > 0; }
  /* ★ v2.6.59：节拍抖动对「轮询级」间隔（≥2s）按比例抖动。
     原来只加动作间隔的 min~max 毫秒（典型 200~1000ms）—— 对 30s 的耐久 / 宠物 / 背包检查
     等于没加，而且只会单向变长。现在大间隔按「阈值抖动幅度%」（默认 10%）双向抖动，
     小间隔（动作级，<2s）仍按毫秒范围加。 */
  const RHYTHM_BIG_MS = 2000;
  function rhythm(base) {
    if (!humanRhythmOn()) return base;
    if (base >= RHYTHM_BIG_MS) {
      const p = Math.min(50, Math.max(1, Math.round(+cfg.humanJitterPct || 10)));
      return Math.max(500, Math.round(base * (1 + (Math.random() * 2 - 1) * p / 100)));
    }
    return base + humanDelayMs();
  }
  /* ★ 随机节拍定时器：每次随机间隔后再排下一次（可用 stopTimer 停） */
  let _rhythmSeq = 1; const _rhythmLive = {};
  function rhythmTimer(fn, base) {
    const h = _rhythmSeq++; _rhythmLive[h] = true;
    const loop = function () {
      if (!_rhythmLive[h]) return;
      let d = base; try { d = rhythm(base); } catch (e) { d = base; }
      setTimeout(function () { if (!_rhythmLive[h]) return; try { fn(); } catch (e) { /* ignore */ } loop(); }, d);
    };
    loop();
    return h;
  }
  function stopTimer(h) { if (h == null) return; delete _rhythmLive[h]; }
  /* ★ 阈值抖动：每次取值都在原值上下随机漂移（小整数至少 ±1） */
  function humanJitterOn() { return !!cfg.humanDelay && !!cfg.humanJitter && (+cfg.humanJitterPct || 0) > 0; }
  function jitterVal(v) {
    const n = +v;
    if (!isFinite(n) || n === 0) return n;
    if (!humanJitterOn()) return n;
    const amp = Math.max(1, Math.abs(n) * (+cfg.humanJitterPct || 0) / 100);
    return Math.round(n + (Math.random() * 2 - 1) * amp);
  }
  /* ★ 微停顿：以概率额外插一段停顿 */
  function humanMicroMs() {
    if (!cfg.humanDelay || !cfg.humanMicroOn) return 0;
    if (Math.random() * 100 >= (+cfg.humanMicroPct || 0)) return 0;
    const a = Math.max(0, Math.round(+cfg.humanMicroMin || 0));
    const b = Math.max(a, Math.round(+cfg.humanMicroMax || 0));
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  /* ★ 多角色轮转：任务完成后的随机等待 */
  function humanRotWaitMs() {
    if (!cfg.humanRotWaitOn) return 0;
    const a = Math.max(0, Math.round(+cfg.humanRotWaitMin || 0)) * 1000;
    const b = Math.max(a, Math.round(+cfg.humanRotWaitMax || 0) * 1000);
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  /* ★ 移动偶发失误：找一个附近、不是点位/门 的可走格 */
  function mistakeTile(tx, ty) {
    try {
      const pts = window.points || [];
      const cx = character.x, cy = character.y;
      const poi = {};
      $$q('.map_table .tile_poi').forEach(function (el) { const c = (el.getAttribute('coords') || '').split('-'); poi[c[0] + '-' + c[1]] = 1; });
      const cand = pts.filter(function (p) {
        if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return false;
        if (p.x === tx && p.y === ty) return false;
        if (p.x === cx && p.y === cy) return false;
        if (poi[p.x + '-' + p.y]) return false;
        const d = Math.abs(p.x - cx) + Math.abs(p.y - cy);
        return d >= 1 && d <= 2;
      });
      if (!cand.length) return null;
      const p = cand[Math.floor(Math.random() * cand.length)];
      return [p.x, p.y];
    } catch (e) { return null; }
  }
  /* ★ 无用操作：定期随机打开一个「只读」面板看看，几秒后关掉
     （模拟真人随手点开背包/角色/成就看一眼；不影响挂机） */
  const IDLE_PANELS = [
    ['Character', '/modal/character'],
    ['Inventory', '/modal/inventory'],
    ['Professions', '/modal/professions'],
    ['Achievement', '/modal/achievement'],
    ['Journal', '/modal/journal'],
    ['Dailies', '/modal/dailies'],
    ['Guild', '/modal/guild'],
    ['Friends', '/modal/friends'],
    ['Cosmetics', '/modal/cosmetics'],
    ['Artifacts', '/modal/artifacts'],
    ['Augments', '/modal/augments'],
    ['Help', '/modal/help']
  ];
  function humanIdleActMs() {
    const a = Math.max(1, Math.round(+cfg.humanIdleActMin || 3)) * 60000;
    const b = Math.max(a, Math.round(+cfg.humanIdleActMax || 12) * 60000);
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function idleActTick() {
    if (!cfg.humanIdleActOn || !inGame()) return;
    if (!st.idleActAt) { st.idleActAt = now() + humanIdleActMs(); return; }
    if (st.idleActBusy || now() < st.idleActAt) return;
    if (hasFrame('frame_Combat') || st.move || st.phase === 'move') return;
    if (st.repair.active || st.sell.active || st.bank.active || st.tripManual || st.mcBusy) return;
    st.idleActAt = now() + humanIdleActMs();
    const p = IDLE_PANELS[Math.floor(Math.random() * IDLE_PANELS.length)];
    const before = {};
    $$q('[id^=frame_]').forEach(function (el) { before[el.id] = 1; });
    st.idleActBusy = true;
    logEvent('真人化：随手打开「' + p[0] + '」看一眼');
    humanDialog(p[0], '', 'ajax', p[1], true);
    /* 把新开的窗口登记成「用户窗口」，免被自动关弹窗的扫描器瞬间关掉 */
    setTimeout(function () { try { $$q('[id^=frame_]').forEach(function (el) { if (!before[el.id]) st.userFrames[el.id] = now(); }); } catch (e) { /* ignore */ } }, 300);
    setTimeout(function () {
      try { $$q('[id^=frame_]').forEach(function (el) { if (!before[el.id]) { closeFrameById(el.id); delete st.userFrames[el.id]; } }); } catch (e) { /* ignore */ }
      st.idleActBusy = false;
    }, 2500 + Math.floor(Math.random() * 4000));
  }

  /* ★ v2.6.67：延迟发出时返回 'deferred'（**不是** true），真实结果通过 cb(ok) 回写。
     旧实现直接 return true → 调用方以为「已经走起来了」，st.move.started 永远为真 →
     checkMove 的「重发」分支变成死代码：走位被游戏挡掉（can_travel=false / 幽灵战斗态）时
     脚本什么都不做，只能干等 45 秒的 checkStuck 看门狗 —— 实测「打完怪发呆 45 秒」。
     cb 可选；不传就只当「已排队发出」（walkTileCore / nudgeRecover 这些不看返回值）。 */
  function installWalkRequestGuard() {
    const $ = jq();
    if (!$ || typeof $(document).on !== 'function') return;
    if ($.__nrWalkRequestHook) return;
    $.__nrWalkRequestHook = true;
    $(document).on('ajaxSend.nrWalkCancel', function (_ev, xhr, opts) {
      if (!_walkRequestOwner || !/\/ajax_get_path\.php(?:\?|$)/.test(String(opts.url || ''))) return;
      _walkRequests.add(xhr);
    }).on('ajaxComplete.nrWalkCancel', function (_ev, xhr) { _walkRequests.delete(xhr); });
  }
  function safeWalkTo(x, y, cb) {
    if (!inGame()) return false;
    const seq = walkSeq, id = character.id, mapId = character.current_map;
    const go = function () {
      if (seq !== walkSeq || !inGame() || character.id !== id || character.current_map !== mapId) return false;
      installWalkRequestGuard();
      const previous = _walkRequestOwner;
      _walkRequestOwner = { seq: seq, id: id, mapId: mapId };
      try { return typeof window.walkTo === 'function' ? window.walkTo(x, y) : false; } catch (e) { return false; }
      finally { _walkRequestOwner = previous; }
    };
    /* ★ 真人化：走格也算一个动作 → 随机间隔后再发出 */
    if (humanDelayOn()) {
      humanDefer(function () { const ok = go(); if (cb) { try { cb(ok); } catch (e) { /* ignore */ } } });
      return 'deferred';
    }
    return go();
  }

  /* ★ 2026-10-21 真机实测：游戏 walkTo(x,y) 成功时返回 **undefined**（不是 true），
     只有被守卫拦下（can_travel=false / current_action≠Traveling / 已在走该格 / 寻路失败）才返回 false。
     所以「已发起」的判据必须是 r !== false，而不是 r === true；
     否则每次正常走位都会被误判成「没发起」→ 无意义地 abortWalk() 重发
     （清掉正在走的队列）+ 日志刷「无法前往 X，已跳过」。
     'deferred' = 真人化延迟发出，真实结果由回调回写。 */
  function walkStarted(r) { return r !== false && r !== 'deferred'; }

  const manhattan = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);

  // 中止移动：游戏自己的 clearQueue 只清 walkQueue，不清 character.walk_to；
  // 残留的 walk_to 会让后续 walkTo 变成 no-op（角色站着不动），所以必须一并清掉。
  function abortWalk() {
    walkSeq++;
    const pending = Array.from(_walkRequests);
    _walkRequests.clear();
    pending.forEach(function (xhr) { try { xhr.abort(); } catch (e) { /* ignore */ } });
    try {
      /* ★ v2.6.70 兜底[落位]：中止一次「正在进行的走位」= 客户端动画停在半路，
         而服务端已经把整条路径走完（实测服务端推进远快于客户端 400ms/格的动画）→
         之后交互按服务端位置校验就会失败（Enemy Not Found / 采不了 / 不在采集点）。
         这里只记一笔（时间+位置）；要不要真去「走开一格再走回」由 settleServerPos() 决定。 */
      try {
        const _q = (window.walkQueue && character && window.walkQueue[character.id]) || [];
        if (character && (character.walk_to || _q.length)) { st.pos.at = now(); st.pos.x = character.x; st.pos.y = character.y; }
      } catch (e) { /* ignore */ }
      if (typeof window.clearQueue === 'function') window.clearQueue(character && character.id);
      if (character) character.walk_to = null;
      // 寻路回包前本地队列仍可能为空，原生 clearQueue 此时不会发送停止通知。
      if (pending.length && typeof window.sendWalkQueue === 'function') window.sendWalkQueue([]);
      /* ★ 关键根因修复：游戏的 walkTo() 在发起寻路时先把 window.can_travel 置 false，
         只有在「走格动画完成」或「寻路 AJAX 失败」时才会重新置 true。
         一旦那次寻路中途被打断（窗口弹出 / 异常 / 回调丢失），can_travel 会一直卡在 false，
         之后所有 walkTo 都直接 return false（no-op）—— 角色就「站着不动」，
         而且原来的软复位只清 walk_to/队列、没复位 can_travel，所以怎么复位都救不回来。
         这里复位时一并把 can_travel 打开，下一次 walkTo 才能真正生效。 */
      window.can_travel = true;
      /* ★ 战斗加载标志也要清：loadCombat 失败（Enemy Not Found）时它会一直挂着，
         导致后续 walkTo 全部被拦 → 表现就是「打完怪站在原地发呆」。 */
      const _stuckCombat = (window.pendingCombatLoad === true);   // ★ 先记下：清掉前判断是不是「幽灵战斗」
      window.pendingCombatLoad = false;
      /* ★ 2026-10-19 根因修复（「打完怪发呆」）：幽灵战斗态 —— 游戏把 pendingCombatLoad 一直挂着、
         没有 #frame_Combat、current_action 停在「In combat」等非行走态，游戏 walkTo() 会直接 return false，
         角色原地不动。用游戏自带的 abortCombatStart() 复位（无参调用不弹提示），再兜底把动作置回 Traveling。
         ★ 只处理「pendingCombatLoad 卡住」这一种；正常的搜刮/拾取（pendingCombatLoad=false）不能动，
           否则会把游戏自己的搜刮流程打断（那种交给 gameBusyAction 去「等」）。 */
      if (_stuckCombat
          && !document.getElementById('frame_Combat')
          && !document.getElementById('battle_defeat')
          && now() - _unstickAt > 1500) {
        _unstickAt = now();
        try { if (typeof window.abortCombatStart === 'function') window.abortCombatStart(); } catch (e) { /* ignore */ }
        try { if (character) character.current_action = 'Traveling'; } catch (e) { /* ignore */ }
        window.pendingCombatLoad = false;
        window.can_travel = true;
      }
    } catch (e) { /* ignore */ }
  }
  let _unstickAt = 0;

  /* ★ 2026-10-19：游戏 walkTo() 的守卫是 ——「character.current_action 为空或 'Traveling' 才允许行走」
     （travel.min.js: if(character.current_action && character.current_action!=='Traveling') return false）。
     所以只要 current_action 是别的值（自动搜刮的 'Collecting Scrap'、战斗中的 'In combat' …），角色就走不动。
     脚本这时必须「等游戏做完」，不能去重试 / 拉黑 / 卡住自愈 —— 那是在跟游戏抢步，打能搜刮的怪时尤其明显。 */
  function gameBusyAction() {
    return !!(character && character.current_action && character.current_action !== 'Traveling');
  }

  /* ── 兜底[位置同步]（便宜的第一招，通常不够）─────────────────────
   * 症状：客户端走完最后一格后服务端位置对不上 → 交互失败（Enemy Not Found / 采不了 / 不在采集点）。
   * 判据：没有正在走的队列（window.walkQueue[charId] 为空）。
   * 动作：重发一次空 walk queue（游戏自带的 sendWalkQueue），把当前坐标再告诉服务端一次。
   *       零移动、零游戏动作，不影响正常节奏。
   * 上限：800ms 节流（_posSyncAt）。
   * 高级参数：不受影响。
   * ★ v2.6.70 实测（真机 + 刷新核对服务端坐标）：空 walk queue 只在「小幅、且方向是往前」的
   *   谎报时被服务端接受（+2/+3 格 OK，+5 格起被拒）；真实失同步是「客户端落后于服务端」，
   *   偏移 5/7/9/11 格时它一次都没修好。真正有效的只有「重新发一次寻路」= 走开一格再走回
   *   （见 settleAtSpot / settleServerPos）。
   * ───────────────────────────────────────────────────────────── */
  let _posSyncAt = 0;
  function syncServerPos() {
    if (!inGame()) return false;
    if (now() - _posSyncAt < 800) return false;                 /* 节流 */
    try {
      const q = (window.walkQueue && window.walkQueue[character.id]) || [];
      if (q.length) return false;                               /* 正在走 → 不能发空队列 */
    } catch (e) { /* ignore */ }
    try {
      if (typeof window.sendWalkQueue !== 'function') return false;
      window.sendWalkQueue([]);
      _posSyncAt = now();
      return true;
    } catch (e) { return false; }
  }

  /* ── 兜底[落位]（真·位置同步）──────────────────────────────────
   * 症状：客户端与服务端位置对不上（长距离走位被打断 / 采集进度条不转 / Enemy Not Found）。
   * 判据：调用方明确要求（force），或 abortWalk() 刚打断过一次走位（st.pos.at 新鲜，90s 内）。
   * 动作：走开一格 → 再走回原格。走开这一步会重新发 ajax_get_path.php（带客户端当前格 cx,cy），
   *       服务端据此重新校准角色位置 —— 实测 3/3 成功；而空 walk queue 0/4 成功。
   * 上限：单次 settle 由 walkTileCore 自带超时（25s + 30s）；同时只允许一个（st.settling）。
   * 高级参数：不受影响。
   * ───────────────────────────────────────────────────────────── */
  async function settleAtSpot(tx, ty, why) {
    const cancelSeq = navCancelSeq;
    const n2 = mcAdjWalkTile(tx, ty);
    if (!n2) return false;
    const fromMap = (character && character.current_map);
    /* ★ v2.6.72：落位期间一旦「换图 / 活动进出 / 导航 / 休整 / 加载页 / 开战」就立刻放弃 ——
       否则 abortWalk + 重新寻路会和 loadTravel() 撞车，把切地图卡死。 */
    const alive = function () {
      if (cancelSeq !== navCancelSeq) return false;
      try { if (settleBlocked()) return false; if (character && character.current_map !== fromMap) return false; } catch (e) { /* ignore */ }
      return true;
    };
    const noNudge = function () { /* 落位期间不做卡死自愈，避免又走开 */ };
    const done = function () { st.pos.at = 0; st.pos.hits = 0; };
    await navWalkTile(n2[0], n2[1], { timeoutMs: 12000, alive: alive, onStuck: noNudge, cond: function () { return character.x === n2[0] && character.y === n2[1]; } });
    if (!alive()) { done(); return false; }
    await sleep(600);
    if (!alive()) { done(); return false; }
    await navWalkTile(tx, ty, { timeoutMs: 15000, alive: alive, onStuck: noNudge, cond: function () { return character.x === tx && character.y === ty; } });
    done();
    return true;
  }
  /* 落位入口：先试便宜的空 walk queue；不够（或调用方 force）就异步做一次「走开一格再走回」。
     返回 true = 已排上一次真·落位（主循环会通过 st.settling 让路）。 */
  function settleServerPos(tx, ty, why, force) {
    syncServerPos();
    /* ★ v2.6.72：换图 / 活动进出 / 导航 / 休整行程 / 加载页进行中，绝不做落位
       （settleAtSpot 会 abortWalk + 重新寻路，正好和 loadTravel() 撞车 → 把切地图卡住）。 */
    if (settleBlocked()) return false;
    const fresh = st.pos.at && (now() - st.pos.at < 90000);
    if (!fresh && !force) return false;
    if (st.settling) return false;
    st.settling = now();
    logEvent('落位：' + (why || '位置可能不同步') + ' → 走开一格再走回（' + tx + '-' + ty + '）');
    settleAtSpot(tx, ty, why).catch(function () { /* ignore */ }).then(function () { st.settling = 0; });
    return true;
  }
  /* 落位的「禁飞区」：这些情况下位置不同步是正常的（正在换图/进出活动），别去动 */
  function settleBlocked() {
    try {
      if (mapLoadStuck()) return true;
      if (navBusy) return true;
      if (st.mapSwitch && st.mapSwitch.active) return true;
      if (st.event && st.event.phase !== 'idle') return true;
      if (st.repair.active || st.sell.active || st.bank.active) return true;
      if (st.tripManual) return true;
      if (hasFrame('frame_Combat')) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  /* ── 兜底[切图卡住] ─────────────────────────────────────────────
   * 症状：换图 / 进活动图后画面一直停在加载页 → 角色看着「卡住」不动（以前靠整页刷新硬解）。
   * 根因（读 travel.min.js + 实测）：加载页 #transition_container 只有在
   *   「地图底图 /images/maps/map_<id>.jpg 加载成功」时才消失
   *   （dismissLoadingScreen ← pollMapImageLoaded ← testMapImageLoaded）。
   *   底图很大（实测 map_11 2.6MB / map_20 4.7MB / 活动图 map_1183 3.3MB），走代理时容易超时 →
   *   加载页永远不消失；游戏自己会在延迟后挂出 [RETRY]（#transition_retry）。
   * 判据：#transition_container 还在屏幕上（dismiss 后是 top:100%）且已停留 MAPLOAD_STUCK_MS。
   * 动作：先点游戏自己的 [RETRY]（retryMapImageLoad，带 ?t= 破缓存重试）；没有 [RETRY] 就自己预热一次底图。
   * 上限：连续 MAPLOAD_MAX 次无效 → 整页刷新（刷新后 autoResume 自动续挂）。
   * 高级参数：不受影响。
   * ───────────────────────────────────────────────────────────── */
  const MAPLOAD_STUCK_MS = 12000;
  const MAPLOAD_MAX = 3;
  function mapLoadStuck() {
    try {
      const el = document.getElementById('transition_container');
      if (!el) return false;
      if (getComputedStyle(el).display === 'none') return false;
      return el.getBoundingClientRect().top < (window.innerHeight - 5);   /* dismiss 后 top:100% → 在屏幕外 */
    } catch (e) { return false; }
  }
  function prewarmMapImage() {
    try {
      const url = (typeof window.getMapTableImageUrl === 'function') ? window.getMapTableImageUrl() : '';
      if (!url) return;
      const img = new Image();
      img.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + now();
    } catch (e) { /* ignore */ }
  }
  function checkMapLoad() {
    const M = st.mapload;
    if (!mapLoadStuck()) { M.at = 0; M.hits = 0; return false; }
    if (!M.at) { M.at = now(); return true; }                 /* 刚开始 → 先给底图时间 */
    if (now() - M.at < MAPLOAD_STUCK_MS) return true;         /* 还在等底图 */
    M.at = now(); M.hits++;
    if (M.hits > MAPLOAD_MAX) {
      logEvent('切图卡住：底图连续 ' + MAPLOAD_MAX + ' 次重试无效 → 刷新页面');
      setStatus('切图卡住，正在刷新页面…');
      saveCfgNow();
      setTimeout(function () { try { location.reload(); } catch (e) { /* ignore */ } }, 300);
      return true;
    }
    const rt = document.getElementById('transition_retry');
    const rtShown = rt && getComputedStyle(rt).display !== 'none';
    if (rtShown) humanClick(rt); else prewarmMapImage();
    logEvent('切图卡住：加载页停留 >' + Math.round(MAPLOAD_STUCK_MS / 1000) + 's → ' + (rtShown ? '点游戏 [RETRY]' : '预热底图') + '（第 ' + M.hits + ' 次）');
    setStatus('切图卡住：正在重试加载地图底图…（第 ' + M.hits + ' 次）');
    return true;
  }
  /* ★ v2.6.111：屏幕上**真正画出来**的地图 id —— 读 .map_table 的底图 URL。
     比 window.map.id 更贴近「画面」：window.map 可能已经被响应脚本改掉，但 DOM 还是旧的。
     ★ v2.6.113 真机实测修正：.map_table 的**计算样式** background-image 被游戏的网格线
       （repeating-linear-gradient）覆盖了 → getComputedStyle 拿不到底图，必须读**内联 style**
       （实测 map 1183：inline = "background-image: url(\"/images/maps/map_1183.jpg\")"，
        computed = repeating-linear-gradient(...)）。两个都试，谁有算谁。 */
  function renderedMapId() {
    try {
      const el = document.querySelector('#map_container .map_table') || document.querySelector('.map_table');
      if (!el) return 0;
      const src = [
        el.getAttribute('style') || '',
        (window.getComputedStyle ? window.getComputedStyle(el).backgroundImage : '')
      ];
      for (let i = 0; i < src.length; i++) {
        const m = /maps\/map_(\d+)\.(?:jpg|jpeg|png|webp)/i.exec(src[i]) || /map_(\d+)\.(?:jpg|jpeg|png|webp)/i.exec(src[i]);
        if (m) return +m[1];
      }
    } catch (e) { /* ignore */ }
    return 0;
  }
  /* 把镜头对准角色（游戏自己的 centerCurrentLocation）。换图后 #map_container 的 top/left
     没对准角色 = 老 bug「画面看着没变 / 卡在 Traveling」的直接原因。 */
  function recenterCamera() {
    try {
      const jq = window.jQuery;
      const c = (typeof character === 'object' && character) ? character : null;
      if (!jq || !c || typeof window.centerCurrentLocation !== 'function') return false;
      const el = jq('#map_container');
      if (!el.length) return false;
      if (!(el.outerWidth() > 0)) return false;      /* 底图还没撑开 → 算了，别把镜头算歪 */
      window.centerCurrentLocation(el, ((c.x + 2) * 48) + '/' + ((c.y + 2) * 48));
      return true;
    } catch (e) { return false; }
  }
  /* ★ v2.6.111：换图后「立刻」核对一次（用户要求把动作放在换图之后，而不是只等 8 秒看门狗）。
     2.2s 后（够客户端把 map DOM 换完）读屏幕上真正画出来的底图：
       · 画对了 → 顺手把镜头对准角色
       · 没画对 → 调游戏 loadTravel() 重画（只刷新画面，不刷新网页）
     加载页在转（mapLoadStuck）时不插一脚，交给 checkMapLoad。 */
  function scheduleRenderCheck(fromMap, toMap) {
    setTimeout(function () {
      try {
        if (!inGame()) return;
        if (+character.current_map !== +toMap) return;      /* 又换图了 → 交给新的一次检查 */
        if (mapLoadStuck()) return;                         /* 正在加载 → 别插一脚 */
        const drawn = renderedMapId() || renderMapId();
        if (drawn === +toMap) { recenterCamera(); return; } /* 画对了 → 只把镜头对准 */
        logEvent('换图后没重画（应画 ' + toMap + '，画面还是 ' + (drawn || '?') + '）→ 调游戏 loadTravel() 重画');
        setStatus('换图没重画：正在重画地图…');
        softReloadMap();
      } catch (e) { /* ignore */ }
    }, 2200);
  }
  /* ── 兜底[换图没重画] ───────────────────────────────────────────
   * 症状：服务端已经把角色移到新图（character.current_map 变了、角色贴图也挪过去了），
   *       但客户端**没有重画地图** → 画面还停在上一张图（旧的门 / 旧的怪 / 旧的地形）。
   * 根因（读 1.0 客户端 travel.min.js，2026-10-23 复核）：
   *   客户端只在「travel_data 推送里 current_map 变了 **且** character.current_action === 'Traveling'」
   *   时才调 loadTravel() 重画地图；条件不满足（战斗中 / 搜刮中 / 其它动作态）就**静默跳过**，
   *   而 current_map 已经被推送改掉了 → 之后再也对不上 → 永远停在旧图。
   * 判据：换图后 RENDER_STUCK_MS 内 window.map.id（「渲染自己的 id」）仍 != character.current_map。
   * 动作：先调游戏自己的 loadTravel()（= 手动换图那条链路：重拉 /includes/do/travel.php、
   *       重画地图、重新对准镜头）—— **只刷新画面，不刷新网页**；
   *       连续 RENDER_MAX 次仍没对上 → 退回整页刷新（老办法，最稳，刷新后自动续挂）。
   * 上限：RENDER_MAX 次 → 刷新页面。
   * 高级参数：不受影响。
   * ───────────────────────────────────────────────────────────── */
  const RENDER_STUCK_MS = 8000;
  const RENDER_MAX = 4;
  /* 只刷新画面（不刷新网页）：调游戏自己的 loadTravel() —— 等价于手动换一次图 */
  function softReloadMap() {
    try {
      if (typeof window.loadTravel === 'function') { window.loadTravel(); return true; }
    } catch (e) { /* ignore */ }
    return false;
  }
  /* 只刷新实体列表（最轻）：调游戏自己的 fetchTravelData() —— 重拉 /includes/ajax_travel.php，
     把「玩家 / 怪物 / 采集点」按服务端最新状态重画（已经死掉的怪会被移除）。 */
  function softRefreshEntities() {
    try {
      if (typeof window.fetchTravelData === 'function') { window.fetchTravelData(); return true; }
    } catch (e) { /* ignore */ }
    return false;
  }
  /* ── 兜底[到位没触发 action] ─────────────────────────────────────
   * 症状：走到目标格了，但格子上的动作没触发（怪没开打 / 资源没拾取 / 门没切图）。
   * 根因（读 1.0 客户端 nextStep 的走格动画完成回调，2026-10-23 复核）：
   *   格子动作只在「动画完成的那一刻 character.x+'-'+character.y === character.walk_to」时才执行
   *   （else if(character['x']+'-'+character['y']==character['walk_to']){ execTileAction(tileAction) }）。
   *   而脚本自己会 abortWalk()（把 walk_to 清成 null：分段导航 / 重发走位 / 落位 / 卡住自愈），
   *   只要清空的那一刻正好落在目标格上，动作就永远不会触发；另外「本来就在格上」也不会触发。
   * 判据：到位后 ARRIVE_ACTION_MS 内，格子还有 action、角色还站在格上、且没有出现对应的窗口。
   * 动作：显式调游戏自己的 execTileAction(action)（和爬塔门 / 采集点 / 传送站一样的做法）。
   *       ★ v2.6.116：敌人格在 .map_table 里没有 action（敌人是 #players_container 覆盖层），改用 walkTo(同格) 触发游戏的「同格 → loadCombat」分支。
   * 上限：每次到位只补触发 1 次（避免和游戏抢动作）。
   * 高级参数：不受影响。
   * ───────────────────────────────────────────────────────────── */
  const ARRIVE_ACTION_MS = 1300;
  function tileActionAt(x, y) {
    try { if (typeof window.getTileActionAt === 'function') return String(window.getTileActionAt(x, y) || ''); } catch (e) { /* ignore */ }
    try { const el = document.querySelector('.map_table #ID' + x + '-' + y); return el ? String(el.getAttribute('action') || '') : ''; } catch (e) { /* ignore */ }
    return '';
  }
  /* 这个动作是不是「已经触发了」（出现对应窗口 / 已经在加载战斗） */
  function arriveActionFired(act) {
    if (act === 'combat' || act === 'boss') return hasFrame('frame_Combat') || window.pendingCombatLoad === true;
    if (act === 'waygate') return !!document.querySelector('#frame_Waygate #tab_cities, #frame_Waygate #tab_wilderness');
    if (act === 'collect_scrap') return hasFrame('frame_CollectScrap');
    if (act === 'pick_up') return hasFrame('frame_Loot');
    if (act === 'overlord_lootbox') return hasFrame('frame_OverlordLootbox') || hasFrame('frame_Loot');
    if (act === 'gathering') return hasFrame('frame_Gathering');
    return false;
  }
  function scheduleArriveAction(x, y, kind) {
    if (kind === 'gather' || kind === 'tower') return;   /* 这两类脚本自己会显式触发（stepGather / 爬塔） */
    const seq = runSeq, mapId = character.current_map;
    setTimeout(function () {
      try {
        if (!running || seq !== runSeq || character.current_map !== mapId) return;
        if (!inGame()) return;
        if (+character.x !== +x || +character.y !== +y) return;   /* 已经走开了 → 不管 */
        if (mapLoadStuck()) return;                               /* 正在换图 → 别插一脚 */
        const act = tileActionAt(x, y);
        if (!act) {
          /* ★ v2.6.116：敌人格在 .map_table 里没有 action（敌人是 #players_container 的覆盖层），
             战斗靠「到位回调里的 findEnemyAtCoords → loadCombat」触发，同样会被 walk_to 清空打断。
             站到怪格 ARRIVE_ACTION_MS 还没开战 → 用游戏自己的 walkTo(当前格) 触发它的「同格 → loadCombat」分支。 */
          if (kind === 'enemy' && !hasFrame('frame_Combat') && window.pendingCombatLoad !== true) {
            logEvent('到位没触发战斗（@' + x + '-' + y + '）→ 用 walkTo 同格重触发');
            setStatus('到位没开战，正在重触发…');
            let acted = false;
            try { if (typeof window.walkTo === 'function') acted = (window.walkTo(x, y) !== false); } catch (e) { /* ignore */ }
            /* walkTo 被守卫拦下（can_travel=false / current_action 非 Traveling）→
               退一步走游戏自己的 loadCombat（和到位回调一致），仅当脚下确实还有怪时调。 */
            if (!acted) {
              try {
                const has = (typeof window.findEnemyAtCoords === 'function') ? window.findEnemyAtCoords(x, y).length : 0;
                if (has && typeof window.loadCombat === 'function') window.loadCombat(1);
              } catch (e) { /* ignore */ }
            }
          }
          return;                                                 /* 格子上没有动作 */
        }
        if (arriveActionFired(act)) return;                       /* 已经触发了 */
        if (character.current_action && character.current_action !== 'Traveling') return;   /* 游戏正忙 */
        logEvent('到位没触发动作（' + act + ' @' + x + '-' + y + '）→ 补一次 execTileAction');
        setStatus('到位没触发动作，正在补触发…');
        if (typeof window.execTileAction === 'function') window.execTileAction(act, false);
      } catch (e) { /* ignore */ }
    }, ARRIVE_ACTION_MS);
  }
  function checkMapRender() {
    const R = st.render;
    if (!inGame()) { R.map = 0; R.at = 0; R.hits = 0; return false; }
    const cm = +character.current_map || 0;
    /* ★ v2.6.111：判据优先用「屏幕上真正画出来的底图」（.map_table 的 background-image），
       读不到再退回 window.map.id（响应脚本会原子地同时改 window.map 和 DOM，但 DOM 才是画面）。 */
    const rid = renderedMapId() || renderMapId();
    /* 读不到「渲染 id」就不猜（登录页 / 加载中 / 游戏改版）—— 交给 checkMapLoad 兜底 */
    if (!(cm > 0) || !(rid > 0)) { R.map = 0; R.at = 0; R.hits = 0; return false; }
    if (cm === rid) { R.map = 0; R.at = 0; R.hits = 0; return false; }            /* 渲染已跟上 → 正常 */
    if (R.map !== cm) { R.map = cm; R.at = now(); R.hits = 0; return false; }     /* 刚换图 → 先给客户端时间 */
    if (mapLoadStuck()) { R.at = now(); return false; }                           /* 加载页还在转 → 交给 checkMapLoad */
    if (now() - R.at < RENDER_STUCK_MS) return false;
    R.at = now(); R.hits++;
    if (R.hits > RENDER_MAX) {
      /* ★ 防刷新循环：3 分钟内最多因「换图没重画」刷新一次 ——
         万一某张图的 window.map.id 和 current_map 天生对不上，也不会变成刷新死循环。 */
      let _last = 0;
      try { _last = +(sessionStorage.getItem('norroth_render_reload_at') || 0); } catch (e) { /* ignore */ }
      if (_last && now() - _last < 180000) {
        R.hits = 0; R.at = now();
        logEvent('换图没重画：3 分钟内已刷新过一次 → 本次不再刷新（避免刷新循环）');
        setStatus('换图没重画：重试 ' + RENDER_MAX + ' 次仍没对上（3 分钟内不再刷新）');
        return true;
      }
      try { sessionStorage.setItem('norroth_render_reload_at', String(now())); } catch (e) { /* ignore */ }
      logEvent('换图没重画：loadTravel 连续 ' + RENDER_MAX + ' 次无效 → 刷新页面');
      setStatus('换图没重画，正在刷新页面…');
      saveCfgNow();
      setTimeout(function () { try { location.reload(); } catch (e) { /* ignore */ } }, 300);
      return true;
    }
    logEvent('换图没重画（服务端在 ' + cm + '，客户端还画着 ' + rid + '）→ 调游戏 loadTravel() 重画（第 ' + R.hits + ' 次）');
    setStatus('换图没重画：正在重画地图…（第 ' + R.hits + ' 次）');
    if (!softReloadMap()) R.hits = RENDER_MAX + 1;   /* 游戏没有 loadTravel → 下次直接走刷新分支 */
    return true;
  }
  /* ── 兜底[怪物列表过期] ─────────────────────────────────────────
   * 症状：同一张图很多人一起打怪时，画面上还挂着**已经被别人杀掉**的怪 →
   *       走过去 / 点它 → 服务端回 "Enemy Not Found"（这次是真的没怪，不是位置不同步）。
   * 根因：1.0 客户端优先走 WebSocket 推送（ensureTravelWebSocketBound() 成功就不再轮询），
   *       推送丢包 / 断线时实体列表就停在旧状态；怪的死活只有服务端知道。
   * 动作：每 ENTITY_REFRESH_MS 强制调一次游戏自己的 fetchTravelData()（REST 直拉，不依赖 WS），
   *       让游戏按服务端最新状态重画实体（死掉的怪会被移除）。
   * 上限：不停止（节流 ENTITY_REFRESH_MS）。
   * 高级参数：不受影响。
   * ───────────────────────────────────────────────────────────── */
  const ENTITY_REFRESH_MS = 20000;
  /* ★ v2.6.114：出发打怪前「先确认一次」的节流（抢怪场景：画面上还挂着别人已打死的怪） */
  const ENTITY_PRE_ATTACK_MS = 6000;
  const ENTITY_PRE_ATTACK_DIST = 3;
  function checkEntityFresh() {
    const E = st.entity;
    if (!running || st.paused || !inGame()) return false;
    if (mapLoadStuck() || navBusy || (st.mapSwitch && st.mapSwitch.active)) return false;
    if (now() - E.at < ENTITY_REFRESH_MS) return false;
    E.at = now();
    softRefreshEntities();
    return true;
  }
  /* 状态栏去重：主循环 400ms 一次，重复写 DOM 会白白触发重排 */
  function setStatus(msg) {
    if (st.statusText === msg) return;
    st.statusText = msg;
    const el = document.getElementById('nr-status');
    if (el) el.textContent = msg;
    const ha = document.getElementById('nr-hact');   // ★ 折叠标题栏同步「当前动作」（不等 1.2s 的统计刷新）
    if (ha && cfg.uiFold) { if (ha.textContent !== msg) ha.textContent = msg; ha.title = msg; }
  }

  // 名称归一化：去 (Lv.x)、统一撇号、压缩空格、转小写
  /* 名称归一化（带记忆化：主循环里每 tick 会对同一批名字调用几十次） */
  const _normMemo = new Map();
  function normName(s) {
    const k = String(s || '');
    let v = _normMemo.get(k);
    if (v !== undefined) return v;
    v = k
      .replace(/\s*\(Lv\.[^)]*\)\s*$/i, '')
      .replace(/[\u2018\u2019\u02BC\u00B4`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (_normMemo.size > 800) _normMemo.clear();
    _normMemo.set(k, v);
    return v;
  }

  function parseLines(text) {
    return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }

  const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---- 操作日志：挂机一整晚出问题时，玩家需要知道「到底发生过什么」 ---- */
  const LOG_MAX = 200;
  let _logSaveTimer = null;
  function saveLogSoon() {
    if (_logSaveTimer) return;
    _logSaveTimer = setTimeout(() => {
      _logSaveTimer = null;
      renderLog();
      try { localStorage.setItem(LOG_KEY, JSON.stringify(st.log.slice(-80))); } catch (e) { /* ignore */ }
    }, 400);
  }
  /* ★ 启动时把上次的日志/停止原因读回来 —— 挂机半夜停了，第二天能直接看到原因 */
  function loadLog() {
    try {
      const a = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      if (Array.isArray(a) && a.length) st.log = a.slice(-LOG_MAX).map(e => Object.assign({}, e, { scope: null }));
    } catch (e) { /* ignore */ }
    try {
      const rec = JSON.parse(localStorage.getItem(STOP_KEY) || 'null');
      if (rec && rec.reason) {
        st.log.push({ t: rec.t || '--:--:--', msg: '（上次运行结束）' + rec.reason });
        if (st.log.length > LOG_MAX) st.log.splice(0, st.log.length - LOG_MAX);
      }
    } catch (e) { /* ignore */ }
  }
  /* 相同消息合并；指定 key 的高频过程按固定时间段汇总，错误和启停仍单列。
     firstAt 固定窗口起点，避免持续运行时一条摘要无限累加。 */
  function logEvent(msg, opts) {
    opts = opts || {};
    const d = new Date();
    const at = d.getTime();
    const t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    msg = String(msg);
    const key = opts.key ? String(opts.key) : '';
    const span = opts.windowMs || 30000;
    const count = opts.count > 0 ? opts.count : 1;
    let index = -1;
    for (let i = st.log.length - 1; i >= Math.max(0, st.log.length - 40); i--) {
      const e = st.log[i];
      if (e.firstAt == null || e.scope !== runSeq || at < e.firstAt || at - e.firstAt >= span) continue;
      if (key ? e.key === key : (i === st.log.length - 1 && !e.key && e.msg === msg)) { index = i; break; }
    }
    const previous = index >= 0 ? st.log.splice(index, 1)[0] : null;
    st.log.push({ t: t, msg: msg, key: key, n: (previous ? previous.n || 1 : 0) + count,
      firstAt: previous ? previous.firstAt : at, firstT: previous ? previous.firstT : t, unit: opts.unit || '次', scope: runSeq });
    if (st.log.length > LOG_MAX) st.log.splice(0, st.log.length - LOG_MAX);
    // 批量渲染与保存，短时连发只刷新一次面板。
    saveLogSoon();
  }

  function logEntryText(e, clean) {
    return (clean ? clean(e.msg) : String(e.msg)) + (e.n > 1 ? '（本段 ' + e.n + (e.unit || '次') + '）' : '');
  }

  function renderLog() {
    const tg = document.getElementById('nr-logtoggle');
    if (tg) tg.textContent = '操作日志 (' + st.log.length + ')';
    const box = document.getElementById('nr-log');
    if (!box) return;
    const follow = box.scrollHeight - box.scrollTop - box.clientHeight < 24;
    box.style.display = 'block';                       // ★ 常开，不再折叠
    box.innerHTML = st.log.slice(-100).map(e =>
      '<div class="lrow"><span class="lt">' + e.t + '</span><span>' + escapeHtml(logEntryText(e)) + '</span></div>').join('');
    if (follow) box.scrollTop = box.scrollHeight;
    placePanel(false);
  }

  /* ---- 异常提醒：挂机时人不在屏幕前，停摆必须能看见/听见 ---- */
  let baseTitle = null;
  function notify(title, body) {
    try { if (!skinOn()) { if (baseTitle == null) baseTitle = document.title; document.title = '⚠ ' + title + ' · ' + baseTitle; } } catch (e) { /* ignore */ }
    if (!cfg.notifyOnStop) return;
    try {
      if (typeof Notification === 'undefined') return;
      const fire = () => { try { new Notification('norroth小伴侣', { body: title + (body ? '：' + body : '') }); } catch (e) { /* ignore */ } };
      if (Notification.permission === 'granted') fire();
      else if (Notification.permission !== 'denied') Notification.requestPermission().then(p => { if (p === 'granted') fire(); });
    } catch (e) { /* ignore */ }
  }
  function clearNotifyTitle() { try { if (skinOn()) return; if (baseTitle != null) document.title = baseTitle; } catch (e) { /* ignore */ } }

  function h(tag, attrs, html) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (html != null) el.innerHTML = html;
    return el;
  }

  /* ★ v2.6.76：面板内确认弹窗。返回 Promise<boolean>（确定=true / 取消=false）。 */
  function nrConfirm(msg, okText, cancelText) {
    return new Promise(function (resolve) {
      let done = false;
      const wrap = h('div', { class: 'nr-ask' });
      wrap.innerHTML =
        '<div class="nr-ask-box">' +
          '<div class="nr-ask-msg">' + escapeHtml(msg) + '</div>' +
          '<div class="nr-ask-btns">' +
            '<button type="button" data-a="0">' + escapeHtml(cancelText || '取消') + '</button>' +
            '<button type="button" class="pri" data-a="1">' + escapeHtml(okText || '确定') + '</button>' +
          '</div>' +
        '</div>';
      const finish = function (v) {
        if (done) return; done = true;
        try { wrap.remove(); } catch (e) { /* ignore */ }
        resolve(v);
      };
      wrap.addEventListener('click', function (e) {
        if (e.target === wrap) { finish(false); return; }
        const b = e.target.closest ? e.target.closest('button[data-a]') : null;
        if (b) finish(b.getAttribute('data-a') === '1');
      });
      document.body.appendChild(wrap);
    });
  }

  /* ======================= 4. 地图扫描 ======================= */

  /* 星级识别 —— ★ 这是 v1.6.0 的一个真 bug：
   * 旧代码写的是「星级 = 第一个 .char_name_tag 的文本」。但普通怪根本没有星级标签，
   * 它的第一个 .char_name_tag 就是名字 <b>Bear (7)</b>，于是 rank 被解析成 "Bear (7)"。
   * 后果：① 星级统计里冒出一堆怪名；② 用户取消勾选「普通」想跳过杂怪时完全失效。
   * 正确做法：只认 .char_name_tag.text_small 这个星级标签（文本或图标），取不到就是 Normal。
   */
  function detectRank(el) {
    const rankEl = el.querySelector('.char_name_tag.text_small');
    if (rankEl) {
      const txt = (rankEl.textContent || '').trim().toLowerCase();
      if (/elite/.test(txt)) return 'Elite';
      if (/rare/.test(txt)) return 'Rare';
      if (/champion/.test(txt)) return 'Champion';
      if (/adventurer/.test(txt)) return 'Player';
    }
    // 图标兜底（文本可能被本地化/改版）
    const imgs = $$q('img', rankEl || el).map(i => (i.getAttribute('src') || '').toLowerCase());
    const has = n => imgs.some(s => new RegExp('(^|/)' + n + '\\.gif$').test(s));
    if (has('elite')) return 'Elite';
    if (has('rare')) return 'Rare';
    if (has('champion')) return 'Champion';
    return 'Normal';
  }

  /** 扫描当前地图的怪物 */
  function scanEnemies() {
    const out = [];
    $$q('#players_container span.enemy').forEach(el => {
      const m = /^enemy(\d+)-(\d+)$/.exec(el.id || '');
      if (!m) return;
      const x = +m[1], y = +m[2];
      const nameEl = el.querySelector('b.char_name_tag');
      const full = nameEl ? (nameEl.textContent || '').trim() : '';
      const lm = /\((\d+)\)\s*$/.exec(full);
      const img = el.querySelector('img');
      const im = img ? /enemy_(\d+)\.gif/.exec(img.getAttribute('src') || '') : null;
      out.push({
        x: x, y: y,
        rank: detectRank(el),
        lv: lm ? +lm[1] : 0,
        icon: im ? im[1] : '',
        name: full.replace(/\s*\(\d+\)\s*$/, '').trim(),
        key: x + '-' + y
      });
    });
    return out;
  }

  /** 扫描地面资源点（Crate / Mushroom / Plant …） */
  function scanResources() {
    const out = [];
    $$q('.map_table [action="collect_scrap"][coords], .map_table [action="pick_up"][coords]').forEach(el => {
      const c = (el.getAttribute('coords') || '').split('-');
      const x = parseInt(c[0], 10), y = parseInt(c[1], 10);
      if (!isFinite(x) || !isFinite(y)) return;
      out.push({ x: x, y: y, name: (el.getAttribute('name') || '').trim(), action: el.getAttribute('action'), key: x + '-' + y });
    });
    return out;
  }

  /* ======================= 5. 可达性 ======================= */
  /* 塔/副本里的门会把地图切成互不相通的片区，另一侧的怪点了也走不过去：
   * 游戏只把 walk_to 设上，角色原地不动，也不报错。所以要提前用 BFS 算清楚。
   * 依据：window.points = 当前地图所有可走格 [{x,y}]；门不在 points 里，相当于墙。
   */
  function reachableSet() {
    if (!inGame()) return null;                       // ★ 非游戏页（登录/选角）直接放弃，别去碰 character
    const pts = window.points;
    if (!Array.isArray(pts) || !pts.length) return null;
    const K = (x, y) => x + ',' + y;
    const cached = st.reach;
    if (cached && cached.map === character.current_map && cached.set.has(K(character.x, character.y))) return cached.set;

    const grid = new Set();
    for (const p of pts) grid.add(K(p.x, p.y));
    const sx = character.x, sy = character.y;
    if (!grid.has(K(sx, sy))) return null;          // 角色不在可走格上（换图/过渡中）：这轮不判
    const set = new Set([K(sx, sy)]);
    const queue = [[sx, sy]];
    while (queue.length) {
      const cur = queue.pop(), x = cur[0], y = cur[1];
      /* ★ v2.6.120：可达性必须和游戏寻路一致 —— 客户端 findWalkPath() 用 8 邻接（含斜向，允许切角），
         旧版这里只做 4 邻接 → 在「只能斜着连通」的地形上会把整张图切成两块（人在上半区时下半区的怪
         全被判「不可达」→ 不索敌、不跑过去，表现为「上面不下去 / 下面不上来」）。 */
      const nbs = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x + 1, y - 1], [x - 1, y + 1], [x - 1, y - 1]];
      for (const n of nbs) {
        const k = K(n[0], n[1]);
        if (set.has(k) || !grid.has(k)) continue;
        set.add(k); queue.push(n);
      }
    }
    st.reach = { map: character.current_map, set: set };
    return set;
  }

  /** 目标能不能走到：目标格或它紧邻的一格在可达集合里就算（怪站的那格被占，通常不在 points 里） */
  function isReachable(x, y) {
    const set = reachableSet();
    if (!set) return true;                          // 数据拿不到时一律放行
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (set.has((x + dx) + ',' + (y + dy))) return true;
    }
    return false;
  }

  function unreachableEnemies() {
    if (!inGame()) return 0;
    return scanEnemies().filter(e => !isReachable(e.x, e.y)).length;
  }

  /* ★ 诊断「为什么没得打」：把本图所有怪按各过滤器逐项归类。
     排查「明明有怪却提示无怪」时，看哪一项把怪吃掉了即可。 */
  function targetDiag() {
    if (!inGame()) return null;
    const all = scanEnemies();
    const d = { total: all.length, player: 0, name: 0, mobblack: 0, rank: 0, lv: 0, black: 0, unreach: 0, ok: 0 };
    all.forEach(e => {
      if (e.rank === 'Player') { d.player++; return; }
      if (!nameAllowed(e.name)) { d.name++; return; }
      if (mobBlacklisted(e.name)) { d.mobblack++; return; }
      if (!rankAllowed(e.rank)) { d.rank++; return; }
      if (!lvAllowed(e.lv)) { d.lv++; return; }
      if (isBlacklisted(e.key)) { d.black++; return; }
      if (!isReachable(e.x, e.y)) { d.unreach++; return; }
      d.ok++;
    });
    return d;
  }
  /* 紧凑文案：只列出「吃掉了怪」的项 */
  function targetDiagText(d) {
    if (!d) return '';
    const bits = [];
    if (d.name) bits.push('名单过滤 ' + d.name);
    if (d.mobblack) bits.push('怪物黑名单 ' + d.mobblack);
    if (d.rank) bits.push('星级过滤 ' + d.rank);
    if (d.lv) bits.push('等级过滤 ' + d.lv);
    if (d.black) bits.push('黑名单 ' + d.black);
    if (d.unreach) bits.push('不可达 ' + d.unreach);
    if (!bits.length) return '';
    return '（本图怪 ' + d.total + '：' + bits.join(' · ') + '）';
  }

  /* ======================= 6. 目标筛选与优先级排序 ======================= */

  /* 名单解析缓存：nameAllowed / nameWeight / whyText 每 tick 会调用几十次，
     旧实现每次都 split 一遍 textarea 内容 */
  let _mlCache = { src: null, list: [], norm: [] };
  /* ★ 生效名单 = 用户手填名单 + （可选）未完成任务的击杀目标 */
  function monsterList() {
    const quest = cfg.questMonsters ? _questCache.list : [];
    const src = (cfg.monsterFilter || '') + '\u0000' + quest.join('\n');
    if (_mlCache.src !== src) {
      // ★ 顺序：任务怪在前，手填名单在后（两者同优先级，只是任务怪排前面）
      const merged = [];
      quest.forEach(n => { if (merged.indexOf(n) < 0) merged.push(n); });
      parseLines(cfg.monsterFilter || '').forEach(n => { if (merged.indexOf(n) < 0) merged.push(n); });
      _mlCache = { src: src, list: merged, norm: merged.map(normName) };
    }
    return _mlCache.list;
  }
  function monsterNormList() { monsterList(); return _mlCache.norm; }
  /* ★ v2.6.55：怪物黑名单 —— 命中的怪一律不打（优先级最高：和星级 / 等级 / 名单都无关）。
     缓存更新策略和 _mlCache 一致：只在源文本变了才重新 split。 */
  let _mblCache = { src: null, norm: [] };
  function mobBlackNorm() {
    const src = cfg.monsterBlacklist || '';
    if (_mblCache.src !== src) _mblCache = { src: src, norm: parseLines(src).map(normName) };
    return _mblCache.norm;
  }
  function mobBlacklisted(name) {
    const norm = mobBlackNorm();
    if (!norm.length) return false;
    return norm.indexOf(normName(name)) >= 0;
  }
  function invalidateMonsterList() { _mlCache = { src: null, list: [], norm: [] }; _mblCache = { src: null, norm: [] }; }

  /* ★ 星级过滤已合并进「星级优先级」列表：勾选的星级才打，取消勾选的不打。
     （原来的独立「星级过滤」开关已去掉 —— 只要上面勾了星级就直接生效） */
  function rankAllowed(rank) {
    return cfg.rankOff.indexOf(rank) < 0;
  }

  /**
   * 名单的两种语义（★ 用户定义）：
   *   · 默认（全图列表 = 关）：名单是「过滤器」—— 名单非空时只打名单里的怪。
   *     配合「任务名单」，名单 = 手填名单 + 未完成任务怪，于是勾上它 + 手填留空 = 只打任务怪。
   *   · 全图列表 = 开：名单降级为「优先级」—— 名单外的怪一样打，只是排在名单怪后面。
   * 归一化后精确比对，避免 "Rat" 误伤 "Rat King"。
   */
  function nameAllowed(name) {
    if (cfg.targetMode === 'distance') return true;  // ★ v2.6.74 优先距离：不看优先名单，全部可打
    if (cfg.nameFirst) return true;                  // 全图列表：不做过滤，只影响排序
    const norm = monsterNormList();
    if (!norm.length) return true;
    return norm.indexOf(normName(name)) >= 0;
  }

  const isBlacklisted = key => { const t = st.blacklist[key]; return !!t && t > now(); };
  const blacklistTile = (key, ms) => { st.blacklist[key] = now() + (ms || 20000); };

  /* ---- 任务怪：把「还没打够数量」的任务击杀目标自动并入名单 ----
   * 数据源：/modal/journal（任务日志，服务端渲染）+ /modal/help_detail?id=53（图鉴怪名表）
   * 判定：日志里出现某怪名，且其后 160 字内有 "x/y" 且 x < y → 视为未完成
   * 说明：图鉴怪名表只在首次使用时拉一次，之后走缓存，不增加循环开销。 */
  let _questCache = { at: 0, list: [], err: '' };
  let _enemyNames = null;
  const QUEST_TTL = 60000;

  async function loadEnemyNames() {
    if (_enemyNames) return _enemyNames;
    try {
      const h = await (await fetch('/modal/help_detail?id=53', { credentials: 'same-origin' })).text();
      const names = [];
      h.split(/<div class="divblock[^"]*search-this"/).slice(1).forEach(b => {
        const ds = (b.match(/^\s*data-search="([^"]*)"/) || [])[1] || '';
        const nm = ds.split(',')[0].trim();
        if (nm) names.push(nm);
      });
      if (names.length) _enemyNames = names;
    } catch (e) { /* ignore */ }
    return _enemyNames || [];
  }

  async function refreshQuestTargets(force) {
    if (!cfg.questMonsters) { _questCache = { at: now(), list: [], err: '' }; invalidateMonsterList(); renderRankList(); return []; }
    if (!force && now() - _questCache.at < rhythm(QUEST_TTL)) return _questCache.list;
    try {
      const [h, names] = await Promise.all([
        fetch('/modal/journal', { credentials: 'same-origin' }).then(r => r.text()),
        loadEnemyNames()
      ]);
      const text = h.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      const low = text.toLowerCase();
      const out = [];
      /* ★ 原来只看名字「第一次出现」的位置：如果任务日志里这个名字先出现在
         「已完成/其它」段落，就会误判成已打够而漏掉 —— 这正是「任务怪有时候不显示」的原因。
         现在扫描该名字的每一次出现：只要有任意一次后面跟着未完成的 x/y，就并入名单；
         若整篇都没读到达成数，则保守地当作未完成（避免漏怪）。 */
      for (const nm of names) {
        const needle = nm.toLowerCase();
        let idx = -1, found = false, sawCount = false, incomplete = false;
        while ((idx = low.indexOf(needle, idx + 1)) >= 0) {
          found = true;
          const seg = text.slice(idx, idx + 160);
          const pm = /(\d+)\s*\/\s*(\d+)/.exec(seg);
          if (pm) { sawCount = true; if (+pm[1] < +pm[2]) { incomplete = true; break; } }
        }
        if (!found) continue;                        // 日志里根本没提到 → 不是任务目标
        if (incomplete || !sawCount) out.push(nm);
      }
      _questCache = { at: now(), list: out, err: '' };
      invalidateMonsterList();
      renderRankList();
      return out;
    } catch (e) {
      _questCache = { at: now(), list: _questCache.list, err: (e && e.message) || String(e) };
      renderRankList();
      return _questCache.list;
    }
  }

  /* ---- 优先级权重 ---- */

  /** 星级权重：按下标，越小越优先；不在顺序表里的排最后 */
  function rankWeight(rank) {
    const i = cfg.rankOrder.indexOf(rank);
    return i < 0 ? 99 : i;
  }

  /** 名单权重：只分两级 —— 在名单里 = 0（彼此同优先级，不再按名单先后），不在名单里 = 999。
   *  ★ v2.6.76：名单只决定「打不打 / 谁先打」，名单内的怪一律同优先级；
   *  先打谁一律看 星级 → 距离（优先任务 / 全图列表都适用）。 */
  function nameWeight(name) {
    const norm = monsterNormList();
    if (!norm.length) return 0;
    return norm.indexOf(normName(name)) < 0 ? 999 : 0;
  }

  /**
   * 目标排序：
   *   ① 怪物优先名单（只分两级）—— 名单内的怪彼此同优先级、排在名单外的怪前面：
   *        · 优先任务（priority）：名单外的怪直接不打（名单 = 过滤器）；
   *        · 全图列表（all）：名单外的怪一样打，只是排在名单内之后。
   *   ② 星级（按「星级优先级」列表的顺序）
   *   ③ 距离（越近越优先）
   * 用数组比较实现字典序，稳定且好扩展。
   */
  function targetKey(e, cx, cy) {
    const d = manhattan(cx, cy, e.x, e.y);
    /* ★ v2.6.74 优先距离：不看名单 / 星级顺序，只按「离人的距离」选下一个怪 */
    if (cfg.targetMode === 'distance') return [d];
    return [nameWeight(e.name), rankWeight(e.rank), d];
  }

  function cmpKey(a, b) {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  }

  /** 从一份「已经扫好的」怪物列表里筛出可打的并排序（避免每 1.2 秒重复扫 DOM） */
  /* ★ 融合：怪物等级范围过滤（0 = 不限）。设了范围但读不到等级 → 不打。 */
  function lvAllowed(lv) {
    const lo = cfg.monsterLvMin || 0, hi = cfg.monsterLvMax || 0;
    if (!lo && !hi) return true;
    if (!lv) return false;
    if (lo && lv < lo) return false;
    if (hi && lv > hi) return false;
    return true;
  }

  function attackableFrom(list) {
    if (!inGame() || !list) return [];
    const cx = character.x, cy = character.y;
    return list
      .filter(e => e.rank !== 'Player' && nameAllowed(e.name) && !mobBlacklisted(e.name) && rankAllowed(e.rank) && lvAllowed(e.lv) &&
                   !isBlacklisted(e.key) && isReachable(e.x, e.y))
      .map(e => Object.assign({ _k: targetKey(e, cx, cy) }, e))
      .sort((a, b) => cmpKey(a._k, b._k));
  }

  /** 可攻击的怪物（过滤名称/星级/等级/黑名单/可达），已按优先级排好序 */
  function attackableEnemies() {
    if (!inGame()) return [];
    return attackableFrom(scanEnemies());
  }

  /** 给面板展示的优先级原因（★ 不再输出「名单第 N 位」——日志里太吵） */
  function whyText(e) {
    const bits = [];
    if (e.rank !== 'Normal') bits.push(RANK_STAR[e.rank] + RANK_CN[e.rank]);
    return bits.join(' · ');
  }

  /** 最近的可拾取地面资源（Crate / Mushroom / …），已过滤黑名单与不可达 */
  function nearestResource() {
    if (!inGame()) return null;
    const cx = character.x, cy = character.y;
    let best = null, bd = Infinity;
    scanResources().forEach(r => {
      if (isBlacklisted(r.key) || !isReachable(r.x, r.y)) return;
      const d = manhattan(cx, cy, r.x, r.y);
      if (d < bd) { bd = d; best = r; }
    });
    // 脚下的资源没被触发 → 是残留，短期跳过
    if (best && bd === 0) { blacklistTile(best.key, 15000); return null; }
    return best;
  }

  /* ---- 目标选择 ---- */

  function pickTarget() {
    const cx = character.x, cy = character.y;

    const enemies = attackableEnemies();
    /* ★ v1.7.1：资源拾取只看「拾取地面资源」这一个开关（旧「顺路拾取」已合并进来） */
    const resources = cfg.gatherScrap ? scanResources().filter(r => !isBlacklisted(r.key) && isReachable(r.x, r.y)) : [];

    const eBest = enemies[0] || null;                 // 已按优先级排序
    const eD = eBest ? manhattan(cx, cy, eBest.x, eBest.y) : Infinity;

    let rBest = null, rD = Infinity;
    resources.forEach(r => { const d = manhattan(cx, cy, r.x, r.y); if (d < rD) { rD = d; rBest = r; } });

    // 脚下的怪没触发战斗 → 先原地重触发一次（可能是服务端位置没跟上），再不行才拉黑
    /* ★ v2.6.110：脚下的怪「点了没反应」多半不是位置问题，而是这只怪**已经被别人杀了**
       （人多抢怪时客户端列表还没更新，画面上还挂着）→ 立刻强制拉一次实体列表把它清掉，
       否则会一直对着一个不存在的怪原地重试（Enemy Not Found）。 */
    if (eBest && eD === 0) { softRefreshEntities(); blacklistTile(eBest.key, 15000); return { skip: true }; }

    // 资源点只在「不比自己优先级最高的怪更远」时才插队，避免打断精英怪节奏
    if (rBest && (!eBest || rD <= eD)) {
      return { kind: 'res', x: rBest.x, y: rBest.y, label: '资源·' + (rBest.name || rBest.action) };
    }
    if (eBest) {
      return {
        kind: 'enemy', x: eBest.x, y: eBest.y, enemy: eBest,
        label: '怪物·' + (eBest.name || '') + (eBest.lv ? ' Lv' + eBest.lv : '') + (whyText(eBest) ? '（' + whyText(eBest) + '）' : '')
      };
    }
    return null;
  }

  /* ======================= 6.5 目标切换（可复用模块） =======================
   * 用户定义：前往目标的路上要一直扫图；一旦出现「更符合条件、且优先级更高」的目标，
   * 立刻切换过去（不等走到原目标）。
   *
   * makeRetarget(opts) 生成一个「途中换目标」检查器，战斗 / 采集 / 一键挂机共用同一份逻辑：
   *   opts.pick()        当前模式下的最优目标 → {kind,x,y,enemy,label} | null（由调用方决定策略）
   *   opts.allow()       额外闸门（默认 true）；例如采集模式要求 cfg.gatherInterrupt
   *   opts.intervalMs    扫描节流（默认 1200ms）
   *   opts.tag           切换日志前缀（默认「索敌」）
   * 返回 { tick() }：tick() 返回 true = 已切换目标（调用方应当立刻 return，本 tick 结束）。
   *
   * 规则：
   *   · 只在「正在前往某个目标」(st.move) 时生效 —— 去怪 / 去采集点 / 去资源点都算；
   *   · 新目标必须是「怪」(t.enemy)；且不能就是当前正在走的格子；
   *   · 当前目标也是怪时，只有新目标排序键「严格更优」才切（避免同权重来回抖）；
   *   · 当前目标是采集点 / 资源点时，只要策略选中了怪就直接切（即「被更优怪打断」）。
   * ====================================================================== */
  function makeRetarget(opts) {
    opts = opts || {};
    const intervalMs = +opts.intervalMs || 1200;
    const pick = opts.pick;
    const allow = opts.allow || function () { return true; };
    const tag = opts.tag || '索敌';
    let at = 0;
    let lastKey = '';
    return {
      tick: function () {
        if (!running || st.paused || !inGame()) return false;
        const m = st.move;
        if (!m) { st.retargetHist = {}; return false; }        /* 没在走 → 清空「已锁定过」历史，交给正常选目标流程 */
        if (m.segment && m.segment.phase === 'pause') return false;
        if (!allow()) return false;
        if (now() - at < intervalMs) return false;             /* 节流 */
        at = now();
        if (hasFrame('frame_Combat') || hasFrame('frame_Scavenge') || hasFrame('frame_Loot')) return false;
        if (!canAct()) return false;
        /* ★ v2.6.121：把「本次移动期间已经锁定过」的怪记下来（含当前目标），禁止再切回去 ——
           否则两个怪互相「更优」时会 A→B→A→B 来回横跳，人永远走不到其中任何一只。 */
        if (!st.retargetHist) st.retargetHist = {};
        if (st.target && st.target.key) st.retargetHist[st.target.key] = 1;
        let t = pick();
        if (!t || !t.enemy) return false;                      /* 只处理「换成某只怪」 */
        const goal = m.segment || m;
        if (t.x === goal.tx && t.y === goal.ty) { lastKey = t.enemy.key; return false; }   /* 就是当前目标 */
        /* ★ v2.6.121：本次移动「已经锁定过」的怪不再切回去（否则 A→B→A→B 来回横跳，永远走不到）。
           最优目标被禁时 → 顺位取「还没锁定过」的最优怪；都锁过就不切。 */
        if (st.retargetHist[t.enemy.key]) {
          const list = attackableEnemies();
          let alt = null;
          for (let i = 0; i < list.length; i++) {
            if (st.retargetHist[list[i].key]) continue;
            alt = enemyTargetOf(list[i]);
            if (alt) break;
          }
          if (!alt) return false;
          t = alt;
        }
        /* 当前目标也是怪 → 只有严格更优才切 */
        if (m.kind === 'enemy' && st.target) {
          const list = attackableEnemies();
          const best = list.find(function (e) { return e.key === t.enemy.key; });
          const cur = list.find(function (e) { return e.key === st.target.key; });
          if (best && cur && cmpKey(best._k, cur._k) >= 0) return false;
        }
        if (startMove(t.x, t.y, t.kind, t.label) === false) return false;
        st.target = t.enemy;
        st.retargetHist[t.enemy.key] = 1;                      /* ★ 记入「已锁定过」历史 */
        lastKey = t.enemy.key;
        logEvent(tag + '：切换目标 → ' + (t.enemy.name || t.enemy.key), { key: 'target:' + character.current_map });
        return true;
      },
      lastKey: function () { return lastKey; }
    };
  }

  /* 战斗 / 一键挂机：有怪就打怪（combatTarget 已按 名单→星级→距离 排好） */
  const retargetCombat = makeRetarget({ tag: '索敌', pick: combatTarget });
  /* 采集：只在勾了「采集中断打怪」时抢，且沿用「采集中断条件」星级门槛 */
  const retargetGather = makeRetarget({ tag: '采集打断', pick: gatherInterruptTarget, allow: function () { return !!cfg.gatherInterrupt; } });

  /* ======================= 7. 移动 ======================= */

  function countGather() {
    st.gathers++;
    const k = st.gatherKind || '采集';
    st.gathersByKind[k] = (st.gathersByKind[k] || 0) + 1;   // ★ 详细统计
    updateStats();
  }

  /* 普通挂机先把目的地设为真实路径的倒数第二格，不靠轮询抢在最后一步前刹车。
     游戏 findWalkPath 返回逆序格子列表；也兼容终点在末尾的列表。
     ★ v2.6.147：加诊断日志（按原因键去重，60s 内聚合成一条）——
     用来区分「分段导航整个没生效」和「只是算不出前一格」。 */
  function navSegDiag(msg) {
    try { logEvent('分段导航：' + msg, { key: 'navseg:' + String(msg).replace(/[0-9]+/g, '#'), windowMs: 60000 }); } catch (e) { /* ignore */ }
  }
  function regularSegmentPoint(x, y, kind) {
    if (!cfg.navSegOn) return null;                                   /* 没开：静默（用户自己知道开关状态） */
    if (st.mode === 'tower' || (st.ovl && st.ovl.on)) { navSegDiag('爬塔 / Overlord 不适用，跳过'); return null; }
    if (kind !== 'enemy' && kind !== 'gather' && kind !== 'res') { navSegDiag('该移动类型（' + kind + '）不适用，跳过'); return null; }
    if (typeof window.findWalkPath !== 'function') { navSegDiag('游戏未暴露 findWalkPath，算不出前一格'); return null; }
    try {
      const path = window.findWalkPath(character.x, character.y, x, y);
      if (!Array.isArray(path)) { navSegDiag('findWalkPath 没算出路线，跳过'); return null; }
      const need = Math.max(3, +cfg.navSegDist || 5);
      if (path.length <= need) { navSegDiag('路径只有 ' + path.length + ' 步（≤ 长距离阈值 ' + need + '），跳过'); return null; }
      const goal = x + '-' + y;
      const raw = path[0] === goal ? path[1] : (path[path.length - 1] === goal ? path[path.length - 2] : null);
      if (typeof raw !== 'string') { navSegDiag('路线里找不到目标前一格，跳过'); return null; }
      const p = raw.split('-').map(Number);
      if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.max(Math.abs(x - p[0]), Math.abs(y - p[1])) !== 1) { navSegDiag('前一格不紧邻目标，跳过'); return null; }
      if (tileActionAt(p[0], p[1])) { navSegDiag('前一格 ' + p[0] + '-' + p[1] + ' 有交互（NPC/门/采集），跳过'); return null; }
      if (scanEnemies().some(e => e.x === p[0] && e.y === p[1])) { navSegDiag('前一格 ' + p[0] + '-' + p[1] + ' 有怪，跳过'); return null; }
      navSegDiag('已启用：先到前一格 ' + p[0] + '-' + p[1] + '（目标 ' + x + '-' + y + '，路径 ' + path.length + ' 步）');
      return { x: p[0], y: p[1] };
    } catch (e) { navSegDiag('异常：' + (e && e.message ? e.message : e)); return null; }
  }
  function walkVisualArrived(x, y) {
    try {
      if ((window.walkQueue && window.walkQueue[character.id] || []).length) return false;
      const el = document.getElementById('player_' + character.id);
      if (!el) return true;
      const $ = jq();
      if ($ && $(el).is(':animated')) return false;
      const left = parseFloat(el.style.left), top = parseFloat(el.style.top);
      return (!Number.isFinite(left) || Math.abs(left - x * 48) < 1) && (!Number.isFinite(top) || Math.abs(top - y * 48) < 1);
    } catch (e) { return false; }
  }
  function startMove(x, y, kind, label, opts) {
    opts = opts || {};
    if (!canAct()) return false;
    if (!st.move && !opts.finalLeg) st.retargetHist = {};   /* 新目标清历史；分段最后一格沿用本次历史 */
    /* ── 兜底[抢怪·出发前确认] ───────────────────────────────────
     * 症状：同一张图很多人一起打怪时，画面上还挂着**已经被别人杀掉**的怪 →
     *       走过去 / 点它 → 服务端回 "Enemy Not Found"（这次是真的没怪，不是位置不同步）。
     * 判据：目标是怪 + 距离 > ENTITY_PRE_ATTACK_DIST 格 + 距上次强制刷新 > ENTITY_PRE_ATTACK_MS。
     * 动作：先强制拉一次实体列表（把已死的怪清掉），**本 tick 先不动** → 下一 tick 用新列表重新选目标。
     * 代价：一次轻量请求 + 约 0.5s；收益：不会白走 10~30 秒到一只不存在的怪那里。
     * 上限：节流 ENTITY_PRE_ATTACK_MS（不停止）。
     * 高级参数：不受影响。
     * ─────────────────────────────────────────────────────────── */
    if (kind === 'enemy' && manhattan(character.x, character.y, x, y) > ENTITY_PRE_ATTACK_DIST
        && now() - (st.entity.at || 0) > ENTITY_PRE_ATTACK_MS) {
      st.entity.at = now();
      softRefreshEntities();
      return false;   /* 本 tick 不动；下一 tick 用刷新后的列表重新选目标 */
    }
    if (kind === 'gather' || kind === 'res') {
      st.gatherKind = String(label || '').replace(/^(采集点|资源)·/, '') || (kind === 'gather' ? '采集点' : '资源');
    }
    /* ★ 真人化偶发失误：先走错一格，到了再走真目标（模拟手滑） */
    if (!opts.finalLeg && cfg.humanMistakeOn && (+cfg.humanMistakePct || 0) > 0 && !st.move && Math.random() * 100 < (+cfg.humanMistakePct || 0)) {
      const w = mistakeTile(x, y);
      if (w) {
        const rw = safeWalkTo(w[0], w[1], function (ok) {
          const mm = st.move;
          if (!mm || mm.tx !== w[0] || mm.ty !== w[1]) return;      /* 已经换目标 → 忽略 */
          mm.pending = false;
          mm.started = walkStarted(ok) || character.walk_to === (w[0] + '-' + w[1]);
          if (!mm.started) { mm.retryAt = 0; mm.retries = 0; }      /* 没走起来 → 立刻允许重发 */
        });
        markAct();
        st.move = { tx: w[0], ty: w[1], kind: kind, label: label, at: now(), started: walkStarted(rw), retryAt: now(), retries: 0,
                    pending: (rw === 'deferred'), pendingAt: (rw === 'deferred') ? now() : 0,
                    d: manhattan(character.x, character.y, w[0], w[1]),
                    after: { tx: x, ty: y, kind: kind, label: label } };
        st.phase = 'move';
        setStatus('前往 ' + label + '（' + x + '-' + y + '）');
        return true;
      }
    }
    let segment = null;
    const pre = !opts.finalLeg && regularSegmentPoint(x, y, kind);
    if (pre) {
      segment = { tx: x, ty: y, kind: kind, label: label, phase: 'first' };
      x = pre.x; y = pre.y;
    }
    const r = safeWalkTo(x, y, function (ok) {
      const mm = st.move;
      if (!mm || mm.tx !== x || mm.ty !== y) return;              /* 已经换目标 → 忽略 */
      mm.pending = false;
      mm.started = walkStarted(ok) || character.walk_to === (x + '-' + y);
      if (!mm.started) { mm.retryAt = 0; mm.retries = 0; }        /* 没走起来 → 立刻允许重发 */
    });
    markAct();
    const already = character.walk_to === (x + '-' + y);   // walkTo 已朝该格走时会返回 false，同样视为已发起
    st.move = { tx: x, ty: y, kind: kind, label: label, at: now(), started: walkStarted(r) || already, retryAt: now(), retries: 0,
                pending: (r === 'deferred'), pendingAt: (r === 'deferred') ? now() : 0,
                d: manhattan(character.x, character.y, x, y), segment: segment };
    st.phase = 'move';
    setStatus('前往 ' + label + '（' + x + '-' + y + '）');
    return true;
  }

  /* ★ v2.6.67：走位「没进展」判定阈值 —— 已发起 + 位置 N 秒没变 + walk_to 已空 = 这一步根本没走起来。
     走速约 400ms/格，正常走路位置一直在变；4 秒不动就足够判定，不必等 d×0.8 秒的距离预算。 */
  const MOVE_STALL_MS = 4000;
  const MOVE_RETRY_MAX = 8;      /* walkTo 明确失败 → 最多重发 8 次（每次约 0.9s） */
  const MOVE_STALL_MAX = 4;      /* walkTo 收下了但人不动 → 最多重发 4 次（每次约 4s），别拖太久 */

  /* 重发一次走位：abortWalk 清残留（复位 can_travel / pendingCombatLoad）→ 重新 safeWalkTo，
     并把 walkTo 的真实结果回写 st.move。返回 false = 重试次数用尽，调用方负责拉黑 + 清 st.move。 */
  function resendMove(m, maxTries) {
    const cap = maxTries || MOVE_RETRY_MAX;
    m.retries = (m.retries || 0) + 1;
    if (m.retries > cap) return false;
    abortWalk();                                   // 清残留，否则重试也是 no-op
    const r = safeWalkTo(m.tx, m.ty, function (ok) {
      if (st.move !== m) return;                   /* 已经换目标 → 忽略 */
      m.pending = false;
      m.started = walkStarted(ok) || character.walk_to === (m.tx + '-' + m.ty);
      if (!m.started) m.retryAt = 0;
    });
    m.started = walkStarted(r);
    m.pending = (r === 'deferred');
    m.pendingAt = m.pending ? now() : 0;
    m.retryAt = now();
    m.lastPos = ''; m.lastPosAt = now();           /* 重新开始计「没进展」 */
    markAct();
    return true;
  }

  /** 返回 true 表示本 tick 已处理（仍在移动或刚结束） */
  function checkMove() {
    const m = st.move;
    if (!m) return false;
    const goal = m.segment || m;

    if (hasFrame('frame_Combat')) { st.move = null; st.phase = 'combat'; return true; }   // 走到怪格 → 游戏自动开战
    if (m.segment && m.segment.phase === 'pause') {
      const s = m.segment;
      if (cfg.navSegOn && now() < s.resumeAt) return true;
      if (!canAct()) return true;
      st.move = null;
      if (s.kind === 'enemy' && !scanEnemies().some(e => e.x === s.tx && e.y === s.ty)) { st.target = null; return true; }
      startMove(s.tx, s.ty, s.kind, s.label, { finalLeg: true });
      return true;
    }
    if (character.x === m.tx && character.y === m.ty) {                                    // 到位
      if (m.segment) {
        // 原生 nextStep 在动画开始时就更新坐标，要等动画真正结束才计算停顿。
        if (!walkVisualArrived(m.tx, m.ty)) return true;
        const ms = cfg.navSegOn ? Math.max(0, Math.round(+cfg.navSegPauseMs || 0)) : 0;
        abortWalk();
        m.segment.phase = 'pause'; m.segment.resumeAt = now() + ms;
        st.phase = 'wait';
        logEvent('分段到站：' + m.tx + '-' + m.ty + ' → ' + m.segment.tx + '-' + m.segment.ty + '，停顿 ' + ms + 'ms');
        setStatus('分段导航：目标前一格，停顿 ' + ms + 'ms…');
        if (!ms) { const s = m.segment; st.move = null; startMove(s.tx, s.ty, s.kind, s.label, { finalLeg: true }); }
        return true;
      }
      /* ★ 到位先同步服务端位置：否则「看着到了、实际没到」→ 攻击/采集会失败。
         v2.6.70：若这次走位中途被 abortWalk 打断过（st.pos 新鲜），空 walk queue 不够 →
         直接做一次真·落位（走开一格再走回）。 */
      if (!m.after) settleServerPos(m.tx, m.ty, '到位');
      st.move = null;
      /* ★ v2.6.115：到位后核对「格子动作到底触发了没」，没触发就补一次 execTileAction
         （abortWalk 会把 character.walk_to 清成 null → 游戏就永远不会执行格子动作）。 */
      scheduleArriveAction(m.tx, m.ty, m.kind);
      if (m.after) {   /* ★ 失误绕路：到了错格 → 稍微停一下再走真目标 */
        const a = m.after;
        const seq = runSeq, mapId = character.current_map;
        setTimeout(function () { try { if (running && seq === runSeq && character.current_map === mapId && canAct()) startMove(a.tx, a.ty, a.kind, a.label); } catch (e) { /* ignore */ } }, 400 + Math.floor(Math.random() * 900));
      }
      return true;
    }

    /* 真人化延迟发出中：等 safeWalkTo 的回调把 walkTo 的真实结果写回来。
       最多等 2 秒（回调丢了就当「没发起」，走下面的重发分支）。 */
    if (m.pending) {
      if (now() - (m.pendingAt || m.at) < 2000) return true;
      m.pending = false; m.started = false; m.retryAt = 0;
    }

    /* ── 兜底[走位重试] ───────────────────────────────────────────
     * 症状：点了目标格但角色没动（can_travel=false / 幽灵战斗态 / 游戏正忙）。
     * 判据：st.move.started === false（walkTo 明确返回 false / 回调报失败）。
     * 动作：900ms 后 abortWalk() + 重发 safeWalkTo；游戏正忙（如自动搜刮）时最多等 20s。
     * 上限：8 次 → 把该格拉黑 30s 并跳过。
     * 高级参数：不受影响。
     * ─────────────────────────────────────────────────────────── */
    if (!m.started) {
      /* ★ 游戏正忙（current_action 不是 'Traveling'，例如自动搜刮 'Collecting Scrap'）→ 等它做完。
         正常搜刮约 4.5s；等太久（>20s）说明是卡住的幽灵战斗态，交给 abortWalk 复位后再试。 */
      if (gameBusyAction() && now() - (m.busyAt || (m.busyAt = now())) < 20000) { m.retryAt = now(); return true; }
      m.busyAt = 0;
      if (now() - m.retryAt > 900) {
        if (!resendMove(m)) {
          blacklistTile(goal.tx + '-' + goal.ty, 30000);
          logEvent('无法前往 ' + m.label + '，已跳过');
          setStatus('无法前往 ' + m.label + '，已跳过');
          st.move = null; return true;
        }
      }
      return true;
    }

    /* ── 兜底[走位无进展]（v2.6.67 新增）─────────────────────────────
     * 症状：walkTo 被游戏「收下」了（返回真 / 已发起），但角色原地不动 → 打完怪发呆。
     * 判据：已发起 + 位置连续 MOVE_STALL_MS 没变 + character.walk_to 已空 + 游戏不忙
     *       （walk_to 还挂着 = 游戏以为在走，那是 checkFrozen 的活；游戏正忙 = 等它做完，这里都不抢）。
     * 动作：abortWalk()（复位 can_travel / pendingCombatLoad）+ 重发，最多 8 次。
     * 上限：8 次 → 拉黑该格 30s 并跳过。
     * 高级参数：不受影响。
     * ─────────────────────────────────────────────────────────── */
    const _pos = character.x + '-' + character.y;
    if (m.lastPos !== _pos) { m.lastPos = _pos; m.lastPosAt = now(); }
    /* ★ 寻路请求在途：walkTo() 一发起就把 can_travel 置 false，直到寻路回包/走格动画结束才复位。
       这期间「位置没变」是正常的（实测寻路回包可能 >1.5s），不能算「没进展」；
       但 can_travel 卡死（幽灵寻路）也是「发呆」的一种，所以只宽限 10s。 */
    if (window.can_travel === false && now() - m.at < 10000) m.lastPosAt = now();
    if (now() - (m.lastPosAt || m.at) > MOVE_STALL_MS && !character.walk_to && !gameBusyAction()) {
      logEvent('走位无进展（' + Math.round(MOVE_STALL_MS / 1000) + 's 位置没变且 walk_to 已空）→ 重发 ' + m.label);
      if (!resendMove(m, MOVE_STALL_MAX)) {
        blacklistTile(goal.tx + '-' + goal.ty, 30000);
        logEvent('走位无进展，已跳过 ' + m.label);
        setStatus('走位无进展，已跳过 ' + m.label);
        st.move = null; return true;
      }
      return true;
    }

    /* ★ 走位超时按距离缩放（2026-10-19 实测）：走速 ≈400ms/格，固定 cfg.moveTimeout(15s) 只够 ~37 格。
       目标在 37 格以外时，纯走路就会超过 15s → 被判「移动超时」→ 该格被拉黑 30s，
       表现就是「明明有怪、却说本图无怪」。预算 = 基础超时 + 距离×0.8s（留足绕路/分段导航/真人化间隔余量）。 */
    const _budget = (cfg.moveTimeout + Math.ceil((m.d || 0) * 0.8)) * 1000;
    if (now() - m.at > _budget) {
      abortWalk();
      blacklistTile(goal.tx + '-' + goal.ty, 30000);
      logEvent('移动超时，跳过 ' + m.label);
      setStatus('移动超时，跳过 ' + m.label);
      st.move = null;
      return true;
    }
    return true;
  }

  /* ======================= 8. 弹窗处理 ======================= */

  let lootAt = 0;
  const LOOT_GIVE_UP_MS = 15000;

  /** 战利品窗口：主动点「Take All」把掉落全收进背包（不主动拿的话，塔里进层的掉落会被后续掉落覆盖丢掉） */
  function takeAllLoot() {
    const f = document.getElementById('frame_Loot');
    if (!f) { st.lootSince = 0; return false; }
    if (!st.lootSince) st.lootSince = now();
    if (now() - st.lootSince > LOOT_GIVE_UP_MS) {
      closeFrameById('frame_Loot');
      st.lootSince = 0;
      setStatus('战利品没能全部拾取（背包可能已满），已关闭拾取窗口');
      return false;
    }
    if (now() - lootAt < 1500) return false;           // 拾取是异步的，别连点
    lootAt = now();
    const btn = f.querySelector('input[name="loot_all"]');
    if (btn) humanClick(btn);
    else if (typeof window.takeLoot === 'function') humanDefer(function () { try { window.takeLoot('all'); } catch (e) { /* ignore */ } });
    return true;
  }

  /** 返回 true 表示当前有弹窗需要等待，本 tick 不做其他事 */
  function handleFrames() {
    if (!hasFrame('frame_Loot')) st.lootSince = 0;

    const inCollectNow = hasFrame('frame_CollectScrap');
    if (!inCollectNow && st.inCollect) st.inCollect = false;
    if (inCollectNow) {
      if (!st.inCollect) { st.inCollect = true; countGather(); }
      st.phase = 'wait';
      setStatus('采集中…（游戏自动完成）');
      return true;
    }
    if (hasFrame('frame_Scavenge')) { st.phase = 'wait'; setStatus('搜索尸体中…'); return true; }

    if (hasFrame('frame_Loot')) {
      st.phase = 'wait';
      takeAllLoot();
      try { if (typeof window.checkForLootClose === 'function') window.checkForLootClose(); } catch (e) { /* ignore */ }
      setStatus('拾取战利品…');
      return true;
    }
    if (hasFrame('frame_Use')) { closeFrameById('frame_Use'); return true; }
    return false;
  }

  /* ★ 意外弹窗自愈：挂机时把「不是脚本自己用的」弹窗关掉。
     典型场景：走位时踩到 NPC / 服务格（weaponsmith、inn、stash、quest_board…），
     游戏 nextStep 会自动 execTileAction → createDialog → 弹出 frame_<Title>；
     脚本不认识它就干等 —— 其中 frame_Quest 还会让游戏的 walkTo 直接 return（彻底卡死）。
     ⚠ 维修/清包行程（st.repair/sell.active）和导航（navBusy）在 step() 里已经提前 return，
       所以行程要用的 frame_Weaponsmith / frame_Waygate / frame_MapDetails 不会被误关。

     ★★ 2026-09-21 修复「手动打开邮箱 / 公会 / 活动 / 商店被秒关」：
     这两类弹窗在 DOM 上完全一样（都是 frame_<Title>），只能靠「前面有没有真人点击」区分：
       · 玩家点 HUD 图标（hud_PostOffice / hud_Guild / hud_Activities / 市场…）或点链接 → 前面有一次 isTrusted 点击；
       · 挂机踩到 NPC / 服务格由游戏自动弹 → 前面没有任何真人操作。
     所以这里记录真人操作时间：真人点过之后的宽限期内出现的 frame 一律登记成「用户窗口」，
     登记过的窗口脚本永不自动关；窗口被关掉（DOM 里消失）后自动从登记表里清掉，
     下次再冒出来才会重新按「意外弹窗」处理。 */
  const KEEP_FRAMES = ['frame_Combat', 'frame_Loot', 'frame_Scavenge', 'frame_CollectScrap',
                       'frame_Gathering', 'frame_FeedPet', 'frame_Use', 'frame_Inventory', 'frame_MapDetails', 'frame_OverlordLootbox',
                       'frame_TowerGate', 'frame_Entrance', 'frame_Quest', 'frame_AbyssalTower'];   /* ★ 爬塔：进/下一层的过渡窗与入口提示，被自动关弹窗关掉会打断传送 / 看不到任务要求 */
  const USER_GRACE_MS = 6000;      // 真人点击后多久内出现的弹窗算「玩家自己开的」

  /* 把当前所有「非白名单」弹窗登记成用户窗口（只在真人刚操作过的宽限期内调用） */
  function registerUserFrames() {
    if (!inGame()) return;
    const all = document.querySelectorAll('[id^=frame_]');
    for (let i = 0; i < all.length; i++) {
      const id = all[i].id;
      if (id === 'frame_container') continue;
      if (KEEP_FRAMES.indexOf(id) >= 0) continue;
      if (!st.userFrames[id]) st.userFrames[id] = now();
    }
  }

  /* ★ 真人操作探针：只认 isTrusted === true 的事件（脚本自己的 .click() 是 false）。
     点地图 = 走位，不算「开窗口」的意图，除非点的是 HUD 图标 / 链接 / 按钮。 */
  function installUserIntentWatch() {
    const mark = function (e) {
      if (!e || e.isTrusted !== true) return;
      const t = e.target;
      try {
        if (t && t.closest && t.closest('#map_container')
            && !(t.closest('[id^=hud_]') || t.closest('a') || t.closest('button'))) return;
      } catch (err) { /* ignore */ }
      st.userActAt = now();
      /* 点击处理（inline onclick → createDialog）是同步的，0ms 后再登记就能抓到刚弹出的窗口，
         避免「游戏 walkTo 的 closeFrames 比下一次 tick 先到」的竞态 */
      setTimeout(registerUserFrames, 0);
      setTimeout(registerUserFrames, 300);
      setTimeout(registerUserFrames, 900);
    };
    document.addEventListener('pointerdown', mark, true);
    document.addEventListener('click', mark, true);
    document.addEventListener('keydown', mark, true);
  }
  installUserIntentWatch();

  /* ★★ 真正的主因：游戏自己的 closeFrames()。
     travel.js 里 walkTo() 的寻路回调、换图、以及 ESC 都会调它，把
     「除 frame_Combat / frame_Loot / frame_CelestialMarket / frame_Inventory / frame_Introduction」
     之外的所有弹窗关掉 —— 挂机时脚本每走一步都调 walkTo，所以玩家一打开邮箱/公会/活动/商店就被秒关，
     而背包（frame_Inventory）恰好在游戏的保留名单里，所以没事。
     这里包一层：调用原函数前把「玩家自己打开的窗口」临时改名（不再匹配 [id^=frame_]），
     原函数照常跑完（setLocal / hideGatheringPopup 等副作用全部保留）再改回来。
     ESC 触发的 closeFrames(true) 不拦，照常全关。 */
  function installCloseFramesGuard() {
    let tries = 0;
    const iv = setInterval(function () {
      const cf = window.closeFrames;
      if (typeof cf === 'function' && !cf.__nrGuarded) {
        clearInterval(iv);
        const guarded = function (force) {
          const saved = [];
          if (force !== true) {
            for (const id in st.userFrames) {
              const el = document.getElementById(id);
              if (el) { saved.push([el, id]); el.id = 'nrkeep_' + id; }
            }
          }
          try { return cf.apply(this, arguments); }
          finally {
            for (let i = 0; i < saved.length; i++) { try { saved[i][0].id = saved[i][1]; } catch (e) { /* ignore */ } }
          }
        };
        guarded.__nrGuarded = true;
        window.closeFrames = guarded;
      } else if (++tries > 240) { clearInterval(iv); }
    }, 250);
  }
  installCloseFramesGuard();

  function sweepStrayFrames() {
    if (!inGame()) return;
    if (cfg.sweepFrames === false) return;      // ★ 用户关掉了「自动关弹窗」

    const all = document.querySelectorAll('[id^=frame_]');
    const seen = {};
    for (let i = 0; i < all.length; i++) seen[all[i].id] = 1;

    /* 登记表清理：窗口已经不在 DOM 里 → 忘掉它（下次再冒出来才会被当成意外弹窗关掉） */
    for (const k in st.userFrames) if (!seen[k]) delete st.userFrames[k];

    const grace = st.userActAt && (now() - st.userActAt < USER_GRACE_MS);
    let closed = 0;
    for (let i = 0; i < all.length && closed < 3; i++) {
      const id = all[i].id;
      if (id === 'frame_container') continue;
      if (KEEP_FRAMES.indexOf(id) >= 0) continue;
      if (st.userFrames[id]) continue;                      // 玩家自己开的 → 不关
      if (grace) { st.userFrames[id] = now(); continue; }    // 真人刚点过 → 登记成用户窗口
      closeFrameById(id);
      closed++;
    }
    if (closed) {
      logEvent('关闭意外弹窗', { key: 'frames', count: closed, unit: '个' });
      setStatus('已关闭意外弹窗，继续挂机…');
    }
  }

  /* ★ 离线模式（Idle Mode）结算弹窗：切到副角色后游戏会弹出「Idle Mode Results」，
     右下角 OK 必须点掉 —— 否则 modal 遮罩挡住后续所有点击（维修 / 存仓 / 走位全部失效）。
     只认标题含「Idle Mode Results」的 bootstrap-dialog，绝不误关玩家自己开的对话框。 */
  function idleResultDialog() {
    let all = [];
    try { all = document.querySelectorAll('.bootstrap-dialog'); } catch (e) { return null; }
    for (let i = 0; i < all.length; i++) {
      let t = '';
      try { t = (all[i].querySelector('.bootstrap-dialog-title') || {}).textContent || all[i].textContent || ''; } catch (e) { /* ignore */ }
      if (/Idle\s*Mode\s*Results|离线模式[\s\S]{0,6}(结果|收获)|挂机[\s\S]{0,6}(结果|收获)/i.test(t)) return all[i];   /* ★ v2.6.19：中英双语 */
    }
    return null;
  }
  /* 点掉离线结算弹窗；返回 true = 本次处理了弹窗 */
  function closeIdleResultDialog() {
    if (!inGame()) return false;
    const dlg = idleResultDialog();
    if (!dlg) return false;
    let btn = null;
    try {
      const btns = $$q('button', dlg.querySelector('.bootstrap-dialog-footer-buttons') || dlg);
      btn = btns.filter(function (b) { return /^ok$/i.test((b.textContent || '').trim()); }).pop()
         || btns.filter(function (b) { return /btn-primary/.test(b.className || ''); }).pop()
         || btns[btns.length - 1];
    } catch (e) { /* ignore */ }
    if (!btn) { try { btn = dlg.querySelector('.bootstrap-dialog-close-button'); } catch (e) { /* ignore */ } }
    if (!btn) return false;
    humanClick(btn);
    logEvent('多角色：已领取离线模式（Idle Mode）收获');
    return true;
  }
  /* 异步流程用：点掉并等它消失（弹窗可能刚渲染出来，多点几次） */
  async function claimIdleRewards() {
    for (let k = 0; k < 10; k++) {
      if (!idleResultDialog()) return true;
      closeIdleResultDialog();
      await sleep(500 + Math.floor(Math.random() * 400));
    }
    return !idleResultDialog();
  }

  /* ======================= 9. 补给（战后用药） ======================= */

  /* ---- 物品效果库：直接读游戏自带的 tooltip_texts.js ----
   * tooltip_texts[res] = { name, description }，描述里带
   *   "[Heals life by 150]" / "[Heals mana by 50]"
   * 用它精确区分补血 / 补蓝（药水、食物、双补药都能认出来）。
   * 例：starter_rejuv_potion = 150HP + 50MP（旧版按名字猜，认不出来 → 一直提示"缺少补血药"）
   * ------------------------------------------------------------ */
  let _ttdb = null;
  function ttDB() {
    if (_ttdb) return _ttdb;
    try { if (typeof tooltip_texts !== 'undefined' && tooltip_texts) { _ttdb = tooltip_texts; return _ttdb; } } catch (e) { /* ignore */ }
    try { if (window.tooltip_texts) { _ttdb = window.tooltip_texts; return _ttdb; } } catch (e) { /* ignore */ }
    return null;
  }
  async function ensureTTDB() {
    if (ttDB()) return _ttdb;
    /* ★ 原来只试一次：脚本标签还没插进来就直接放弃，导致 healInfo 把「没效果」缓存下来，
       之后即使效果库加载了也永远认不出（smoked minnow 这类料理就这样漏掉，刷新后才恢复）。
       现在重试几次，成功后清掉之前的空缓存。 */
    for (let i = 0; i < 12; i++) {
      try {
        if (ttDB()) { _healMemo.clear(); return _ttdb; }
        const src = $$q('script[src]').map(x => x.getAttribute('src')).find(u => /tooltip_texts/.test(u || ''));
        if (src) {
          const txt = await (await fetch(src, { credentials: 'same-origin' })).text();
          _ttdb = (new Function(txt + '\nreturn tooltip_texts;'))();
          if (_ttdb) { _healMemo.clear(); return _ttdb; }
        }
      } catch (e) { /* ignore */ }
      await sleep(500);
    }
    return null;
  }
  const _healMemo = new Map();
  function healInfo(key) {
    if (_healMemo.has(key)) return _healMemo.get(key);
    const r = { life: 0, mana: 0 };
    const db = ttDB();
    if (!db) return r;                 // ★ 效果库还没加载：不缓存空结果，等加载后再算
    const e = db[key];
    if (e && e.description) {
      const L = /\[Heals life by (\d+)\]/i.exec(e.description);
      const M = /\[Heals mana by (\d+)\]/i.exec(e.description);
      if (L) r.life = +L[1];
      if (M) r.mana = +M[1];
    }
    _healMemo.set(key, r);
    return r;
  }
  /* 这件物品能不能补 kind（hp / mp） */
  function heals(it, kind) {
    if (!it || !it.key) return false;
    const h = healInfo(it.key);
    return kind === 'hp' ? h.life > 0 : h.mana > 0;
  }

  const bagPotions = kind => (cfg.bagList || []).filter(i => heals(i, kind));

  /* ★ v2.6.125：这件物品是不是「战斗中可用」的药水。
     判据 = 游戏自带 tooltip 描述里写着 "can be used during battle"
     （实测 22 条：tiny/small/…/sacred 的 health / mana / rejuv potion + starter_rejuv_potion；
       食物 / 料理 / 生鱼一律没有这句）。 */
  function combatUsable(key) {
    const db = ttDB(); if (!db) return false;
    const e = db[key];
    return !!(e && e.description && /can be used during battle/i.test(e.description));
  }

  function autoPotionKey(kind) {
    const list = bagPotions(kind);
    if (!list.length) return '';
    const amt = k => { const h = healInfo(k); return kind === 'hp' ? h.life : h.mana; };
    /* ★ v2.6.125：选中的食物吃完了 → 回到这里自动挑。
       战斗药水（能在战斗中用的）排到最后 —— 那是应急物资，平时回血优先吃食物 / 料理；
       同组内再按「数量多 → 补得少（省药）」挑。全部都是战斗药水时照旧按数量挑。 */
    list.sort((a, b) =>
      (combatUsable(a.key) ? 1 : 0) - (combatUsable(b.key) ? 1 : 0) ||
      (b.count - a.count) || (amt(a.key) - amt(b.key)));
    return list[0].key;
  }

  function potionKey(kind) {
    const chosen = kind === 'hp' ? cfg.hpPotion : cfg.mpPotion;
    if (chosen) { const it = (cfg.bagList || []).find(i => i.key === chosen); if (it && heals(it, kind)) return chosen; }
    return autoPotionKey(kind);
  }

  const itemName = key => { const it = (cfg.bagList || []).find(i => i.key === key); return it ? it.name : key; };

  /* 用药成功后本地扣库存：bagList 是扫描快照，数量不会自己更新。
   * 不扣的话「药已用完」插件永远不知道，会一直对空瓶子发指令（失败 5 次 → 挂起 20 秒 → 再来，无限空放）。 */
  function consumeLocal(key) {
    const list = cfg.bagList || [];
    const it = list.find(i => i.key === key);
    if (!it) return;
    it.count = (it.count || 0) - 1;
    if (it.count <= 0) {
      const i = list.indexOf(it); if (i >= 0) list.splice(i, 1);
      /* ★ 选中的药吃完了 → 立刻清掉选择，回到「自动选择（数量最多的）」并同步下拉框。
         原来只有 scanBag() 会清 cfg.hpPotion / cfg.mpPotion，而 scanBag 只在
         「手动点扫描」或「同一瓶连续失败 5 次」时才跑 → 吃完最后一瓶后会继续对空瓶子
         发指令，要等 5 次失败 + 20 秒暂停 + 60 秒节流才回退。 */
      let changed = false;
      if (cfg.hpPotion === key) { cfg.hpPotion = ''; changed = true; }
      if (cfg.mpPotion === key) { cfg.mpPotion = ''; changed = true; }
      if (changed) { try { renderPotionSelects(); } catch (e) { /* ignore */ } }
    }
    saveCfg();   // ★ 数量变化也要落盘，否则刷新页面后数量会回退到旧快照
  }

  function useItem(key) {
    if (!key || typeof window.updateInventory !== 'function') return false;
    try {
      window.updateInventory('Use', key);
      st.lastUse = now();
      consumeLocal(key);
      return true;
    } catch (e) { return false; }
  }

  const BAG_RESCAN_MS = 60000;
  let bagRescanAt = 0;
  function rescanBagForPotion() {
    if (st.repair.active || st.sell.active) return false;      // 行程中不扫，避免同时开两个窗口
    if (now() - bagRescanAt < rhythm(BAG_RESCAN_MS)) return false;
    bagRescanAt = now();
    scanBag().catch(() => { /* ignore */ });
    return true;
  }

  /* ★ 回血逻辑（战斗外）：不是「一次战斗只吃一瓶」，而是「一直吃到回到设定百分比为止」。
   *   战斗中不吃药（用户要求：战斗外补）。
   *   做法：吃完一瓶先挂起（pendingCheck），等服务器结算（HP/MP 真的涨了）再决定要不要继续吃，
   *   避免在游戏自己的用药冷却里空放，也避免把「没生效」误判成「药没了」。 */
  function supply() {
    st.healing = false;
    if (!cfg.autoPotion || !character) return false;

    const maxHp = character.max_health || 0, maxMp = character.max_mana || 0;
    const hpPct = maxHp > 0 ? character.current_health / maxHp * 100 : 100;
    const mpPct = maxMp > 0 ? character.current_mana / maxMp * 100 : 100;

    const need = [];
    if (hpPct < jitterVal(cfg.hpPct)) need.push('hp');
    if (mpPct < jitterVal(cfg.mpPct)) need.push('mp');
    if (!need.length) { st.potionFail = {}; return false; }

    /* ★ 只要还没补到阈值，就返回 true 让主循环「原地等待」，不要急着寻敌 / 走格。
       之前的 bug：吃完一瓶只挂起 pendingCheck 就继续往下走 → 战斗间隙只吃 1 瓶就跑去打下一只。 */
    st.healing = true;
    if (st.pendingCheck) return true;                                                 // 上一瓶还没结算 → 等它
    if (now() - st.lastUse < Math.max(700, jitterVal(+cfg.potionDelayMs || 1500))) return true;  // 用药冷却中 → 等

    for (const kind of need) {
      const key = potionKey(kind);
      if (!key) { setStatus('缺少' + (kind === 'hp' ? '补血' : '补蓝') + '药，请到「食物」页扫描背包'); continue; }

      const fail = st.potionFail[key];
      if (fail && fail.until > now()) continue;
      if (fail && fail.n >= 5) {
        st.potionFail[key] = { n: 0, until: now() + 20000 };
        const rescanning = rescanBagForPotion();
        setStatus('药剂「' + itemName(key) + '」似乎已用完' + (rescanning ? '，正在重新扫描背包确认数量…' : '，暂停 20 秒'));
        continue;
      }
      if (useItem(key)) {
        /* 记下「这一瓶预期能补多少」：取 药效 与 当前缺口 的较小值。
           结算判定用它做门槛，避免刚吃下就凭一点点自然回血误判成"已生效"而连吃第二瓶。 */
        const hi = healInfo(key);
        const cap = kind === 'hp' ? (maxHp - character.current_health) : (maxMp - character.current_mana);
        const eff = kind === 'hp' ? (hi.life || 1) : (hi.mana || 1);
        const want = Math.max(1, Math.min(eff, cap > 0 ? cap : 1));
        st.pendingCheck = { key: key, at: now(), hp: character.current_health, mp: character.current_mana, want: want, kind: kind };
        setStatus('补充' + (kind === 'hp' ? '血量' : '蓝量') + '：' + itemName(key));
        return true;
      }
    }

    /* 需要补但没药 / 药连续失败 → 不阻塞主循环，继续正常挂机（避免死等） */
    st.healing = false;
    return false;
  }

  /* ★ 爬塔停止条件用：补血/补蓝药是否已耗尽（当前低于阈值，但背包里已经没有可用的对应药） */
  function suppliesEmpty() {
    try {
      if (!cfg.autoPotion || !character) return false;
      const maxHp = character.max_health || 0, maxMp = character.max_mana || 0;
      const hpPct = maxHp > 0 ? character.current_health / maxHp * 100 : 100;
      const mpPct = maxMp > 0 ? character.current_mana / maxMp * 100 : 100;
      if (hpPct < cfg.hpPct && !potionKey('hp')) return true;
      if (mpPct < cfg.mpPct && !potionKey('mp')) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  /** 用药后核对是否生效：涨到「预期值的一半」或已满 → 放行（可以继续吃下一瓶）
   *  3 秒还没动静才算失败；只要涨过一点就不算失败（服务器慢，别误判成"药没用"） */
  function verifyPotion() {
    if (!cfg.autoPotion || !character || !st.pendingCheck) return;
    const p = st.pendingCheck;
    const maxHp = character.max_health || 0, maxMp = character.max_mana || 0;
    const full = p.kind === 'mp'
      ? (maxMp > 0 && character.current_mana >= maxMp)
      : (maxHp > 0 && character.current_health >= maxHp);
    /* ★ 只统计「本次要补的那一项」的增量。
       之前把 HP/MP 增量相加 —— 双补药（如 Starter Rejuv +150HP/+50MP）光靠 MP 那部分
       就能骗过判定，导致战斗中一瓶接一瓶连吃（实测 130 秒吃了 29 瓶）。 */
    const gained = (p.kind === 'mp')
      ? Math.max(character.current_mana - p.mp, 0)
      : Math.max(character.current_health - p.hp, 0);
    if (full || gained >= Math.max(1, (p.want || 1) * 0.5)) { st.pendingCheck = null; st.potionFail = {}; return; }
    if (now() - p.at < 3000) return;
    st.pendingCheck = null;
    if (gained > 0) { st.potionFail = {}; return; }   // 有涨但没到预期 → 也算生效
    const f = st.potionFail[p.key] || { n: 0, until: 0 };
    f.n++;
    st.potionFail[p.key] = f;
  }

  /* ======================= 10.1 药品（独立开关） =======================
   * ★ 药品不再和挂机绑定：只要开着，就自己按阈值吃药（挂机没开也吃）。
   *   吃药期间 supply() 会把 st.healing 置真，主循环看到就让路（暂停寻敌/走格），
   *   补到阈值再继续 —— 这就是「吃药时把其他动作暂时暂停」。
   * ==================================================================== */
  let potionTimer = null;

  function potionTick() {
    if (!cfg.autoPotion || !inGame()) return;
    if (!isMainCharNow()) return;   /* ★ 多角色：副角色页不吃药（只是过来走行程） */
    if (st.repair.active || st.sell.active) return;   /* 维修/清包行程自己会处理，别抢 */
    /* ★ 保持原设计「战斗外补」：战斗中 / 采集 / 拾取 / 使用窗口开着时不补，
       和主循环调用 supply() 的时机保持一致 */
    if (hasFrame('frame_Combat')) return;
    if (hasFrame('frame_CollectScrap') || hasFrame('frame_Scavenge') || hasFrame('frame_Loot') || hasFrame('frame_Use')) return;
    verifyPotion();
    supply();
  }
  function startPotionLoop() { if (!potionTimer) potionTimer = rhythmTimer(potionTick, 500); }
  function stopPotionLoop() {
    if (potionTimer) { stopTimer(potionTimer); potionTimer = null; }
    st.healing = false; st.pendingCheck = null;
  }
  function syncPotionButton() {
    const el = document.getElementById('nr-potion');
    if (el) el.checked = !!cfg.autoPotion;
  }
  /** 独立开关：只管吃药，和挂机 / 战斗互不影响（复选框 = 与「自动喂宠」同款 UI） */
  function setPotionOn(on) {
    on = !!on;
    if (on === !!cfg.autoPotion) { syncPotionButton(); return; }
    if (on) {
      if (!inGame()) { setStatus('请先进入游戏'); syncPotionButton(); return; }
      cfg.autoPotion = true; saveCfg(); startPotionLoop();
      setStatus('已开启自动补药（独立运行，不依赖挂机）');
      logEvent('开启自动补药');
    } else {
      cfg.autoPotion = false; saveCfg(); stopPotionLoop();
      setStatus('已关闭自动补药');
      logEvent('关闭自动补药');
    }
    syncPotionButton();
  }
  function togglePotion() { setPotionOn(!cfg.autoPotion); }

  /* ======================= 10.2 自动喂食宠物 ======================= */
  /* - 宠物状态只在 /modal/character 的宠物 tooltip 里（只读请求即可）
   * - 食品是 pet_food_t<N>，双击（= 使用）打开 #frame_FeedPet
   * - 档位按宠物等级选：1-9 → t1，10-19 → t2，以此类推（tier = floor(level/10)+1）
   */
  const PET_CHECK_MS = 30000;

  async function readPetInfo() {
    const h = await (await fetch('/modal/character', { credentials: 'same-origin' })).text();
    const i = h.indexOf('class="pet"');
    if (i < 0) return null;
    const blk = h.slice(i, i + 2500);
    /* ★ v2.6.19：优先用游戏自己的 data-name 锚点（和喂食窗口 #frame_FeedPet 同一套），
       没有才退回「Energy: x / y」文案（中英双语）。 */
    let energy = 0, max = 0, level = 0;
    try {
      const doc = new DOMParser().parseFromString('<div>' + blk + '</div>', 'text/html');
      const q = function (nm) { const el = doc.querySelector('[data-name="' + nm + '"]'); return el ? (parseInt(String(el.textContent || '').replace(/[^\d]/g, ''), 10) || 0) : 0; };
      energy = q('pet_energy'); max = q('pet_max_energy'); level = q('pet_level');
    } catch (e) { /* ignore */ }
    if (!max) {
      const em = blk.match(/(?:Energy|能量)\s*[:：]?\s*([\d,]+)\s*\/\s*([\d,]+)/i);
      if (!em) return null;
      energy = parseInt(em[1].replace(/,/g, ''), 10); max = parseInt(em[2].replace(/,/g, ''), 10);
    }
    if (!level) { const lm = blk.match(/(?:Level|等级|Lvl\.?)\s*[:：]?\s*(\d+)/i); if (lm) level = parseInt(lm[1], 10); }
    return { energy: energy, max: max, level: level };
  }

  async function readPetFood() {
    const h = await (await fetch('/modal/inventory', { credentials: 'same-origin' })).text();
    const out = {};
    h.split('class="inv_slot').slice(1).forEach(blk => {
      const r = blk.match(/res="(pet_food_t\d+)"/);
      if (!r) return;
      const k = r[1].toLowerCase();
      const n = invCount(blk, r[1]) || 0;
      out[k] = (out[k] || 0) + n;
    });
    return out;
  }

  async function waitUntil(cond, ms) {
    const deadline = now() + ms;
    while (now() < deadline) { const v = cond(); if (v) return v; await sleep(200); }
    return null;
  }

  function findPetFoodSlot(key) {
    const inv = document.getElementById('frame_Inventory');
    if (!inv) return null;
    const icon = inv.querySelector('div[res="' + key + '"]');
    return icon ? icon.closest('.inv_slot') : null;
  }

  /* 界面是否真的可用：游戏关掉界面后节点可能还留在 DOM 里（隐藏、内容空），
   * 那种残留节点照它读会读到「食物 0」，看起来就像「宠物袋里没有食物」。 */
  function liveFeedFrame() {
    const f = document.getElementById('frame_FeedPet');
    if (!f) return null;
    if (getComputedStyle(f).display === 'none') return null;
    if (!f.querySelector('span[data-name="pet_food_amount"]')) return null;
    return f;
  }

  async function openFeedFrame(key) {
    let frame = liveFeedFrame();
    if (frame) return frame;

    if (typeof window.updateInventory === 'function') {
      try { window.updateInventory('Use', key); } catch (e) { /* ignore */ }
      frame = await waitUntil(liveFeedFrame, 3000);
    }
    if (!frame) {
      const invWasOpen = hasFrame('frame_Inventory');
      if (!invWasOpen) { const hd = document.getElementById('hud_Inventory'); if (hd) humanClick(hd); await sleep(1000); }
      const slot = findPetFoodSlot(key);
      if (slot) { slot.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); frame = await waitUntil(liveFeedFrame, 3000); }
      if (!frame && !invWasOpen) closeFrameById('frame_Inventory');
    }
    return frame || null;
  }

  /** 打开界面 → 按缺口喂（不超出上限）→ 关界面。返回 'ok' | 'full' | 'gap-small' | 'uncertain' */
  async function feedPetNow(key) {
    const frame = await openFeedFrame(key);
    if (!frame) throw new Error('没能打开喂食界面（背包里有 ' + key + ' 吗）');

    let bag = 0;
    await waitUntil(() => {
      const el = frame.querySelector('span[data-name="pet_food_amount"]');
      bag = el ? (parseInt(el.textContent, 10) || 0) : 0;
      return bag > 0;
    }, 3000);
    if (bag <= 0) { closeFrameById('frame_FeedPet'); throw new Error('喂食界面显示食物为 0（可能档位不对）'); }

    const curEl = frame.querySelector('span[data-name="pet_energy"]');
    const maxEl = frame.querySelector('span[data-name="pet_max_energy"]');
    const cur = curEl ? (parseInt(curEl.textContent, 10) || 0) : st.pet.energy;
    const max = maxEl ? (parseInt(maxEl.textContent, 10) || 0) : st.pet.max;

    /* ★ v2.6.19：先找 data-name 锚点，再退回文案（中英双语）。 */
    let per = 0;
    try { const pe = frame.querySelector('[data-name="pet_food_per_energy"],[data-name="pet_per_food"],[data-name="per_food_energy"]'); if (pe) per = parseInt(String(pe.textContent || '').replace(/[^\d]/g, ''), 10) || 0; } catch (e) { /* ignore */ }
    if (!per) { const perM = (frame.innerText || '').match(/(?:Per Food|每个食物)[^\d]*?([\d,]+)/i); per = perM ? (parseInt(perM[1].replace(/,/g, ''), 10) || 0) : 0; }
    if (!per) { closeFrameById('frame_FeedPet'); throw new Error('读不到「每个食物恢复多少能量」'); }

    const gap = Math.max(0, max - cur);
    if (!gap) { closeFrameById('frame_FeedPet'); setStatus('宠物能量已满（' + cur + '/' + max + '）'); return 'full'; }

    /* ★ v2.6.71：按「不超出上限」喂 —— 用 floor 而不是 ceil。
       每块饲料回的是**固定**能量（官方 id=198：150 × 饲料档位），
       原来 ceil(gap/per) 为了补满缺口会多喂 1 块，超出上限的那部分被直接吃掉 = 白扔一块饲料。
       现在只喂「装得下」的整数块；缺口不足 1 块时默认不喂（宁可差一点，也不浪费饲料）。
       注：满能量时喂食才有机会涨 Growth（官方 id=198），那是另一件事 —— 本函数只负责补能量。 */
    let n = Math.floor(gap / per);
    if (n < 1) {
      closeFrameById('frame_FeedPet');
      setStatus('宠物能量缺口只剩 ' + gap + '（1 块饲料回 ' + per + '），不喂以免超出上限');
      return 'gap-small';
    }
    n = Math.min(n, bag);

    const input = frame.querySelector('#pet_food_amount');
    if (input) { input.value = String(n); input.dispatchEvent(new Event('change', { bubbles: true })); }
    const btn = frame.querySelector('button[onclick*="feedPet"]');
    if (btn) humanClick(btn);
    else if (typeof window.feedPet === 'function') humanDefer(function () { try { window.feedPet(); } catch (e) { /* ignore */ } });

    const rose = await waitUntil(() => {
      const e = frame.querySelector('span[data-name="pet_energy"]');
      return e && (parseInt(e.textContent, 10) || 0) > cur;
    }, 6000);
    const after = parseInt((frame.querySelector('span[data-name="pet_energy"]') || {}).textContent, 10) || cur;

    await sleep(500);
    closeFrameById('frame_FeedPet');
    st.pet.lastFeed = now();
    st.pet.energy = after;
    if (!rose) { setStatus('已喂食 ' + n + ' 个宠物食品，但没读到能量变化（可能还在结算）'); return 'uncertain'; }
    setStatus('已喂食 ' + n + ' 个宠物食品，能量 ' + after + '/' + max);
    return 'ok';
  }

  async function checkAndFeedPet() {
    const pet = await readPetInfo();
    if (!pet || !pet.max) {
      Object.assign(st.pet, { level: 0, energy: 0, max: 0, food: 0, tier: 0 });
      return 'no-pet';
    }
    st.pet.level = pet.level; st.pet.energy = pet.energy; st.pet.max = pet.max;

    const tier = pet.level >= 1 ? (Math.floor(pet.level / 10) + 1) : 1;
    st.pet.tier = tier;
    const key = 'pet_food_t' + tier;

    const have = (await readPetFood())[key] || 0;
    st.pet.food = have;

    const pct = pet.max > 0 ? (pet.energy / pet.max * 100) : 100;
    if (pct > jitterVal(cfg.petEnergyPct)) { updateStats(); return 'enough'; }   /* ★ v2.6.19：喂宠阈值也纳入抖动 */
    if (!have) {
      setStatus('宠物能量 ' + Math.round(pct) + '%，但背包里没有 ' + key + '（' + pet.level + ' 级宠物要喂 T' + tier + '）');
      updateStats();
      return 'no-food';
    }
    setStatus('宠物能量不足（' + pet.energy + '/' + pet.max + '），开始喂食…');
    const r = await feedPetNow(key);
    updateStats();
    return r;
  }

  /* ★ 独立循环：只要开着「自动喂宠」就自己跑，不依赖挂机 / 战斗。
     战斗中、维修/清包、喂食界面开着时让路，避免抢游戏的操作。 */
  let petTimer = null;
  function petTick() {
    if (!cfg.petFeedOn || !inGame()) return;
    if (!isMainCharNow()) return;   /* ★ 多角色：副角色页不喂宠 */
    if (st.repair.active || st.sell.active) return;
    if (hasFrame('frame_Combat') || hasFrame('frame_FeedPet')) return;
    if (now() - st.pet.lastCheck < rhythm(PET_CHECK_MS)) return;
    st.pet.lastCheck = now();
    checkAndFeedPet().catch(e => setStatus('喂食宠物失败：' + (e && e.message ? e.message : String(e))));
  }
  function startPetLoop() { if (!petTimer) petTimer = rhythmTimer(petTick, 3000); }
  function stopPetLoop() { if (petTimer) { stopTimer(petTimer); petTimer = null; } }
  /** 独立开关：只管喂宠，和挂机 / 战斗互不影响 */
  function togglePetFeed(on) {
    cfg.petFeedOn = !!on; saveCfg();
    if (cfg.petFeedOn) {
      if (!inGame()) { setStatus('请先进入游戏'); }
      st.pet.lastCheck = 0;                       /* 立刻检查一次，方便确认有没有生效 */
      startPetLoop();
      setStatus('已开启自动喂宠（独立运行，不依赖挂机）');
      logEvent('开启自动喂宠');
    } else {
      stopPetLoop();
      setStatus('已关闭自动喂宠');
      logEvent('关闭自动喂宠');
    }
  }
  /** 手动立即喂一次（面板按钮，方便验证） */
  function feedPetNowManual() {
    if (!inGame()) { setStatus('请先进入游戏'); return; }
    setStatus('正在检查宠物…');
    checkAndFeedPet().then(r => {
      if (r === 'no-pet') setStatus('没有装备宠物');
      else if (r === 'enough') setStatus('宠物能量充足，无需喂食');
      updateStats();
    }).catch(e => setStatus('喂食宠物失败：' + (e && e.message ? e.message : String(e))));
  }

  /* ======================= 11. 地图数据（唯一数据源） =======================
   * 全脚本只有这一份地图数据；其它功能一律通过 MapDB.* 读取，不要再各自维护地图表。
   *   分层：内置种子 MAPDB_SEED（本文件唯一写死的地图数据，由 bot/inject_mapdb.js 注入）
   *        > localStorage norroth_mapdb_v1（边玩边学 / 到访记录）
   *        > 运行时 /modal/world_map 的权威名字（MapDB.applyWorldMap）
   *   rec   = { id, name, type, g[], m[], visited, smith, at }   ← 只存脚本真正用到的字段
   *   edges = [[from,to,x,y], ...]  门连接
   *   mon   = { 怪物名: 图鉴图标id }
   *   cities= [{ name, lv, id }]    传送站城镇清单（含还没探索出 id 的）
   *   ※ 等级 / 群系 / 大陆 / 世界坐标 / 采集图标 / 传送站标记 等「只给人看」的字段
   *     不进脚本，完整数据在 data/map_db.json 与《Norroth资料汇编/22_全地图清单.md》。
   * ======================================================================== */
  const MAPDB_KEY = 'norroth_mapdb_v1';

  /* ★ 内置种子：唯一一份写死的全地图数据（由 bot/inject_mapdb.js 从 data/map_db.json 注入） */
  const MAPDB_SEED = {"v":1,"cities":[{"name":"El Caspar","lv":"1","id":"5"},{"name":"Elundi","lv":"10","id":"16"},{"name":"Owranbu","lv":"10","id":"23"},{"name":"Drouver","lv":"15","id":"91"},{"name":"Vileton","lv":"15","id":"113"},{"name":"Sanjuo","lv":"19","id":"134"},{"name":"Bungavik","lv":"20","id":"169"},{"name":"Saurville","lv":"20","id":"201"},{"name":"Ururg","lv":"20","id":"229"},{"name":"Caeltys","lv":"30","id":"183"},{"name":"Trescan","lv":"30","id":"281"},{"name":"Stogow","lv":"30","id":"284"},{"name":"Nythrendal","lv":"40","id":"143"},{"name":"Galkathos","lv":"45","id":"317"},{"name":"Laen Dorei","lv":"50","id":"348"},{"name":"Dominion Spire","lv":"50","id":"360"}],"maps":{"110":{"name":"Corduin","type":"Normal"},"310":{"name":"Haunted Forest","type":"Normal"},"336":{"name":"Red Desert","type":"Normal"},"348":{"name":"Laen Dorei","type":"City"},"352":{"name":"Wardens’ Bridge","type":"Normal"},"360":{"name":"Dominion Spire","type":"City"},"1":{"name":"Fountain of Rebirth"},"2":{"name":"Lower Fountain’s Descent"},"3":{"name":"Sasquatch Grotto","type":"Normal","m":["Sasquatch"],"visited":1},"4":{"name":"Upper Fountain’s Descent","type":"Normal","g":["Mucky Patch"],"gt":[[24,12,"Mucky Patch"]],"visited":1},"5":{"name":"El Caspar","type":"City","g":["Minnow Pier","Mucky Patch"],"gt":[[13,22,"Minnow Pier"],[26,48,"Mucky Patch"]],"visited":1,"smith":1},"6":{"name":"Brisban Pond","type":"Normal","g":["Slate Quarry","Minnow Pier"],"gt":[[18,38,"Slate Quarry"],[39,28,"Minnow Pier"],[53,24,"Slate Quarry"]],"m":["Wild Dog","Snake","Deer","Hare","Wasp"],"visited":1},"7":{"name":"Akelay Foothills","type":"Normal","m":["Wild Hog","Wasp","Snake","Bison","Salamanderoid","Deer","Wild Dog"],"visited":1},"8":{"name":"Akelay Cave Level 1","type":"Normal","g":["Copper Mine"],"gt":[[36,26,"Copper Mine"]],"m":["Troglodyte","Snake","Miner","Goblin Pyro","Monstrous Worm","Hypnotic Bat"],"visited":1},"9":{"name":"Akelay Cave Level 2","type":"Secret","g":["Slate Quarry"],"gt":[[35,45,"Slate Quarry"]],"m":["Hypnotic Bat","Goblin Pyro","Troglodyte","Thorny Vines","Monstrous Worm","Miner","Snake"],"visited":1},"10":{"name":"Mount Akelay","m":["Wolf","Bison","Goblin Pyro","Goblin Soldier"]},"11":{"name":"Elena’s Crossroad","type":"Normal","g":["Cotton Field"],"gt":[[27,41,"Cotton Field"]],"m":["Wild Dog","Deer","Hare","Wasp","Snake"],"visited":1},"12":{"name":"Forested Canyon","type":"Normal","m":["Peasant","Beaver","Badger","Deer","Woodland Snake"],"visited":1},"13":{"name":"Tree of Life","type":"Normal","g":["Minnow Pier"],"gt":[[25,19,"Minnow Pier"],[40,20,"Minnow Pier"]],"m":["Wolf","Deer","Woodland Spider","Peasant","Woodland Snake","Bear","Badger","Wild Hog","Beaver"],"visited":1},"14":{"name":"Arodas Lakeshore","type":"Normal","g":["Mucky Patch","Cotton Field","Minnow Pier"],"gt":[[14,46,"Minnow Pier"],[23,35,"Mucky Patch"],[25,35,"Cotton Field"]],"m":["River Troll","Snapping Turtle","Toad","Salamanderoid","Crocodile","Beaver","Toxic Toad"],"visited":1},"15":{"name":"Arodas Beach","type":"Normal","g":["Shrimp Pier"],"gt":[[32,35,"Shrimp Pier"]],"m":["Salamanderoid","Crocodile","Snapping Turtle","River Troll","Toxic Toad","Toad"],"visited":1},"16":{"name":"Elundi","type":"City","g":["Shrimp Pier","Silk Field"],"gt":[[9,21,"Shrimp Pier"],[14,40,"Silk Field"]],"visited":1,"smith":1},"17":{"name":"Southern Foothill","type":"Normal","g":["Copper Mine","Aspen Grove","Cotton Field","Mucky Patch"],"gt":[[12,22,"Aspen Grove"],[13,27,"Cotton Field"],[19,31,"Mucky Patch"],[21,9,"Copper Mine"],[41,14,"Aspen Grove"],[54,53,"Copper Mine"]],"m":["Woodland Snake","Deer","Peasant","Beaver","Badger"],"visited":1},"18":{"name":"Bay’s Alley","type":"Normal","g":["Aspen Grove","Minnow Pier"],"gt":[[18,48,"Minnow Pier"],[58,44,"Aspen Grove"]],"m":["Toxic Toad","Salamanderoid","Beaver","River Troll","Toad","Crocodile","Snapping Turtle"],"visited":1},"19":{"name":"Bay’s Alley","type":"Normal","g":["Shrimp Pier"],"gt":[[34,50,"Shrimp Pier"]],"m":["Salamanderoid","Crocodile","Snapping Turtle","River Troll","Toxic Toad","Toad"],"visited":1},"20":{"name":"Windy Fields","type":"Normal","g":["Minnow Pier","Aspen Grove","Cotton Field"],"gt":[[9,56,"Aspen Grove"],[17,59,"Cotton Field"],[18,35,"Minnow Pier"],[40,10,"Minnow Pier"],[41,25,"Minnow Pier"]],"m":["Wild Dog","Wasp","Deer","Snake","Hare"],"visited":1},"21":{"name":"Forest Of Owranbu","type":"Normal","g":["Aspen Grove"],"gt":[[24,35,"Aspen Grove"]],"m":["Wolf","Woodland Snake","Badger","Woodland Spider","Beaver","Deer","Wild Hog","Peasant","Bear"],"visited":1},"22":{"name":"Owranbu River","type":"Normal","g":["Silk Field","Scrap Patch","Iron Mine","Shrimp Pier","Elm Grove"],"gt":[[19,11,"Scrap Patch"],[22,9,"Silk Field"],[27,19,"Shrimp Pier"],[44,25,"Elm Grove"],[55,14,"Iron Mine"]],"m":["Bear","Woodland Spider","Peasant","Badger","Wolf","Wild Hog","Woodland Snake"],"visited":1},"23":{"name":"Owranbu","type":"City","visited":1,"smith":1},"24":{"name":"Manor’s Courtyard","type":"Normal","m":["Goblin Pyro","Bison","Wolf","Goblin Soldier"],"visited":1},"25":{"name":"Laverne Foothill","type":"Normal","m":["Bison","Wild Hog","Deer","Salamanderoid","Wild Dog","Snake","Wasp"],"visited":1},"26":{"name":"Grasping Maze","type":"Normal","m":["Snake","Hypnotic Bat","Miner","Goblin Pyro","Troglodyte","Thorny Vines","Monstrous Worm"],"visited":1},"27":{"name":"Heart of the Tree","type":"Dungeon","m":["Thorny Vines","Troglodyte","Hypnotic Bat","Monstrous Worm","Snake","Goblin Pyro","Tree of Life"],"visited":1},"28":{"name":"Dying Forest","type":"Normal","m":["Myconid","Mothman","Dryad","Troll Boar","Decaying Worm"],"visited":1},"29":{"name":"Dead Leaves Tiara","type":"Normal","g":["Elm Grove","Shrimp Pier"],"gt":[[18,42,"Shrimp Pier"],[24,35,"Shrimp Pier"],[25,19,"Elm Grove"],[55,29,"Elm Grove"]],"m":["Decaying Worm","Troll Boar","Mothman","Myconid","Dryad"],"visited":1},"30":{"name":"Venom Arch Forest","type":"Normal","m":["Troll Boar","Mothman","Decaying Worm","Myconid","Dryad"],"visited":1},"31":{"name":"Pirate Wreck Foothill","type":"Normal","m":["Crocodile","Merfolk","Mountain Troll","Lizardman"],"visited":1},"32":{"name":"Pirate Wreck Beach","type":"Normal","g":["Shrimp Pier"],"gt":[[56,41,"Shrimp Pier"]],"m":["Crocodile","Mountain Troll","Lizardman","Merfolk"],"visited":1},"33":{"name":"The Pirate Wreck","type":"Secret","m":["Zombie Pirate","Pirate","Ghost Pirate"],"visited":1},"34":{"name":"Sewers","type":"Normal"},"35":{"name":"Deep Sewers"},"36":{"name":"Ratdom"},"37":{"name":"Manor Main Floor","type":"Secret","m":["Peasant","Goblin Pyro","Troglodyte"],"visited":1},"38":{"name":"Manor 1st Floor"},"39":{"name":"Manor Attic"},"40":{"name":"Manor Cellar","type":"Secret","m":["Goblin Pyro","Monstrous Worm","Miner","Snake","Hypnotic Bat","Troglodyte"],"visited":1},"41":{"name":"Owranbu Drylands","type":"Normal","m":["Scorpion","Dune Glider","Bone Scarab","Nomadic Cleric","Raider","Cassowary"],"visited":1},"42":{"name":"The Cult Tunnel","type":"Secret","m":["Monstrous Worm","Snake","Goblin Pyro","Thorny Vines"],"visited":1},"43":{"name":"The Cult Hideout","type":"Secret","visited":1},"44":{"name":"Farmer’s House","m":["Peasant"],"visited":1},"45":{"name":"Baron’s Lair"},"46":{"name":"Bear Den","visited":1},"47":{"name":"Den Of Devourer"},"48":{"name":"Elundi Garden","type":"Normal","m":["Centaur","Werewolf","Goblin Pyro","Druid","Owlbear","Wandering Ent","Goblin Soldier"],"visited":1},"49":{"name":"Elundi Garden","type":"Normal","g":["Elm Grove"],"gt":[[15,11,"Elm Grove"]],"m":["Goblin Soldier","Wandering Ent","Werewolf","Druid","Centaur","Goblin Pyro","Owlbear"],"visited":1},"50":{"name":"Deep Forest","type":"Normal","m":["Goblin Pyro","Druid","Owlbear","Goblin Soldier","Wandering Ent","Centaur","Werewolf"],"visited":1},"51":{"name":"Deep Forest","type":"Normal","m":["Goblin Pyro","Druid","Wandering Ent","Goblin Soldier","Werewolf","Centaur","Owlbear"],"visited":1},"52":{"name":"Deep Forest","type":"Normal","g":["Shrimp Pier"],"gt":[[36,53,"Shrimp Pier"]],"m":["Werewolf","Centaur","Goblin Soldier","Goblin Pyro","Druid","Owlbear","Wandering Ent"],"visited":1},"53":{"name":"Deep Forest","type":"Normal","g":["Elm Grove"],"gt":[[31,50,"Elm Grove"]],"m":["Wandering Ent","Druid","Owlbear","Centaur","Werewolf","Goblin Pyro","Goblin Soldier"],"visited":1},"54":{"name":"Elm’s Rest","visited":1},"55":{"name":"Way to Morwen","type":"Normal","g":["Fieldstone Quarry"],"gt":[[15,28,"Fieldstone Quarry"]],"m":["Centaur","Goblin Pyro","Goblin Soldier","Werewolf","Druid","Wandering Ent","Owlbear"],"visited":1},"56":{"name":"Abandoned Mine","type":"Normal","g":["Laterite Quarry"],"gt":[[16,46,"Laterite Quarry"],[19,22,"Laterite Quarry"]],"m":["Drow","Goblin Engineer","Rust Monster","Xorn","Phantom Miner","Werebat"],"visited":1},"57":{"name":"Abandoned Mine"},"58":{"name":"Abandoned Mine"},"59":{"name":"Abandoned Mine"},"61":{"name":"Sandstorm Pass","type":"Normal","m":["Raider","Cassowary","Dune Glider","Bone Scarab","Nomadic Cleric","Scorpion"],"visited":1},"62":{"name":"Sun-Scorched Plateau","type":"Normal","m":["Dune Glider","Cassowary","Nomadic Cleric","Scorpion","Raider","Bone Scarab"],"visited":1},"63":{"name":"Sandspire Summit","type":"Normal","m":["Cassowary","Bone Scarab","Scorpion","Raider","Nomadic Cleric","Dune Glider"],"visited":1},"64":{"name":"Droughtlands","type":"Normal","m":["Nomadic Cleric","Dune Glider","Cassowary","Scorpion","Bone Scarab","Raider","Ruin Guard"],"visited":1},"65":{"name":"Mesa Mine Area","type":"Normal","g":["Fieldstone Quarry","Iron Mine"],"gt":[[26,49,"Iron Mine"],[29,35,"Fieldstone Quarry"]],"m":["Raider","Scorpion","Cassowary","Dune Glider","Bone Scarab","Nomadic Cleric"],"visited":1},"66":{"name":"Rock Valley","type":"Normal","m":["Cassowary","Raider","Scorpion","Nomadic Cleric","Dune Glider","Bone Scarab"],"visited":1},"67":{"name":"Mirage Mountains","type":"Normal","m":["Scorpion","Bone Scarab","Cassowary","Raider","Nomadic Cleric","Dune Glider"],"visited":1},"68":{"name":"Yurk’s Yard"},"69":{"name":"Yurk’s Lodge"},"72":{"name":"Shifting Sands","type":"Normal","m":["Cassowary","Raider","Scorpion","Dune Glider","Nomadic Cleric","Bone Scarab"],"visited":1},"73":{"name":"Radiant Heat Flats","type":"Normal","m":["Cassowary","Scorpion","Raider","Dune Glider","Bone Scarab","Nomadic Cleric"],"visited":1},"74":{"name":"Sunken Sands","type":"Normal","m":["Dune Glider","Scorpion","Cassowary","Raider","Nomadic Cleric","Bone Scarab"],"visited":1},"75":{"name":"The Shifting Tides","type":"Normal","m":["Nomadic Cleric","Scorpion","Bone Scarab","Raider","Dune Glider","Cassowary"],"visited":1},"76":{"name":"Sirocco Springs","type":"Normal","m":["Cassowary","Raider","Dune Glider","Bone Scarab","Scorpion","Nomadic Cleric"],"visited":1},"77":{"name":"Guardian Queen Hive"},"78":{"name":"Guardian Queen Hive"},"83":{"name":"Khamsin Cliffs","type":"Normal","m":["Dune Glider","Bone Scarab","Nomadic Cleric","Cassowary","Raider","Scorpion"],"visited":1},"84":{"name":"Golden Sandscape","type":"Normal","m":["Dune Glider","Scorpion","Raider","Phoenix","Bone Scarab","Cassowary","Nomadic Cleric"],"visited":1},"85":{"name":"Oasis","type":"Normal","g":["Shrimp Pier","Elm Grove"],"gt":[[14,34,"Elm Grove"],[45,27,"Shrimp Pier"]],"m":["Boggard","Lizardman","Crocodile","Merfolk"],"visited":1},"90":{"name":"Whispering Sands","type":"Normal","m":["Dune Glider","Raider","Cassowary","Bone Scarab","Nomadic Cleric","Scorpion"],"visited":1},"91":{"name":"Drouver","type":"City","visited":1,"smith":1},"92":{"name":"Savanna","m":["Gnoll Warlock","Carrion Harpy","Terastodon","Gnoll Warrior","Scorpion","Arynx"],"visited":1},"93":{"name":"Savanna","type":"Normal","m":["Scorpion","Terastodon","Arynx","Gnoll Warrior","Gnoll Warlock","Carrion Harpy"],"visited":1},"94":{"name":"Scorpion`s Nest","g":["Iron Mine"],"gt":[[35,31,"Iron Mine"]],"m":["Raider","Scorpion","Nomadic Cleric","Cassowary","Bone Scarab","Dune Glider"],"visited":1},"95":{"name":"Dry Mirage","g":["Iron Mine"],"gt":[[40,17,"Iron Mine"]],"m":["Scorpion","Nomadic Cleric","Cassowary","Raider","Bone Scarab","Dune Glider","Phoenix"],"visited":1},"96":{"name":"Dune Sea","m":["Dune Glider","Nomadic Cleric","Bone Scarab","Cassowary","Raider","Scorpion"],"visited":1},"97":{"name":"Ancient Ruins","type":"Normal","m":["Dune Glider","Scorpion","Nomadic Cleric","Cassowary","Bone Scarab","Raider"],"visited":1},"98":{"name":"Burning Sands","type":"Normal","m":["Nomadic Cleric","Bone Scarab","Cassowary","Raider","Dune Glider","Scorpion"],"visited":1},"99":{"name":"Burnt Sienna Wastes","type":"Normal","m":["Dune Glider","Nomadic Cleric","Cassowary","Scorpion","Bone Scarab","Raider"],"visited":1},"100":{"name":"Dust Outskirts","type":"Normal","g":["Scrap Patch","Silk Field"],"gt":[[35,13,"Scrap Patch"],[38,14,"Silk Field"]],"m":["Bone Scarab","Scorpion","Dune Glider","Raider","Cassowary","Nomadic Cleric"],"visited":1},"106":{"name":"Savanna","type":"Normal","m":["Gnoll Warlock","Carrion Harpy","Scorpion","Gnoll Warrior","Terastodon","Arynx"],"visited":1},"107":{"name":"Savanna","type":"Normal","m":["Arynx","Carrion Harpy","Terastodon","Gnoll Warlock","Gnoll Warrior","Scorpion"],"visited":1},"111":{"name":"Spider Den","type":"Normal","m":["Mana Webber","Spitter","Brute Spider","Spider Queen"],"visited":1},"112":{"name":"Vileton Entrance","type":"Normal","m":["Mountain Troll","Bison","Goblin Pyro","Goblin Soldier"],"visited":1},"113":{"name":"Vileton","type":"City","visited":1,"smith":1},"114":{"name":"Marsh","type":"Normal","m":["Bog Worm","Bogleech","Tarn Linnorm","Killer Centipede","Boggard"],"visited":1},"115":{"name":"Marsh","m":["Tarn Linnorm","Bogleech","Boggard","Blood Queen","Bog Worm"],"visited":1},"116":{"name":"Marsh","g":["Spruce Grove","Jute Field","White Bass Pier"],"gt":[[16,7,"Spruce Grove"],[18,29,"White Bass Pier"],[33,14,"Jute Field"]],"m":["Bogleech","Tarn Linnorm","Blood Queen","Boggard","Bog Worm"],"visited":1},"117":{"name":"Swamp","m":["Swamp Dragon","Wisp Phantom","Mutated Lizardman","Hydra"],"visited":1},"118":{"name":"Swamp","m":["Wisp Phantom","Swamp Dragon","Hydra","Mutated Lizardman"],"visited":1},"119":{"name":"Swamp","m":["Wisp Phantom","Hydra","Swamp Dragon","Mutated Lizardman"],"visited":1},"120":{"name":"Swamp","type":"Normal","m":["Swamp Dragon","Mutated Lizardman","Hydra","Wisp Phantom"],"visited":1},"121":{"name":"Marsh"},"122":{"name":"Marsh","g":["White Bass Pier","Low Quality Patch"],"gt":[[25,16,"Low Quality Patch"],[31,12,"White Bass Pier"]],"m":["Boggard","Tarn Linnorm","Blood Queen","Bog Worm","Bogleech"],"visited":1},"123":{"name":"Swamp","type":"Normal","g":["Smallmouth Bass Pier","Maple Grove","Medium Quality Patch"],"m":["Swamp Dragon","Wisp Phantom","Mutated Lizardman","Hydra"],"visited":1},"124":{"name":"Swamp","type":"Normal"},"125":{"name":"Swamp"},"126":{"name":"Marsh"},"127":{"name":"Marsh"},"128":{"name":"Marsh"},"129":{"name":"Marsh"},"130":{"name":"Secret Cave Tunnel"},"131":{"name":"The Squid Lair"},"133":{"name":"Magic Plains"},"134":{"name":"Sanjuo","type":"City"},"135":{"name":"Chamber of Oracles","type":"Secret","visited":1},"136":{"name":"The Bilge"},"137":{"name":"Marsh","g":["Scrap Patch","Shrimp Pier"],"gt":[[45,29,"Scrap Patch"],[46,57,"Shrimp Pier"]],"m":["Bog Worm","Boggard","Tarn Linnorm","Bogleech","Blood Queen"],"visited":1},"138":{"name":"Abandoned Mine"},"139":{"name":"Ghrorak’s Prison"},"141":{"name":"Abandoned Mine"},"142":{"name":"Abandoned Mine"},"143":{"name":"Nythrendal","type":"City"},"169":{"name":"Bungavik","type":"City","visited":1,"smith":1},"170":{"name":"Dying Forest"},"171":{"name":"Dying Forest"},"172":{"name":"Dying Forest"},"173":{"name":"Dying Forest"},"174":{"name":"Dying Forest"},"175":{"name":"Dying Forest"},"176":{"name":"Dying Forest"},"179":{"name":"Deep Forest","type":"Normal","m":["Centaur","Druid","Goblin Pyro","Owlbear","Goblin Soldier","Wandering Ent","Werewolf"],"visited":1},"180":{"name":"Caeltys’ Causeway","type":"Normal","g":["Medium Quality Patch","Maple Grove","Nettle Field"],"gt":[[35,39,"Medium Quality Patch"],[38,37,"Medium Quality Patch"],[41,39,"Medium Quality Patch"],[45,44,"Nettle Field"],[48,46,"Nettle Field"],[51,44,"Nettle Field"],[55,42,"Maple Grove"]],"m":["Forest Guardian","Drow","Wendigo","Ankheg"],"visited":1},"181":{"name":"Caeltys’ Causeway"},"182":{"name":"Caeltys’ Causeway"},"183":{"name":"Caeltys","type":"City"},"184":{"name":"Caeltys’ Yarden"},"185":{"name":"Caeltys’ Yarden"},"186":{"name":"Caeltys’ Yarden"},"187":{"name":"Caeltys’ Yarden"},"188":{"name":"Caeltys’ Yarden"},"189":{"name":"Caeltys’ Yarden"},"190":{"name":"Savanna","type":"Normal","m":["Gnoll Warrior","Gnoll Warlock","Arynx","Scorpion","Carrion Harpy","Terastodon"],"visited":1},"191":{"name":"Savanna","m":["Carrion Harpy","Gnoll Warlock","Gnoll Warrior","Terastodon","Arynx","Scorpion"],"visited":1},"192":{"name":"Savanna","m":["Terastodon","Scorpion","Carrion Harpy","Arynx","Gnoll Warrior","Gnoll Warlock"],"visited":1},"193":{"name":"Savanna","m":["Gnoll Warrior","Terastodon","Arynx","Carrion Harpy","Scorpion","Gnoll Warlock"],"visited":1},"194":{"name":"Savanna","type":"Normal","m":["Gnoll Warrior","Arynx","Terastodon","Carrion Harpy","Scorpion","Gnoll Warlock"],"visited":1},"195":{"name":"Savanna","type":"Normal","g":["Tin Mine","Soapstone Quarry"],"gt":[[27,28,"Soapstone Quarry"],[38,25,"Tin Mine"]],"m":["Arynx","Terastodon","Scorpion","Gnoll Warrior","Gnoll Warlock","Carrion Harpy"],"visited":1},"196":{"name":"Savanna","type":"Normal","m":["Gnoll Warrior","Carrion Harpy","Scorpion","Gnoll Warlock","Terastodon","Arynx"],"visited":1},"197":{"name":"Desert","type":"Normal","m":["Carrion Harpy","Gnoll Warlock","Arynx","Scorpion","Gnoll Warrior","Terastodon"],"visited":1},"198":{"name":"Desert","m":["Gnoll Warrior","Arynx","Scorpion","Gnoll Warlock","Terastodon","Carrion Harpy"],"visited":1},"199":{"name":"Desert","m":["Carrion Harpy","Gnoll Warrior","Terastodon","Gnoll Warlock","Scorpion","Arynx"],"visited":1},"200":{"name":"Haunted Forest","type":"Normal","g":["White Bass Pier"],"gt":[[39,25,"White Bass Pier"]],"m":["Skeleton Archer","Skeleton Mage","Skeleton Warrior","Zombie Horse"],"visited":1},"201":{"name":"Saurville","type":"City","m":["Skeleton Warrior"],"visited":1,"smith":1},"202":{"name":"Haunted Forest","type":"Normal"},"203":{"name":"Desert of Whispers"},"204":{"name":"Pumpkin King`s Lodge"},"205":{"name":"Savanna"},"206":{"name":"Savanna"},"207":{"name":"Savanna"},"208":{"name":"Savanna"},"209":{"name":"Savanna","type":"Normal","m":["Arynx","Gnoll Warrior","Gnoll Warlock","Carrion Harpy","Scorpion","Terastodon"],"visited":1},"210":{"name":"Crimson Dust","type":"Normal","m":["Cassowary","Nomadic Cleric","Dune Glider","Raider"],"visited":1},"211":{"name":"Taiga","type":"Normal","m":["Valkyrie","Polar Bear","Frostbinder","Cougar","Berserker","Yak"],"visited":1},"212":{"name":"Taiga"},"213":{"name":"Taiga"},"214":{"name":"Taiga"},"215":{"name":"Taiga"},"216":{"name":"Taiga"},"217":{"name":"Taiga"},"218":{"name":"Desert of Lost Hope","type":"Normal","g":["Iron Mine"],"gt":[[52,21,"Iron Mine"]],"m":["Bone Scarab","Nomadic Cleric","Scorpion","Raider","Cassowary","Dune Glider"],"visited":1},"219":{"name":"Sandstorm Ridge","type":"Normal","m":["Dune Glider","Bone Scarab","Cassowary","Raider","Nomadic Cleric","Scorpion"],"visited":1},"220":{"name":"Burning Moon Sands","m":["Nomadic Cleric","Raider","Cassowary","Scorpion","Phoenix","Bone Scarab","Dune Glider"],"visited":1},"221":{"name":"Deserted Cavern","m":["Monstrous Bat","Monstrous Worm","Purple Worm","Goblin Pyro","Stone Hulk"],"visited":1},"222":{"name":"The Living Desert","g":["Fieldstone Quarry"],"gt":[[40,45,"Fieldstone Quarry"]],"m":["Phoenix","Cassowary","Bone Scarab","Raider","Dune Glider","Scorpion","Nomadic Cleric"],"visited":1},"224":{"name":"Desert of Illusions","m":["Cassowary","Dune Glider","Raider","Bone Scarab","Scorpion","Nomadic Cleric","Phoenix"],"visited":1},"225":{"name":"Devil’s Gulch","type":"Normal","m":["Cassowary","Nomadic Cleric","Raider","Scorpion","Phoenix","Bone Scarab","Dune Glider"],"visited":1},"226":{"name":"Temple Entrance","type":"Normal","m":["Phoenix","Dune Glider","Bone Scarab","Cassowary","Scorpion","Raider","Nomadic Cleric"],"visited":1},"227":{"name":"Shrubland","type":"Normal","g":["Spruce Grove"],"gt":[[17,54,"Spruce Grove"]],"m":["Orc Hunter","Catoblepas","Carrion Harpy","Terastodon","Orc Warrior","Orc Warlock"],"visited":1},"228":{"name":"Shrubland","type":"Normal","g":["White Bass Pier","Jute Field","Low Quality Patch"],"gt":[[20,11,"White Bass Pier"],[40,23,"Jute Field"],[44,25,"Low Quality Patch"]],"m":["Orc Warrior","Orc Hunter","Carrion Harpy","Catoblepas","Orc Warlock","Terastodon"],"visited":1},"229":{"name":"Ururg","type":"City","visited":1},"231":{"name":"Old Graveyard"},"232":{"name":"Mausoleum Stairway"},"233":{"name":"Mausoleum Chamber"},"234":{"name":"Medusa’s Hallway","m":["Stone Hulk","Goblin Pyro","Monstrous Worm","Purple Worm","Monstrous Bat"],"visited":1},"235":{"name":"Medusa’s Chamber"},"239":{"name":"Orc Domain Entrance","type":"Normal","m":["Dune Glider","Raider","Bone Scarab","Nomadic Cleric","Cassowary","Phoenix","Scorpion"],"visited":1},"240":{"name":"Shrubland","type":"Normal","m":["Orc Warrior","Catoblepas","Orc Warlock","Terastodon","Carrion Harpy"],"visited":1},"241":{"name":"Desert of the Damned","type":"Normal","m":["Raider","Dune Glider","Bone Scarab","Phoenix","Scorpion","Nomadic Cleric","Cassowary"],"visited":1},"243":{"name":"Sands of Echoes","type":"Normal","m":["Bone Scarab","Raider","Dune Glider","Nomadic Cleric","Phoenix","Cassowary","Scorpion"],"visited":1},"244":{"name":"Red Desert"},"245":{"name":"Red Desert"},"246":{"name":"Red Desert"},"247":{"name":"Underground"},"248":{"name":"Red Desert"},"249":{"name":"Red Desert"},"250":{"name":"Cactus Canyon"},"251":{"name":"Unison Obelisk"},"252":{"name":"Haunted Forest","type":"Normal","m":["Zombie Horse","Skeleton Warrior","Skeleton Mage","Skeleton Archer"],"visited":1},"253":{"name":"Haunted Forest","m":["Skeleton Mage","Skeleton Archer","Skeleton Warrior","Zombie Horse"],"visited":1},"254":{"name":"Haunted Forest"},"255":{"name":"Toxic River"},"256":{"name":"Haunted Forest"},"257":{"name":"Necropolis"},"260":{"name":"Stirge Lair"},"262":{"name":"Sands of the Forgotten","m":["Cassowary","Raider","Nomadic Cleric","Dune Glider"],"visited":1},"263":{"name":"Mirage’s Eye"},"264":{"name":"Sandstorm Plains"},"265":{"name":"Taiga"},"266":{"name":"Taiga"},"267":{"name":"Taiga"},"268":{"name":"Taiga"},"269":{"name":"Shrubland"},"270":{"name":"Shrubland"},"271":{"name":"Orc’s Bone Road"},"272":{"name":"Shrubland"},"273":{"name":"Shrubland"},"274":{"name":"Shrubland"},"275":{"name":"Shrubland","type":"Normal","m":["Carrion Harpy","Catoblepas","Orc Warrior","Orc Hunter","Orc Warlock","Terastodon"],"visited":1},"276":{"name":"Shrubland","type":"Normal"},"277":{"name":"Shrubland"},"278":{"name":"Shrubland"},"279":{"name":"Ancient Worm Tunnel"},"280":{"name":"Shrubland"},"281":{"name":"Trescan","type":"City"},"282":{"name":"Taiga"},"283":{"name":"Taiga"},"284":{"name":"Stogow","type":"City"},"285":{"name":"Taiga"},"286":{"name":"Taiga"},"287":{"name":"Yeti’s Cave"},"288":{"name":"Itham’s Lakeshore"},"289":{"name":"Itham’s Crator"},"290":{"name":"Itham’s Old Bay","type":"Normal"},"291":{"name":"Itham’s Anchorage","type":"Normal","g":["Coal Mine","Smallmouth Bass Pier"],"visited":1},"292":{"name":"Itham’s Heart","type":"Secret","m":["Thornweaver Itham"],"visited":1},"293":{"name":"Rainforest"},"294":{"name":"Rainforest"},"295":{"name":"Rainforest"},"296":{"name":"Rainforest"},"297":{"name":"Rainforest"},"298":{"name":"Rainforest"},"301":{"name":"Rainforest"},"302":{"name":"Coveted Blossom"},"304":{"name":"Rainforest"},"306":{"name":"Rainforest"},"307":{"name":"Rainforest"},"316":{"name":"Rainforest"},"317":{"name":"Galkathos","type":"City"},"318":{"name":"Temple Hall","type":"Normal","m":["Purifier","Monstrous Bat","Mummy","Sphinx"],"visited":1},"319":{"name":"Valdor’s Throneroom","m":["Valdor, Lord of Dawn"],"visited":1},"320":{"name":"Glacierbane’s Hollow"},"321":{"name":"Goliathor’s Temple"},"322":{"name":"Goliathor’s Throne Room"},"323":{"name":"Trescan’s Dock"},"324":{"name":"Dark Boreal"},"325":{"name":"Dark Boreal"},"326":{"name":"Dark Boreal"},"327":{"name":"Dark Boreal"},"328":{"name":"The Ghost Shore"},"332":{"name":"Grimble’s Camp"},"333":{"name":"Magic Plains"},"334":{"name":"Magic Plains"},"335":{"name":"Magic Plains"},"340":{"name":"The Ember Forge"},"900":{"name":"Abyssal Tower Entrance"},"901":{"name":"Abyssal Tower"},"902":{"name":"Abyssal Tower"},"903":{"name":"Abyssal Tower"},"904":{"name":"Abyssal Tower"},"905":{"name":"Abyssal Tower"},"906":{"name":"Abyssal Tower"},"907":{"name":"Abyssal Tower"},"908":{"name":"Abyssal Tower"},"909":{"name":"Abyssal Tower"},"910":{"name":"Abyssal Tower"},"911":{"name":"Abyssal Tower"},"998":{"name":"Fall of Rebirth"},"999":{"name":"Fountain of Rebirth"},"1000":{"name":"Fountain of Rebirth","type":"Normal","visited":1},"1001":{"name":"Winter Wonderland Lobby"},"1002":{"name":"Winter Wonderland"},"1003":{"name":"Winter Wonderland"},"1004":{"name":"Winter Wonderland"},"1005":{"name":"Winter Wonderland"},"1006":{"name":"Winter Wonderland"},"1027":{"name":"Loveland Lobby"},"1028":{"name":"Loveland"},"1029":{"name":"Loveland"},"1030":{"name":"Loveland"},"1031":{"name":"Loveland"},"1032":{"name":"Loveland"},"1040":{"name":"Patrick’s Land Lobby"},"1041":{"name":"Patrick’s Land"},"1066":{"name":"Bunnyland Lobby"},"1067":{"name":"Bunnyland"},"1068":{"name":"Bunnyland"},"1069":{"name":"Bunnyland"},"1070":{"name":"Bunnyland"},"1071":{"name":"Bunnyland"},"1144":{"name":"Das Festhalle Lobby"},"1145":{"name":"Das Festhalle"},"1157":{"name":"Sleepy Hollow Lobby"},"1158":{"name":"Sleepy Hollow"},"1159":{"name":"Sleepy Hollow"},"1160":{"name":"Sleepy Hollow"},"1161":{"name":"Sleepy Hollow"},"1162":{"name":"Sleepy Hollow"},"1183":{"name":"The Sacred Wilds Lobby","g":["Quarry","Grove","Mine","Pier","Field","Patch"],"visited":1},"1184":{"name":"The Sacred Wilds"},"1185":{"name":"The Sacred Wilds","type":"Secret","m":["Wyvern","Drake Boss"],"visited":1},"1186":{"name":"The Sacred Wilds"},"1187":{"name":"The Sacred Wilds"},"1188":{"name":"The Sacred Wilds"},"2001":{"name":"Overgrown Land","type":"Secret","visited":1},"2002":{"name":"Encampment"},"2003":{"name":"Fenced Encampment"},"2004":{"name":"Village"},"2005":{"name":"Tudor Village"},"2006":{"name":"Motte-and-Bailey"},"2007":{"name":"Stone Keep"},"2008":{"name":"Castle"},"2009":{"name":"Stronghold"},"2100":{"name":"Ashspire Battlegrounds"}},"edges":[[43,42,34,40],[42,9,17,60],[42,43,57,5],[9,8,10,23],[9,42,55,23],[8,7,17,40],[8,9,45,30],[7,6,14,57],[7,8,11,17],[7,10,49,20],[7,11,59,25],[6,5,57,30],[6,7,45,7],[6,14,11,7],[5,4,18,49],[5,6,11,32],[5,11,38,16],[5,17,41,50],[5,20,53,31],[5,34,39,28],[4,3,17,12],[4,5,47,7],[3,4,43,21],[11,5,33,46],[11,7,16,30],[11,12,31,18],[11,25,51,30],[12,11,38,60],[12,13,38,7],[12,135,21,33],[13,12,38,60],[13,26,33,30],[26,13,40,58],[26,26,56,24],[26,27,37,8],[135,12,36,41],[25,11,9,38],[17,5,31,8],[17,18,40,62],[17,44,22,24],[18,17,5,36],[18,19,60,37],[18,130,36,17],[19,18,10,36],[19,31,58,37],[31,19,9,31],[31,32,58,33],[32,31,9,20],[32,33,30,34],[32,112,59,22],[33,32,31,15],[33,136,34,44],[112,32,5,21],[112,113,53,18],[113,112,10,12],[113,120,49,35],[120,113,14,35],[120,119,52,20],[14,6,49,60],[14,15,27,16],[15,14,63,31],[15,16,36,9],[16,15,29,60],[16,48,29,7],[48,16,29,60],[48,49,56,10],[49,46,29,55],[49,48,14,39],[49,50,53,18],[50,49,14,34],[50,51,56,27],[51,50,15,28],[51,52,56,27],[51,54,22,8],[52,51,14,26],[52,53,59,21],[53,52,14,47],[53,55,39,7],[53,179,53,34],[55,53,40,60],[55,56,26,17],[56,55,31,63],[56,57,9,25],[179,53,14,25],[179,180,57,28],[180,179,16,47],[180,181,55,30],[75,74,16,34],[75,76,23,12],[75,218,49,42],[76,75,35,59],[76,83,41,16],[83,76,34,55],[83,84,36,9],[84,83,34,59],[84,85,41,13],[20,5,16,30],[20,21,57,47],[20,24,28,3],[24,20,9,47],[24,37,34,32],[37,24,34,55],[37,40,24,34],[40,37,15,40],[40,45,50,34],[21,20,9,27],[21,22,58,44],[22,21,9,33],[22,23,58,35],[23,22,9,34],[23,28,59,48],[23,41,52,12],[41,23,24,57],[41,61,44,7],[61,41,36,60],[61,62,43,9],[61,65,58,38],[65,61,10,34],[65,66,53,26],[66,65,14,37],[66,67,53,31],[67,66,14,32],[67,72,53,29],[72,67,18,34],[72,73,53,23],[73,72,19,35],[73,74,53,23],[74,73,14,35],[74,75,53,25],[218,75,19,7],[218,219,37,60],[219,218,22,11],[219,220,32,60],[220,219,23,7],[220,221,28,52],[221,220,24,7],[221,222,52,23],[222,221,14,42],[222,224,53,20],[224,222,14,19],[224,225,53,19],[224,243,39,60],[54,51,53,58],[62,61,36,60],[62,63,47,7],[63,62,14,59],[63,64,36,7],[64,63,23,59],[97,64,46,40],[97,96,53,24],[97,98,53,31],[96,94,32,7],[96,97,29,59],[94,93,49,7],[94,95,14,16],[94,96,20,60],[95,94,48,56],[95,234,36,35],[234,95,33,60],[234,235,33,7],[93,92,53,16],[93,94,14,36],[92,91,57,20],[92,93,20,19],[91,90,34,60],[91,92,13,35],[91,107,54,22],[91,190,28,7],[107,91,15,27],[107,106,53,28],[106,107,14,39],[106,197,53,19],[197,106,18,33],[197,198,53,22],[198,197,16,57],[198,199,53,10],[199,198,16,57],[199,200,50,22],[119,118,53,47],[119,120,18,10],[118,117,35,7],[118,119,14,27],[118,121,52,27],[118,123,37,59],[117,114,35,7],[117,118,22,60],[114,30,14,8],[114,115,53,36],[114,117,39,60],[115,114,14,36],[115,116,53,29],[115,137,49,60],[116,115,14,57],[137,115,25,7],[137,122,25,56],[122,121,14,52],[122,137,42,7],[122,260,48,42],[44,17,41,29],[1185,1183,56,11],[28,23,14,7],[28,29,41,60],[29,28,40,7],[29,30,38,60],[30,29,32,7],[30,111,44,41],[30,114,36,55],[90,91,28,7],[90,100,22,59],[100,90,43,15],[100,99,14,51],[99,98,14,40],[99,100,53,16],[98,97,14,26],[98,99,53,36],[64,97,13,16],[211,212,33,2],[27,26,36,60],[85,84,24,56],[225,224,16,46],[225,241,53,22],[227,228,38,8],[227,240,22,59],[228,227,14,55],[228,229,53,33],[239,240,46,29],[239,241,15,31],[240,227,51,19],[240,239,18,43],[241,225,14,48],[241,239,52,21],[243,224,27,10],[243,244,39,57],[201,200,34,61],[201,210,13,34],[201,252,41,7],[210,201,53,41],[210,209,13,26],[200,199,14,54],[200,201,31,7],[200,202,47,60],[169,196,31,57],[196,169,15,9],[196,195,34,60],[292,291,49,34],[291,290,37,2],[123,118,35,7],[123,124,44,60],[195,194,19,60],[195,196,45,7],[226,318,43,21],[229,228,14,45],[229,275,53,13],[275,229,11,47],[275,276,55,6],[318,226,34,66],[111,30,9,8],[252,201,19,54],[252,253,53,24],[253,252,14,27],[253,254,61,29],[209,210,49,41],[209,262,33,10],[262,209,44,63],[262,263,36,13],[319,318,35,50],[194,193,44,60],[194,195,20,7],[193,192,53,49],[193,194,14,11],[190,91,33,60],[190,191,34,7],[191,190,24,60],[191,192,15,10],[192,191,53,47],[192,193,14,19],[1183,5,24,35],[10,7,37,52]],"mon":{"Sasquatch":"65","Wild Dog":"6","Snake":"2","Deer":"3","Hare":"5","Wasp":"168","Wild Hog":"20","Bison":"37","Salamanderoid":"10","Troglodyte":"14","Miner":"64","Goblin Pyro":"54","Hypnotic Bat":"28","Thorny Vines":"62","Monstrous Worm":"16","Peasant":"13","Beaver":"11","Badger":"8","Woodland Snake":"15","Wolf":"32","Woodland Spider":"33","Bear":"19","River Troll":"56","Snapping Turtle":"23","Toad":"4","Crocodile":"22","Toxic Toad":"21","Merfolk":"88","Mountain Troll":"86","Lizardman":"87","Zombie Pirate":"89","Pirate":"57","Ghost Pirate":"141","Scorpion":"27","Dune Glider":"105","Bone Scarab":"51","Nomadic Cleric":"175","Raider":"103","Cassowary":"104","Centaur":"96","Werewolf":"95","Druid":"97","Owlbear":"106","Wandering Ent":"98","Goblin Soldier":"55","Drow":"111","Goblin Engineer":"217","Rust Monster":"213","Xorn":"215","Phantom Miner":"214","Werebat":"216","Phoenix":"172","Gnoll Warlock":"153","Carrion Harpy":"132","Terastodon":"131","Gnoll Warrior":"129","Arynx":"128","Bog Worm":"118","Bogleech":"120","Tarn Linnorm":"122","Killer Centipede":"49","Boggard":"119","Blood Queen":"121","Swamp Dragon":"151","Wisp Phantom":"174","Mutated Lizardman":"152","Hydra":"173","Forest Guardian":"112","Wendigo":"107","Ankheg":"110","Monstrous Bat":"29","Purple Worm":"143","Stone Hulk":"108","Wyvern":"138","Drake Boss":"137","Myconid":"115","Mothman":"114","Dryad":"113","Troll Boar":"117","Decaying Worm":"116","Valkyrie":"187","Polar Bear":"167","Frostbinder":"43","Cougar":"30","Berserker":"186","Yak":"188","Orc Warrior":"158","Catoblepas":"130","Orc Warlock":"160","Orc Hunter":"159","Tree of Life":"63","Skeleton Archer":"148","Skeleton Mage":"149","Skeleton Warrior":"150","Zombie Horse":"177","Thornweaver Itham":"207","Purifier":"40","Mummy":"145","Sphinx":"184","Mana Webber":"101","Spitter":"100","Brute Spider":"99","Spider Queen":"102","Valdor, Lord of Dawn":"206","Angry Egg":"198","Ape Brute":"203","Arcane Imp":"182","Armored Ram":"221","Basilisk":"165","Blue Stirge":"171","Cockatrice":"109","Cockroach":"47","Dwarven Caster":"224","Dwarven Guard":"222","Dwarven Hunter":"223","Eel":"52","Faery":"199","Fire Elemental":"205","Foliage Shaman":"24","Frost Elemental":"178","Giant Vulture":"185","Knight":"67","Komodo Basilisk":"225","Leech":"45","Light Elemental":"204","Lightning Elemental":"179","Loot Goblin":"230","Luminous Plant":"202","Ogre Mage":"183","Ooze":"193","Rat":"1","Red Stirge":"170","Skeleton":"147","Snow Rabbit":"237","Stone Centipede":"166","Succubus":"176","Tiger":"25","Vampire Bat":"135","Venomous Viper":"195","Vine Sniper":"201","Warg":"161","Wererat Slinger":"71","Wererat Soldier":"70","Wererat Wizard":"72","Wizard":"181","Wraith":"200","Zombie":"146"}};

  /* ★ v2.6.104：Smugglers Route（走私路线）边表（双向）。用户手填，后续可改。
     实测：格子 action = 'smugglers_route'，面板 #frame_SmugglersRoute，点 Ride 付金币直接换图。 */
  const SMUGGLER_EDGES = [
    [11, 62], [99, 67], [90, 76], [75, 226], [85, 87],
    [196, 209], [110, 239], [221, 288], [346, 293]
  ];
  const MapDB = (function () {
    const maps = {}, adj = {};
    let edges = [], mon = {}, cities = [], updated = '', dirty = false;
    /* ★ 到图即刷新用：门「连续未见」计数（只在内存里，不落盘）+ 连续几次没看到才删门 */
    const miss = {};
    /* ★ v2.6.105：3 → 20。实测：window.door_tiles 会短暂不完整（换图刚到 / 渲染未完），
       而 liveMapSnapshot 的 matched===doors 只能保证「内部一致」，不能保证「完整」。
       3 次（约 7.5s）就删会把真门误删（实测：5→25 / 5→12 / 5→7 被删）→ 导航突然算不出路线。
       20 次（约 50s 持续看不到）才删。 */
    const EDGE_MISS = 20;

    function blank(id) {
      return { id: +id, name: '', type: '', g: [], gt: [], m: [], ex: [], visited: false, smith: false, at: 0 };
    }
    function rec(id) { const k = String(id); return maps[k] || (maps[k] = blank(k)); }
    /* ★ v2.6.104：边带类型。kind = 'gate'（普通门，可步行）| 'smugglers'（走私路线，付金币换图）| 'other'（副本/入口等，不参与寻路） */
    const adjWalk = {};
    function edgeKindOf(e) { return (e && e[4]) ? String(e[4]) : 'gate'; }
    function isWalkKind(k) { return k === 'gate' || k === 'smugglers'; }
    function rebuildAdj() {
      Object.keys(adj).forEach(function (k) { delete adj[k]; });
      Object.keys(adjWalk).forEach(function (k) { delete adjWalk[k]; });
      edges.forEach(function (e) {
        (adj[e[0]] = adj[e[0]] || []).push(e[1]);
        if (isWalkKind(edgeKindOf(e))) (adjWalk[e[0]] = adjWalk[e[0]] || []).push(e[1]);
      });
    }
    /* ★ 2026-10-17：同一条门 (from,to) 若坐标和已存的不一致，以「新看到的」为准并返回 true。
       老版本只按 (from,to) 去重、坐标永不更新 —— 游戏改过门的位置后，导航会一直走到死格。 */
    function addEdge(a, b, x, y, kind) {
      a = +a; b = +b; if (!(a > 0) || !(b > 0)) return false;
      x = +x || 0; y = +y || 0;
      kind = kind || '';   /* 空 = 「本次没读到格子」→ 保留原类型，不降级 */
      const ex = edges.filter(function (e) { return e[0] === a && e[1] === b; })[0];
      if (ex) {
        const nk = kind || edgeKindOf(ex);
        if (ex[2] === x && ex[3] === y && edgeKindOf(ex) === nk) return false;
        ex[2] = x; ex[3] = y; ex[4] = nk; dirty = true;
        rebuildAdj();
        return true;
      }
      const k0 = kind || 'gate';
      edges.push([a, b, x, y, k0]);
      (adj[a] = adj[a] || []).push(b);
      if (isWalkKind(k0)) (adjWalk[a] = adjWalk[a] || []).push(b);
      dirty = true;
      return true;
    }
    /* ★★ 清掉「野外传送点」：老版本把世界地图上**所有带 waygate 图标**的点都塞进了 cities，
       但传送站 wilderness 页签的野外传送点（Itham's Anchorage 291 / The Shifting Tides 75 /
       Desert of Illusions 224 …）没有 smith / 邮箱 / 仓库，不是维修清包点。
       判定：有 id、map_db 里已有该图记录、且类型不是 City → 丢掉（没 id 的占位项保留）。 */
    function pruneCities() {
      const before = cities.length;
      cities = cities.filter(function (c) {
        if (!c.id) return true;
        const r = maps[String(c.id)];
        if (!r) return true;
        return r.type === 'City';
      });
      if (cities.length !== before) dirty = true;
    }
    /* localStorage 覆盖层：只并「学到的东西」，名字/类型不覆盖权威源 */
    function overlay(o) {
      if (o.cities && o.cities.length) cities = o.cities.map(function (c) { return Object.assign({}, c); });
      if (o.mon) Object.keys(o.mon).forEach(function (k) { if (!mon[k]) mon[k] = o.mon[k]; });
      (o.edges || []).forEach(function (e) { addEdge(e[0], e[1], e[2], e[3], e[4]); });
      if (o.maps) Object.keys(o.maps).forEach(function (k) {
        const s = o.maps[k]; if (!s) return;
        const r = rec(k);
        if (s.visited) r.visited = true;
        if (s.smith) r.smith = true;
        if (s.at) r.at = s.at;
        (s.g || []).forEach(function (x) { if (x && r.g.indexOf(x) < 0) r.g.push(x); });
        (s.gt || []).forEach(function (t) { if (t && +t[0] > 0 && +t[1] > 0 && !(r.gt || []).some(function (q) { return q[0] === +t[0] && q[1] === +t[1]; })) r.gt.push([+t[0], +t[1], String(t[2] || '')]); });
        (s.m || []).forEach(function (x) { if (x && r.m.indexOf(x) < 0) r.m.push(x); });
        (s.ex || []).forEach(function (t) { if (t && +t[0] > 0 && +t[1] > 0 && !(r.ex || []).some(function (q) { return q[0] === +t[0] && q[1] === +t[1] && q[2] === String(t[2] || ''); })) r.ex.push([+t[0], +t[1], String(t[2] || ''), String(t[3] || '')]); });
      });
      if (o.updated) updated = o.updated;
    }
    function load() {
      Object.keys(maps).forEach(function (k) { delete maps[k]; });
      Object.keys(MAPDB_SEED.maps).forEach(function (k) { maps[k] = Object.assign(blank(k), MAPDB_SEED.maps[k]); });
      edges = MAPDB_SEED.edges.map(function (e) { return e.slice(); });
      /* ★ v2.6.104：走私路线边（双向、跳数 1、付金币换图）。用户手填，可随版本改。 */
      SMUGGLER_EDGES.forEach(function (p) {
        edges.push([+p[0], +p[1], 0, 0, 'smugglers']);
        edges.push([+p[1], +p[0], 0, 0, 'smugglers']);
      });
      mon = Object.assign({}, MAPDB_SEED.mon);
      cities = (MAPDB_SEED.cities || []).map(function (c) { return Object.assign({}, c); });
      try { const o = JSON.parse(localStorage.getItem(MAPDB_KEY) || 'null'); if (o) overlay(o); } catch (e) { /* ignore */ }
      rebuildAdj();
      pruneCities();          /* ★ 老版本 localStorage 里存的野外传送点在这里清掉 */
      dirty = false;
    }
    function save() {
      try {
        const out = { v: 1, updated: new Date().toISOString(), cities: cities, edges: edges, mon: mon, maps: {} };
        Object.keys(maps).forEach(function (k) {
          const r = maps[k];
          out.maps[k] = { visited: !!r.visited, smith: !!r.smith, at: r.at || 0, g: r.g || [], gt: r.gt || [], m: r.m || [], ex: r.ex || [] };
        });
        localStorage.setItem(MAPDB_KEY, JSON.stringify(out));
        updated = out.updated; dirty = false;
      } catch (e) { /* ignore */ }
    }
    const api = {
      KEY: MAPDB_KEY,
      reload: load, save: save,
      isDirty: function () { return dirty; },
      markDirty: function () { dirty = true; },
      get: function (id) { return maps[String(id)] || null; },
      name: function (id) { const r = maps[String(id)]; return (r && r.name) ? r.name : ('map' + id); },
      type: function (id) { const r = maps[String(id)]; return (r && r.type) || ''; },
      isTown: function (id) { const r = maps[String(id)]; return !!(r && r.type === 'City'); },
      visited: function (id) { const r = maps[String(id)]; return !!(r && r.visited); },
      g: function (id) { const r = maps[String(id)]; return (r && r.g) || []; },
      gatherTiles: function (id) { const r = maps[String(id)]; return (r && r.gt) || []; },
      m: function (id) { const r = maps[String(id)]; return (r && r.m) || []; },
      mon: function (nm) { return mon[nm]; },
      monAll: function () { return mon; },
      edges: function () { return edges; },
      exits: function (id) { const r = maps[String(id)]; return (r && r.ex) || []; },
      adj: function (id) { return adj[String(id)] || []; },
      /* ★ v2.6.104：只含「可步行」边（gate + smugglers）的邻接表 —— 寻路只认这个 */
      adjWalk: function (id) { return adjWalk[String(id)] || []; },
      edgeKind: function (a, b) {
        a = +a; b = +b;
        const list = edges.filter(function (e) { return e[0] === a && e[1] === b; });
        if (!list.length) return '';
        if (list.some(function (e) { return edgeKindOf(e) === 'gate'; })) return 'gate';
        if (list.some(function (e) { return edgeKindOf(e) === 'smugglers'; })) return 'smugglers';
        return edgeKindOf(list[0]);
      },
      cities: function () { return cities; },
      list: function () { return Object.keys(maps).map(function (k) { return maps[k]; }); },
      count: function () { return Object.keys(maps).length; },
      edgeCount: function () { return edges.length; },
      addEdge: addEdge,
      /* 到访记录（原 _visited） */
      markVisited: function (id, opt) {
        const r = rec(id); opt = opt || {};
        const name = api.name(id);
        const type = api.type(id) || opt.type || '';
        const smith = !!opt.smith;
        if (r.visited && r.name === name && r.type === type && r.smith === smith) { r.at = now(); return false; }
        r.name = name; r.type = type; r.visited = true; r.smith = smith; r.at = now();
        dirty = true; save();
        return true;
      },
      visitedTowns: function () {
        return api.list().filter(function (r) { return r.visited && (r.type === 'City' || r.smith); })
          .sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
      },
      cityIdByName: function (name) {
        const k = normName(name);
        const hit = cities.filter(function (c) { return c.id && normName(c.name) === k; })[0];
        if (hit) return String(hit.id);
        const r = api.list().filter(function (x) { return x.type === 'City' && normName(x.name) === k; })[0];
        return r ? String(r.id) : '';
      },
      /* 运行时：/modal/world_map 的权威名字 + 传送站城镇 */
      applyWorldMap: function (byId, town) {
        let ch = 0;
        Object.keys(byId || {}).forEach(function (k) {
          const r = rec(k);
          if (byId[k] && r.name !== byId[k]) { r.name = byId[k]; ch++; }
        });
        Object.keys(town || {}).forEach(function (k) {
          const nm = byId[k]; if (!nm) return;
          if (cities.some(function (c) { return String(c.id) === String(k) || normName(c.name) === normName(nm); })) return;
          /* ★ 只有「类型 = City」才算城镇：world map 上 wilderness 页签的野外传送点
             （Itham's Anchorage 291 / The Shifting Tides 75 / Desert of Illusions 224 …）同样带
             waygate 图标，但它们没有 smith / 邮箱 / 仓库，不能进维修清包的下拉清单。 */
          const r = maps[String(k)];
          if (!r || r.type !== 'City') return;
          cities.push({ name: nm, lv: '', id: String(k) });
        });
        if (ch) dirty = true;
        pruneCities();
        return ch;
      },
      /* 边玩边学：把当前图学到的信息并进来（只补不覆盖） */
      learnDom: function (id, dom) {
        const r = rec(id); let ch = false; dom = dom || {};
        if (dom.name && !/^map\d+$/.test(dom.name) && (!r.name || /^map\d+$/.test(r.name))) { r.name = dom.name; ch = true; }
        if (dom.type && !r.type) { r.type = String(dom.type); ch = true; }
        (dom.g || []).forEach(function (x) { if (x && r.g.indexOf(x) < 0) { r.g.push(x); ch = true; } });
        (dom.m || []).forEach(function (x) { if (x && r.m.indexOf(x) < 0) { r.m.push(x); ch = true; } });
        (dom.mon || []).forEach(function (p) { if (p && p[0] && !mon[p[0]]) { mon[p[0]] = p[1]; ch = true; } });
        (dom.edges || []).forEach(function (e) { if (addEdge(e[0], e[1], e[2], e[3])) ch = true; });
        if (ch) dirty = true;
        return ch;
      },
      /* ★★ 到图即刷新（v1.7.0，2026-10-17 新前端）：每到一张图，就用「当前实测」覆盖该 map id 的记录。
         和 learnDom（只补不覆盖）不同 —— 这里以实测为准：
           名字 / 类型 / 采集点(g) / 门坐标 全部更新；连续 EDGE_MISS 次没再看到的门才删。
         怪物(m) 仍是「只增不减」：scanEnemies() 只是当前刷出来的那一批，
         刚落地/刚清完怪时可能是空的，拿它当全量会误删（采集点和门是静态地图要素，快照即事实）。
         返回「这次改了哪些」的文字数组，供面板日志显示。 */
      syncLive: function (id, live) {
        const r = rec(id); live = live || {};
        const diff = [];
        const uniq = function (a) { const o = []; (a || []).forEach(function (x) { if (x && o.indexOf(x) < 0) o.push(x); }); return o; };
        if (live.name && live.name !== r.name) { diff.push('名字 ' + (r.name || '?') + '→' + live.name); r.name = live.name; }
        if (live.type && live.type !== r.type) { diff.push('类型 ' + (r.type || '?') + '→' + live.type); r.type = live.type; }
        /* ★ v2.6.66（F4）：采集点 / 坐标改成「只在实测点数 ≥ 已知点数时才覆盖」。
           原因：换图未完成时 .map_table 可能只渲染了一部分 tile_poi，直接覆盖会把有效采集点删掉
           （实测：合成页只给 1 个点 → 种子里的 3 个被覆盖成 1 个）。
           点数变少 = 可疑（可能只是没渲染完）→ 只增不减；点数不变或变多 = 可信 → 正常纠错。
           代价：游戏真删掉采集点时本图记录不会自动收缩（采集点是静态要素，误删的代价更大）。 */
        if (live.g && live.g.length >= (r.g || []).length) {
          const ng = uniq(live.g);
          if (ng.join('|') !== (r.g || []).join('|')) {
            const add = ng.filter(function (x) { return r.g.indexOf(x) < 0; });
            const del = r.g.filter(function (x) { return ng.indexOf(x) < 0; });
            if (add.length) diff.push('采集点 +' + add.join('/'));
            if (del.length) diff.push('采集点 -' + del.join('/'));
            r.g = ng;
          }
        }
        if (live.gt && live.gt.length && live.gt.length >= (r.gt || []).length) {
          const norm = live.gt.map(function (t) { return [+t[0], +t[1], String(t[2] || '')]; })
            .filter(function (t) { return t[0] > 0 && t[1] > 0; });
          const key = function (a) { return a.map(function (t) { return t.join(','); }).sort().join('|'); };
          if (key(norm) !== key(r.gt || [])) { r.gt = norm; diff.push('采集点坐标 ' + norm.length + ' 个'); }
        }
        if (live.m) {
          (live.m || []).forEach(function (x) { if (x && r.m.indexOf(x) < 0) { r.m.push(x); diff.push('怪物 +' + x); } });
        }
        /* ★ v2.6.98：出口类格子（门 / 传送站 / 走私路线 / 秘密通路 / 副本入口 …）——静态要素，实测即事实 */
        if (live.exits && live.exits.length) {
          const normEx = live.exits.map(function (t) { return [+t[0], +t[1], String(t[2] || ''), String(t[3] || '')]; })
            .filter(function (t) { return t[0] > 0 && t[1] > 0; });
          const keyEx = function (a) { return a.map(function (t) { return t.join(','); }).sort().join('|'); };
          if (keyEx(normEx) !== keyEx(r.ex || [])) { r.ex = normEx; diff.push('出口 ' + normEx.length + ' 个'); }
        }
        (live.mon || []).forEach(function (p) {
          if (p && p[0] && mon[p[0]] !== p[1]) { mon[p[0]] = p[1]; diff.push('图鉴 ' + p[0]); }
        });
        /* ★ v2.6.63：只有「本图确实读到了门」才敢删门。
           window.door_tiles 为空/没加载完时 live.edges 是空数组，旧逻辑会把这张图的边全部记 miss，
           连续 3 次（约 7.5 秒）就把整张图的边删光 → navRoute 突然算不出路线（实测：传送目的地莫名退到别的城）。 */
        if (live.edges && live.edges.length) {
          const seen = {};
          live.edges.forEach(function (e) {
            const a = +e[0], b = +e[1], x = +e[2] || 0, y = +e[3] || 0;
            if (!(a > 0) || !(b > 0)) return;
            seen[a + '>' + b] = 1; miss[a + '>' + b] = 0;
            const kind = (e[4] === 'smugglers') ? 'smugglers' : ((e[4] === 'other') ? 'other' : 'gate');
            const ex = edges.filter(function (o) { return o[0] === a && o[1] === b; })[0];
            if (!ex) {
              edges.push([a, b, x, y, kind]); (adj[a] = adj[a] || []).push(b);
              if (kind === 'gate') (adjWalk[a] = adjWalk[a] || []).push(b);
              diff.push('新门 ' + a + '→' + b + ' @' + x + ',' + y + (kind !== 'gate' ? '[' + kind + ']' : ''));
            } else if (ex[2] !== x || ex[3] !== y || edgeKindOf(ex) !== kind) {
              diff.push('门 ' + a + '→' + b + ' ' + ex[2] + ',' + ex[3] + '→' + x + ',' + y + (edgeKindOf(ex) !== kind ? ' [' + edgeKindOf(ex) + '→' + kind + ']' : ''));
              ex[2] = x; ex[3] = y; ex[4] = kind;
              rebuildAdj();
            }
          });
          /* 本图的门：连续 EDGE_MISS 次没再看到 → 删（游戏里门被移掉时导航才不会走死格） */
          for (let i = edges.length - 1; i >= 0; i--) {
            const e = edges[i];
            if (e[0] !== +id) continue;
            /* ★ v2.6.104：只删「普通门」边。走私路线边不在 window.door_tiles 里，永远「看不见」，
               若不排除会被误删（实测：11→62 走私边被删）。 */
            if (edgeKindOf(e) !== 'gate') continue;
            const k = e[0] + '>' + e[1];
            if (seen[k]) continue;
            miss[k] = (miss[k] || 0) + 1;
            if (miss[k] >= EDGE_MISS) {
              diff.push('删门 ' + e[0] + '→' + e[1] + '（连续 ' + miss[k] + ' 次未见）');
              edges.splice(i, 1); delete miss[k];
              const lst = adj[e[0]];
              if (lst) { const j = lst.indexOf(e[1]); if (j >= 0) lst.splice(j, 1); }
              const lw = adjWalk[e[0]];
              if (lw) { const j2 = lw.indexOf(e[1]); if (j2 >= 0) lw.splice(j2, 1); }
            }
          }
        }
        /* ★ v2.6.98：数据有变化就刷新 at —— at 现在表示「这张图的数据最后更新于」，用于公共地图库按图取最新 */
        if (diff.length) { dirty = true; r.at = now(); }
        return diff;
      },
      /* ★ v2.6.98：导出「可共享的地图数据」——每张图一条记录（自带 at 与该图的出边），
         供公共地图库按「每张图取 at 最新」合并。 */
      exportSync: function () {
        const out = {};
        const byFrom = {};
        edges.forEach(function (e) { (byFrom[e[0]] = byFrom[e[0]] || []).push([e[0], e[1], e[2], e[3], edgeKindOf(e)]); });
        Object.keys(maps).forEach(function (k) {
          const r = maps[k];
          const o = { at: r.at || 0 };
          if (r.name) o.name = r.name;
          if (r.type) o.type = r.type;
          if ((r.g || []).length) o.g = r.g;
          if ((r.gt || []).length) o.gt = r.gt;
          if ((r.m || []).length) o.m = r.m;
          if ((r.ex || []).length) o.ex = r.ex;
          if (r.visited) o.visited = true;
          if (r.smith) o.smith = true;
          if (byFrom[+k]) o.edges = byFrom[+k];
          out[k] = o;
        });
        return out;
      },
      /* ★ v2.6.98：并入公共地图数据 —— 每张图以 at 更新的那份为准（整条替换，含门与出口格） */
      applyRemote: function (payload) {
        const rmap = (payload && payload.maps) || {};
        let changed = 0;
        Object.keys(rmap).forEach(function (k) {
          const s = rmap[k]; if (!s) return;
          const r = rec(k);
          const at = +s.at || 0;
          if (at <= (r.at || 0)) return;                 /* 本地更新 → 保留本地 */
          if (s.name) r.name = String(s.name);
          if (s.type) r.type = String(s.type);
          if (Array.isArray(s.g)) r.g = s.g.slice();
          if (Array.isArray(s.gt)) r.gt = s.gt.map(function (t) { return [+t[0], +t[1], String(t[2] || '')]; });
          if (Array.isArray(s.m)) r.m = s.m.slice();
          if (Array.isArray(s.ex)) r.ex = s.ex.map(function (t) { return [+t[0], +t[1], String(t[2] || ''), String(t[3] || '')]; });
          if (s.visited) r.visited = true;
          if (s.smith) r.smith = true;
          r.at = at;
          if (Array.isArray(s.edges)) {
            const oldKinds = {};
            edges.forEach(function (e) { if (e[0] === +k) oldKinds[e[1]] = edgeKindOf(e); });
            for (let i = edges.length - 1; i >= 0; i--) { if (edges[i][0] === +k) edges.splice(i, 1); }
            s.edges.forEach(function (e) {
              if (!Array.isArray(e) || +e[0] !== +k || !(+e[1] > 0)) return;
              // 旧共享数据没有类型时，保留本地已知类型；未知边不推断为普通门。
              const kind = ['gate', 'smugglers', 'other'].indexOf(e[4]) >= 0 ? e[4] : (oldKinds[+e[1]] || 'other');
              addEdge(e[0], e[1], e[2], e[3], kind);
            });
          }
          changed++;
        });
        if (changed) { rebuildAdj(); dirty = true; save(); }
        return changed;
      },
      /* 导入「地图记录器」导出的 JSON（maps + edges） */
      importRecorder: function (o) {
        if (!o || !o.maps) return { edges: 0, visited: 0, poi: 0 };
        const mInfo = function (id) { return o.maps[id] || o.maps[String(id)] || null; };
        let added = 0, vis = 0, poi = 0;
        (o.edges || []).forEach(function (e) {
          const a = (e && e.fromId != null) ? +e.fromId : +e[0];
          const b = (e && e.toId != null) ? +e.toId : +e[1];
          const x = (e && e.x != null) ? +e.x : +e[2];
          const y = (e && e.y != null) ? +e.y : +e[3];
          if (!(a > 0) || !(b > 0)) return;
          const ma = mInfo(a), mb = mInfo(b), ra = rec(a), rb = rec(b);
          if (ma && ma.name && (!ra.name || /^map\d+$/.test(ra.name))) ra.name = ma.name;
          if (mb && mb.name && (!rb.name || /^map\d+$/.test(rb.name))) rb.name = mb.name;
          if (addEdge(a, b, x, y)) added++;
        });
        Object.keys(o.maps).forEach(function (k) {
          const m = o.maps[k]; if (!m) return;
          const id = String(m.id != null ? m.id : k);
          const r = rec(id);
          if (m.visited && !r.visited) { r.visited = true; r.at = now(); vis++; }
          (m.npcs || []).forEach(function (p) {
            const a = Array.isArray(p) ? p[0] : p.action, n = Array.isArray(p) ? p[1] : p.name;
            if (a === 'gate' || a === 'waygate') return;
            if (a === 'gathering' && n && r.g.indexOf(n) < 0) { r.g.push(n); poi++; }
          });
          if (m.enemies) {
            const add = function (nm) { if (nm && r.m.indexOf(nm) < 0) { r.m.push(nm); poi++; } };
            if (Array.isArray(m.enemies)) m.enemies.forEach(function (x) { add(Array.isArray(x) ? x[0] : x); });
            else Object.keys(m.enemies).forEach(function (nm) { add(nm); });
          }
        });
        if (added || vis || poi) { dirty = true; save(); }
        return { edges: added, visited: vis, poi: poi };
      },
      /* 导出（格式与「地图记录器」一致，可回导） */
      exportRecorder: function () {
        const outMaps = {};
        api.list().forEach(function (r) {
          outMaps[String(r.id)] = {
            id: r.id, visited: !!r.visited, name: r.name, type: r.type,
            npcs: (r.gt && r.gt.length)
              ? r.gt.map(function (t) { return { action: 'gathering', name: t[2], coords: (t[0] + '-' + t[1]) }; })
              : (r.g || []).map(function (n) { return { action: 'gathering', name: n, coords: '' }; }),
            enemies: (r.m || []).reduce(function (a, n) { a[n] = 1; return a; }, {})
          };
        });
        return { version: 1, updated: new Date().toISOString(), maps: outMaps, edges: edges, mon: mon };
      }
    };
    load();
    /* 一次性迁移旧版 localStorage（老版本小伴侣 / 地图记录器） */
    (function migrateOld() {
      try {
        if (localStorage.getItem(MAPDB_KEY)) return;
        let changed = false;
        const v = JSON.parse(localStorage.getItem('norroth_visited_v1') || 'null');
        if (v) Object.keys(v).forEach(function (k) { const r = rec(k); r.visited = true; if (v[k] && v[k].smith) r.smith = true; changed = true; });
        const p = JSON.parse(localStorage.getItem('norroth_poi_learn_v1') || 'null');
        if (p && p.maps) {
          Object.keys(p.maps).forEach(function (k) {
            const m = p.maps[k]; if (!m) return; const r = rec(k);
            (m.npcs || []).forEach(function (q) { const a = Array.isArray(q) ? q[0] : q.action, n = Array.isArray(q) ? q[1] : q.name; if (a === 'gathering' && n && r.g.indexOf(n) < 0) r.g.push(n); });
            if (m.enemies) { const add = function (nm) { if (nm && r.m.indexOf(nm) < 0) r.m.push(nm); }; if (Array.isArray(m.enemies)) m.enemies.forEach(function (x) { add(Array.isArray(x) ? x[0] : x); }); else Object.keys(m.enemies).forEach(add); }
          });
          if (p.mon) Object.keys(p.mon).forEach(function (k) { if (!mon[k]) mon[k] = p.mon[k]; });
          (p.edges || []).forEach(function (e) { addEdge(e[0], e[1], e[2], e[3]); });
          changed = true;
        }
        const mr = JSON.parse(localStorage.getItem('norroth_maprec_v1') || 'null');
        if (mr && mr.maps) { api.importRecorder(mr); changed = true; }
        if (changed) save();
      } catch (e) { /* ignore */ }
    })();
    return api;
  })();

  /* ---- 世界地图字典（运行时权威名字来源） ---- */
  let mapDict = null, mapDictTask = null;

  function getMapDict() {
    if (mapDict) return Promise.resolve(mapDict);
    if (mapDictTask) return mapDictTask;
    mapDictTask = (async () => {
      const t = await (await fetch('/modal/world_map', { credentials: 'same-origin' })).text();
      const doc = new DOMParser().parseFromString(t, 'text/html');
      const byId = {}, byName = {}, town = {};
      doc.querySelectorAll('[map_id]').forEach(g => {
        const id = g.getAttribute('map_id');
        const m = (g.getAttribute('content') || '').match(/<h1[^>]*>([^<]*)<\/h1>/);
        if (!m) return;
        const name = m[1].trim();
        byId[id] = name;
        const k = normName(name);
        if (byName[k] === undefined) byName[k] = id;
        /* ★ 传送站图标 = 该图是「可传送的服务城镇」：游戏自己的数据、按 id 判定，不用猜名字 */
        if (/\/waygate\.gif/i.test(g.getAttribute('content') || '')) town[id] = 1;
      });
      if (!Object.keys(byId).length) throw new Error('世界地图数据为空');
      /* ★ 世界地图是「按 id 的权威名字来源」：直接写进 MapDB（唯一数据源） */
      try { MapDB.applyWorldMap(byId, town); } catch (e) { /* ignore */ }
      mapDict = { byId: byId, byName: byName, town: town };
      return mapDict;
    })();
    mapDictTask.catch(() => { mapDictTask = null; });
    return mapDictTask;
  }

  /* ★★ 地图名称 / 类型一律「按 id」查（MapDB 是唯一数据源）。
   *   名字会错、id 不会错：记录器曾把 map5 记成 "Grasping Maze"、map16 记成 "Deep Forest"，
   *   都是换图瞬间读了 window.map（换图后长时间仍是旧图）造成的。 */
  function mapNameById(id) { return MapDB.name(id); }
  function mapTypeById(id) { return MapDB.type(id); }
  /* 该图是不是「可维修/清包的服务城镇」：只认类型 City。
   * ★ 不能只看世界地图的 waygate 图标 —— 传送站的 wilderness 页签里那些野外传送点
   *   （Itham's Anchorage 291、The Shifting Tides 75、Desert of Illusions 224 …）同样带
   *   waygate 图标，但它们没有 smith / 邮箱 / 仓库，当不了维修清包点。 */
  function isServiceTownById(id) { return MapDB.isTown(String(id)); }

  /* 当前地图名称：以 character.current_map 为准；window.map 只做最后的显示兜底 */
  function currentMapName() {
    if (!inGame()) return '';
    const id = String(character.current_map);
    const n = mapNameById(id);
    if (!/^map\d+$/.test(n)) return n;
    if (window.map && window.map.name && String(window.map.name).trim()) return String(window.map.name).trim();
    return n;
  }

  const RARITY_CN = { normal: '普通', magic: '魔法', rare: '稀有', epic: '史诗', unique: '独特', relic: '遗物', legendary: '传说', bronze: '青铜', silver: '白银', gold: '黄金' };
  const rarityCN = r => RARITY_CN[r] || RARITY_CN2[r] || r || '未知';

  /* ★ 自动清包：品质过滤 + 出售/拆解（用户 2026-10-20 需求） */
  function rarityRank(r) { return RARITY_ORDER.indexOf(String(r || '').toLowerCase()); }
  /** 自动清包是否设了过滤条件（等级上限 或 品质阈值）；两个都不设 = 不处理任何装备（防误卖） */
  function clearFilterActive() { return cfg.sellEquipMaxLv > 0 || !!cfg.sellRarity; }
  /** 某件装备是否符合「自动清包」条件：lv = 装备等级，rarity = 品质字符串 */
  function clearEligible(lv, rarity) {
    if (cfg.sellEquipMaxLv <= 0 && !cfg.sellRarity) return false;   // 两个都不限 → 不处理（防误卖）
    if (cfg.sellEquipMaxLv > 0 && !(lv > 0 && lv <= cfg.sellEquipMaxLv)) return false;
    if (cfg.sellRarity) {
      const rk = rarityRank(rarity), th = rarityRank(cfg.sellRarity);
      /* ★ v2.6.76：阈值取「普通」时表示「只处理普通（灰色）」。
         旧实现是严格「低于」，而「低于普通」恒为空集 → 选普通等于什么都不清（灰色装备永远清不掉）。 */
      const ok = (th <= 0) ? (rk === 0) : (rk >= 0 && rk < th);
      if (!ok) return false;
    }
    return true;
  }
  /* ★ v2.6.76：游戏里物品名字的固定配色（实测 2026-10-21，取自 /modal/<smith>/salvage 与收购列表）。
     有些界面（尤其灰色装备）没有 label-<rarity>、也没有 rarity 属性，只能靠颜色区分。 */
  const RARITY_BY_COLOR = {
    '#a5a3a0': 'normal', '#3592d9': 'magic', '#fae922': 'rare', '#9c37ba': 'epic', '#ffa405': 'mystical'
  };
  /** 从收购/拆解条目里读装备品质（label-<rarity> 类名 / rarity 属性 / tooltip 的 text-<rarity> / 名字颜色） */
  function equipRarityOf(block) {
    const el = block.querySelector('.label-left-top') || block.querySelector('[class*="label-"]');
    if (el) { const m = /label-(normal|magic|rare|epic|mystical|ascended|legendary|relic|unique)\b/.exec(el.className || ''); if (m) return m[1]; }
    const ra = block.querySelector('[rarity]');
    if (ra) { const r = String(ra.getAttribute('rarity') || '').toLowerCase(); if (rarityRank(r) >= 0) return r; }
    const nm = block.querySelector('.item_name[content], img[content]');
    if (nm) { const m2 = /text-(normal|magic|rare|epic|mystical|ascended|legendary|relic|unique)\b/.exec(nm.getAttribute('content') || ''); if (m2) return m2[1]; }
    /* ★ 兜底：按名字颜色判品质（灰色装备最常走到这里） */
    const col = block.querySelector('.item_name[style*="color"]');
    if (col) {
      let cm = /color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/.exec(col.getAttribute('style') || '');
      if (cm) {
        let hex = cm[1].toLowerCase();
        if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        const r2 = RARITY_BY_COLOR[hex];
        if (r2) return r2;
      }
    }
    return '';
  }

  /* ---- 拜访过的地图（识别城镇 + 记录挂机地图） ----
   * 数据源：window.map.type（'City' = 城镇）+ 当前图是否有 smith NPC。
   * 只能记录「亲自到过」的图 —— 正好对应需求「拜访过的 city」。 */
  const DET_KEY = 'norroth_detstats_v1';   // 详细统计落盘
  /* ★ 到访记录统一由 MapDB 管理（localStorage: norroth_mapdb_v1），这里不再单独存一份 */
  function loadVisited() { /* MapDB 启动时已自行加载 */ }
  function saveDetStats() {
    try { localStorage.setItem(DET_KEY, JSON.stringify({ killsByName: st.killsByName, gathersByKind: st.gathersByKind, gainedByKey: st.gainedByKey, gainedByRarity: st.gainedByRarity, soldByRarity: st.soldByRarity, deaths: st.deaths })); } catch (e) { /* ignore */ }
  }
  function loadDetStats() {
    try {
      const o = JSON.parse(localStorage.getItem(DET_KEY) || '{}') || {};
      if (o.killsByName) st.killsByName = o.killsByName;
      if (o.gathersByKind) st.gathersByKind = o.gathersByKind;
      if (o.gainedByKey) st.gainedByKey = o.gainedByKey;
      if (o.gainedByRarity) st.gainedByRarity = o.gainedByRarity;
      if (o.soldByRarity) st.soldByRarity = o.soldByRarity;
      if (o.deaths) st.deaths = o.deaths;
    } catch (e) { /* ignore */ }
  }
  function recordVisit() {
    if (!inGame()) return;
    try {
      /* ★ v2.6.106：id 用「渲染自己的 id」（window.map.id）—— 换图瞬间 character.current_map
         会先变，而 type / smith 都是读当前 DOM 得到的，用它会把这几个字段写到新图名下。 */
      const rid = renderMapId();
      if (rid > 0 && !renderSynced()) return;         /* 渲染还没跟上 → 这一拍不记 */
      const id = String(rid > 0 ? rid : character.current_map);
      const type = mapTypeById(id) || ((window.map && window.map.type) || '');
      const smith = !!findSmith();
      if (MapDB.markVisited(id, { type: type, smith: smith })) {
        if (type === 'City' || smith) { try { renderTownSelect(); } catch (e) { /* ignore */ } }
      }
    } catch (e) { /* ignore */ }
  }
  /* 可作为维修/清包点的城镇：类型是 City 或该图有 smith */
  function visitedTowns() {
    return MapDB.visitedTowns().map(function (r) { return { id: String(r.id), name: r.name, type: r.type, smith: r.smith }; });
  }
  function townName(id) {
    if (!id) return '';
    const n = mapNameById(id);
    if (!/^map\d+$/.test(n)) return n;
    return navMapName(id) || ('地图 ' + id);
  }

  /* 城镇名 → 地图 id：MapDB 的城镇清单（含世界地图补进来的） */
  function cityIdByName(name) { return MapDB.cityIdByName(name); }

  /* ★ 维修/清包候选城镇 = 传送站城市（含还没探索出 id 的，先列出但停用）∪ 到过的城镇。
   *   ★「能不能选」= 从当前图真的算得出路线，而不是「到过没到过」。
   *     记录器导入的图（例如 Bungavik 169）会带 real 标记，但本机导航图里可能根本没有连过去
   *     的那条边 —— 按 real 放行的话，选了必然走到「暂无路线」失败。反过来，没到过但能导航
   *     过去的图应该可选。不在游戏里（拿不到 character）时退回「到过」判断，免得面板全灰。
   *   ★★ 2026-09-22：**只收真能维修/清包的图**（类型 = City，或该图确实有 smith）。
   *     野外传送点（带 waygate 图标但没有 smith / 邮箱 / 仓库，如 Itham's Anchorage 291、
   *     The Shifting Tides 75、Desert of Illusions 224）一律不进下拉 —— 用户实测反馈过这个 bug。 */
  function serviceTowns() {
    const out = [], seen = {};
    const canService = function (id) {
      if (!id) return true;                       /* 没 id 的占位项（来自游戏 Cities 页）保留 */
      const r = MapDB.get(id) || {};
      return MapDB.isTown(id) || !!r.smith;       /* 类型 City 或该图有 smith */
    };
    const push = (id, extra) => {
      id = String(id);
      if (!id || seen[id]) return;
      if (!(extra && extra.noId) && !canService(id)) return;
      seen[id] = 1;
      const r = MapDB.get(id) || {};
      const noId = !!(extra && extra.noId);
      let reach, viaWg = false;
      if (noId) reach = false;
      else {
        try {
          if (inGame()) {
            reach = !!navRoute(character.current_map, +id);
            if (!reach) { viaWg = waygateReachable(id); reach = viaWg; }   /* ★ v2.6.86：没步行路线但传送点能到 */
          } else reach = !!r.visited;
        } catch (e) { reach = !!r.visited; }
      }
      out.push(Object.assign({
        id: id,
        name: MapDB.name(id),
        type: MapDB.type(id) || r.type || '',
        smith: !!r.smith,
        visited: !!r.visited,
        viaWg: viaWg,
        reachable: reach
      }, extra || {}));
    };
    /* 1) MapDB 里类型 = City 的图（内置种子 + 世界地图 + 边玩边学） */
    MapDB.list().forEach(function (r) { if (r.type === 'City') push(r.id); });
    /* 2) 亲自到过、且有 smith 的图（可能不是 City） */
    MapDB.visitedTowns().forEach(function (r) { push(r.id); });
    /* 3) 传送站城镇清单里还没探索出 id 的照样列出来，只是停用 */
    MapDB.cities().forEach(function (c) {
      /* ★ v2.6.63：传送站城镇清单本来就带 id —— 直接用，别再按名字反查（同名城市会串） */
      const id = c.id ? String(c.id) : cityIdByName(c.name);
      if (id) push(id, { lv: c.lv });
      else push('name:' + c.name, { lv: c.lv, name: c.name, type: 'City', noId: 1 });
    });
    out.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return out;
  }

  /** 用户输入 → { id, name }；支持 "名称"、"编号"、"名称 [编号]" */
  function resolveMapInput(raw) {
    if (!mapDict) return null;
    let s = String(raw || '').trim();
    const b = s.match(/\[(\d+)\]\s*$/);
    if (b) {
      if (mapDict.byId[b[1]]) return { id: b[1], name: mapDict.byId[b[1]] };
      s = s.slice(0, b.index).trim();
    }
    if (/^\d+$/.test(s)) return mapDict.byId[s] ? { id: s, name: mapDict.byId[s] } : null;
    const id = mapDict.byName[normName(s)];
    return id ? { id: id, name: mapDict.byId[id] } : null;
  }

  /** 装备是否损坏。
   *  ★ 只能判计算后的 display，不能判 class：
   *    服务端会按损坏状态渲染 class（坏了就不带 no_display），但**同一张图内**工具刚坏时是客户端
   *    调 damagedEquipmentIndicator(false) → jQuery fadeIn() 写内联 display 显示的，class 里的
   *    no_display 不会移除 —— 两种来源混在一起，只有 computed display 两种情况都准。 */
  function isDamaged() {
    const el = document.getElementById('hud_Equipment');
    return !!el && getComputedStyle(el).display !== 'none';
  }

  /* ======================= 6b. 装备耐久（v1.8.1） =======================
   * 为什么不能只看 #hud_Equipment：它的 tooltip 是「受损的装备 / 破损装备的属性将无法生效」
   * —— 只在「属性失效」时亮。而采集工具（镐/耕耘/斧/钓竿）在还剩几十点时就采不动了，
   * 那个图标根本不亮。所以直接读真实耐久：
   *   ① GET /modal/character：每件已装备物品的 tooltip 里有「耐久度: cur / max」（含全部 4 件工具）
   *   ② 采集弹窗 #gathering_popup #durability / #turns_left：实时值（1 回合 = 2 点耐久，实测）
   * 触发（repairNeeded）—— 只留一个设置 cfg.repairDurPct（「维修阈值(%)」，默认 15）：
   *   'broken' = 游戏自己判定破损（属性失效）—— 比阈值更硬，保留
   *   'low'    = 任一装备的真实耐久 ≤ max × 阈值%
   * ===================================================================== */
  const DUR_CACHE_MS = 30000;
  const TOOL_SLOT_RE = /pick|hoe|axe|rod|tool/i;
  function isToolSlot(s) { return TOOL_SLOT_RE.test(String(s || '')); }
  /* ★ v2.6.53：宠物耐久（Energy）靠食物回，由「自动喂宠」负责，不参与自动维修。
     判定依据：① 槽位 class 含 pet（如 <div class="pet">）；
                ② tooltip 里带游戏自己的 data-name="pet_*" 锚点（和喂食窗口同一套）；
                ③ tooltip 里是「Energy: x / y」（宠物专用，装备都是 Durability）。 */
  const PET_SLOT_RE = /\bpet\b/i;
  function isPetItem(slot, content) {
    if (PET_SLOT_RE.test(String(slot || ''))) return true;
    const c = String(content || '');
    if (/data-name=["']?pet_/i.test(c)) return true;
    return /(?:Energy|能量)\s*[:：]?\s*[\d,]+\s*\/\s*[\d,]+/i.test(c);
  }
  function parseEquipDur(h) {
    const out = [];
    let doc; try { doc = new DOMParser().parseFromString(h, 'text/html'); } catch (e) { return out; }
    Array.prototype.slice.call(doc.querySelectorAll('[onclick]')).forEach(function (el) {
      if (!/inspect\(\s*['"]item['"]/.test(el.getAttribute('onclick') || '')) return;
      const content = el.getAttribute('content') || '';
      const nm = /<h1[^>]*>([^<]*)<\/h1>/.exec(content);
      /* 先按「耐久度/Durability」定位（不同语言都能中），拿不到再退化成第一个 N / M */
      const dm = /(?:\u8010\u4e45\u5ea6|Durability|Haltbarkeit|Durabilidad|Durabilit|Duurzaamheid|\u8010\u4e45)[^0-9]{0,14}([\d,]+)\s*\/\s*([\d,]+)/i.exec(content)
              || /([\d,]+)\s*\/\s*([\d,]+)/.exec(content);
      if (!dm) return;
      const cur = parseInt(String(dm[1]).replace(/,/g, ''), 10);
      const max = parseInt(String(dm[2]).replace(/,/g, ''), 10);
      if (!isFinite(cur) || !isFinite(max) || max <= 0) return;
      const slotEl = el.parentElement;
      const slot = slotEl ? String(slotEl.className || '') : '';
      if (isPetItem(slot, content)) return;   /* ★ v2.6.53：宠物耐久不算装备耐久，不触发自动维修 */
      out.push({ slot: slot, name: nm ? nm[1].trim() : '', cur: cur, max: max });
    });
    return out;
  }
  async function readEquipDur(force) {
    if (!inGame()) return [];
    if (!force && st.dur && now() - st.dur.at < rhythm(DUR_CACHE_MS)) return st.dur.list;
    try {
      const h = await (await fetch('/modal/character', { credentials: 'same-origin' })).text();
      const list = parseEquipDur(h);
      st.dur = { at: now(), list: list };
      return list;
    } catch (e) { return (st.dur && st.dur.list) || []; }
  }
  function refreshEquipDur() {
    if (st.durBusy) return;
    if (st.dur && now() - st.dur.at < rhythm(DUR_CACHE_MS)) return;
    st.durBusy = true;
    readEquipDur(true).then(function () { st.durBusy = false; }, function () { st.durBusy = false; });
  }
  function durWorst(list) {
    let worst = null;
    (list || []).forEach(function (x) {
      const pct = x.max ? x.cur / x.max : 1;
      if (!worst || pct < worst.pct) worst = { name: x.name, slot: x.slot, cur: x.cur, max: x.max, pct: pct };
    });
    return worst;
  }
  /* 采集弹窗里的实时耐久（只在采集时存在）；顺便学习「每回合消耗」 */
  function gatheringActive() {
    const pop = document.getElementById('gathering_popup');
    return !!pop && getComputedStyle(pop).display !== 'none';
  }
  /* ★ v2.6.15：弹窗开着 ≠ 真在采（服务端没确认位置时窗口会开、进度条却不转）。
     用 #turns_left / #durability 是否在变来判断「进度真的在走」。 */
  let _gatherProg = { key: '', at: 0 };
  function gatheringTurning() {
    const pop = document.getElementById('gathering_popup');
    if (!pop || getComputedStyle(pop).display === 'none') { _gatherProg = { key: '', at: 0 }; return false; }
    const t = document.getElementById('turns_left'), d = document.getElementById('durability');
    const key = (t ? String(t.textContent).trim() : '') + '/' + (d ? String(d.textContent).trim() : '');
    if (key !== _gatherProg.key) { _gatherProg = { key: key, at: now() }; return true; }
    return (now() - _gatherProg.at) < 30000;   /* 30 秒没变化 → 认为进度没在走 */
  }
  /* ★ v2.6.15：站在采集点上「开始 / 重新开始采集」必须走游戏自己的 execTileAction('gathering')
     （内部 → collectGathering()）。只 createDialog('/modal/gathering') 会开弹窗但进度条不转。 */
  function startGatheringHere() {
    const seq = runSeq;
    const alive = function () { return running && runSeq === seq; };
    if (!alive()) return false;
    try {
      if (typeof window.execTileAction === 'function') {
        humanDefer(function () { try { window.execTileAction('gathering'); } catch (e) { /* ignore */ } }, alive);
        return true;
      }
      if (typeof window.createDialog === 'function') {
        humanDialog('Gathering', '', 'ajax', '/modal/gathering', true, alive);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }
  function gatherDurNow() {
    if (!gatheringActive()) return null;
    const d = document.getElementById('durability');
    if (!d) return null;
    const cur = parseInt(String(d.textContent || '').replace(/[^\d]/g, ''), 10);
    if (!isFinite(cur)) return null;
    const t = document.getElementById('turns_left');
    const turns = t ? parseInt(String(t.textContent || '').replace(/[^\d]/g, ''), 10) : NaN;
    const turnsOk = isFinite(turns) ? turns : null;
    const prev = st.gatherDur;
    const cost = (turnsOk && turnsOk > 0) ? Math.max(1, Math.round(cur / turnsOk)) : ((prev && prev.cost) || 2);
    st.gatherDur = { cur: cur, turns: turnsOk, cost: cost, at: now() };
    return st.gatherDur;
  }
  /* 最近一次的采集耐久读数（弹窗关了也能用 3 分钟） */
  function lastGatherDur() {
    const g = gatherDurNow();
    if (g) return g;
    return (st.gatherDur && now() - st.gatherDur.at < 180000) ? st.gatherDur : null;
  }
  /* 需要维修吗？返回原因（'' = 不需要）
   * ★ v1.8.1：只留一个判据 —— 真实耐久 ≤ 维修阈值(%) 就去修。
   *   另外保留游戏自己的「破损（属性失效）」信号：它比阈值更硬，不会误报。 */
  function repairNeeded() {
    if (isDamaged()) return 'broken';
    const list = (st.dur && st.dur.list) || [];
    const w = durWorst(list);
    if (w && w.pct <= Math.max(1, jitterVal(+cfg.repairDurPct || 15)) / 100) return 'low';
    return '';
  }
  const REPAIR_REASON_CN = { broken: '装备破损（属性失效）', low: '耐久低于维修阈值' };
  function durText() {
    const g = lastGatherDur();
    const w = durWorst(st.dur && st.dur.list);
    const bits = [];
    if (g) bits.push('采集中工具 ' + g.cur + (g.turns != null ? '（' + g.turns + ' 回合）' : ''));
    if (w) bits.push('最低 ' + w.name + ' ' + w.cur + '/' + w.max + '（' + Math.round(w.pct * 100) + '%）');
    return bits.join(' · ');
  }

  /* ★ v2.6.104：删掉「按地图名找门」的旧引擎（findGateTo / gotoMap）。
     现在所有换图都走模块 A：navToMap()（用门坐标而不是名字）。 */

  /* 可维修的工匠只认名字里带 smith 的：Armorsmith / Weaponsmith / Toolsmith。
   * Stonemason（石匠）名字里没有 smith，不能维修，必须排除。 */
  function isRepairSmith(el) {
    const nm = el.getAttribute('name') || '', act = el.getAttribute('action') || '';
    return /smith/i.test(nm) || /smith/i.test(act);
  }

  function findSmith() {
    if (!inGame()) return null;
    let best = null, bd = Infinity;
    $$q('.map_table .tile_poi[action]').forEach(el => {
      if (!isRepairSmith(el)) return;
      const act = el.getAttribute('action') || '';
      const c = (el.getAttribute('coords') || '').split('-');
      const x = parseInt(c[0], 10), y = parseInt(c[1], 10);
      if (!isFinite(x) || !isFinite(y)) return;
      const d = manhattan(character.x, character.y, x, y);
      if (d < bd) { bd = d; best = { x: x, y: y, action: act, name: el.getAttribute('name') || act }; }
    });
    return best;
  }

  /* ★ 2026-10-17 仓库（银行）：新前端没有独立的 stash 格了，改成银行 NPC（action=bank）。
     实例：El Caspar 20-32。弹窗 /modal/bank → frame_Bank，里面有「快速存入」按钮
     （onclick=stackTobank()，实际就是 POST /includes/ajax_inventory.php {type:'Stack',value:'stash'}）。 */
  function findBank() {
    if (!inGame()) return null;
    let best = null, bd = Infinity;
    $$q('.map_table .tile_poi[action]').forEach(el => {
      if ((el.getAttribute('action') || '') !== 'bank') return;
      const c = (el.getAttribute('coords') || '').split('-');
      const x = parseInt(c[0], 10), y = parseInt(c[1], 10);
      if (!isFinite(x) || !isFinite(y)) return;
      const d = manhattan(character.x, character.y, x, y);
      if (d < bd) { bd = d; best = { x: x, y: y, action: 'bank', name: el.getAttribute('name') || '银行' }; }
    });
    return best;
  }

  /* ======================= 12. 维修 / 清包 ======================= */

  const WALK_TIMEOUT_MIN = 25000;
  const WALK_MS_PER_TILE = 900;
  const WALK_TIMEOUT_PAD = 15000;
  const REPAIR_VERIFY = 5000;
  /* 兜底[休整] 冷却（成功/失败都冷却，避免刚回来又出发来回打转）：
     REPAIR_COOLDOWN    维修失败 → 60s 内不再出发
     REPAIR_OK_COOLDOWN 维修成功 → 20s 内不再出发（损坏图标消失有延迟） */
  const REPAIR_COOLDOWN = 60000;
  const REPAIR_OK_COOLDOWN = 20000;

  function walkTimeoutFor(tx, ty) {
    if (!inGame()) return WALK_TIMEOUT_MIN;
    return Math.max(WALK_TIMEOUT_MIN, manhattan(character.x, character.y, tx, ty) * WALK_MS_PER_TILE + WALK_TIMEOUT_PAD);
  }

  /** 行程（自动维修 / 手动去维修点 / 自动清包 / 手动清包）是否应继续 */
  function tripAlive() {
    if (st.tripManual) return true;
    if (st.sell.force) return true;
    if (st.bank.force) return true;                 /* ★ 手动存仓 */
    if (!(st.repair.active || st.sell.active || st.bank.active)) return false;
    if (!running) return false;
    /* ★ v2.6.49：统一「回城休整」行程会同时置三个 active，但配置里可能只开了其中一两项 ——
       只要「还开着的任一项」在跑就继续；三项全关才中止。 */
    return !!(cfg.repairOn || cfg.sellOn || cfg.autoDeposit);
  }


  /* ======================= 12a. 统一走格引擎（维修行程 / 跨图导航共用） =======================
   * 走到 (gx,gy) 并等待条件成立，返回 'ok' | 'timeout' | 'cancel'。
   * 它是模块 B navWalkTile() 的引擎：脚本里所有「在一张图内移动」都经过 navWalkTile() 到这里。
   * 避免两套「走到格 + 卡住自愈」逻辑各自演进而分叉。
   * opts:
   *   cond()      条件成立即成功（默认：站到目标格）
   *   alive()     返回 false 立即中止（cancel）
   *   timeoutMs   超时（战斗 / 挡路弹窗 / 阵亡等待不计入）
   *   retrigger   站到目标格后条件仍不成立时，走开一格再走回（重触发门/事件），默认 false
   *   combatText  战斗等待期间的状态栏文案（可选）
   *   onStuck()   卡住自愈（默认 nudgeRecover）
   */
  async function walkTileCore(gx, gy, opts) {
    opts = opts || {};
    if (!inGame()) return 'cancel';
    const timeoutMs = opts.timeoutMs || WALK_TIMEOUT_MIN;
    const cancelSeq = navCancelSeq;
    const callerAlive = opts.alive || function () { return true; };
    const alive = function () { return cancelSeq === navCancelSeq && callerAlive(); };
    const cancel = function () { if (cancelSeq === navCancelSeq) { try { abortWalk(); } catch (e) {} } return 'cancel'; };
    if (!alive()) return 'cancel';
    const cond = opts.cond || function () { return character.x === gx && character.y === gy; };
    const retrigger = !!opts.retrigger;
    const onStuck = opts.onStuck || nudgeRecover;
    /* ★ v2.6.156：导航途中也要等自动回血。由调用方注入（navWalkTile 传 supply）；
       返回 true = 正在补血/补蓝 → 原地等，别继续走。默认不启用，保持 walkTileCore 的纯粹性。 */
    const heal = (typeof opts.heal === 'function') ? opts.heal : function () { return false; };
    let from = null;
    try { from = character.current_map; } catch (e) { return 'cancel'; }
    const onTile = function () { return character.x === gx && character.y === gy; };
    const mapChanged = function () { return character.current_map !== from; };
    const pts = window.points || [];
    /* ★ v2.6.120：邻格也用 8 邻接（和游戏一致）；顺序仍是「右→左→下→上→斜」，stepAside 取第一个可走格的行为不变。 */
    const nb = function (x, y) { return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x + 1, y - 1], [x - 1, y + 1], [x - 1, y - 1]]
      .filter(function (p) { return pts.some(function (q) { return q.x === p[0] && q.y === p[1]; }); }); };
    const stepAside = async function () {
      if (!alive()) return;
      const n = nb(character.x, character.y)[0];
      if (n) { try { safeWalkTo(n[0], n[1]); } catch (e) { /* ignore */ } await sleep(2600); }
    };
    /* ★ v2.6.129：分段导航改成「两段式」——长距离移动时，先走到目标「前一格」停下喘口气，再走到目标点位。
       触发：本次移动开始时，角色到目标的曼哈顿距离 > cfg.navSegDist（「多少格算长距离」）。
       原理：服务器把整条路径放在 window.walkQueue[charId]；角色贴着目标（曼哈顿 ≤1）时
             abortWalk 停下 → 随机停顿 → 再 walkTo(同一目标)。停下的位置本来就在服务器原路径上，
             重新请求得到同一条剩余路线 → 路线不变。
       注：走路期间游戏把 can_travel 置 false，中途重新请求会被丢弃，所以必须「先停再请求」。 */
    const segOn = function () { return !!cfg.navSegOn && !retrigger; };
    const segDist = function () { return Math.max(3, Math.round(+cfg.navSegDist || 5)); };
    const onPoiTile = function () {
      try { const k = character.x + '-' + character.y;
        return $$q('.map_table .tile_poi').some(function (el) { return (el.getAttribute('coords') || '') === k; }); } catch (e) { return false; }
    };
    let seg = null;   /* null = 本次移动不走两段式；{dist0} = 已武装，等角色贴到目标前一格 */
    let segDone = false;   /* ★ v2.6.130：两段式的第二段（走向目标点位）已发出 → 到位后要确认动作是否触发 */

    /* ★ v2.6.130：两段式导航到位后，若目标格有 action 但没触发，走开一格再走回重触发。
       根因：两段式会在目标前一格 abortWalk()（清掉 character.walk_to），若这次清空正好落在
       目标格上，游戏就不会执行 execTileAction（见上方「兜底[到位没触发 action]」）→ 动作点不开。
       这里在「两段式到位」后主动确认一次，没触发就走开一格再走回（最多 2 次）。 */
    const actionOpened = function (act) {
      if (arriveActionFired(act)) return true;
      const ids = ['frame_Gate', 'frame_Quest', 'frame_SmugglersRoute', 'frame_CollectScrap', 'frame_Scavenge', 'frame_Gathering'];
      for (let i = 0; i < ids.length; i++) if (hasFrame(ids[i])) return true;
      return false;
    };
    const settleArriveAction = async function () {
      if (!segDone) return;                                  /* 只有两段式才确认 */
      if (!tileActionAt(gx, gy)) return;                     /* 目标格没有 action → 不用管 */
      for (let k = 0; k < 2; k++) {
        await sleep(ARRIVE_ACTION_MS);
        if (!alive() || !inGame() || !onTile()) return;
        const act = tileActionAt(gx, gy);
        if (!act || actionOpened(act)) return;
        logEvent('两段式到位没触发动作（' + act + ' @' + gx + '-' + gy + '）→ 走开一格再走回');
        setStatus('到位没触发动作，走开再走回重触发…');
        await stepAside();
        if (!alive()) return;
        try { safeWalkTo(gx, gy); } catch (e) { /* ignore */ }
        await sleep(1200);
      }
    };

    const blockers = ['frame_Quest', 'frame_CollectScrap', 'frame_Scavenge', 'frame_Gate'];
    const clearBlockers = function () {
      for (let i = 0; i < blockers.length; i++) {
        const el = document.getElementById(blockers[i]);
        /* ★ 用非 force 版：一样能关掉 frame_Quest / frame_Gate 这些挡路的弹窗，
             但会跳过玩家自己手动打开的窗口（邮箱/公会/活动/商店…） */
        if (el) { try { if (typeof window.closeFrames === 'function') window.closeFrames(); else el.remove(); } catch (e) { try { el.remove(); } catch (e2) { /* ignore */ } } return true; }
      }
      return false;
    };

    /* ★ 入口先复位 can_travel / 清残留 walk_to：否则第一次 walkTo 可能是 no-op（can_travel 卡 false），
       要白等一轮卡住自愈才恢复。 */
    try { abortWalk(); } catch (e) { /* ignore */ }
    if (retrigger && onTile()) await stepAside();
    if (!alive()) return cancel();
    /* ★ v2.6.129：只有「长距离」移动才启用两段式 */
    if (segOn()) {
      const d0 = Math.abs(character.x - gx) + Math.abs(character.y - gy);
      if (d0 > segDist()) seg = { dist0: d0 };
    }
    /* ★ v2.6.134：入口立刻发一次走位。
       原来这里没有发走位，第一次 walkTo 要等 2.5s 的「重发走路指令」兜底才发出：
       既白白卡 2.5s，而且那次重发会清掉两段式标记（seg=null）→ 分段导航永远不生效。 */
    if (!cond()) { try { safeWalkTo(gx, gy); } catch (e) { /* ignore */ } }

    /* ★ 走到目标格后先原地同步一次服务端位置，再交给调用方做交互（换图/采集/维修） */
    const okOut = function () { syncServerPos(); return 'ok'; };
    /* ── 兜底[导航卡住]（本函数内部，与 checkStuck / checkFrozen 相互独立）──────
     * 症状：走到一半不动了 / 位置长时间不变。
     * 判据：lastMove 超过阈值仍无位移；或 2.5s 没进展且没到格、没换图。
     * 动作：onStuck()（默认 nudgeRecover）+ 重发 walkTo；顺带关掉挡路的弹窗。
     * 上限：本函数超时（默认 25s + 距离×900ms）或 paused > 5 分钟 → 放弃返回。
     * 高级参数：分段导航（只影响 retrigger:false 的调用点）。
     * ─────────────────────────────────────────────────────────── */
    const t0 = now();
    let paused = 0, lastTry = 0, lastPos = '', lastMove = now(), bestD = 1e9, bestAt = now(), stuck = 0, blocked = 0, scavWait = 0;
    /* ★ paused 上限：避免“永远在等”（死循环） —— 真实时间超过 timeoutMs 且 paused 也超过 5 分钟就放弃 */
    while (now() - t0 - paused < timeoutMs && paused < 300000) {
      if (!alive()) return cancel();
      if (cond()) { await settleArriveAction(); return alive() ? okOut() : cancel(); }
      if (!inGame()) return 'cancel';

      /* 阵亡：点复活，等待期间不计入超时 */
      const df = document.getElementById('battle_defeat');
      if (df) { const b = df.querySelector('button'); if (b) { try { humanClick(b); } catch (e) { /* ignore */ } } paused += 4000; await sleep(4000); continue; }
      /* ★ v2.6.156：低于补血/补蓝阈值 → 喝药并原地等补到阈值，再继续导航（不计入超时）。 */
      if (heal()) { paused += 300; await sleep(300); continue; }
      /* 战斗中：交给游戏自动战斗，等待期间不计入超时 */
      if (hasFrame('frame_Combat')) { if (opts.combatText) setStatus(opts.combatText); paused += 900; await sleep(900); continue; }
      /* ★ v2.6.107 修复「导航途中击杀怪物后永久卡死」：
         实测根因 —— 导航中打死怪 → 游戏弹出 #frame_Loot，而导航期间主循环被 navBusy 挡住、
         没人去关这个窗；原来的写法只是 `await sleep(500); continue;`（不关窗、不超时、paused 不累加）
         → 整个 walkTileCore 无限空转，角色原地卡死 20 分钟（实测 map 22 / map 41 多次复现）。
         现在：frame_Loot → 主动 takeAllLoot()（点「全部拾取」，15s 拿不完会自动关窗）；
              frame_Scavenge → 等游戏自动搜刮，但给 30s 上限，超时强关。 */
      if (hasFrame('frame_Loot')) {
        try { takeAllLoot(); } catch (e) { /* ignore */ }
        paused += 500; await sleep(500); continue;
      }
      if (hasFrame('frame_Scavenge')) {
        scavWait += 500;
        if (scavWait > 30000) { try { closeFrameById('frame_Scavenge'); } catch (e) { /* ignore */ } scavWait = 0; }
        paused += 500; await sleep(500); continue;
      }
      /* 挡路弹窗：关掉（非 force 版，保留玩家自己开的窗口）
         ★ 但同一个弹窗反复出现（例如站在门格上时门弹窗一直重开）会让 paused 永远跟着真实时间增长 →
            整个循环永不超时、角色永远卡住。这里限制连续清弹窗次数，超了就当卡住返回。 */
      if (clearBlockers()) {
        if (++blocked > 40) { try { abortWalk(); } catch (e) { /* ignore */ } return 'timeout'; }
        try { abortWalk(); } catch (e) { /* ignore */ } paused += 700; await sleep(700); continue;
      }
      blocked = 0;

      const pos = character.x + ',' + character.y;
      if (pos !== lastPos) { lastPos = pos; lastMove = now(); }
      if (onTile()) {
        if (!retrigger) { await settleArriveAction(); return alive() ? okOut() : cancel(); }   /* 非重触发：站上目标格即成功 */
        if (cond()) return okOut();
        break;                                       /* 重触发：已到门口但条件未成立 → 跳出，走开再走回 */
      }
      const d = Math.abs(character.x - gx) + Math.abs(character.y - gy);
      if (d < bestD) { bestD = d; bestAt = now(); }
      /* ★ 卡住自愈：位置长时间不变 / 长时间无进展 → 复位 can_travel + 朝几个邻近格各点一次 */
      if (now() - lastMove > 6000 || now() - bestAt > 12000) {
        lastMove = now(); bestAt = now(); stuck++;
        if (retrigger) setStatus('导航卡住，正在强恢复（第 ' + stuck + ' 次）…');
        try { onStuck(); } catch (e) { try { abortWalk(); } catch (e2) { /* ignore */ } }
        /* ★ v2.6.134：卡住自愈不清 seg（新设计是几何判据，不依赖队列），否则两段式会被永久关掉 */
        await sleep(retrigger ? 1600 : 1500);
        continue;
      }
      /* ★ v2.6.129：两段式分段导航 —— 贴到目标「前一格」（曼哈顿 ≤1）就停下、喘口气、再走到目标点位 */
      if (mapChanged()) seg = null;
      if (seg && !onTile() && !onPoiTile() && (Math.abs(character.x - gx) + Math.abs(character.y - gy)) <= 1) {
        seg = null;
        try { abortWalk(); } catch (e) { /* ignore */ }
        const p0 = now();
        logEvent('分段到站：' + character.x + '-' + character.y + ' → ' + gx + '-' + gy + '，停顿 ' + Math.max(0, Math.round(+cfg.navSegPauseMs || 0)) + 'ms');
        setStatus('分段导航：到目标前一格，停顿中…');
        /* ★ v2.6.133：段间停顿 = 固定值（默认 300ms，不随机）。 */
        await sleep(Math.max(0, Math.round(+cfg.navSegPauseMs || 0)));
        paused += now() - p0;
        if (!alive()) return cancel();
        lastMove = now(); bestAt = now();                     /* 别把停顿误判成卡住 */
        safeWalkTo(gx, gy);
        segDone = true;                                       /* ★ v2.6.130：第二段已发出 */
        await sleep(500);
        continue;
      }
      /* 重发走路指令的两个禁区：
       * 1) 已经站在目标格上 —— 对传送门来说重复请求同一格会再次触发该门，表现是「刚换图又被弹回去」
       * 2) 已经换过图了 —— 旧地图的坐标在新地图上指向完全不同的地方
       * ★ 只在「位置真的不动了」才重发：无条件重发会 clearQueue 打断正在播的走格动画 */
      const stalled = now() - lastMove > 2500;
      if (!onTile() && !mapChanged() && stalled && now() - lastTry > 2000) { lastTry = now(); safeWalkTo(gx, gy); }
      await sleep(300);
    }
    /* 重触发场景：站到目标格但条件仍未成立 → 走开一格再走回，试几次（门要重踩才触发） */
    if (retrigger && onTile() && !cond()) {
      for (let k = 0; k < 3; k++) {
        for (let w = 0; w < 9; w++) { await sleep(700); if (!alive()) return cancel(); if (cond()) return okOut(); clearBlockers(); }
        await stepAside();
        if (!alive()) return cancel();
        try { safeWalkTo(gx, gy); } catch (e) { /* ignore */ }
        for (let w = 0; w < 9; w++) { await sleep(700); if (!alive()) return cancel(); if (cond()) return okOut(); }
      }
    }
    try { abortWalk(); } catch (e) { /* ignore */ }
    return 'timeout';
  }

  /* ★ v2.6.104：维修/清包行程的走格统一走模块 B navWalkTile()（见下方「模块 B」）。 */

  /* ★ v2.6.96：当前生效的「维修/清包城镇」。
     副角色行程中（st.altTrip）**只用该副角色自己的 serviceTown**，绝不回落到主角色的全局设置；
     其余情况（主角色 / 手动行程）用主角色的全局设置 cfg.serviceTown。
     —— 修掉「副角色没设城镇时会跑去主角色的维修城镇」这个串味 bug。 */
  function activeServiceTown() {
    return st.altTrip ? String(st.tripTown || '') : String(cfg.serviceTown || '');
  }

  async function resolveRepairRoute() {
    await getMapDict();
    // ★ 选了城镇：路线由跨图导航自动算（travelToRepairPoint 会走 nav 过去）
    // ★ 多角色：副角色用自己的城镇（activeServiceTown）
    const townId = activeServiceTown();
    if (townId) {
      navLearn();
      const plan = navRoute(character.current_map, +townId);
      if (!plan) {
        /* ★ v2.6.86：没有步行路线 ≠ 到不了 —— 勾了传送点的话，travelToRepairPoint 会走 navToMap 用传送点过去，
           所以这里只在「既没步行路线、传送点也用不了」时才报错。返回的占位路线在选了城镇时会被忽略。 */
        if (!waygateReachable(townId)) throw new Error('暂无到「' + townName(townId) + '」的路线（该区域还没探索过，先手动走一趟让插件学习；也可勾选「城市/野外传送点」）');
        return [{ id: String(townId), name: navMapName(townId) }];
      }
      return plan.map(id => ({ id: String(id), name: navMapName(id) }));
    }
    const lines = parseLines(cfg.repairPath);
    if (!lines.length) throw new Error('未选择休整城镇，请到「休整」页选一个');
    const route = [];
    for (const line of lines) {
      const r = resolveMapInput(line);
      if (!r) throw new Error('路径中无法识别的地图：' + line);
      route.push(r);
    }
    return route;
  }

  /* ★ v2.6.104：维修/清包目标格 —— 统一走模块 B navWalkTile() */
  async function walkToSpot(tx, ty, what) {
    setStatus('前往 ' + what + '（' + tx + '-' + ty + '）');
    let rs = await navWalkTile(tx, ty, {
      cond: function () { return character.x === tx && character.y === ty; },
      timeoutMs: walkTimeoutFor(tx, ty),
      alive: tripAlive,
      combatText: '维修途中遭遇战斗，等待游戏自动战斗…'
    });
    if (rs === 'cancel') return 'cancel';
    /* 目标格可能被占住：停在紧邻的一格也算到达（服务器只要求相邻） */
    if (rs === 'timeout' && manhattan(character.x, character.y, tx, ty) <= 1) { abortWalk(); rs = 'ok'; }
    if (rs === 'timeout') throw new Error('走到 ' + what + ' 超时（目标格 ' + tx + '-' + ty + '）');
    abortWalk();
    return 'ok';
  }

  /* ★ v2.6.104：维修/清包行程的「到目标地」—— 统一走模块 A navToMap()。
     有选城镇 → 导航到城镇（副角色用自己的）；没选 → 用 route 的最后一站。 */
  async function travelToRepairPoint(route, kind) {
    const isBank = (kind === 'bank');
    const svcTown = activeServiceTown();
    const target = svcTown ? { id: String(svcTown), name: townName(svcTown) } : (route && route.length ? route[route.length - 1] : null);
    if (!target) throw new Error('未选择维修/清包城镇');
    if (!inGame()) return 'cancel';
    st.tripOrigin = character.current_map;
    if (String(character.current_map) !== String(target.id)) {
      setStatus('导航前往「' + target.name + '」…');
      const ok = await navToMap(+target.id, { alive: tripAlive });
      if (!ok) {
        if (!tripAlive()) return 'cancel';
        throw new Error('无法导航到「' + target.name + '」（路线缺失或中途失败；先手动走一趟让插件学习路线）');
      }
    }
    setStatus('已到达「' + currentMapName() + '」，寻找 ' + (isBank ? '银行' : 'smith') + '…');
    const smith = isBank ? findBank() : findSmith();
    if (!smith) throw new Error(isBank ? ('「' + currentMapName() + '」找不到银行（换个城镇试试）')
                                            : ('「' + currentMapName() + '」找不到可维修的 smith（需要名字里带 smith 的工匠）'));
    const rs = await walkToSpot(smith.x, smith.y, smith.name);
    if (rs === 'cancel') return 'cancel';
    st.repair.smith = smith;
    return 'ok';
  }

  /* ★ v2.6.104：返程 —— 统一走模块 A navToMap() */
  async function travelBack(route) {
    const home = +(st.tripHome || cfg.farmMap || st.tripOrigin || 0);
    if (home && String(character.current_map) !== String(home)) {
      setStatus('返程：导航回「' + townName(home) + '」…');
      await navToMap(home, { alive: tripAlive });
    }
    abortWalk();
    return 'ok';
  }

  function landingNote() {
    if (!st.tripOrigin || !inGame()) return '';
    if (String(character.current_map) === String(st.tripOrigin)) return '';
    return '（注意：这里不是出发地图，请把「休整」页路径第一行写成出发地图）';
  }

  /** 触发维修：优先点游戏原生菜单项（只有原生调用会执行返回脚本里的状态刷新） */
  function invokeRepair(action, scope) {
    // ★ 修 bug：原版用 document.querySelector('a[onclick*="?repair"]') 全局找，
    //    可能命中别的窗口里的链接。这里优先在 smith 自己的窗口里找。
    // ★ 2026-10 新前端：smith 菜单换成 tab，维修页是 /modal/<npc>/repair（不再是 ?repair）。
    const root = scope || document;
    const link = root.querySelector('a[onclick*="/repair"], a[onclick*="?repair"]') || document.querySelector('a[onclick*="/repair"], a[onclick*="?repair"]');
    if (link) { humanClick(link); return true; }
    try {
      if (typeof window.createDialog === 'function') {
        humanDialog(action.charAt(0).toUpperCase() + action.slice(1), '', 'ajax', '/modal/' + action + '/repair', true);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  async function verifyRepaired(ms) {
    const deadline = now() + ms;
    while (now() < deadline) {
      if (!isDamaged()) { try { await readEquipDur(true); } catch (e) { /* ignore */ } return true; }
      if (!tripAlive()) return false;
      await sleep(400);
    }
    return false;
  }

  /** 可靠打开 smith 的某个子页：page='' 主菜单 / 'sell' / 'salvage' / 'repair'。
   *  ★ 游戏 walkTo 的 closeFrames 会留下「空壳 frame」，此时 createDialog 不会重载 —— 先关掉再重开。
   *  返回 frame 元素（成功）或 null。 */
  async function ensureSmithFrame(smith, page, readyCheck, timeoutMs) {
    const title = smith.action.charAt(0).toUpperCase() + smith.action.slice(1);
    const fid = 'frame_' + title;
    const url = '/modal/' + smith.action + (page ? '/' + page : '');
    const deadline = now() + (timeoutMs || 10000);
    let lastOpen = 0;
    while (now() < deadline) {
      if (!tripAlive()) return null;
      if (readyCheck()) return document.getElementById(fid);
      const f = document.getElementById(fid);
      const content = f && f.querySelector('.frame-content');
      const empty = !f || !content || content.classList.contains('loading');
      if (empty) {
        if (now() - lastOpen > 1200) {
          if (f) { try { closeFrameById(fid); } catch (e) { /* ignore */ } await sleep(250); }
          try { if (typeof window.createDialog === 'function') window.createDialog(title, '', 'ajax', url, true); } catch (e) { /* ignore */ }
          lastOpen = now();
        }
      } else if (page) {
        const link = f.querySelector('a[onclick*="/' + page + '"]');
        if (now() - lastOpen > 1200) {
          if (link) { try { link.click(); } catch (e) { /* ignore */ } }
          else {
            /* ★ v2.6.78：sell / salvage / repair 三个子页之间**没有互相跳转的链接**
               （实测三个页面里 /sell、/salvage、/repair 的出现次数都是 0，只有 smith 主菜单有）。
               若 frame 已经停在别的子页（例如上一次清包留下的收购页），「点链接」这条路走不通 →
               会一直空转到超时，报「没打开 XXX 的拆解界面」。这里直接关掉重开目标子页。 */
            try { closeFrameById(fid); } catch (e) { /* ignore */ }
            await sleep(250);
            try { if (typeof window.createDialog === 'function') window.createDialog(title, '', 'ajax', url, true); } catch (e) { /* ignore */ }
          }
          lastOpen = now();
        }
      }
      await sleep(300);
    }
    return readyCheck() ? document.getElementById(fid) : null;
  }

  async function ensureSmithDialog(smith) {
    const f = await ensureSmithFrame(smith, '', function () {
      return !!document.querySelector('a[onclick*="/sell"], a[onclick*="/repair"], a[onclick*="/salvage"]');
    }, 12000);
    return !!f;
  }

  /* ======================= 11b. 游戏 AJAX 接口（不点 DOM，不受语言影响） =======================
   * ★★ 2026-10-17 新前端：修理/出售/回收/存取都有干净的 HTTP 接口（从游戏自己的
   *   smithing.js / inventory.min.js 里读出来的，已实测）：
   *     · 修理  POST /includes/ajax_repair.php    {ids, item_ids, locs}   （均为 JSON 字符串）
   *     · 回收  POST /includes/ajax_salvage.php   {ids}
   *     · 鉴定  POST /includes/ajax_identify.php  {ids}
   *     · 出售  POST /includes/ajax_item_buy_sell.php {type:'sell', item:<res>, amount:N}
   *     · 存包  POST /includes/ajax_inventory.php  {type:'DepositResource', value:<res>, to:null, slot_id:<slotid>}
   *     · 取出  POST /includes/ajax_inventory.php  {type:'Split', value:<res>, to:<数量>}
   *   所有 POST 都要带 csrf_token=<window.NORROTH_CSRF_TOKEN>（游戏用 $.ajaxPrefilter 自动加）
   *   以及 X-Requested-With: XMLHttpRequest，否则返回 403 「安全性检查失败」。
   *   ★ 用接口的好处：不用等内联脚本、不用点按钮、不会因为按钮文案被本地化而失败。
   *   下面的实现都是「先走接口，失败再回退到点 DOM」。 */
  function nrCsrf() { try { return window.NORROTH_CSRF_TOKEN || ''; } catch (e) { return ''; } }
  async function nrPost(url, data) {
    const body = new URLSearchParams();
    Object.keys(data || {}).forEach(function (k) { if (data[k] != null) body.append(k, String(data[k])); });
    const tk = nrCsrf(); if (tk) body.append('csrf_token', tk);
    const r = await fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
      body: body.toString()
    });
    const txt = await r.text();
    let json = null; try { json = JSON.parse(txt); } catch (e) { /* xml */ }
    const err = (json && json.error) || ((/error="([^"]*)"/.exec(txt) || [])[1] || '');
    return { ok: r.status === 200 && !err, status: r.status, text: txt, json: json, error: err || '' };
  }
  /* 修理：读到待修行后直接 POST /includes/ajax_repair.php */
  async function apiRepairRows(list) {
    const rows = Array.prototype.slice.call(list.querySelectorAll('.smithing_bulk_row'));
    if (!rows.length) return { ok: false, empty: true };
    const ids = [], itemIds = [], locs = [];
    rows.forEach(function (r) {
      ids.push(r.getAttribute('data-id')); itemIds.push(r.getAttribute('data-itemid')); locs.push(r.getAttribute('data-location'));
    });
    const res = await nrPost('/includes/ajax_repair.php', { ids: JSON.stringify(ids), item_ids: JSON.stringify(itemIds), locs: JSON.stringify(locs) });
    return { ok: res.ok, rows: rows.length, error: res.error, text: res.text };
  }

  /* 仓库（银行）：存入 / 取出。存包需要背包格子的 slotid（slot_id 属性）。 */
  async function stashDeposit(res, slotId) {
    return await nrPost('/includes/ajax_inventory.php', { type: 'DepositResource', value: res, to: null, slot_id: slotId });
  }
  async function stashWithdraw(res, amount) {
    return await nrPost('/includes/ajax_inventory.php', { type: 'Split', value: res, to: Math.max(1, parseInt(amount, 10) || 1) });
  }
  /* 仓库里某个资源现在有多少（只读 /modal/bank，不开窗） */
  async function stashCount(res) {
    try {
      const h = await (await fetch('/modal/bank', { credentials: 'same-origin' })).text();
      const blk = h.split('class="stash_slot').slice(1).find(function (b) { return new RegExp('res="' + res + '"').test(b); });
      if (!blk) return 0;
      const m = /<span>([\d,]+)<\/span>/.exec(blk);
      return m ? (parseInt(m[1].replace(/,/g, ''), 10) || 0) : 1;
    } catch (e) { return -1; }
  }

  /* 等 smith 页面的内联脚本就绪（toggleAllSmithingRows / repairAllItems / salvageAllItems）。
     游戏把 modal 的 <script> 抽出来单独跑，所以「元素已在、函数还没定义」是正常现象。 */
  async function waitSmithingReady(ms) {
    const deadline = now() + (ms || 2500);
    while (now() < deadline) {
      if (typeof window.repairAllItems === 'function' || typeof window.toggleAllSmithingRows === 'function') return true;
      if (!tripAlive()) return false;
      await sleep(150);
    }
    return false;
  }

  /** smith 自己的窗口（找不到就返回 null） */
  function smithScope(smith) {
    if (!smith || !smith.action) return null;
    return document.getElementById('frame_' + smith.action.charAt(0).toUpperCase() + smith.action.slice(1));
  }

  /** 触发维修并确认生效。返回 'ok' | 'none' | 'fail' | 'cancel'
   *  menuOnly = 只认菜单里的维修项：菜单没有就直接 'none'，不发那个有副作用的 /modal/x?repair，避免「没坏也被扣钱」 */
  async function repairAtSmith(smith, menuOnly) {
    const scope = smithScope(smith);
    // ★ 2026-10 新前端：维修页是勾选式列表（#repair_items_list），
    //    全选 = #btn-toggle-repair（toggleAllSmithingRows('repair')），
    //    维修 = #btn-repair-all（repairAllItems()）。旧的 ?repair 链接已不存在。
    if (!invokeRepair(smith.action, scope)) return menuOnly ? 'none' : 'fail';
    let list = null; const dl = now() + 6000;
    while (now() < dl) {
      if (!tripAlive()) return 'cancel';
      list = document.getElementById('repair_items_list');
      if (list) break;
      await sleep(200);
    }
    if (!list) return 'fail';
    if (!list.querySelector('.smithing_bulk_row')) return 'none';   // 没有可修项 → 服务端判定无需维修
    /* ★ 2026-10-17 优先走接口：直接 POST /includes/ajax_repair.php（不点按钮、不等内联脚本） */
    for (let i = 0; i < 2; i++) {
      if (!tripAlive()) return 'cancel';
      try {
        const api = await apiRepairRows(list);
        if (api.empty) return 'none';
        if (api.ok) { await sleep(600); if (await verifyRepaired(REPAIR_VERIFY)) return 'ok'; }
      } catch (e) { /* 接口不可用 → 走下面的 DOM 回退 */ }
      if (i === 1) break;
    }
    for (let i = 0; i < 2; i++) {
      if (!tripAlive()) return 'cancel';
      /* ★ 2026-10-17：维修页的按钮 onclick 是内联脚本（toggleAllSmithingRows / repairAllItems），
         而游戏是「先塞 HTML、再跑内联脚本」，中间有个窗口期——直接点会报
         "toggleAllSmithingRows is not defined"，一个钩都没打上（所以维修不生效）。
         这里改成：① 先等内联函数就绪；② 直接勾 .smithing_pick 复选框（不依赖那个按钮）。 */
      await waitSmithingReady(2500);
      const picks = list.querySelectorAll('input.smithing_pick');
      for (let k = 0; k < picks.length; k++) {
        if (picks[k].checked) continue;
        humanClick(picks[k]);
      }
      await sleep(400);
      const all = document.getElementById('btn-repair-all');
      if (typeof window.repairAllItems === 'function') humanDefer(function () { try { window.repairAllItems(); } catch (e) { /* ignore */ } });
      else if (all) humanClick(all);
      if (await verifyRepaired(REPAIR_VERIFY)) return 'ok';
      await sleep(800);
    }
    return 'fail';
  }

  /* ---- 背包 / 收购 ---- */

  const BAG_CHECK_MS = 30000;
  /* 兜底[休整] 清包 / 存仓失败 → 120s 内不再尝试 */
  const SELL_FAIL_COOLDOWN = 120000;
  /* ★ v2.6.78：按「名字」猜工具是个坑 —— 游戏里有 15 件「斧」类武器（Copper Berserker Axe /
     Battle Axe / Twin-bladed Axe … Lv1~49），名字里也有 "Axe"，被 /\baxe\b/ 误判成采集工具
     → isEquipBlock=false → 「出售」清包永远跳过它们（灰色斧头永远不会被卖掉）。
     实测（2026-10-21，从武器商买一把灰色 Copper Berserker Axe）：收购列表里 2 件装备，脚本只认 1 件。
     改成优先读游戏自己的物品类型文案（tooltip 的 <h2>，如 "Normal Weapon" / "Normal Chopping Axe"）。 */
  const TOOL_WORDS = /\b(pick|hoe|axe|rod)\b/i;        // 仅作最后兜底（读不到类型文案时）
  const TOOL_TYPES = /\b(mining pick|farmer hoe|chopping axe|fishing rod)\b/i;   // 真正的四种采集工具

  /** 读背包占用（只读请求，不弹窗） */
  /* ★ 解析 /modal/inventory 的物品：key → { name, rarity, count } */
  /* ★ 融合修复：背包槽位数量解析统一走这里。
     数量 span 的 class 就是物品 res 名（实测 <span class="mucky_fruits">4</span>）；
     锁定物品的槽位里会多一个 <span class=locked>🔒</span>，排在数量 span 前面。
     先按 class 精确匹配，再退回「第一个纯数字 span」（天然跳过 🔒 等非数字），
     都找不到返回 null（由调用方决定默认值：装备/资源=1，宠物粮=0）。 */
  function invCount(blk, key) {
    try {
      const safe = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = new RegExp('<span[^>]*class=["\'][^"\']*\\b' + safe + '\\b[^"\']*["\'][^>]*>\\s*([\\d,]+)\\s*</span>').exec(blk);
      if (m) return parseInt(m[1].replace(/,/g, ''), 10) || 0;
    } catch (e) { /* ignore */ }
    const m2 = /<span[^>]*>([\d,]+)<\/span>/.exec(blk);
    return m2 ? (parseInt(m2[1].replace(/,/g, ''), 10) || 0) : null;
  }

  function parseInvItems(h) {
    const out = {};
    String(h).split('class="inv_slot').slice(1).forEach(blk => {
      const res = /res="([^"]+)"/.exec(blk);
      if (!res) return;
      const key = res[1];
      const cn = invCount(blk, key);
      const n = (cn == null) ? 1 : cn;   // 没有数量 span = 单件（默认 1）
      const rm = /rarity="([^"]+)"/.exec(blk);
      const nm = /hover_title="([^"]*)"/.exec(blk);
      if (!out[key]) out[key] = { key: key, name: nm ? nm[1] : key, rarity: rm ? rm[1] : '', count: 0 };
      out[key].count += n;
    });
    return out;
  }
  /* ★ 和上次快照对比：数量变多的部分 = 本次挂机「获得」的东西 */
  function applyBagDiff(items) {
    const rar = {};
    Object.keys(items).forEach(k => { if (items[k].rarity) rar[items[k].rarity] = (rar[items[k].rarity] || 0) + items[k].count; });
    st.bagByRarity = rar;
    if (st.bagSnapReady) {
      Object.keys(items).forEach(k => {
        const prev = (st.bagSnap && st.bagSnap[k]) || 0;
        const cur = items[k].count;
        if (cur > prev) {
          const d = cur - prev;
          const nm = items[k].name || k;
          st.gainedByKey[nm] = (st.gainedByKey[nm] || 0) + d;
          if (items[k].rarity) st.gainedByRarity[items[k].rarity] = (st.gainedByRarity[items[k].rarity] || 0) + d;
        }
      });
    }
    const snap = {};
    Object.keys(items).forEach(k => { snap[k] = items[k].count; });
    st.bagSnap = snap;
  }
  /* 开始挂机时先拍一张背包快照（之后只统计「增量」） */
  async function initBagSnap() {
    st.bagSnapReady = false;
    try {
      const h = await (await fetch('/modal/inventory', { credentials: 'same-origin' })).text();
      const items = parseInvItems(h);
      const snap = {};
      Object.keys(items).forEach(k => { snap[k] = items[k].count; });
      st.bagSnap = snap;
      st.bagSnapReady = true;
    } catch (e) { /* ignore */ }
  }

  async function readBag() {
    const h = await (await fetch('/modal/inventory', { credentials: 'same-origin' })).text();
    const m = h.match(/Inventory\s*\((\d+)\s*\/\s*(\d+)\)/);
    if (!m) return null;
    const used = parseInt(m[1], 10), cap = parseInt(m[2], 10);
    if (!isFinite(used) || !isFinite(cap) || cap <= 0) return null;
    try { applyBagDiff(parseInvItems(h)); } catch (e) { /* ignore */ }
    return { used: used, cap: cap, free: cap - used };
  }

  /** 读游戏自己的「物品类型」文案：tooltip content 里 <h2> 的第一段（"Normal Weapon" / "Normal Armor" /
   *  "Normal Chopping Axe" …）。比按名字猜可靠得多 —— 斧类武器名字里也有 "Axe"。 */
  function itemTypeText(block) {
    const el = block.querySelector('.item_name[content]') || block.querySelector('img[content]') || block.querySelector('[content]');
    const c = el && el.getAttribute('content');
    if (!c) return '';
    const m = /<h2[^>]*>\s*([^<]*)/.exec(c);
    return m ? m[1].trim() : '';
  }
  function isToolBlock(block) {
    const img = block.querySelector('img[alt]');
    if (!img) return true;
    const typeTxt = itemTypeText(block);
    if (typeTxt) return TOOL_TYPES.test(typeTxt);      // ★ v2.6.78：以游戏类型文案为准
    const txt = ((img.getAttribute('alt') || '') + ' ' + (img.getAttribute('hover_title') || '')).replace(/_/g, ' ');
    return TOOL_WORDS.test(txt);
  }
  const isEquipBlock = block => !isToolBlock(block);

  function equipLevelOf(block) {
    const el = block.querySelector('.label-left-top');
    if (el) { const m = el.textContent.match(/(\d+)/); if (m) return parseInt(m[1], 10); }
    /* ★ 拆解/修理行没有 .label-left-top，等级在 tooltip content 的「Level N」里 */
    const nm = block.querySelector('.item_name[content], img[content]');
    if (nm) { const m2 = /Level\s*(\d+)/i.exec(nm.getAttribute('content') || ''); if (m2) return parseInt(m2[1], 10); }
    return 0;
  }

  /** 关掉收购界面：frame id 由 smith 名字拼成，按 #sell_items 反查所在 frame 更稳 */
  function closeSellFrame() {
    const box = document.getElementById('sell_items') || document.getElementById('npc_sell_items_grid');
    const f = box && box.closest ? box.closest('.frame-container') : null;
    if (f && f.id) closeFrameById(f.id);
  }

  function findSellLink(smith) {
    const scopes = [];
    const own = smithScope(smith);
    if (own) scopes.push(own);
    $$q('.frame-container').forEach(f => { if (scopes.indexOf(f) < 0) scopes.push(f); });
    for (const s of scopes) { const a = s.querySelector('a[onclick*="/sell"]'); if (a) return a; }
    return null;
  }

  async function openSmithSell(smith) {
    const f = await ensureSmithFrame(smith, 'sell', function () {
      return !!(document.getElementById('sell_items') || document.getElementById('npc_sell_items_grid'));
    }, 12000);
    return f ? 'ok' : (tripAlive() ? 'timeout' : 'cancel');
  }

  /** 点某个条目的 Sell；装备会弹确认框，点 Yes 才算卖出去
   *  ★★ 2026-10-17 中文（及其它语言）界面修复：
   *    ① 卖出按钮的文案会本地化（英文 Sell / 中文「出售」）—— 不能再按 /^sell$/i 找，
   *      改成认 onclick 里的 sellItem(...)（与语言无关）。
   *    ② 确认框的判定原来是 /sell/i.test(整段文案)，中文界面文案是「出售确认」
   *      → 匹配失败 → 误点 No（卖不出去）。改成用格子自带的
   *      data-confirm-title / data-confirm-text 去比对，并用 BootstrapDialog 的
   *      btn-primary（接受）/ btn-danger | btn-default（取消）认按钮。
   *      （实测确认框：中文界面下标题「出售确认」、正文「你确定要出售这些物品吗？」，
   *       但按钮仍是 Yes(btn-primary)/No(btn-danger)）*/
  async function clickEquipSell(block) {
    const btns0 = $$q('button', block);
    let btn = btns0.filter(b => /sellItem\s*\(/.test(b.getAttribute('onclick') || '')).pop();
    if (!btn) btn = btns0.filter(b => /^(sell|\u51fa\u552e)$/i.test((b.textContent || '').trim())).pop();
    if (!btn) return false;
    /* ★ 2026-10-17 优先走接口：POST /includes/ajax_item_buy_sell.php {type:'sell',item,amount:1}
       —— 不依赖按钮文案（中文「出售」）、不依赖确认框文案，也不会因为确认框判断失误而误点 No。 */
    const oc0 = btn.getAttribute('onclick') || '';
    const mm = /sellItem\(\s*["']([^"']+)["']\s*,\s*["']sell["']/.exec(oc0);
    if (mm) {
      try {
        const api = await nrPost('/includes/ajax_item_buy_sell.php', { type: 'sell', item: mm[1], amount: 1 });
        if (api.ok) return true;
      } catch (e) { /* 接口不可用 → 回退到点按钮 */ }
    }
    humanClick(btn);
    const deadline = now() + 5000;
    while (now() < deadline) {
      const dlg = document.querySelector('.bootstrap-dialog');
      if (dlg) {
        const btns = $$q('button', dlg);
        const yes = btns.filter(b => /btn-primary/.test(b.className || '')).pop()
                 || btns.filter(b => /^yes$/i.test((b.textContent || '').trim())).pop();
        const no = btns.filter(b => /btn-danger|btn-default/.test(b.className || '')).pop()
                || btns.filter(b => /^no$/i.test((b.textContent || '').trim())).pop();
        /* ★ 只认「卖这件物品」的确认框：用格子自带的 data-confirm-title/text 比对（与语言无关）；
           旧前端没有这两个属性 → 回退到原来的 /sell/i 写法。
           万一是别的对话框（丢弃/销毁等）就点取消关掉，绝不下手 */
        const wantTitle = (block.getAttribute('data-confirm-title') || '').trim();
        const wantText = (block.getAttribute('data-confirm-text') || '').trim();
        const dlgText = (dlg.textContent || '');
        const isSell = (wantText && dlgText.indexOf(wantText) >= 0)
                    || (wantTitle && dlgText.indexOf(wantTitle) >= 0)
                    || (!wantTitle && !wantText && /sell/i.test(dlgText));
        if (yes && isSell) { humanClick(yes); return true; }
        if (no) humanClick(no);
        return false;
      }
      await sleep(200);
    }
    return false;
  }

  /** 卖掉所有「符合自动清包条件（等级上限 + 品质阈值）」的装备，按等级从低到高。返回 { sold, free } */
  async function sellEquips(bag) {
    const box = document.getElementById('sell_items') || document.getElementById('npc_sell_items_grid');
    if (!box) throw new Error('收购界面没有出现');
    /* ★ v2.6.78：把「被判定为采集工具而跳过」的件数也报出来 —— 斧类武器误判就是这么被发现的 */
    const allRows = Array.from(box.children).filter(b => b.id && /^sell_/.test(b.id));
    const toolRows = allRows.filter(b => b.querySelector('img[alt]') && isToolBlock(b));   // 有图标但被判成工具（资源条目没有 img）
    const allEq = allRows
      .filter(b => isEquipBlock(b))
      .map(b => { const img = b.querySelector('img[alt]'); return { id: b.id, lv: equipLevelOf(b), rarity: equipRarityOf(b), name: img ? img.getAttribute('alt') : '' }; });
    const list = allEq
      .filter(it => clearEligible(it.lv, it.rarity))
      .sort((a, b) => a.lv - b.lv);                         // 先淘汰低等级装备
    /* ★ v2.6.76：清包诊断 —— 收购列表里有多少装备、其中多少件读不到品质（读不到就不会被清） */
    if (allEq.length) {
      const unk = allEq.filter(it => !it.rarity).length;
      const bits = [];
      if (unk) bits.push(unk + ' 件读不到品质');
      if (toolRows.length) bits.push(toolRows.length + ' 件采集工具');
      const nonEquip = allRows.length - allEq.length - toolRows.length;
      if (nonEquip > 0) bits.push(nonEquip + ' 件非装备（资源等）');
      logEvent('清包：收购列表装备 ' + allEq.length + ' 件，符合条件 ' + list.length + ' 件' + (bits.length ? ('（跳过：' + bits.join('、') + '）') : ''));
    }
    let free = bag ? bag.free : 0, sold = 0;
    for (const it of list) {
      if (!tripAlive()) return { sold: sold, free: free, cancel: true };
      const block = document.getElementById(it.id);         // 每卖一件游戏都会动这块 DOM，按 id 重新取
      if (!block) continue;
      setStatus('卖出装备 ' + it.name + '（Lv.' + it.lv + (it.rarity ? ' · ' + rarityCN(it.rarity) : '') + '）…');
      if (!await clickEquipSell(block)) continue;
      st.soldByRarity[it.rarity || '未知'] = (st.soldByRarity[it.rarity || '未知'] || 0) + 1;   // ★ 详细统计
      free++; sold++;
      await sleep(800);
    }
    return { sold: sold, free: free };
  }

  async function sellAtSmith(smith, bag) {
    if (await openSmithSell(smith) !== 'ok') throw new Error('没打开「' + (smith.name || smith.action) + '」的收购界面');
    const r = await sellEquips(bag);
    closeSellFrame();
    return r;
  }

  /* ---- 拆解（salvage）---- */
  /** 打开拆解界面（/modal/<action>/salvage），等列表出现 */
  async function openSmithSalvage(smith) {
    const f = await ensureSmithFrame(smith, 'salvage', function () {
      return !!document.getElementById('mass_salvage_list');
    }, 12000);
    return f ? 'ok' : (tripAlive() ? 'timeout' : 'cancel');
  }

  /** 拆解所有「符合自动清包条件」的装备：POST /includes/ajax_salvage.php {ids}。返回 { sold, free } */
  async function salvageEquips(bag) {
    const box = document.getElementById('mass_salvage_list');
    if (!box) throw new Error('拆解界面没有出现');
    /* ★★ v2.6.78：主选择器改回真实 DOM（实测 2026-10-21 抓的 /modal/weaponsmith/salvage）：
         <div class='smithing_bulk_row' id='item_block_<ID>' data-id='<ID>'>
           <input type='checkbox' class='smithing_pick' id='smithing_pick_salvage_<ID>' data-id='<ID>'>
           <label class='divblock smithing_pick_label'>…<span class='item_name' rarity='normal'>…</span>…</label>
       v2.6.76 以为主结构是 <input name='item_list[]'> —— 那个在「修理」和「拆解」列表里都不存在，
       于是主分支永远 0 行，只靠下面的兼容分支在工作，而且诊断日志永远不打（排查时看不到任何线索）。 */
    const picked = [];
    const rows = Array.prototype.slice.call(box.querySelectorAll('.smithing_bulk_row'));
    rows.forEach(function (r) {
      const id = r.getAttribute('data-id'); if (!id) return;
      const rar = equipRarityOf(r);
      if (clearEligible(equipLevelOf(r), rar)) picked.push({ id: id, rarity: rar || '未知' });
    });
    /* 兼容：万一以后前端换成 <input name='item_list[]' value='<ID>'> + <label id='item_block_<ID>'> */
    if (!rows.length) {
      Array.prototype.slice.call(box.querySelectorAll("input[name='item_list[]']")).forEach(function (inp) {
        const id = inp.getAttribute('value') || String(inp.id || '').replace(/^item/, '');
        if (!id) return;
        const lab = (inp.id ? box.querySelector("label[for='" + inp.id + "']") : null) || box.querySelector('#item_block_' + id) || inp.parentNode;
        const blk = lab || inp;
        const rar = equipRarityOf(blk);
        if (clearEligible(equipLevelOf(blk), rar)) picked.push({ id: id, rarity: rar || '未知' });
      });
    }
    if (rows.length) {
      const unk = rows.length - picked.length;
      logEvent('拆解：列表 ' + rows.length + ' 件，符合条件 ' + picked.length + ' 件' + (unk ? ('（跳过 ' + unk + ' 件）') : ''));
    }
    let free = bag ? bag.free : 0;
    if (!picked.length) return { sold: 0, free: free };
    setStatus('拆解 ' + picked.length + ' 件装备…');
    const res = await nrPost('/includes/ajax_salvage.php', { ids: JSON.stringify(picked.map(function (p) { return p.id; })) });
    if (!res.ok) throw new Error(res.error || '拆解请求失败');
    picked.forEach(function (p) { st.soldByRarity[p.rarity] = (st.soldByRarity[p.rarity] || 0) + 1; });
    await sleep(800);
    return { sold: picked.length, free: free + picked.length };
  }
  async function salvageAtSmith(smith, bag) {
    if (await openSmithSalvage(smith) !== 'ok') throw new Error('没打开「' + (smith.name || smith.action) + '」的拆解界面');
    const r = await salvageEquips(bag);
    try { closeFrameById('frame_' + smith.action.charAt(0).toUpperCase() + smith.action.slice(1)); } catch (e) { /* ignore */ }
    return r;
  }
  /** 自动清包：按 cfg.clearAction 走出售或拆解 */
  async function clearBagAtSmith(smith, bag) {
    return (cfg.clearAction === 'salvage') ? await salvageAtSmith(smith, bag) : await sellAtSmith(smith, bag);
  }

  /** 到 smith 后的统一处理：需要修就修、需要清就清，两件事各自独立 */
  async function doSmithServices(smith, manual, opts) {
    opts = opts || {};
    const out = { needRepair: false, repaired: false, needSell: false, sold: 0, sellErr: '', repairErr: '', repairNote: '', note: '' };
    if (!smith || !smith.action) return out;

    /* ★ v2.6.7 修 bug：多角色/切号后 st.dur 常是空的 —— 主循环的 refreshEquipDur() 只在
       pollSmithTrip() 里跑，而多角色行程期间 mcTick() 会让 step() 提前 return，永远不刷新；
       切号是整页跳转，st.dur 又回到 null → repairNeeded() 读空列表 → 误判「装备无损坏」不修。
       这里在判断前强制读一次真实耐久（缓存为空才读，正常主循环不受影响）。 */
    if (!st.dur || !(st.dur.list && st.dur.list.length)) {
      try { await readEquipDur(true); } catch (e) { /* ignore */ }
    }
    const reason = repairNeeded();             // ★ v1.8.0：破损 或 工具已采不动（+可选提前量）
    out.repairReason = reason;
    out.needRepair = (opts.repair === false) ? false : (!!reason || !!manual);   // 手动模式：不看本地判断，无条件问一次游戏菜单
    let bag = null;
    const wantClear = (opts.sell === false) ? false : true;
    if (wantClear && clearFilterActive() && (manual || cfg.sellOn || st.sell.force)) {
      bag = await readBag();
      /* ★ v2.6.127：只要这次休整到了铁匠、清包开关开着、且设了过滤条件，就无条件按过滤条件清一次。
         旧实现 needSell = bag.free <= 阈值（st.sell.freeAt 或 cfg.sellFreeMin），而 freeAt 只在
         「背包快满」触发时赋值 → 「耐久不足」触发的休整（freeAt=0 → 回落 sellFreeMin）常常
         整段跳过清包，普通装备越攒越多。格数现在只用于「是否触发一次休整」。 */
      out.needSell = !!bag;
    }
    if (!out.needRepair && !out.needSell) {
      const _durList = (st.dur && st.dur.list) || [];
      const bits = [reason ? ('装备需维修（' + (REPAIR_REASON_CN[reason] || reason) + (durText() ? '：' + durText() : '') + '），但自动维修未开启') : (_durList.length ? '装备无损坏' : '读不到装备耐久（已强制读取仍为空）')];
      if (opts.sell !== false) {
        if (!clearFilterActive()) bits.push('自动清包未设过滤（等级上限 0 且品质不限 → 不处理装备）');
        else if (!bag) bits.push('自动清包未开启（开关关闭或读不到背包）');
      }
      out.note = bits.join('；');
      return out;
    }

    await ensureSmithDialog(smith);

    /* ① 先出售 / 拆解（用户 2026-10-20 要求：清包 → 存仓 → 修理） */
    if (out.needSell) {
      try {
        setStatus(cfg.clearAction === 'salvage' ? '正在拆解…' : '正在清包…');
        const r = await clearBagAtSmith(smith, bag);
        out.sold = r.sold;
        st.sell.free = r.free;
        st.sell.cap = bag.cap;
        updateStats();
      } catch (e) {
        out.sellErr = (e && e.message) ? e.message : String(e);
        closeSellFrame();
      }
    }
    /* ② 再修理 */
    if (out.needRepair) {
      await ensureSmithDialog(smith);
      setStatus('检查并维修装备…');
      const rr = await repairAtSmith(smith, !!manual && !reason);
      if (rr === 'ok') out.repaired = true;
      else if (rr === 'none') { out.needRepair = false; out.repairNote = '游戏菜单里没有维修项（服务端判定无需维修）'; }
      else if (rr !== 'cancel') out.repairErr = '维修未生效（金币不足或 smith 菜单没打开）';
    }
    return out;
  }

  function smithResultText(svc) {
    const parts = [];
    if (svc.needSell) parts.push((cfg.clearAction === 'salvage' ? '拆解 ' : '卖出 ') + (svc.sold || 0) + ' 件装备');
    if (svc.needRepair) parts.push(svc.repaired ? '已维修' : '维修失败');
    const notes = [svc.repairNote, svc.note, svc.sellErr, svc.repairErr].filter(Boolean);
    const tail = notes.length ? '（' + notes.join('；') + '）' : '';
    if (!parts.length) return '无需维修与清包' + tail;
    return parts.join('、') + tail;
  }

  /* ---- 行程编排 ---- */

  /* ---- 统一「回城休整」行程：进城 → ①出售/拆解 ②存仓 ③修理 → 出城 ----
     opts = { sell, deposit, repair, force, tag }
       · sell/deposit/repair 未指定时按配置自动决定（sellOn / autoDeposit / repairOn）；
       · force = true：忽略「背包剩余格数」阈值（手动/多角色用）。
     返回 { sold, sellErr, deposited, depTxt, depErr, repaired, repairErr, note }。
     任一环节失败都不阻断后续环节，最后只回一次挂机地图。 */
  async function runRestock(opts) {
    opts = opts || {};
    const doSell = (opts.sell !== undefined) ? !!opts.sell : (cfg.sellOn && clearFilterActive());
    const doDep  = (opts.deposit !== undefined) ? !!opts.deposit : !!cfg.autoDeposit;
    const doRep  = (opts.repair !== undefined) ? !!opts.repair : !!cfg.repairOn;
    const force  = !!opts.force;
    const tag    = opts.tag || '';
    const R = st.repair, B = st.bank;
    const out = { sold: 0, sellErr: '', deposited: 0, depTxt: '', depErr: '', repaired: false, repairErr: '', note: '' };
    if (!doSell && !doDep && !doRep) return out;
    /* ★ v2.6.12 / v2.6.157：在「临时活动」里触发休整 → 返程要回那个活动（而不是 cfg.farmMap）。
       覆盖：活动图 / 活动战斗区（eventReturnMap）+ Overlord 房（ovlInBattle）。 */
    const fromActivity = eventReturnMap() || (ovlInBattle() ? +character.current_map : 0);
    const home0 = st.tripHome, origin0 = st.tripOrigin;
    if (fromActivity) st.tripHome = String(fromActivity);
    st.repair.active = true; st.bank.active = true; st.sell.active = true;
    try {
      const route = await resolveRepairRoute();
      R.route = route;
      /* ① 出售 / 拆解（在 smith） */
      if (doSell) {
        try {
          if (await travelToRepairPoint(route) === 'cancel') return out;
          const smith = R.smith;
          if (!tripAlive()) return out;
          setStatus(tag + '到达 ' + smith.name + '，' + (cfg.clearAction === 'salvage' ? '拆解中…' : '清包中…'));
          const svc = await doSmithServices(smith, force, { repair: false, sell: true });
          out.sold = svc.sold || 0; out.sellErr = svc.sellErr || '';
          if (out.sold) logEvent(tag + (cfg.clearAction === 'salvage' ? '拆解' : '清包') + '：' + (cfg.clearAction === 'salvage' ? '拆解 ' : '卖出 ') + out.sold + ' 件');
          else if (out.sellErr) logEvent(tag + '清包失败：' + out.sellErr);
        } catch (e) { out.sellErr = (e && e.message) ? e.message : String(e); logEvent(tag + '清包失败 ' + out.sellErr); }
      }
      /* ② 存仓（在银行） */
      if (doDep) {
        try {
          if (!tripAlive()) return out;
          if (await travelToRepairPoint(route, 'bank') === 'cancel') return out;
          const bank = R.smith;
          if (!tripAlive()) return out;
          setStatus(tag + '到达「' + (bank ? bank.name : '银行') + '」，存仓中…');
          const r = await doBankDeposit();
          out.deposited = r.deposited;
          B.lastCheck = now();
          out.depTxt = r.deposited > 0 ? ('存入 ' + r.deposited + ' 件' + (r.equip ? '（装备 ' + r.equip + ' 件）' : '')) : '没有可存的东西';
          B.cooldownUntil = now() + (r.deposited > 0 ? REPAIR_OK_COOLDOWN : SELL_FAIL_COOLDOWN);
          logEvent(tag + '存仓：' + out.depTxt);
        } catch (e) { out.depErr = (e && e.message) ? e.message : String(e); logEvent(tag + '存仓失败 ' + out.depErr); }
      }
      /* ③ 修理（在 smith） */
      if (doRep) {
        try {
          if (!tripAlive()) return out;
          if (await travelToRepairPoint(route) === 'cancel') return out;
          const smith = R.smith;
          if (!tripAlive()) return out;
          setStatus(tag + '到达 ' + smith.name + '，检查维修…');
          const svc = await doSmithServices(smith, false, { repair: true, sell: false });
          out.repaired = !!svc.repaired;
          out.repairErr = (svc.needRepair && !svc.repaired) ? (svc.repairErr || '维修未生效') : '';
          out.note = svc.repairNote || svc.note || '';
          logEvent(tag + '维修：' + (out.repaired ? '已维修' : (out.repairErr || out.note || '无需维修')));
        } catch (e) { out.repairErr = (e && e.message) ? e.message : String(e); logEvent(tag + '维修失败 ' + out.repairErr); }
      }
      /* 返程：只回一次挂机地图 */
      st.tripOrigin = origin0;
      if (tripAlive()) { setStatus(tag + '出城，返回挂机地图…'); await travelBack(route); }
      R.failCount = out.repairErr ? (R.failCount || 0) + 1 : 0;
      R.cooldownUntil = now() + (out.repairErr ? REPAIR_COOLDOWN : REPAIR_OK_COOLDOWN);
      return out;
    } finally {
      if (fromActivity) st.tripHome = home0;
      st.repair.active = false; st.bank.active = false; st.sell.active = false;
      st.sell.freeAt = 0;                      /* ★ v2.6.78：本次行程用的阈值用完即清 */
    }
  }

  /** 休整结果文案（用于状态栏/日志） */
  function restockText(out) {
    out = out || {};
    const parts = [];
    if (out.sold) parts.push((cfg.clearAction === 'salvage' ? '拆解 ' : '卖出 ') + out.sold + ' 件');
    if (out.deposited) parts.push('存仓 ' + out.deposited + ' 件');
    if (out.repaired) parts.push('已维修');
    const errs = [out.sellErr, out.depErr, out.repairErr].filter(Boolean);
    let t = parts.length ? parts.join('、') : '无需维护';
    if (errs.length) t += '（' + errs.join('；') + '）';
    return t;
  }

  /** 兼容旧调用：自动维修行程（顺带按配置清包/存仓） */
  async function runRepair() {
    const out = await runRestock({ repair: true });
    if (out.repairErr) { setStatus('已返回「' + currentMapName() + '」，但' + out.repairErr + '（' + Math.round(REPAIR_COOLDOWN / 1000) + ' 秒后重试）'); return; }
    setStatus('休整完成（' + restockText(out) + '），已返回「' + currentMapName() + '」，继续' + (st.mode === 'gather' ? '采集' : '战斗') + landingNote());
  }

  /** 兼容旧调用：自动清包行程（顺带按配置存仓/维修） */
  async function runSell(force) {
    const S = st.sell;
    if (force) S.force = true;
    try {
      const out = await runRestock({ sell: true, force: !!force });
      S.lastCheck = now();
      setStatus('休整完成（' + restockText(out) + '），回到「' + currentMapName() + '」' + landingNote());
    } finally { S.force = false; }
  }

  /** 兼容旧调用：自动存仓行程（顺带按配置清包/维修） */
  async function runDeposit(force) {
    const out = await runRestock({ deposit: true, force: !!force });
    setStatus('休整完成（' + restockText(out) + '），回到「' + currentMapName() + '」' + landingNote());
  }

  /* ======================= 12b. 自动存仓（银行） ======================= */
  /* 到银行后存包，分两步：
     ① 材料：POST /includes/ajax_inventory.php {type:'Stack',value:'stash'}
        （= 游戏自己的 stackTobank()「快速存入」，只存材料）；接口不行就打开银行窗口点按钮。
        按钮文案会本地化（中文「快速存入」），所以按 onclick=stackTobank 找。
     ② 装备（★ v2.6.85 新增）：把「品质 ≥ cfg.sellRarity」的装备逐件存进银行的装备格。
        游戏机制（实测 2026-10-22，El Caspar 银行）：
          · 银行装备格 = #bank_equipment_slots 里的 25 个 .inventory_container#bank_slot_1..25
            （空闲格的 .stash_slot 带 empty_stash）；
          · 存一件装备 = POST /includes/ajax_inventory.php
              {type:'BankTransfer', value:'<背包容器id invN>', to:'<银行格 bank_slot_K>'}
            成功返回 ["BankTransfer",true,{mode:'deposit',...}]；失败 ["BankTransfer",false,"Unable to deposit"]；
          · 背包里「装备/工具」的判据 = .inv_slot 的 use_name="item"（材料/药水是 ""/Consume/Open）。
        用户要求：每件符合条件的装备各尝试存一次，存不进去就算了（不重试、不报错中断）。 */

  /** 确保银行窗口开着（读空闲装备格要用）；返回是否拿到 #bank_equipment_slots */
  async function ensureBankFrame() {
    if (document.getElementById('bank_equipment_slots')) return true;
    if (!document.getElementById('frame_Bank')) humanDialog('Bank', '', 'ajax', '/modal/bank', true);
    const dl = now() + 8000;
    while (now() < dl) {
      if (!tripAlive()) return false;
      if (document.getElementById('bank_equipment_slots')) return true;
      await sleep(250);
    }
    return !!document.getElementById('bank_equipment_slots');
  }

  /** 银行里空闲的装备格 id 列表（按 #bank_slot_N 顺序） */
  function bankFreeSlots() {
    const eq = document.getElementById('bank_equipment_slots');
    if (!eq) return [];
    return $$q('.inventory_container', eq).filter(function (c) {
      const s = c.querySelector('.stash_slot');
      return !!(s && /\bempty_stash\b/.test(s.className || ''));
    }).map(function (c) { return c.id; });
  }

  /** 读背包里的「装备/工具」（.inv_slot[use_name="item"]）：返回 [{ cid, rarity, name }] */
  async function readBagEquipItems() {
    const h = await (await fetch('/modal/inventory', { credentials: 'same-origin' })).text();
    const d = document.createElement('div');
    d.innerHTML = h;
    const out = [];
    $$q('.inventory_container', d).forEach(function (c) {
      const slot = c.querySelector('.inv_slot');
      if (!slot) return;
      if ((slot.getAttribute('use_name') || '') !== 'item') return;   // 装备/工具；材料/药水不是
      const icon = slot.querySelector('[rarity]') || slot.querySelector('[content]') || slot.querySelector('img');
      out.push({
        cid: c.id,
        rarity: equipRarityOf(slot),
        name: (icon && icon.getAttribute('hover_title')) || ''
      });
    });
    return out;
  }

  /** 把「品质 ≥ cfg.sellRarity」的装备逐件存进银行装备格；返回成功件数。
      每件只试一次，存不进去就跳过（用户要求「存放失败算了」）。 */
  async function depositBagEquips() {
    if (!cfg.sellRarity) return 0;
    const th = rarityRank(cfg.sellRarity);
    if (th < 0) return 0;
    let items = [];
    try { items = await readBagEquipItems(); } catch (e) { return 0; }
    const list = items.filter(function (it) { const rk = rarityRank(it.rarity); return rk >= 0 && rk >= th; });
    if (!list.length) return 0;
    if (!await ensureBankFrame()) { logEvent('存仓：打不开银行窗口，' + list.length + ' 件装备没存'); return 0; }
    const free = bankFreeSlots();
    if (!free.length) { logEvent('存仓：银行装备格已满，' + list.length + ' 件装备没存进去'); return 0; }
    let n = 0;
    for (const it of list) {
      if (!tripAlive()) break;
      if (n >= free.length) { logEvent('存仓：银行装备格用完，剩 ' + (list.length - n) + ' 件没存'); break; }
      const target = free[n];
      let ok = false;
      try {
        const res = await nrPost('/includes/ajax_inventory.php', { type: 'BankTransfer', value: it.cid, to: target });
        ok = !!(res.json && res.json[1] === true);      /* 成功 = ["BankTransfer",true,{...}] */
      } catch (e) { ok = false; }
      if (ok) { n++; setStatus('存入装备 ' + (it.name || '') + (it.rarity ? '（' + rarityCN(it.rarity) + '）' : '') + '…'); await sleep(600); }
      /* 失败（格子被占 / 该件不能存）→ 跳过，不重试 */
    }
    return n;
  }

  async function doBankDeposit() {
    const out = { deposited: 0, before: null, after: null, equip: 0 };
    const b0 = await readBag();
    out.before = b0 ? b0.used : null;
    let done = false;
    try {
      const api = await nrPost('/includes/ajax_inventory.php', { type: 'Stack', value: 'stash' });
      if (api.ok) done = true;
    } catch (e) { /* 回退到点按钮 */ }
    if (!done) {
      if (!document.getElementById('frame_Bank')) {
        humanDialog('Bank', '', 'ajax', '/modal/bank', true);
      }
      const dl = now() + 8000;
      let btn = null;
      while (now() < dl) {
        if (!tripAlive()) return out;
        btn = $$q('#frame_Bank button').filter(b => /stackTobank/.test(b.getAttribute('onclick') || ''))[0];
        if (btn) break;
        await sleep(250);
      }
      if (btn) { humanClick(btn); done = true; }
    }
    /* ② 装备：品质 ≥ 阈值的逐件存进银行装备格（用户 2026-10-22 需求） */
    if (tripAlive()) {
      try { out.equip = await depositBagEquips(); } catch (e) { /* 装备存仓失败不影响材料存仓结果 */ }
    }
    if (done || out.equip) {
      const dl = now() + 6000;
      while (now() < dl) {
        await sleep(500);
        const b = await readBag();
        if (!b) continue;
        out.after = b.used;
        if (out.before != null && b.used < out.before) { out.deposited = out.before - b.used; break; }
      }
    }
    closeFrameById('frame_Bank');
    return out;
  }

  /* ★ 多角色行程专用：一次进城把「清包 + 存仓 + 维修」按顺序做完，再出城（一次往返）。
     返回 { sold, sellErr, deposited, depTxt, depErr, repaired, repairErr, note }。 */
  async function runRepairAndDeposit(opts) {
    opts = opts || {};
    return await runRestock({
      sell: (opts.sell !== undefined) ? !!opts.sell : (cfg.sellOn && clearFilterActive()),
      deposit: !!opts.deposit,
      repair: !!opts.repair,
      tag: '多角色：'
    });
  }

  /** 主循环里的统一检查点：装备损坏（本地判断，每 tick）+ 背包（发请求，节流） */
  function pollSmithTrip() {
    if (st.repair.active || st.sell.active || st.bank.active) return false;
    const wantSell = cfg.sellOn && clearFilterActive();
    const wantDep = !!cfg.autoDeposit;
    const wantRep = !!cfg.repairOn;
    if (!wantSell && !wantDep && !wantRep) return false;

    // ① 装备需维修（破损 或 工具已采不动）→ 触发一次「回城休整」
    if (wantRep) {
      gatherDurNow();                          // ★ 采集中时顺手刷新实时耐久
      refreshEquipDur();                       // ★ 后台刷新 /modal/character 缓存（节流 30s）
      const rr = repairNeeded();
      if (rr && now() > st.repair.cooldownUntil) {
        st.repair.reason = rr;
        startRestock('repair', (REPAIR_REASON_CN[rr] || rr) + (durText() ? ' · ' + durText() : ''));
        return true;
      }
    }
    // ② 背包快满 → 触发一次「回城休整」（清包 + 存仓 + 维修）
    if ((wantSell || wantDep) && now() - st.sell.lastCheck > rhythm(BAG_CHECK_MS) && now() > st.sell.cooldownUntil && now() > st.bank.cooldownUntil) {
      st.sell.lastCheck = now();
      readBag().then(bag => {
        if (!bag) return;
        st.sell.free = bag.free; st.sell.cap = bag.cap;
        updateStats();
        /* ★ v2.6.78：阈值只摇一次，存进 st.sell.freeAt 给 doSmithServices 复用。
           旧实现「触发」和「到铁匠后再判一次」各摇一次独立随机数：
           sellFreeMin=2 + 抖动 5% 时 jitterVal(2) ∈ {1,2,3}，约 1/3 概率是「出发了，
           走到铁匠又说不需要清」→ 静默空跑（日志里只剩每 30s 一条「回城休整」），背包永远清不掉。 */
        const thr = jitterVal(cfg.sellFreeMin);
        if (bag.free <= thr && !st.sell.active && !st.repair.active && !st.bank.active) {
          st.sell.freeAt = thr;
          startRestock('bag', '剩余 ' + bag.free + '/' + bag.cap + ' 格');
        }
      }).catch(() => { /* ignore */ });
    }
    return false;
  }

  /* ★ v2.6.52：回城休整原因文案（挂机时自动触发的回城，日志里写清楚为什么） */
  const RESTOCK_WHY_CN = { repair: '装备/工具耐久不足', bag: '背包快满', manual: '手动立即维护' };
  /** 触发一次「回城休整」行程（清包 → 存仓 → 修理，按配置）
      reason = 'repair' | 'bag' | 'manual'；detail = 补充说明（耐久明细 / 背包剩余格数） */
  function startRestock(reason, detail) {
    if (st.repair.active || st.sell.active || st.bank.active || !running) return;
    if (!inGame()) return;
    const why = (RESTOCK_WHY_CN[reason] || reason || '未知原因') + (detail ? '（' + detail + '）' : '');
    const _dest = +activeServiceTown();
    logEvent('回城休整：' + why + (_dest ? ' → 前往「' + townName(_dest) + '」' : ''));
    setStatus('回城休整：' + why + '…');
    st.repair.active = true; st.bank.active = true; st.sell.active = true;
    /* ★ 行程期间 tick 在「维修/清包进行中」那一行就 return 了，换图检测整段不会跑 ——
       所以出发前先把这些「带着出发地图的值」清掉（否则返程后采集点可能被判成走不到 / 采集不计数）。 */
    st.move = null; st.reach = null; st.blacklist = {}; st.inCollect = false;
    abortWalk();
    closeFrameById('frame_Gathering');
    closeFrameById('frame_CollectScrap');
    runRestock({}).then(out => {
      if (reason === 'repair' && out.repairErr) {
        const R = st.repair;
        R.failCount = (R.failCount || 0) + 1;
        if (R.failCount >= 3) {
          cfg.repairOn = false; saveCfg(); syncUI();
          logEvent('维修失败：' + out.repairErr + '（已连续失败 3 次，自动维修已关闭）');
          setStatus('维修失败：' + out.repairErr + '（已连续失败 3 次，自动维修已关闭）');
        }
      }
      if (out.sold || out.deposited || out.repaired || out.sellErr || out.depErr || out.repairErr) {
        setStatus('休整完成（' + restockText(out) + '），已回到「' + currentMapName() + '」' + landingNote());
      }
    }).catch(e => {
      const R = st.repair;
      st.repair.active = false; st.bank.active = false; st.sell.active = false;
      const m = (e && e.message) ? e.message : String(e);
      R.failCount = (R.failCount || 0) + 1;
      if (R.failCount >= 3) {
        cfg.repairOn = false; saveCfg(); syncUI();
        logEvent('休整失败：' + m + '（已连续失败 3 次，自动维修已关闭）');
        setStatus('休整失败：' + m + '（已连续失败 3 次，自动维修已关闭）');
      } else {
        R.cooldownUntil = now() + rhythm(REPAIR_COOLDOWN);
        logEvent('休整失败：' + m + '（' + Math.round(REPAIR_COOLDOWN / 1000) + ' 秒后重试）');
        setStatus('休整失败：' + m + '（60 秒后重试）');
      }
    });
  }

  /** 手动「立即维修/清包」：暂停挂机（保留统计）→ 走到选定城镇 → 修装备 + 清背包（不看剩余格数）→ 回挂机地图继续 */
  /** 手动「立即维护」：暂停挂机（保留统计）→ 走到选定城镇 → 清包 + 存仓 + 维修（不看剩余格数）→ 回挂机地图继续 */
  function repairSellNow() {
    if (st.repair.active || st.sell.active || st.bank.active) return;
    if (!inGame()) { setStatus('请先进入游戏'); return; }
    const wasRunning = running, wasMode = st.mode;
    if (running) { st.runElapsed = runElapsedMs(); running = false; }   /* ★ 软暂停：保留统计与模式，回来接着挂 */
    navAutoSeq++;                                   /* ★ 中止正在跑的「切图刷怪」，否则它会占着 navBusy 让导航失败 */
    st.mapSwitch.active = false; st.mapSwitch.idleSince = 0; st.roam = { idx: 0, bad: {} };
    st.tripManual = true;
    st.repair.active = true; st.sell.active = true; st.bank.active = true;
    st.repair.smith = null;
    st.sell.force = true;                 /* ★ 不看剩余格数，立即清包 */
    st.move = null; st.reach = null; st.blacklist = {}; st.inCollect = false;
    running = true;
    if (!timer) timer = rhythmTimer(tick, TICK);
    syncRunButtons();
    setStatus('立即维护：读取地图数据…');

    (async () => {
      for (let i = 0; i < 12 && navBusy; i++) await sleep(500);   /* 等被中止的自动切图让出导航 */
      return await runRestock({ force: true });
    })().then(out => {
      const txt = restockText(out || {});
      if (wasRunning) {
        /* ★ 回到挂机：恢复运行态，统计保留 */
        st.tripManual = false; st.sell.force = false;
        st.repair.active = false; st.sell.active = false; st.bank.active = false;
        st.paused = false;
        running = true; st.mode = wasMode; st.runStart = now();
        if (!timer) timer = rhythmTimer(tick, TICK);
        markRunning(st.mode);
        const here = currentMapName();
        setStatus('维护完成（' + txt + '），已回到「' + here + '」，继续挂机');
        logEvent('维护完成：' + txt + '；已回到「' + here + '」继续挂机');
      } else {
        stopCore();
        setStatus('维护完成：' + currentMapName() + '，' + txt);
        logEvent('维护完成：' + txt);
      }
      syncRunButtons();
    }, e => {
      st.repair.active = false; st.sell.active = false; st.bank.active = false;
      stopCore();
      setStatus('维护失败：' + (e && e.message ? e.message : String(e)));
      syncRunButtons();
    });
  }

  /* ======================= 13. 背包扫描 ======================= */

  async function scanBag() {
    const btn = document.getElementById('nr-scan');
    if (btn) { btn.disabled = true; btn.textContent = '扫描中…'; }
    const wasOpen = hasFrame('frame_Inventory');
    try {
      if (!wasOpen) { const hd = document.getElementById('hud_Inventory'); if (hd) humanClick(hd); }

      // ★ 修 bug：原版固定 sleep(1300)，网络慢时会读到空背包。
      //   改成轮询等槽位出现（最多 5 秒）。
      await ensureTTDB();   // ★ 先拿到物品效果库，才能精确分类补血/补蓝

      const inv = await waitUntil(() => {
        const f = document.getElementById('frame_Inventory');
        return (f && f.querySelector('.inv_slot')) ? f : null;
      }, 5000);
      if (!inv) {
        setStatus('背包扫描失败：窗口未就绪，已保留上次库存');
        return false;
      }
      // ★ 背包是分批渲染的：等槽位数量稳定下来再读，否则会漏物品
      if (inv) {
        let lastN = -1, stable = 0;
        for (let i = 0; i < 24; i++) {
          const n = $$q('.inv_slot', inv).length;
          if (n === lastN && n > 0) { stable++; if (stable >= 3) break; } else stable = 0;
          lastN = n;
          await sleep(220);
        }
      }

      const map = {};
      const items = {};
      if (inv) {
        $$q('.inv_slot.full_inv', inv).forEach(slot => {
          const d = slot.querySelector('div');
          if (!d) return;
          const key = d.getAttribute('res') || d.getAttribute('name') || '';
          try { const bg = (d.style && d.style.backgroundImage) || ''; const im = /url\(["']?([^"')]+)["']?\)/.exec(bg); if (key && im) _iconCache.set(key, im[1]); } catch (e) { /* ignore */ }
          const name = d.getAttribute('hover_title') || key;
          const use = slot.getAttribute('use_name') || '';
          if (!key || !use) return;
          const rq = d.getAttribute('rarity');           // ★ 装备才有 rarity 属性
          /* ★ 锁定物品的槽位里会多一个 <span class=locked>🔒</span>，它排在数量 span 前面，
             原来的 querySelector('span') 会读到 🔒 → parseInt('🔒') = NaN → 数量被当成 0。
             改成只认「纯数字」的 span（老版 parseInvItems 的正则天然跳过 🔒，这里是回归修复）。 */
          let count = 0;
          for (const s of slot.querySelectorAll('span')) {
            const t = (s.textContent || '').replace(/,/g, '').trim();
            if (/^\d+$/.test(t)) { count = parseInt(t, 10) || 0; break; }
          }
          if (!items[key]) items[key] = { key: key, name: name, rarity: rq || '', count: 0 };
          items[key].count += count;
          if (!map[key]) {
            const hi = healInfo(key);
            let kind = 'other';
            if (hi.life > 0 && hi.mana > 0) kind = 'hpmp';
            else if (hi.life > 0) kind = 'hp';
            else if (hi.mana > 0) kind = 'mp';
            map[key] = { key: key, name: name, kind: kind, healLife: hi.life, healMana: hi.mana, count: 0 };
          }
          map[key].count += count;
        });
      }

      const list = Object.keys(map).map(k => map[k]);
      list.sort((a, b) => {
        const r = x => x.kind === 'hp' ? 0 : (x.kind === 'hpmp' ? 1 : (x.kind === 'mp' ? 2 : 3));
        return (r(a) - r(b)) || a.name.localeCompare(b.name);
      });
      applyBagDiff(items);                              // ★ 详细统计：算「获得」增量 + 背包装备稀有度
      cfg.bagList = list;
      cfg.bagScanned = true;
      if (cfg.hpPotion && !list.some(i => i.key === cfg.hpPotion)) cfg.hpPotion = '';
      if (cfg.mpPotion && !list.some(i => i.key === cfg.mpPotion)) cfg.mpPotion = '';
      saveCfg();

      renderPotionSelects();
      setStatus('背包扫描完成，发现 ' + list.length + ' 种可用物品');
      return true;
    } catch (e) {
      setStatus('背包扫描失败：' + (e && e.message ? e.message : String(e)));
      return false;
    } finally {
      if (!wasOpen) closeFrameById('frame_Inventory');
      if (btn) { btn.disabled = false; btn.textContent = '重新扫描背包'; }
    }
  }

  /* ======================= 14. 采集 ======================= */

  function findGatheringSpot(name) {
    if (!inGame()) return null;
    const want = normName(name);
    if (!want) return null;
    let best = null, bd = Infinity;
    $$q('.map_table .tile_poi[action="gathering"]').forEach(el => {
      const nm = el.getAttribute('name') || '';
      if (normName(nm).indexOf(want) < 0) return;
      const c = (el.getAttribute('coords') || '').split('-');
      const x = parseInt(c[0], 10), y = parseInt(c[1], 10);
      if (!isFinite(x) || !isFinite(y)) return;
      if (!isReachable(x, y)) return;
      const d = manhattan(character.x, character.y, x, y);
      if (d < bd) { bd = d; best = { x: x, y: y, name: nm }; }
    });
    return best;
  }

  function gatheringSpots() {
    const seen = {}, out = [];
    $$q('.map_table .tile_poi[action="gathering"]').forEach(el => {
      const n = (el.getAttribute('name') || '').trim();
      if (!n || seen[n]) return;
      seen[n] = 1; out.push(n);
    });
    return out;
  }

  /* ★ v2.6.76：采集点锁定 —— 采集 / 一键挂机运行期间，采集点下拉不再随换图变化。 */
  function gatherPointFrozen() {
    return !!running && (st.mode === 'gather' || st.mode === 'auto');
  }

  function detectGatherPoints(silent) {
    const sel = document.getElementById('nr-gpoint');
    if (!sel) return;
    /* ★ 运行中（采集 / 一键挂机）冻结下拉：换图不再重填，保持用户选定的采集点。 */
    if (silent && gatherPointFrozen()) return;
    const names = inGame() ? gatheringSpots() : [];
    const cur = cfg.gatherPoint || sel.value || '';
    sel.innerHTML = '';
    if (!names.length) {
      sel.appendChild(h('option', { value: '', text: inGame() ? '（本图没有可采集的地点）' : '（请先进入游戏）' }));
      if (!silent) setStatus('本图没有识别到采集点');
      return;
    }
    names.forEach(n => sel.appendChild(h('option', { value: n, text: n })));
    if (names.indexOf(cur) >= 0) sel.value = cur;
    else {
      sel.value = names[0];
      if (!silent) { cfg.gatherPoint = sel.value; saveCfg(); }   // 自动刷新时不覆盖用户设置
    }
    if (!silent) setStatus('识别到 ' + names.length + ' 个采集点：' + names.join('、'));
  }

  /* ★ 本图实际要采的点：优先用户设置；设置在本图找不到时，退回下拉里当前选中的那个。
   *   为什么需要：detectGatherPoints() 的自动刷新是「静默」的（silent=true），它只改下拉、
   *   不动 cfg.gatherPoint —— 换图后下拉显示的是本图的点，cfg 却还留着上一张图的点，
   *   于是「看着选好了，却一直提示本图没有这个采集点」→ 不采集。 */
  function effectiveGatherPoint() {
    /* ★ 活动地图里用「活动专用采集点」（和外面同类型），不覆盖用户的 cfg.gatherPoint */
    if (st.event && st.event.on && st.event.pointName) return st.event.pointName;
    const want = String(cfg.gatherPoint || '').trim();
    const names = inGame() ? gatheringSpots() : [];
    const hit = n => normName(n).indexOf(normName(want)) >= 0;
    if (want && (!names.length || names.some(hit))) return want;
    const sel = document.getElementById('nr-gpoint');
    const v = sel ? String(sel.value || '').trim() : '';
    return v || want;
  }

  /* ★ 采集点下拉自愈。
   *   换图那一刻 .map_table 往往还没渲染完，detectGatherPoints() 会识别到 0 个采集点，
   *   把下拉清成「（本图没有可采集的地点）」；而 tick 里的「换图检测」每张图只触发一次
   *   （st.map 一旦更新就不再进那个分支）→ 下拉永远空着。
   *   实测最容易踩到的就是「回城维修返程」：返程本身就是一次完整换图。
   *   这里每 3 秒对一次账：本图有采集点、但下拉没跟上 → 重新识别。 */
  let _gpAt = 0;
  function gatherPointsTick() {
    if (!running || !inGame()) return;
    if (gatherPointFrozen()) return;                        /* ★ 采集点已锁定：不再自愈重填 */
    if (now() - _gpAt < 3000) return;
    _gpAt = now();
    const sel = document.getElementById('nr-gpoint');
    if (!sel) return;
    const names = gatheringSpots();
    if (!names.length) return;                              /* 本图确实没有采集点：不动 */
    if (sel.options.length === names.length && names.indexOf(sel.value) >= 0) return;   /* 已经对上 */
    detectGatherPoints(true);
  }

  /** 关掉游戏侧的采集窗口（采集点 / 废料），用于中断采集去打怪或去维修 */
  function closeGatheringWindows() {
    // 正式服用独立 popup/计时器；只关旧 frame 不能停止采集。
    try { if (typeof window.stopGathering === 'function') window.stopGathering(); } catch (e) { /* ignore */ }
    try { if (typeof window.hideGatheringPopup === 'function') window.hideGatheringPopup(); } catch (e) { /* ignore */ }
    _gatherProg = { key: '', at: 0 };
    closeFrameById('frame_Gathering');
    closeFrameById('frame_CollectScrap');
    abortWalk();
  }

  // 仅接管已在正式服确认的等级拒绝，不猜测其它业务错误的含义。
  function installGatherResultHook() {
    const $ = jq();
    if (!$ || typeof $(document).on !== 'function') return false;
    if ($.__nrGatherResultHook) return true;
    $.__nrGatherResultHook = true;
    const requests = new WeakMap();
    $(document).on('ajaxSend.nrGatherResult', function (_ev, xhr, opts) {
      if (!running || !inGame() || !/\/ajax_gathering\.php(?:\?|$)/.test(String(opts.url || ''))) return;
      requests.set(xhr, { seq: runSeq, charId: character.id, mapId: character.current_map });
    }).on('ajaxComplete.nrGatherResult', function (_ev, xhr) {
      const request = requests.get(xhr);
      if (!request) return;
      requests.delete(xhr);
      if (!running || request.seq !== runSeq || !inGame() || character.id !== request.charId || character.current_map !== request.mapId) return;
      if (st.mode !== 'gather' && st.mode !== 'auto' && !st.event.on) return;
      let xml = xhr.responseXML;
      if (!xml && xhr.responseText) xml = new DOMParser().parseFromString(xhr.responseText, 'text/xml');
      const root = xml && xml.querySelector('xmlresponse');
      const error = root ? String(root.getAttribute('error') || '') : '';
      if (/level too low to gather here/i.test(error)) stop('采集被拒：专业等级不足（' + error + '）');
    });
    return true;
  }

  /**
   * ★ 采集模式下「值得中断采集去打」的目标。
   * 复用战斗那套优先级（星级 → 名单 → 距离），再按打断门槛过滤。
   */
  /* ★ 采集中断门槛 → 最低星级（0=任意怪） */
  function gatherInterruptMinStars() {
    const v = cfg.gatherInterruptRank;
    if (v === 'r3') return 3;
    if (v === 'r2') return 2;
    if (v === 'r1' || v === 'champion') return 1;
    return 0;
  }

  /* 把一只怪包装成移动目标（含「脚下残留」判定） */
  function enemyTargetOf(e) {
    if (!e) return null;
    // 脚下的怪没触发战斗 → 先原地重触发一次（可能是服务端位置没跟上），再不行才拉黑
    if (e.x === character.x && e.y === character.y) { blacklistTile(e.key, 15000); return null; }
    return {
      kind: 'enemy', x: e.x, y: e.y, enemy: e,
      label: '怪物·' + (e.name || '') + (e.lv ? ' Lv' + e.lv : '') + (whyText(e) ? '（' + whyText(e) + '）' : '')
    };
  }

  /* ★ 普通战斗选怪：只按「星级 → 名单 → 距离」排序，
     不受「采集中断条件」的星级门槛影响（那个门槛只服务于采集任务的中断打怪）。
     旧版 stepAuto 直接复用 gatherInterruptTarget，导致战斗任务里把「普通怪」也过滤掉 →
     明明有怪却提示「本图无怪」。 */
  function combatTarget() {
    if (!inGame()) return null;
    const list = attackableEnemies();
    if (!list.length) return null;
    return enemyTargetOf(list[0]);
  }

  function gatherInterruptTarget() {
    if (!inGame()) return null;
    const list = attackableEnemies();
    if (!list.length) return null;
    const _need = gatherInterruptMinStars();   // 0=任意怪；1/2/3=只打 ★N 以上
    const e = _need > 0 ? (list.find(x => (RANK_STARS[x.rank] || 0) >= _need) || null) : list[0];
    return enemyTargetOf(e);
  }

  /* 采集模式主循环
   * ★ v2.0.0 的两个问题（用户反馈）：
   *   ① handleFrames() 在 frame_CollectScrap 打开时直接 return —— 采集期间永远不扫怪；
   *   ② 站在采集点上时 frame_Gathering 分支直接 return —— 同样不扫怪。
   *   现在改成：采集窗口只做「计数」，不再阻塞；每 tick 都扫怪，有合适目标就中断采集去打。 */
  function stepGather() {
    // 1) 战斗中：★ 只采集 + 勾了「遇怪逃跑」→ 点游戏自带的「逃跑」；否则交给游戏内置自动战斗
    if (hasFrame('frame_Combat')) {
      if (cfg.gatherFlee && tryGatherFlee()) { st.phase = 'wait'; return; }
      noteCombat();
      st.gatherFighting = true;
      setStatus('战斗中…（游戏自动战斗）');
      return;
    }

    // 2) 移动中（去怪 / 去采集点）：交给移动状态机
    if (retargetGather.tick()) return;   /* ★ 途中持续索敌：去怪/采集点/资源的路上出现更优怪就切 */
    if (checkMove()) return;

    // 3) 战斗收尾（搜尸 / 拾取战利品）：等它走完再回去采集
    if (st.gatherFighting && (hasFrame('frame_Scavenge') || hasFrame('frame_Loot'))) {
      st.phase = 'wait';
      takeAllLoot();
      setStatus('战斗收尾中…');
      return;
    }

    // 4) 采集窗口计数（★ 不阻塞后续判断）
    const inGather = hasFrame('frame_Gathering') || hasFrame('frame_CollectScrap') || gatheringActive();
    if (inGather && !st.inCollect) { st.inCollect = true; countGather(); }
    if (!inGather && st.inCollect) st.inCollect = false;

    // 4.5) ★ 补血/补蓝：没到阈值就先原地补，补够了再考虑打怪 / 采集
    const healing = supply();
    if (healing) { setStatus('回血中…（补到阈值后再继续）'); return; }

    // 5) ★ 采集时优先打怪：有合适目标就中断采集去打
    if (cfg.gatherInterrupt) {
      const t = gatherInterruptTarget();
      if (t) {
        if (inGather) closeGatheringWindows();
        st.gatherFighting = true;
        st.target = t.enemy;
        startMove(t.x, t.y, t.kind, t.label);
        return;
      }
    }

    // 6) 战斗收尾结束，回到采集
    if (st.gatherFighting) { st.gatherFighting = false; setStatus('战斗结束，回去采集…'); }

    if (pollSmithTrip()) return;

    // 7) 顺便捡地面资源（Crate / Mushroom …）—— 一次性资源，先拿再说
    if (cfg.gatherScrap) {
      const r = nearestResource();
      if (r) {
        const d = manhattan(character.x, character.y, r.x, r.y);
        if (!inGather || d <= 15) {                 // 正在采集时只捡近的，避免来回跑
          if (inGather) closeGatheringWindows();
          startMove(r.x, r.y, 'res', '资源·' + (r.name || r.action));
          return;
        }
      }
    }

    const name = effectiveGatherPoint();
    if (!name) { st.phase = 'idle'; setStatus('请先在「挂机」页选择采集点（可点「识别采集点」扫描本图）'); return; }

    const spot = findGatheringSpot(name);
    if (!spot) {
      st.phase = 'idle';
      setStatus('当前地图没有可采集的「' + name + '」（可能不存在，或被门/障碍挡在另一侧走不到）');
      return;
    }
    if (character.x === spot.x && character.y === spot.y) {
      /* ── 兜底[采集] ─────────────────────────────────────────────
       * 症状：弹了进度条却不采集 / 切号后显示「继续采集」却不动。
       * 判据：真在采 = 进度弹窗在转（gatheringActive() 且 gatheringTurning()）。
       *       只看 frame_Gathering 会误判 —— 服务端没确认位置时窗口会开、进度条却不转。
       * 动作：8 秒没转 → 关掉重开；连续 3 次还不行 → 走开一格再走回（强制同步服务端位置）。
       * 上限：不停止，按上面循环。
       * 高级参数：不受影响（8 秒写死）。
       * ─────────────────────────────────────────────────────────── */
      if (gatheringActive() && gatheringTurning()) { st.phase = 'gather'; st.gatherRetryAt = 0; st.gatherIdleSince = 0; st.gatherResync = 0; st.gatherQuickAt = 0; setStatus('采集中…（游戏自动循环）'); return; }
      if (!st.gatherIdleSince) st.gatherIdleSince = now();
      /* ★ v2.6.158：到位后先给游戏 1.2s 自动开采的机会 —— 没开就主动触发一次
         （和「一键挂机」stepAuto 一致）。原来这里直接进 8s 看门狗（第一次还是「走开一格再走回」的落位），
         表现为「到位后要等两轮才开始正式采集」。 */
      if (!st.gatherQuickAt && now() - st.gatherIdleSince >= 1200) {
        st.gatherQuickAt = now();
        closeGatheringWindows();
        if (startGatheringHere()) { st.phase = 'wait'; setStatus('开始采集…'); return; }
      }
      if (now() - st.gatherIdleSince > 8000) {
        st.gatherIdleSince = now();
        st.gatherResync = (st.gatherResync || 0) + 1;
        /* ★ v2.6.70：第一次发现「弹窗开着但进度条不转」就直接做一次真·落位。
           实测：客户端在采集点、服务端说不在 → 只有重新发寻路才能把服务端拉回来（空 walk queue 没用）；
           老代码要等 3×8s=24s 才走开一格，太慢。 */
        if (st.gatherResync === 1 && !st.settling && settleServerPos(spot.x, spot.y, '采集进度条不转', true)) return;
        if (st.gatherResync >= 3) {
          st.gatherResync = 0;
          const n2 = mcAdjWalkTile(spot.x, spot.y);
          if (n2) {
            logEvent('采集看门狗：进度条一直不转 → 走开一格再走回，强制同步服务端位置');
            closeGatheringWindows();
            startMove(n2[0], n2[1], 'gather', '同步采集点');
            return;
          }
        }
        closeGatheringWindows();
        if (startGatheringHere()) {
          setStatus('重新开始采集…（第 ' + st.gatherResync + ' 次）');
          return;
        }
      }
      st.phase = 'wait';
      setStatus('已就位，等待采集开始…');
      return;
    }
    st.gatherRetryAt = 0;
    st.gatherIdleSince = 0;
    st.gatherQuickAt = 0;
    startMove(spot.x, spot.y, 'gather', '采集点·' + spot.name);
  }
  /* ======================= 14.6 活动自动进入（采集时） =======================
   * 游戏 1.0 的 Event（实测 2026-10-18）：
   *   · 活动由玩家手动开启（Event Shard 开门），持续 20 分钟；聊天播报
   *     「[NEW EVENT] The gate to <名> has been opened by <玩家> ... next 20 minutes. [Join Event]」；
   *   · 判定开启：GET /modal/activities 里出现「Event Gate ... Join」按钮；
   *   · 进入：GET /modal/event_gate（开启时返回脚本：关面板 + 显示返回门 + loadTravel()）；
   *   · 活动地图 = 1183（The Sacred Wilds Lobby），公共采集枢纽、无怪；
   *   · 采集点按「资源类型」对应（外面 Copper Mine → 里面 Mine）；
   *   · 时间到服务器自动把角色弹出（回到入口城镇），再用导航回原图继续采（勾了「使用传送点」就走传送）。
   * 状态机：idle → enter → in → return → idle；eventTick() 返回 true = 本 tick 被接管。
   * ===================================================================== */
  const EVENT_MAP_ID = 1183;
  /* ★ v2.6.73：活动检查的节流 / 超时 / 兜底（详见 eventTick 步骤 ④）
     - 间隔 30s：别太频繁地打 /modal/activities
     - 单次请求 8s 超时：fetch 挂死时靠 AbortController 主动中断（原来会永久挂住 → E.busy 卡死 → 再也不检查）
     - busy 兜底 20s：即使超时逻辑没兜住（页面切走 / 异常），超过 20s 也强制释放 busy 重新检查 */
  const EVENT_CHECK_INTERVAL_MS = 30000;
  const EVENT_CHECK_TIMEOUT_MS = 8000;
  const EVENT_CHECK_STUCK_MS = 20000;
  /* ★ v2.6.19：活动「同类型采集点」判定 —— 优先用游戏自己的 data-poi（poi_2=mine 等）。
     传入 poi id 或采集点名字都行；名字走「关键词 → poi」兜底，最后才退回末词。 */
  function eventTypeOf(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    if (/^poi_\d+$/.test(s)) return s;                    /* DOM：data-poi 直接就是类型 */
    const prof = gatherProfOf(s) || gatherProfOf(s.split(/\s+/).pop() || '');
    if (prof && PROF_POI[prof]) return PROF_POI[prof];
    const p = s.split(/\s+/);
    return p[p.length - 1].toLowerCase();
  }
  /* ★ v2.6.101：活动「战斗型」—— 大厅（1183）里有按等级分的战斗区入口，进「当前等级」对应的那个。
     ★★ v2.6.109 用户更正：**1184 不是战斗区，而是「出活动区域的门」；活动没有 Lv1-9 的区域**。
     所以战斗区只有 5 个：1185=10-19 / 1186=20-29 / 1187=30-39 / 1188=40-49 / 1189=50-60。
     （Lv1-9 的角色没有可进的战斗区 —— eventCombatTargetId() 返回 0，脚本会明确报出来。） */
  const EVENT_COMBAT_MAPS = { '1185': [10, 19], '1186': [20, 29], '1187': [30, 39], '1188': [40, 49], '1189': [50, 60] };
  /* ★ v2.6.109：大厅里「通向 1184（出活动区域的门）」的等级门 —— **绝对不能踩**（踩了就离开活动）。
     实测 2026-10-23：门 @14-41 → env_1184.jpg。 */
  const EVENT_LOBBY_EXIT_MAPS = { '1184': 1 };
  const EVENT_LOBBY_EXIT_GATES = { '14-41': 1184 };
  /* ★ v2.6.108：活动大厅（1183）的「等级门」—— 格子 action='level_gate'，name 只有 'Level Gate'，
     **等级不在格子上**，要踩上去看弹出的 #frame_LevelGate：
       <h1>The Sacred Wilds (Level 10-19)</h1> + <img src="/images/maps/ambient/env_1185.jpg">
     → env_<目标图id>.jpg 就是这道门通向哪张图。踩对等级的门会**直接进图**（不弹窗）；
        踩错才弹这个窗（"A strong force is holding you back"）。
     实测 2026-10-23（Doubledawn 活动 / 角色 Lv10，大厅 1183）：
       17-13→1186(20-29) · 38-13→1187(30-39) · 52-12→1188(40-49) · 54-26→1189(50-60) · 11-25→1185(10-19)；
       14-41→1184 = **出活动区域的门**（不是战斗区，见 EVENT_LOBBY_EXIT_GATES，绝不踩）。
     用法：① 优先用「本次活动实测学到」的门→图映射；② 否则用下面这张内置表；③ 都对不上就逐个试（踩错就关窗换下一道）。 */
  const EVENT_LOBBY_GATE_MAP = { '17-13': 1186, '38-13': 1187, '52-12': 1188, '54-26': 1189, '11-25': 1185 };
  function eventCombatTargetId() {
    const lv = +((typeof character === 'object' && character && character.level) || 0);
    if (!(lv > 0)) return 0;
    const ids = Object.keys(EVENT_COMBAT_MAPS);
    for (let i = 0; i < ids.length; i++) { const r = EVENT_COMBAT_MAPS[ids[i]]; if (lv >= r[0] && lv <= r[1]) return +ids[i]; }
    return 0;
  }
  /* 从门名里解析等级区间："The Sacred Wilds (Lv.10-19)" / "Lv. 10 - 19" / "10-19" / "Lv.10" */
  function eventLevelRange(name) {
    const t = String(name || '');
    let m = /Lv\.?\s*(\d+)\s*[-\u2013~\u81f3]\s*(\d+)/i.exec(t);
    if (!m) m = /(\d+)\s*[-\u2013~]\s*(\d+)/.exec(t);
    if (m) return [+m[1], +m[2]];
    m = /Lv\.?\s*(\d+)\b/i.exec(t);
    if (m) return [+m[1], +m[1]];
    return null;
  }
  /* 诊断：把本图所有 POI 按 action 归类列出来（每个 action 最多 6 个），找不到门时写进日志。
     ★ v2.6.102：原来只看 .tile_poi[action]，会漏掉「战斗区入口」这种非标准 action / 非 tile_poi 的点。 */
  function eventDumpTiles() {
    try {
      const els = $$q('.map_table [action], #map_container [action], .map_table .tile_poi, #map_container .tile_poi, .map_table [data-poi], #map_container [data-poi]');
      const cnt = {}, out = [];
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const a = String(el.getAttribute('action') || '') || '(no-action)';
        const n = String(el.getAttribute('name') || el.getAttribute('data-poi') || el.getAttribute('title') || '').trim();
        const c = String(el.getAttribute('coords') || '');
        const oc = String(el.getAttribute('onclick') || '').trim();
        if ((cnt[a] || 0) >= 6) continue;
        cnt[a] = (cnt[a] || 0) + 1;
        out.push(a + ':' + n + (c ? '@' + c : '') + (oc ? ' onclick=' + oc.slice(0, 50) : ''));
      }
      const nPoi = $$q('.map_table .tile_poi').length;
      const nAct = $$q('.map_table .tile_poi[action]').length;
      return 'tile_poi=' + nPoi + ' 有action=' + nAct + ' ｜ ' + (out.slice(0, 70).join(' / ') || '(无)');
    } catch (e) { return '(dump 失败：' + (e && e.message ? e.message : e) + ')'; }
  }
  /* 找大厅里「当前等级该走的那道门」：返回 {x,y,name,id} 或 null */
  function eventCombatGate() {
    const want = eventCombatTargetId();
    if (!want) return null;
    const rng = EVENT_COMBAT_MAPS[String(want)] || [0, 0];
    const mk = function (g) { return { x: g.x, y: g.y, name: 'The Sacred Wilds (Lv.' + rng[0] + '-' + rng[1] + ')', id: want }; };
    /* ① 本图所有「等级门」格子 */
    const gates = $$q('.map_table .tile_poi[action="level_gate"]').map(function (el) {
      const c = (el.getAttribute('coords') || '').split('-');
      return { x: +c[0], y: +c[1], key: c[0] + '-' + c[1] };
    }).filter(function (t) { return t.x > 0 && t.y > 0; });
    if (!gates.length) return null;
    const E = st.event;
    const learned = E.gateMap || {};
    const tried = E.gateTried || {};
    /* ★ v2.6.109：通向 1184（出活动区域的门）的等级门一律不碰 —— 踩了就离开活动。 */
    const isExitGate = function (key) {
      if (EVENT_LOBBY_EXIT_GATES[key]) return true;
      return !!EVENT_LOBBY_EXIT_MAPS[String(learned[key] || 0)];
    };
    /* ★ v2.6.108：旧逻辑「按格子名字里的等级区间匹配」是错的 —— 大厅里唯一带 "(Lv.10)" 的格子是
       **回城出口** 'Elundi (Lv.10)'，会被误当成战斗区入口（实测踩过）。现在只认 level_gate 格子 +
       实测/内置的「门→目标图」映射。 */
    const idOf = function (key) { return (learned[key] !== undefined) ? learned[key] : EVENT_LOBBY_GATE_MAP[key]; };
    /* ② 已知通向目标图、且没被实测否掉的门 → 取最近的一道 */
    const good = gates.filter(function (g) { return !isExitGate(g.key) && idOf(g.key) === want; });
    if (good.length) {
      const cx = character.x, cy = character.y;
      good.sort(function (a, b) { return manhattan(cx, cy, a.x, a.y) - manhattan(cx, cy, b.x, b.y); });
      return mk(good[0]);
    }
    /* ③ 映射对不上 → 逐个试「还没试过的门」（踩错会弹 #frame_LevelGate，eventTick 读到目标图后记进 E.gateMap） */
    const fresh = gates.filter(function (g) { return !isExitGate(g.key) && !tried[g.key] && (learned[g.key] === undefined || learned[g.key] === want); });
    if (!fresh.length) return null;
    const cx = character.x, cy = character.y;
    fresh.sort(function (a, b) { return manhattan(cx, cy, a.x, a.y) - manhattan(cx, cy, b.x, b.y); });
    return mk(fresh[0]);
  }
  /* 当前是否在「活动战斗区」里（主循环据此强制走战斗逻辑） */
  function eventCombatActive() {
    try {
      if (!cfg.autoEvent || cfg.eventRes !== 'combat') return false;
      const E = st.event; if (!E || !E.on) return false;
      return !!EVENT_COMBAT_MAPS[String(character.current_map)];
    } catch (e) { return false; }
  }
  function eventReset() {
    const E = st.event; if (!E) return;
    E.on = false; E.phase = 'idle'; E.busy = false; E.pointName = ''; E.enteredAt = 0;
    E.busyAt = 0; E.checkAt = 0; E.checkFails = 0; E.combatSkipAt = 0; E.lastHas = null;   /* ★ v2.6.73：清掉检查态，避免残留 busy 卡死 */
    E.gateBusy = false; E.gateLogAt = 0; E.combatMap = 0;   /* ★ v2.6.101 */
    E.dungeonLogAt = 0;                                     /* ★ v2.6.108 */
    E.gateMap = {}; E.gateTried = {};                       /* ★ v2.6.108：大厅等级门「门→目标图」实测表 / 已试过的门 */
  }
  /* 活动是否开启：/modal/activities 里有没有 Event Gate 的 Join 按钮（实测：活动结束按钮消失） */
  async function eventActivitiesHasJoin() {
    /* ★ v2.6.73：加超时 —— 原来裸 fetch，一旦请求挂住（网络抖动 / 服务器不响应）会永久 await，
       eventTick 的 E.busy 也跟着永久为 true → 活动再也不会被检查。这里用 AbortController 主动中断。 */
    let ac = null, timer = 0;
    try {
      ac = (typeof AbortController === 'function') ? new AbortController() : null;
      if (ac) timer = setTimeout(function () { try { ac.abort(); } catch (e) { /* ignore */ } }, EVENT_CHECK_TIMEOUT_MS);
      const r = await fetch('/modal/activities', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: ac ? ac.signal : undefined });
      const t = await r.text();
      /* ★ v2.6.19：先按 DOM 锚点找「Event Gate 磁贴」（onclick 带 /modal/event_gate，语言无关），
         再看这块磁贴里有没有可点的 Join 按钮（onclick 带 event_gate / join）。 */
      try {
        const doc = new DOMParser().parseFromString(t, 'text/html');
        const tile = doc.querySelector('[onclick*="/modal/event_gate"]');
        if (tile) {
          const btns = tile.querySelectorAll('button,a');
          for (let i = 0; i < btns.length; i++) { if (/event_gate|join/i.test(btns[i].getAttribute('onclick') || '')) return true; }
          if (/Join|加入/i.test(tile.textContent || '')) return true;
        }
      } catch (e) { /* ignore */ }
      return /Event\s*Gate[\s\S]{0,600}?(Join|加入)\s*<\/button>/i.test(t);
    } catch (e) { throw e; }
    finally { if (timer) clearTimeout(timer); }
  }
  /* 进入活动：等价于游戏活动面板里「Event Gate」磁贴的 onclick ——
     createDialog('Event Gate','','ajax','/modal/event_gate')。
     ★ v2.6.9 修 bug：原来只 fetch('/modal/event_gate') 并用正则看返回里有没有 hud_portal/loadTravel，
       但**从不执行**服务端返回的那段脚本 → loadTravel() 永远不跑 → 永远「进入失败（没切到活动图）」。
       必须交给游戏自己的 createDialog 去加载并执行响应脚本（关面板 + 显示 #hud_portal + loadTravel()）。 */
  async function eventEnterGate(alive) {
    alive = alive || function () { return true; };
    try {
      if (!alive()) return false;
      if (typeof window.createDialog !== 'function') return false;
      /* ★ v2.6.108：先探一次响应，识别「Failed: Inside Event」这类服务端拒绝并写清楚日志
         （原来 createDialog 是 fire-and-forget，失败静默 → 看着像「进活动没反应」）。 */
      try {
        const r = await fetch('/modal/event_gate', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        const t = await r.text();
        if (/Failed\s*:\s*Inside Event/i.test(t)) { logEvent('活动：进入被拒（Failed: Inside Event）→ 当前在副本 / 塔里，先出副本再进'); return false; }
      } catch (e) { /* 探测失败不阻塞，继续走 createDialog */ }
      if (!alive()) return false;
      humanDialog('Event Gate', '', 'ajax', '/modal/event_gate', undefined, alive);
      return true;
    } catch (e) { return false; }
  }
  /* 在活动图里挑一个「和外面同类型」的采集点（如外面 Copper Mine → 里面 Mine）；没有同类型就取最近的 */
  function eventPickPoint() {
    const E = st.event;
    /* ★ 优先用「用户指定类型」cfg.eventRes；否则用「进入前锁定」的类型（E.homeType）：到活动图里再算会受下拉框影响 */
    const want = cfg.eventRes ? (PROF_POI[cfg.eventRes] || '') : (E.homeType || eventTypeOf(E.homeRes || E.homePoint || cfg.gatherPoint));
    const tiles = $$q('.map_table .tile_poi[action="gathering"]').map(function (el) {
      const c = (el.getAttribute('coords') || '').split('-');
      return { name: (el.getAttribute('name') || '').trim(), poi: (el.getAttribute('data-poi') || '').trim(), x: +c[0], y: +c[1] };
    }).filter(function (t) { return t.name && t.x > 0 && t.y > 0; });
    if (!tiles.length) return '';
    const byDist = function (a, b) { return manhattan(character.x, character.y, a.x, a.y) - manhattan(character.x, character.y, b.x, b.y); };
    if (want) {
      const hit = tiles.filter(function (t) { return eventTypeOf(t.poi || t.name) === want; });
      if (hit.length) { hit.sort(byDist); return hit[0].name; }
      /* ★ 活动图里确实没有同类型：记一条日志，再退回最近的（原来静默退回，看着像「没做类型对应」） */
      try { logEvent('活动：活动图里没有「' + want + '」类型（本图有 ' + tiles.map(function (t) { return t.name; }).join('/') + '）→ 改采最近的'); } catch (e) { /* ignore */ }
    }
    tiles.sort(byDist);
    return tiles[0].name;
  }
  /* ★ v2.6.108：当前是否在「副本 / 塔」里 —— 这种地方**不能进活动**。
     实测（2026-10-23）：角色在深渊塔（map 901）里点 Event Gate，服务端直接返回
       <script>quickNote('Failed: Inside Event','red'); closeFrame(...)</script>
     → 白白浪费整个 20 分钟活动窗口。所以进活动前先判这个。
     判据：① 深渊塔地图（900-911）；② MapDB 类型是 Dungeon / Secret 的图。 */
  function inDungeonOrTower() {
    try {
      const m = +character.current_map;
      if (!(m > 0)) return '';
      if (isTowerMap(m)) return '深渊塔';
      const t = String((MapDB && typeof MapDB.type === 'function' ? MapDB.type(m) : '') || '');
      if (t === 'Dungeon') return '副本';
      if (t === 'Secret') return '秘境';
    } catch (e) { /* ignore */ }
    return '';
  }
  /* ★ v2.6.136：判断一个 HUD 元素「现在真的显示着」。
     游戏的隐藏类是 `.no_display{display:none}`（无 !important），而显示时用 jQuery
     `slideDown()` 只加一个**行内** display（优先级高于类）—— **class 不会被去掉**。
     所以不能看 class，只能看计算后的 display。
     （也不能用 offsetParent：HUD 那一排可以被折叠，折叠时 offsetParent 会是 null。） */
  function hudShown(el) {
    try {
      if (!el) return false;
      const cs = (typeof getComputedStyle === 'function') ? getComputedStyle(el) : null;
      if (cs) return cs.display !== 'none' && cs.visibility !== 'hidden';
      return String(el.style.display) !== 'none';
    } catch (e) { return false; }
  }

  /* ★ v2.6.135：活动「返回传送门」。
     进活动时游戏会给一个 #hud_portal（tooltip：You have an open portal. You can travel back to
     your latest location. The portal will close after being used.）。点它 = 游戏原生全局函数
     backPortal()，直接回到「进入活动前的位置」，比 navToMap 一步步走回去快得多（一次性。
     实测记录（资料汇编 36 章）：活动结束被服务器弹出后 #hud_portal 仍在，仍可 backPortal() 回去。 */
  function tryBackPortal(tag) {
    const t = tag || '活动结束';
    try {
      const el = document.getElementById('hud_portal');
      if (!el) return false;
      if (!hudShown(el)) return false;                       /* 没显示 = 当前没有可用的返回传送门 */
      logEvent(t + '：使用返回传送门（#hud_portal / backPortal()）回进入前的位置');
      setStatus(t + '：用返回传送门回去…');
      if (typeof window.backPortal === 'function') window.backPortal();
      else { try { el.click(); } catch (e2) { return false; } }   /* 没有全局函数就点图标本身 */
      return true;
    } catch (e) { return false; }
  }

  /* 主循环钩子：true = 本 tick 已被活动逻辑接管（进入 / 返回期间） */
  function eventTick() {
    if (!cfg.autoEvent) { if (st.event.phase !== 'idle') eventReset(); return false; }
    if (!running || !inGame()) return false;
    /* ★ v2.6.157：优先级 Overlord > 活动 —— Overlord 期间活动让路，
       否则「已离开活动图」分支会把角色从 Overlord 房拽回活动。 */
    if (cfg.autoOverlord && ovlHolding()) return false;
    const E = st.event;
    const onEventMap = String(character.current_map) === String(EVENT_MAP_ID);

    /* ★ v2.6.51：爬塔时不进活动 —— 塔层共用同一张地图（901）且没有层数变量，
       进出活动会从第 1 层重新开始。已在活动图里时仍按原逻辑处理（正常采集 / 结束返回）。 */
    if (st.mode === 'tower' && !E.on) { if (E.phase !== 'idle') eventReset(); return false; }

    /* ① 已在活动里（大厅 1183 或 战斗区 1184~1189） */
    const onCombatArea = !!EVENT_COMBAT_MAPS[String(character.current_map)];
    if (onEventMap || onCombatArea) {
      /* ★ v2.6.150：已经在活动图里 → 任何「回挂机地图」的待办导航都是过期的，清掉。
         否则 eventTick 在采集 / 战斗分支让出 tick 后，navPendingTick() 会把角色从活动图拽走
         （「切副角色收东西再切回主角色」时必现：恢复挂机登记了回图待办 → 再也进不去活动）。 */
      if (navPending) { navClearPending(); logEvent('活动：已在活动图 → 取消「回挂机地图」待办导航'); }
      /* ★ v2.6.101：战斗型 —— 大厅里走到「当前等级对应的战斗区」入口；战斗区里就正常开打 */
      if (cfg.eventRes === 'combat') {
        if (onCombatArea) {
          if (!E.on) {
            E.on = true; E.phase = 'in'; E.enteredAt = now(); E.combatMap = +character.current_map;
            logEvent('活动：已进入战斗区「' + currentMapName() + '」（角色 Lv ' + (character.level || '?') + '）→ 开始战斗');
            setStatus('活动：在战斗区战斗（' + currentMapName() + '）…');
          }
          return false;   /* 交给主循环的战斗逻辑 */
        }
        /* ★ v2.6.108：踩到「等级不对」的门会弹 #frame_LevelGate（"A strong force is holding you back"）。
           从里面的 env_<目标图id>.jpg 读出这道门通向哪张图 → 记进 E.gateMap（本次实测），关窗换下一道。
           踩对等级的门是**直接进图**、不会弹这个窗。 */
        const lgf = document.getElementById('frame_LevelGate');
        if (lgf) {
          const img = lgf.querySelector('img');
          const src = img ? (img.getAttribute('src') || '') : '';
          const m = /env_(\d+)\.jpg/.exec(src);
          const key = character.x + '-' + character.y;
          E.gateTried = E.gateTried || {}; E.gateTried[key] = 1;
          if (m) { E.gateMap = E.gateMap || {}; E.gateMap[key] = +m[1]; }
          const _isExit = !!(m && EVENT_LOBBY_EXIT_MAPS[String(+m[1])]);
          logEvent('活动：等级门 ' + key + ' 通向「' + (m ? navMapName(+m[1]) + '（' + m[1] + '）' : '?') + '」'
            + (_isExit ? '—— 这是「出活动区域的门」，不再踩它' : '—— 等级不符 → 换下一道门'));
          try { closeFrameById('frame_LevelGate'); } catch (e) { /* ignore */ }
          E.gateBusy = false;
          return true;
        }
        /* 在大厅（刚进来 / 从战斗区退回来）→ 选门 + 走过去（异步，走的过程中接管本 tick） */
        if (E.gateBusy) return true;
        const gate = eventCombatGate();
        if (!gate) {
          /* ★ v2.6.109：先分清「本等级根本没有战斗区」（Lv1-9）和「有区域但没找到门」 */
          if (!eventCombatTargetId()) {
            if (now() - (E.gateLogAt || 0) > 60000) { E.gateLogAt = now(); logEvent('活动：角色 Lv' + (character.level || '?') + ' 没有对应的战斗区（活动只有 Lv10-19 / 20-29 / 30-39 / 40-49 / 50-60 五个区域）→ 本次不进战斗区'); }
            setStatus('活动：本等级没有对应的战斗区（Lv' + (character.level || '?') + '）');
            return true;
          }
          if (now() - (E.gateLogAt || 0) > 20000) {
            E.gateLogAt = now();
            logEvent('活动：大厅里没找到等级 ' + (character.level || '?') + ' 的战斗区入口 → tile_poi：' + eventDumpTiles() + ' ｜ door_tiles：' + (function(){ try { const d=window.door_tiles||{}; return Object.keys(d).map(function(k){return k+'='+d[k];}).join(',')||'(空)'; } catch(e){ return '(读不到)'; } })());
          }
          setStatus('活动：等待战斗区入口（Lv ' + (character.level || '?') + '）…');
          return true;
        }
        E.gateBusy = true; if (gate.id) E.combatMap = gate.id;
        logEvent('活动：前往战斗区「' + gate.name + '」@' + gate.x + ',' + gate.y + '（角色 Lv ' + (character.level || '?') + '）');
        setStatus('活动：进入战斗区（' + gate.name + '）…');
        (async function () {
          const from = character.current_map;
          try {
            await navWalkTile(gate.x, gate.y, {
              retrigger: true,
              /* ★ v2.6.108：踩对 → 换图；踩错 → 弹 #frame_LevelGate。两种都立刻结束，别干等超时。 */
              cond: function () { return !!document.getElementById('frame_LevelGate') || +character.current_map !== +from; },
              timeoutMs: 60000,
              alive: function () { return running && cfg.autoEvent; }
            });
          } catch (e) { /* ignore */ }
          finally { E.gateBusy = false; }
        })();
        return true;
      }
      /* 采集型 */
      if (!E.on) {
        /* ★ 刚进活动图时 .map_table 可能还没渲染完 → eventPickPoint() 返回空。
           这时**先别定采集点**（否则 effectiveGatherPoint 会退回下拉里第一个 Quarry），
           接管本 tick，等地图渲染好再挑。 */
        const pt = eventPickPoint();
        if (!pt) { setStatus('活动：等待活动地图渲染…'); return true; }
        E.on = true; E.phase = 'in'; E.enteredAt = now();
        E.pointName = pt;
        logEvent('活动：进入活动地图「' + currentMapName() + '」，采集点 → ' + pt);
        setStatus('活动：在活动地图采集（' + pt + '）…');
      }
      return false;
    }

    /* ★ v2.6.12 修 bug：维修 / 清包 / 存仓行程中离开活动图 ≠ 活动结束。
       行程本身要离开活动图去城镇，修完再回活动图（runRepair 会把 st.tripHome 设成活动图）。
       这里别误判「活动结束」去抢导航，也别清 E.on / pointName。 */
    if (st.repair.active || st.sell.active || st.bank.active) return true;

    /* ② 刚被弹出活动图 → 回原图继续「之前的任务」 */
    if (E.on) {
      E.on = false; E.phase = 'return'; E.pointName = '';
      const prev = st.mode;
      const home = +E.homeMap || +cfg.farmMap || 0;
      logEvent('活动：已离开活动地图（' + currentMapName() + '）→ 继续' + (prev === 'tower' ? '爬塔' : (prev === 'gather' ? '采集' : '战斗')));
      if (prev === 'tower') {
        /* ★ 爬塔：交给 stepTower 自己导航回塔城再进塔（塔层数会从第 1 层重新开始） */
        E.phase = 'idle';
      } else if (home && String(character.current_map) !== String(home)) {
        /* ★ v2.6.135：先试「返回传送门」（一键回到进入前的位置），没传送成功再退回走路回去。 */
        if (tryBackPortal()) {
          E.phase = 'return';
          setTimeout(function () {
            try {
              if (!running) { E.phase = 'idle'; return; }
              if (String(character.current_map) === String(home)) { E.phase = 'idle'; return; }
              logEvent('活动：返回传送门没生效（当前 ' + currentMapName() + '）→ 改用导航回「' + navMapName(home) + '」');
              navToMap(home, { alive: function () { return running && cfg.autoEvent; }, allowCity: cfg.useWaygateCity, allowWild: cfg.useWaygateWild })
                .then(function () { E.phase = 'idle'; }, function () { E.phase = 'idle'; });
            } catch (e) { E.phase = 'idle'; }
          }, 4000);
          return true;
        }
        setStatus('活动结束：返回「' + navMapName(home) + '」…');
        navToMap(home, { alive: function () { return running && cfg.autoEvent; }, allowCity: cfg.useWaygateCity, allowWild: cfg.useWaygateWild })
          .then(function () { E.phase = 'idle'; }, function () { E.phase = 'idle'; });
      } else { E.phase = 'idle'; }
      return true;
    }

    /* ③ 正在进入 / 返回 → 接管本 tick，别让角色乱跑 */
    if (E.phase !== 'idle') return true;

    /* ④ 定期检查活动是否开启（战斗 / 采集 / 爬塔 都生效）。
       ★ v2.6.73：战斗任务里也要检查，但「只在战斗状态外」检查 —— 正在打（#frame_Combat 在）就本 tick 不查，
       打完这一场（战斗窗口消失）后的第一个 tick 再查，避免战斗中切图 / 打断战斗。
       检查带超时（EVENT_CHECK_TIMEOUT_MS）+ 兜底（E.busy 超过 EVENT_CHECK_STUCK_MS 强制释放）+ 诊断日志。 */
    if (inCombatNow()) { E.combatSkipAt = now(); return false; }   /* 战斗中：本 tick 不查，等打完这一场 */
    /* ★ v2.6.108：在副本 / 塔里不能进活动（服务端返回 Failed: Inside Event）→ 先不查，
       也不推进 lastCheckAt，出副本后第一个 tick 立刻能查。 */
    const _dz = inDungeonOrTower();
    if (_dz) {
      if (now() - (E.dungeonLogAt || 0) > 120000) { E.dungeonLogAt = now(); logEvent('活动：当前在「' + currentMapName() + '」（' + _dz + '）里 —— 副本内不能进活动，先出副本再进'); }
      setStatus('活动开启中，但当前在' + _dz + '里 → 先出副本再进活动');
      return false;
    }
    if (now() - (E.lastCheckAt || 0) < EVENT_CHECK_INTERVAL_MS) return false;
    /* ★ 兜底：上一轮检查卡死（fetch 挂死 / 页面被切走）→ 超过 EVENT_CHECK_STUCK_MS 强制释放 busy 重查 */
    if (E.busy) {
      const held = now() - (E.busyAt || 0);
      if (held < EVENT_CHECK_STUCK_MS) return false;
      E.busy = false; E.checkFails = (E.checkFails || 0) + 1;
      logEvent('活动：上次检查卡住 ' + Math.round(held / 1000) + 's → 强制放弃并重查（连续 ' + E.checkFails + ' 次）');
    }
    E.lastCheckAt = now();
    E.busy = true; E.busyAt = now();
    const seq = runSeq, checkAt = E.busyAt;
    const alive = function () { return running && seq === runSeq && cfg.autoEvent && E.busyAt === checkAt; };
    (async function () {
      try {
        const has = await eventActivitiesHasJoin();
        if (!alive()) return;
        E.checkAt = now();
        if (!has) {
          /* 诊断日志：状态变化（开启→关闭）必记；状态不变则 5 分钟一条心跳，避免每 30s 刷屏 */
          if (E.lastHas !== false) { E.lastLogAt = now(); logEvent('活动：未开启'); }
          E.lastHas = false; E.checkFails = 0;
          return;
        }
        E.lastHas = true; E.checkFails = 0;
        E.homeMap = +cfg.farmMap || +character.current_map;
        /* ★ 用 effectiveGatherPoint()：用户没手动选时 cfg.gatherPoint 可能是空的，
           真正在采的是下拉里自动识别的那个 —— 否则进活动后类型匹配失败，会去挖第一个（Quarry）。 */
        E.homePoint = String(effectiveGatherPoint() || cfg.gatherPoint || '');
        E.homeRes = E.homePoint;
        E.homeType = eventTypeOf(E.homePoint);   /* ★ 进入前就锁定「要采的类型」 */
        E.phase = 'enter';
        logEvent('活动：检测到活动开启 → 进入（原图 ' + navMapName(E.homeMap) + ' · ' + (E.homePoint || '未设采集点') + '）');
        setStatus('活动开启：进入活动地图…');
        await eventEnterGate(alive);
        if (!alive()) return;
        for (let i = 0; i < 30; i++) { await sleep(1000); if (!alive()) return; if (String(character.current_map) === String(EVENT_MAP_ID)) break; }
        if (String(character.current_map) === String(EVENT_MAP_ID)) {
          /* ★ v2.6.111：先试「只刷新画面」—— 调游戏 loadTravel() 重画地图 + 对准镜头；
             3 秒后还是没画出活动图（或 loadTravel 被客户端 retryCount>=5 卡成 no-op）→ 退回整页刷新。
             （v2.6.10 的老办法是直接 location.reload()，能修但太重。） */
          logEvent('活动：已进入活动图 → 先调游戏 loadTravel() 重画（不刷新网页）');
          E.phase = 'idle';
          softReloadMap();
          setTimeout(function () {
            try {
              if (!alive() || !inGame()) return;
              if (+character.current_map !== +EVENT_MAP_ID) return;   /* 又离开活动图 → 不管 */
              const drawn = renderedMapId() || renderMapId();
              if (drawn === +EVENT_MAP_ID) { recenterCamera(); return; }
              logEvent('活动：loadTravel() 后仍未画出活动图（画面还是 ' + (drawn || '?') + '）→ 刷新页面');
              saveCfgNow();
              location.reload();
            } catch (e) { /* ignore */ }
          }, 3000);
          return;
        }
        E.phase = 'idle'; logEvent('活动：进入失败（没切到活动图）');
      } catch (e) {
        if (!alive()) return;
        E.checkFails = (E.checkFails || 0) + 1;
        E.phase = 'idle';
        logEvent('活动：检查/进入异常 → ' + (e && e.message ? e.message : String(e)) + '（连续 ' + E.checkFails + ' 次）');
      }
      finally { if (seq === runSeq && E.busyAt === checkAt) E.busy = false; }
    })();
    return true;
  }


  /* ======================= 14.7 Overlord（世界 Boss）自动参战 =======================
   * 官方（help 111 / wiki 161）：Overlord 在服务器时间 01:00 / 10:00 / 19:00 刷新，全服一起打；
   *   Activities 面板的「Overlord Chamber」磁贴带 data-countdown-epoch = 下一次刷新的 UTC 秒。
   * 实测（2026-10-24，build P20261023）：
   *   · Activities 磁贴：<div onclick="quickNote('Unlocks at Level 30')">… Overlord Chamber … <div class=promo-countdown data-countdown-epoch=…>
   *   · 详情：GET /modal/overlord_chamber → 头图 + 倒计时（data-countdown-epoch）+ 上一场排行榜
   *   · 参战入口：游戏 HUD 里有个隐藏的「Global Overlord」图标（[content="Global Overlord"]），
   *     可参战时去掉 class=no_display；它的 onclick =
   *       createDialog('Join Overlord Battle?', …, 'confirm',
   *         "javascript:createDialog('Overlord Chamber','','ajax','/modal/overlord_chamber?src=activities');")
   *     = 游戏自己的 overlordChamber('activities')。脚本直接走这一步（跳过确认弹窗）。
   * HUD 图标只代表入口开放；必须结合最新倒计时，在设定提前时间内才进入。
   * 参战要求：角色 Lv30+（官方 wiki 161）。
   * ===================================================================== */
  function ovlHudJoinBtn() {
    try {
      const els = $$q('[content="Global Overlord"]');
      for (let i = 0; i < els.length; i++) {
        if (hudShown(els[i])) return els[i];                 /* 游戏把它 slideDown 出来 = 可参战 */
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  /* ★ v2.6.159：Overlord 房内唯一可攻击目标就是 Boss —— 房间判定放宽 + 进房后锁图。 */
  function ovlBossTile() {
    try {
      const els = $$q('.map_table [action="boss"], .map_table [action="overlord"], .map_table [data-poi="boss_on"]');
      for (let i = 0; i < els.length; i++) {
        const c = String(els[i].getAttribute('coords') || '').split('-');
        const x = +c[0], y = +c[1];
        if (x > 0 && y > 0) return { x: x, y: y, name: String(els[i].getAttribute('name') || '').trim() };
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  function ovlInBattle() {
    const O = st.ovl;
    /* 已锁定房间图：以它为准（离开房间即失效，交给 ovlTick 的离场分支） */
    if (O && O.roomMap) return +character.current_map === +O.roomMap;
    try { if (window.overlordChamberMapIds && window.overlordChamberMapIds[character.current_map]) return true; } catch (e) { /* ignore */ }
    try { if (+window.overlordEnemyId > 0) return true; } catch (e) { /* ignore */ }
    try { if (/spawn_overlord/i.test(String((window.map && window.map.name) || ''))) return true; } catch (e) { /* ignore */ }
    try { if (document.querySelector('#overlord_hp, #overlord_boss, .overlord_hp')) return true; } catch (e) { /* ignore */ }
    /* 兜底①：脚本刚点过参战、且已不在「参战前那张图」→ 认为被传进了 Boss 房（不依赖地图 id 名单）。 */
    try { if (O && O.joinMap && O.phase !== 'idle' && +character.current_map !== +O.joinMap) return true; } catch (e) { /* ignore */ }
    /* 兜底②：本场 Overlord 会话内，当前图有固定格子的 Boss tile → 认为在房内。 */
    try { if (O && O.phase !== 'idle' && ovlBossTile()) return true; } catch (e) { /* ignore */ }
    return false;
  }
  async function ovlReadCountdown() {
    let ac = null, timer = 0;
    try {
      ac = (typeof AbortController === 'function') ? new AbortController() : null;
      if (ac) timer = setTimeout(function () { try { ac.abort(); } catch (e) { /* ignore */ } }, EVENT_CHECK_TIMEOUT_MS);
      const r = await fetch('/modal/overlord_chamber', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: ac ? ac.signal : undefined });
      const t = await r.text();
      const m = /data-countdown-epoch=["'](\d+)["']/.exec(t);
      let boss = '';
      const h = /<h1[^>]*>([\s\S]{0,300}?)<\/h1>/i.exec(t);
      if (h) boss = String(h[1]).replace(/<[^>]*>/g, '').trim();
      return { epoch: m ? +m[1] : 0, boss: boss };
    } catch (e) { return { epoch: 0, boss: '' }; }
    finally { if (timer) clearTimeout(timer); }
  }
  function ovlHhmmss(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + 'h' : '') + (h || m ? m + 'm' : '') + ss + 's';
  }
  function ovlJoin() {
    const O = st.ovl;
    if (now() - (O.joinedAt || 0) < 30000) return;   /* 30s 内只点一次，别刷屏 */
    O.joinedAt = now();
    /* ★ v2.6.157：从「活动」里参战 → 打完回活动（而不是挂机图）；
       同时把活动的「原图」也记成活动图，避免 Overlord 期间活动模块把角色拽回挂机图。 */
    const evm = eventReturnMap();
    O.homeMap = evm || +cfg.farmMap || +character.current_map;
    if (evm && st.event) st.event.homeMap = evm;
    O.joinedEpoch = O.nextEpoch;
    O.fought = false;                 /* ★ v2.6.154：新一场 → 复位「本场打过没」 */
    O.leaveBusy = false; O.leaveAt = 0; O.leaveTries = 0;
    O.roomMap = 0; O.enteredAt = 0; O.joinMap = +character.current_map;   /* ★ v2.6.159：记住参战前那张图，换图即视为进房 */
    O.phase = 'joining';
    const seq = runSeq, charId = character.id;
    logEvent('Overlord：已到设定提前时间，进入房间');
    setStatus('Overlord：正在参战…');
    const joinedAt = O.joinedAt, mapId = character.current_map;
    humanDefer(function () {
      if (!running || !cfg.autoOverlord || seq !== runSeq || character.id !== charId || character.current_map !== mapId || O.joinedAt !== joinedAt) return;
      if (typeof window.createDialog === 'function') window.createDialog('Overlord Chamber', '', 'ajax', '/modal/overlord_chamber?src=activities', true);
    });
    /* 兜底：若面板里还要再点一次「Join / Enter」，就点它（跳过玩家排行榜行） */
    setTimeout(function () {
      try {
        if (!running || !cfg.autoOverlord || seq !== runSeq || character.id !== charId || ovlInBattle()) return;
        const f = document.getElementById('frame_OverlordChamber') || document.querySelector('div[id^="frame_"][id*="verlord"]');
        if (!f) return;
        const btns = $$q('button,a', f);
        for (let i = 0; i < btns.length; i++) {
          const oc = String(btns[i].getAttribute('onclick') || '');
          if (/inspect\(/.test(oc)) continue;
          if (/join|enter|overlord/i.test(oc) || /join|enter|加入|进入/i.test(btns[i].textContent || '')) {
            humanClick(btns[i]);
            logEvent('Overlord：点了面板里的参战按钮「' + String(btns[i].textContent || '').trim().slice(0, 20) + '」');
            break;
          }
        }
      } catch (e) { /* ignore */ }
    }, 2500);
  }
  /* 世界 Boss 使用独立目标选择，不受日常采集模式、怪物名单或拾取开关影响。 */
  const OVL_BOSS_GONE_MS = 60000;   /* ★ v2.6.159：打过 Boss 后、房内暂时没 Boss 的宽限（避免阶段切换/短暂消失就离场） */
  function ovlRoomTick() {
    const O = st.ovl;
    if (!O.on) {
      O.on = true; O.phase = 'waiting'; O.fought = false; O.leaveBusy = false; O.leaveAt = 0; O.leaveTries = 0;
      O.roomMap = +character.current_map;      /* ★ v2.6.159：锁定房间图，离房即失效 */
      O.enteredAt = now();
      O.homeMap = O.homeMap || +cfg.farmMap || 0;
      logEvent('Overlord：已进房（map ' + O.roomMap + '），等待 Boss');
    }
    if (hasFrame('frame_Combat')) { O.fought = true; ensureAutoBattle(); noteCombat(); O.phase = 'combat'; return true; }
    if (handleFrames()) return true;
    /* ★ v2.6.154：打完不再开宝箱 —— 奖励改走邮件，开箱步骤已废弃。
       宝箱格子（overlord_lootbox）/ 结算窗（frame_OverlordLootbox）一律忽略，直接等系统把角色传出房间。 */
    if (!renderSynced()) { setStatus('Overlord：等待地图加载…'); return true; }
    if (checkMove()) return true;
    if (supply()) return true;
    /* ★ v2.6.159：房内唯一可攻击目标就是 Boss。先找普通敌人（span.enemy），
       再找固定格子上的 Boss tile（.map_table action=boss/overlord / data-poi=boss_on）。 */
    let boss = scanEnemies().filter(e => isReachable(e.x, e.y)).sort((a, b) =>
      manhattan(character.x, character.y, a.x, a.y) - manhattan(character.x, character.y, b.x, b.y))[0];
    if (!boss) {
      const bt = ovlBossTile();
      if (bt) boss = { x: bt.x, y: bt.y, name: bt.name || 'Overlord', tile: true };
    }
    if (boss) {
      O.phase = 'combat'; st.target = boss; O.fought = true; O.goneAt = 0;   /* 见到 Boss 即算本场参战 */
      if (now() - (O.actionAt || 0) >= 2000) {
        O.actionAt = now();
        if (boss.tile && +character.x === boss.x && +character.y === boss.y) {
          const act = tileActionAt(boss.x, boss.y) || 'boss';
          try { if (typeof window.execTileAction === 'function') window.execTileAction(act, false); } catch (e) { /* ignore */ }
        } else {
          startMove(boss.x, boss.y, 'enemy', 'Overlord · ' + boss.name);
        }
      }
      return true;
    }
    /* 房内没有 Boss 了（已打完 / 还没刷）→ 直接离场。
       先试游戏自己的返回传送门；没有传送门就等系统把角色传出房间
       （ovlTick 的 O.on 分支会检测到「已离开房间」并登记返程）。
       ★ 只在「本场确实打过」之后才试传送门，避免刚进房就被传走。
       ★ v2.6.159 兜底：进房很久仍没开打（Boss 一直没刷 / 没识别到）→ 也离场，别永久卡死。 */
    O.phase = 'waiting'; st.phase = 'idle'; st.target = null;
    if (!O.fought) {
      const stuck = O.enteredAt && now() - O.enteredAt > (+cfg.ovlLeaveSec || 600) * 1000;
      if (!stuck) { setStatus('Overlord：等待 Boss 刷新…'); return true; }
      if (now() - (O.idleLogAt || 0) > 60000) { O.idleLogAt = now(); logEvent('Overlord：进房 ' + Math.round((now() - O.enteredAt) / 1000) + 's 仍未开打 → 兜底离场'); }
    } else {
      /* ★ v2.6.159：打过 Boss、房内暂时没 Boss → 先给一段宽限再离场（阶段切换 / 短暂消失不立刻走） */
      if (!O.goneAt) O.goneAt = now();
      if (now() - O.goneAt < OVL_BOSS_GONE_MS) { setStatus('Overlord：Boss 暂时不见，等待…'); return true; }
    }
    /* 本场打过、房内已无 Boss → 离场。
       ① 先试游戏自己的返回传送门（#hud_portal / backPortal()）；
       ② 没有传送门 → 用世界地图直接传出去（★ v2.6.155：实测房内不会自动传出）。
          传出去后 ovlTick 的 O.on 分支会检测到「已离开房间」并登记回挂机图的导航。 */
    if (tryBackPortal('Overlord 结束')) { O.phase = 'leaving'; return true; }
    if (!O.leaveBusy && (O.leaveTries || 0) < 3 && now() - (O.leaveAt || 0) >= 5000) {
      const home = +O.homeMap || +cfg.farmMap || 0;
      const tgt = home > 0 ? (worldTeleportTarget(home) || home) : 0;
      if (!(tgt > 0)) { setStatus('Overlord：没有可传的目的地，等待手动处理…'); return true; }
      O.leaveBusy = true; O.leaveAt = now(); O.leaveTries = (O.leaveTries || 0) + 1;
      O.phase = 'leaving';
      logEvent('Overlord：房内没有返回传送门 → 世界地图传送离场（第 ' + O.leaveTries + ' 次 → ' + navMapName(tgt) + '）');
      setStatus('Overlord：用世界地图传送离场…');
      navWorldTeleport(tgt, function () { return running && cfg.autoOverlord; }).then(function (out) {
        O.leaveBusy = false;
        logEvent(out ? ('Overlord：世界地图传送成功 → ' + navMapName(out)) : 'Overlord：世界地图传送失败（没有传送道具 / 非 Noble）');
      }, function () { O.leaveBusy = false; });
      return true;
    }
    if ((O.leaveTries || 0) >= 3) {
      if (now() - (O.idleLogAt || 0) > 60000) { O.idleLogAt = now(); logEvent('Overlord：世界地图传送多次失败，留在房内（请手动离场）'); }
      setStatus('Overlord：离场失败，等待手动处理…');
      return true;
    }
    setStatus('Overlord：已打完，准备离场…');
    return true;
  }
  function ovlHolding() {
    return !!(running && cfg.autoOverlord && (ovlInBattle() ||
      (st.ovl.phase === 'joining' && now() - (st.ovl.joinedAt || 0) < 30000)));
  }
  /* ★ v2.6.157：临时活动优先级 = Overlord > 活动 > 多角色离线。
     eventHolding() = 活动正在进行 / 正在进出（用于让多角色离线让路）。 */
  function eventHolding() {
    return !!(st.event && (st.event.on || st.event.phase !== 'idle'));
  }
  /* ★ v2.6.157：当前是否在「活动」里（活动图 / 活动战斗区）；是则返回该图 id，否则 0。
     用于：① Overlord 参战时记住「打完回活动」；② 休整返程回原活动。 */
  function eventReturnMap() {
    try {
      if (!st.event || !st.event.on) return 0;
      const m = String(character.current_map);
      if (m === String(EVENT_MAP_ID) || EVENT_COMBAT_MAPS[m]) return +character.current_map;
    } catch (e) { /* ignore */ }
    return 0;
  }
  /* 主循环钩子：true = 本 tick 被 Overlord 逻辑接管 */
  function ovlTick() {
    const O = st.ovl;
    if (!cfg.autoOverlord) { if (O.on || O.phase !== 'idle') { O.on = false; O.phase = 'idle'; } return false; }
    if (!running || !inGame()) return false;
    /* ★ v2.6.159：点了参战但 60s 内没被传进房（还在参战前那张图）→ 视为参战失败，复位 */
    if (O.phase === 'joining' && O.joinMap && +character.current_map === +O.joinMap && now() - (O.joinedAt || 0) > 60000) { O.phase = 'idle'; O.joinMap = 0; }
    if (ovlInBattle()) return ovlRoomTick();
    if (O.on) {
      /* ★ v2.6.157：休整（维修/清包/存仓）行程中离开房间不算「Overlord 结束」——
         修完要回房继续打（返程目标见 runRestock 的 fromActivity）。 */
      if (st.repair.active || st.sell.active || st.bank.active) return false;
      O.on = false; O.phase = 'idle'; O.actionAt = 0; O.roomMap = 0; O.joinMap = 0; O.enteredAt = 0;
      O.finishedEpoch = O.joinedEpoch || O.nextEpoch;
      const home = +O.homeMap || +cfg.farmMap || 0;
      O.homeMap = 0;
      logEvent('Overlord：已离开房间，恢复原任务');
      if (home && +character.current_map !== home) navSetPending(home, 'Overlord 结束后返回挂机点');
      return true;
    }
    if (st.mode === 'tower') return false;                       /* 爬塔不掺和（进出会从第 1 层重来） */
    /* ★ v2.6.157：优先级 Overlord > 活动 —— 活动「进行中」不再挡住 Overlord（限时全服事件）；
       只在活动「进出切换中」（enter / return）让路，避免半路打断切换。 */
    if (st.event.phase === 'enter' || st.event.phase === 'return') return false;
    if (st.repair.active || st.sell.active || st.bank.active) return false;
    if (hasFrame('frame_Combat')) return false;                  /* 正在打架 → 别插一脚 */
    if (+character.level < 30) return false;
    if (inDungeonOrTower()) return false;
    /* 没到点：定期读倒计时（日志 + 到点前 N 秒开始加密轮询） */
    const due = O.nextEpoch ? (O.nextEpoch * 1000 - now()) : Infinity;
    const near = !!O.nextEpoch && due <= (+cfg.ovlLeadSec || 0) * 1000;
    const interval = near && O.finishedEpoch !== O.nextEpoch ? 3000 : 60000;
    // 图标可能提前开放；必须先确认刷新时间，不能使用陈旧倒计时或重进已完成场次。
    if (O.nextEpoch && near && now() - (O.countdownAt || 0) < 65000 && O.finishedEpoch !== O.nextEpoch && ovlHudJoinBtn()) { ovlJoin(); return true; }
    if (!O.pollBusy && now() - (O.lastPoll || 0) >= interval) {
      O.lastPoll = now();
      O.pollBusy = true;
      const seq = runSeq, charId = character.id;
      (async function () {
        try {
          const r = await ovlReadCountdown();
          if (!running || !cfg.autoOverlord || seq !== runSeq || character.id !== charId) return;
          if (!r.epoch) return;
          const changed = (r.epoch !== O.nextEpoch);
          O.nextEpoch = r.epoch; O.boss = r.boss; O.countdownAt = now();
          const left = r.epoch * 1000 - now(), spawnDue = left <= 0;
          if (changed || O.spawnDue !== spawnDue || now() - (O.logAt || 0) > 600000) {
            O.logAt = now();
            logEvent('Overlord：「' + (r.boss || '?') + '」' + (left > 0 ? ('还有 ' + ovlHhmmss(left)) : '已到刷新时间'));
          }
          O.spawnDue = spawnDue;
          if (spawnDue) setStatus('Overlord：到刷新时间了，等参战按钮…');
          else if (left <= (+cfg.ovlLeadSec || 0) * 1000) setStatus('Overlord：' + ovlHhmmss(left) + ' 后刷新，蹲点中…');
        } finally { O.pollBusy = false; }
      })();
    }
    return false;
  }

  /* ======================= 14.5 动画加速（合并自「动画加速器」） =======================
   * 只压缩 jQuery.animate() 的时长，不动 Date.now / setTimeout / setInterval。
   *
   * ★ 为什么默认不加速「自己的走格动画」：
   *   实测服务器有独立的走位计时器（400ms/格，travel.min.js 的 0x190）。
   *   客户端动画被压缩后会"偷跑"：到达目标格时服务器还剩 3~4 格没走完，
   *   此时触发 loadCombat() 就会判定位置不符 → 弹 "Enemy Not Found"。
   *   ★ 加速范围：默认只加速「战斗」期间的动画。
   *     生产 / 搜刮 / 采集 / 走格 / UI 都有服务器侧校验，客户端提前跑完会被判定不一致，一律原速。
   *     想恢复旧行为（除地图实体外全加速）可在「加速」页关掉「只加速战斗」。
   * ================================================================= */
  const FX_DEF = 13, FX_FAST = 4;

  /** 当前是否在战斗中（游戏用 #frame_Combat 表示） */
  function inCombatNow() { return !!document.getElementById('frame_Combat'); }

  /**
   * ★ 是否允许压缩这段动画的时长。
   *   默认（speedCombatOnly = true）：只有「战斗」期间的动画才加速。
   *     生产 / 搜刮 / 采集 / 走格 / 各种 UI 都有服务器侧校验，客户端提前跑完会判定不一致
   *     （轻则空转重来，重则 Enemy Not Found / 采集失败），所以一律按原速播放。
   *   关闭该开关 = 旧行为：除「地图实体 / 相机 / 换图过渡」外全部加速。
   */
  function speedAllowed(el) {
    if (!inCombatNow()) return false;                 // ★ 战斗外一律不加速
    if (!el) return true;
    if (el.id === 'map_container') return false;      // 相机跟随
    if (el.id === 'transition_container') return false;// 换图过渡
    return true;
  }

  /** 是不是"地图实体 / 相机"的动画（旧行为下这类不加速） */
  function isNoAccelEl(el) {
    if (!el) return false;
    if (el.id === 'map_container') return true;         // 相机跟随
    if (el.id === 'transition_container') return true;  // 换图过渡
    try { if (el.closest && el.closest('#players_container')) return true; } catch (e) { /* ignore */ }
    return false;                                       // 自己/宠物/其他玩家/NPC/敌人 都在这容器里
  }

  function installSpeedPatch() {
    const jq = window.jQuery;
    if (!jq || !jq.fn || typeof jq.fn.animate !== 'function') return false;
    installGatherResultHook();
    if (jq.__nrSpeedPatched) return true;
    jq.__nrSpeedPatched = true;

    const orig = jq.fn.animate;
    jq.fn.animate = function (props, duration, easing, complete) {
      const k = +cfg.speedK || 1;
      if (k > 1 && typeof duration === 'number' && duration > 0) {
        let ok = false;
        try { ok = speedAllowed(this[0]); } catch (e) { ok = false; }
        if (ok) duration = duration / k;
      }
      return orig.call(this, props, duration, easing, complete);
    };
    /* ★ 走位链保命补丁（2026-09-20 实测根因）：
       游戏 clearQueue() = walkQueue[id]=[] + $(player).queue('fx',[]).stop()。
       jQuery 1.11.3 的无参 .stop() 走 rejectWith，animate 的 complete 不会触发 ——
       而 character.x/y 的更新、以及 nextStep() 的递归，全都只写在那个 complete 里。
       后果：精灵停在格子中间、坐标停在上一格、走位链彻底断掉；
       且 character.walk_to 仍等于目标，重发同一目标会被游戏 walkTo 的守卫挡成 no-op。
       这里把「对自己精灵的无参 stop」改成 stop(true, true)（跳到终点）：
       complete 必然触发 → 坐标对齐、链继续。
       安全性：clearQueue 是先清 walkQueue 再 stop，所以 complete 里的 nextStep
       会 pop 到空队列直接返回，不会多走一格。 */
    const origStop = jq.fn.stop;
    jq.fn.stop = function (type, clearQueue, gotoEnd) {
      try {
        if (arguments.length === 0 && this[0] && inGame() && this[0].id === 'player_' + character.id) {
          const running = (jq.timers || []).some(t => t.elem === this[0] && t.anim);
          if (running) return origStop.call(this, true, true);
        }
      } catch (e) { /* ignore */ }
      return origStop.apply(this, arguments);
    };
    try { jq.fx.interval = (cfg.speedK > 1 ? FX_FAST : FX_DEF); } catch (e) { /* ignore */ }
    return true;
  }

  function applySpeedK(k) {
    cfg.speedK = clamp(Math.round((+k || 1) * 10) / 10, 1, 5);   // 1~5，保留 1 位小数
    try { if (window.jQuery && window.jQuery.fx) window.jQuery.fx.interval = (cfg.speedK > 1 ? FX_FAST : FX_DEF); } catch (e) { /* ignore */ }
    saveCfg(); syncUI();
  }

  /* ★ 高级：缩放游戏弹窗。游戏弹窗都是 .frame-container（战斗 / 背包 / professions / activities / bank …）。
     用 transform:scale()（transform-origin: top left）—— 只缩视觉、不动布局，
     元素的 top/left 与视觉左上角 1:1 对应，所以游戏自带的拖动不会错位（zoom 会缩放坐标系导致拖动飘）。
     100% 时清空规则 = 原样；排除 #frame_container 这个外层容器。 */
  function applyWinScale(pct) {
    cfg.winScale = Math.min(100, Math.max(20, Math.round(+pct || 100)));
    try {
      let el = document.getElementById('nr-winscale-style');
      if (!el) { el = document.createElement('style'); el.id = 'nr-winscale-style'; (document.head || document.documentElement).appendChild(el); }
      el.textContent = (cfg.winScale >= 100) ? ''
        : ('.frame-container:not(#frame_container){transform:scale(' + (cfg.winScale / 100) + ');transform-origin:top left}');
    } catch (e) { /* ignore */ }
    saveCfg(); syncUI();
  }

  /** 取游戏里的 character（顶层 const，只能用间接 eval 从全局作用域读） */
  function getChar() {
    try { return (0, eval)('typeof character !== "undefined" ? character : null'); } catch (e) { return null; }
  }

  let spdPos = null, spdT = 0, spdMoved = 0;
  function startSpeedMeter() {
    setInterval(() => {
      try {
        const ch = getChar();
        if (!ch || ch.x == null) return;
        const t = now();
        if (spdPos && (ch.x !== spdPos.x || ch.y !== spdPos.y)) spdMoved += Math.abs(ch.x - spdPos.x) + Math.abs(ch.y - spdPos.y);
        spdPos = { x: ch.x, y: ch.y };
        if (!spdT) { spdT = t; return; }
        if (t - spdT > 4000) {
          const el = document.getElementById('nr-speedrate');
          if (el) el.textContent = (spdMoved / ((t - spdT) / 1000)).toFixed(2) + ' 格/秒';
          spdMoved = 0; spdT = t;
        }
      } catch (e) { /* ignore */ }
    }, 1000);
  }

  /* ---- 收益统计：经验/分、击杀/分（滑动窗口，跨级时按 max_exp 补偿回绕） ---- */
  /* 读 HUD 金币（金/银/铜 1:100:10000），换算成铜（游戏基础币）
     ★ 2026-10-21 根因修复（「金币/分一直涨、钱包却没变」）：
     游戏 HUD 的金/银/铜数字是它自己的 kFormatter() 写的，≥1000 会缩写—— 1000→"1k"、1200→"1.2k"、
     9999→"10k"、123456→"123.5k"。旧实现 parseInt(text.replace(/[^\d]/g,'')) 把 "1.2k" 读成 12、
     "10k" 读成 10，于是同一笔钱在不同数量级下读出来呈锯齿状（999 → 1 → 12 → 10 → 123 …），
     而 updatePerf 只累加正增量（totalCoin += max(0, coin - lastCoin)），每一段锯齿的上升沿都被当成
     「进账」→ 累计收入越滚越大、金币/分一直涨，可钱包其实没动。
     双保险修法：
       ① 挂游戏自己的 window.updateCoins(coins) —— 它收到的就是**原始铜币整数**，零量化误差；
       ② 兜底解析 HUD 文本时识别 k/m/b 后缀（"1.2k" → 1200），不再丢数量级。
     为什么不直接信 HUD：实测抓到 HUD 会被别的代码短暂写坏（silver 77 → 1 → 77），
     而且 kFormatter 把每个分量量化到 0.1k（金越大误差越大）。原始值和 HUD 是同一个
     updateCoins 写的，永远不比 HUD 旧 —— 所以只要挂上了就一直用它，不做「HUD 更大就采信 HUD」的推断。 */
  let _coinsRaw = null;
  function installCoinsHook() {
    try {
      const fn = window.updateCoins;
      if (typeof fn !== 'function' || fn.__nrHooked) return !!fn;
      const wrap = function (v) {
        try {
          const n = Math.round(+v);
          /* 游戏自己的 updateCoins 对 0 / 空值直接 return（不写 HUD），这里也照做：
             否则一次 updateCoins(0) 会被记成「余额归零」，下一次真实值回来就变成巨额假进账。 */
          if (isFinite(n) && n > 0) _coinsRaw = n;
        } catch (e) { /* ignore */ }
        return fn.apply(this, arguments);
      };
      wrap.__nrHooked = true;
      window.updateCoins = wrap;
      return true;
    } catch (e) { return false; }
  }
  /* 解析 HUD 文本：支持 "1234" / "1,234" / "1.2k" / "10k" / "3.5m" */
  function parseCoinText(txt) {
    const s = String(txt == null ? '' : txt).trim().toLowerCase().replace(/[,\s]/g, '');
    const m = /^([0-9]*\.?[0-9]+)([kmb])?$/.exec(s);
    if (!m) return null;
    let v = parseFloat(m[1]);
    if (!isFinite(v)) return null;
    if (m[2] === 'k') v *= 1e3; else if (m[2] === 'm') v *= 1e6; else if (m[2] === 'b') v *= 1e9;
    return Math.round(v);
  }
  function readCoinsHud() {
    try {
      const get = n => {
        const d = document.querySelector('div[name="' + n + '"]');
        if (!d || !d.parentElement) return null;
        const sp = d.parentElement.querySelector('span');
        return sp ? parseCoinText(sp.textContent) : null;
      };
      const g = get('coin_gold'), sv = get('coin_silver'), b = get('coin_bronze');
      if (g == null && sv == null && b == null) return null;
      return (g || 0) * 10000 + (sv || 0) * 100 + (b || 0);
    } catch (e) { return null; }
  }
  function readCoins() {
    installCoinsHook();                       /* 每次读都确认挂着（游戏若重定义会被重新挂上） */
    if (_coinsRaw != null) return _coinsRaw;
    const hud = readCoinsHud();
    return hud == null ? 0 : hud;
  }
  function fmtCoin(bronze) {
    const n = Math.max(0, Math.round(bronze));
    if (n >= 10000) return (n / 10000).toFixed(2) + ' 金';
    if (n >= 100) return (n / 100).toFixed(1) + ' 银';
    return n + ' 铜';
  }

  function updatePerf() {
    if (!inGame()) return;
    const P = st.perf;
    const t = now();
    const exp = character.current_exp || 0, maxExp = character.max_exp || 0;
    const coin = readCoins();
    if (!P.lastAt) { P.lastAt = t; P.lastExp = exp; P.total = 0; P.lastCoin = coin; P.totalCoin = 0; P.samples = [{ t: t, total: 0, kills: st.kills, coin: 0 }]; return; }
    if (exp !== P.lastExp) {
      P.total += (exp >= P.lastExp) ? (exp - P.lastExp) : Math.max(0, maxExp - P.lastExp) + exp;
      P.lastExp = exp;
    }
    if (coin !== P.lastCoin) { P.totalCoin += Math.max(0, coin - P.lastCoin); P.lastCoin = coin; }   // 只算进账
    if (t - P.lastAt < 3000) return;
    P.samples.push({ t: t, total: P.total, kills: st.kills, coin: P.totalCoin });
    while (P.samples.length > 2 && t - P.samples[0].t > PERF_KEEP_MS) P.samples.shift();
    P.lastAt = t;
  }

  /* ★ 统计口径：窗口内所有采样点做「最小二乘回归」求斜率，比旧版「首尾两点求差」稳得多。
     旧版是 2 分钟窗口 + 首尾两点，经验/金币都是离散跳变，一夹到大额进账就飙、一跑图就掉。
     现在统一用 20 分钟窗口（每 3 秒一个采样点 ≈ 400 个点，回归是 O(n)，开销可忽略）。 */
  const PERF_KEEP_MS = 20 * 60 * 1000;        // 采样保留时长
  const PERF_WIN_MS = 20 * 60 * 1000;         // 经验 / 击杀窗口
  const PERF_COIN_WIN_MS = 20 * 60 * 1000;    // 金币窗口

  /** 指定窗口内某条曲线的最小二乘斜率（单位/分钟）；样本太少返回 null */
  function perfSlope(key, winMs) {
    const S = st.perf.samples;
    if (!S || S.length < 3) return null;
    const end = S[S.length - 1].t;
    const W = S.filter(function (x) { return x.t >= end - (winMs || PERF_WIN_MS); });
    if (W.length < 3) return null;
    const t0 = W[0].t;
    let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let i = 0; i < W.length; i++) {
      const x = (W[i].t - t0) / 60000;          // 分钟
      const y = W[i][key] || 0;
      n++; sx += x; sy += y; sxx += x * x; sxy += x * y;
    }
    const den = n * sxx - sx * sx;
    if (Math.abs(den) < 1e-9) return null;
    return (n * sxy - sx * sy) / den;
  }
  /** 经验窗口实际覆盖的分钟数（用于提示可信度） */
  function perfSpanMin() {
    const S = st.perf.samples;
    if (!S || S.length < 2) return 0;
    const end = S[S.length - 1].t;
    const W = S.filter(function (x) { return x.t >= end - PERF_WIN_MS; });
    return (W[W.length - 1].t - W[0].t) / 60000;
  }

  function perfText() {
    const expRate = perfSlope('total');
    const killRate = perfSlope('kills');
    if (expRate == null) return '';
    return Math.max(0, Math.round(expRate)) + ' 经验/分 · ' + Math.max(0, killRate || 0).toFixed(1) + ' 击杀/分';
  }
  /* 金币效率（铜/分 → 金/银/铜） */
  function coinRatePerMin() {
    const r = perfSlope('coin', PERF_COIN_WIN_MS);
    return r == null ? 0 : Math.max(0, r);
  }
  /* 预计升级分钟数（按当前经验/分） */
  function minutesToLevel() {
    if (!inGame() || !character.max_exp) return null;
    const rate = perfSlope('total');
    if (rate == null || rate <= 0) return null;
    const remain = Math.max(0, character.max_exp - character.current_exp);
    return remain / rate;
  }

  /* ---- 挂机时长 ---- */
  function fmtDur(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60);
    return (hh ? hh + ' 小时 ' : '') + mm + ' 分';
  }

  /* ---- 挂机时长（精确到秒，供折叠标题栏用） ---- */
  function fmtClock(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60), ss = sec % 60;
    const p2 = n => (n < 10 ? '0' : '') + n;
    return hh ? (hh + ':' + p2(mm) + ':' + p2(ss)) : (mm + ':' + p2(ss));
  }

  /* ---- 面板折叠时，标题栏改显示：当前动作 + 运行时间 + 迷你开始/暂停 ---- */
  function updateHeader() {
    const t = document.getElementById('nr-title');
    if (!t) return;
    t.textContent = 'Norroth 小伴侣';
    const act = document.getElementById('nr-hact');
    const rt = document.getElementById('nr-hrt');
    if (!act && !rt) return;
    if (!cfg.uiFold) {
      if (act) act.textContent = '';
      if (rt) rt.textContent = '';
      return;
    }
    let msg;
    if (!inGame()) msg = '未进入游戏';
    else msg = st.statusText || (running ? '运行中…' : (st.paused ? '已暂停（可继续）' : '就绪'));
    if (act) { if (act.textContent !== msg) act.textContent = msg; act.title = msg; }
    if (rt) {
      const on = (running || st.paused) && st.runStart;
      rt.textContent = on ? fmtClock(runElapsedMs()) : '0:00';
      rt.title = on ? '本次已挂机时长（暂停不计）' : '未在挂机';
    }
  }

  /* ---- ★ 新前端「自动战斗」保险：开战瞬间若 #auto_combat 未勾选就替玩家勾上。
     onchange 处理器就是 changeOpt('combat')，所以「checked=true + dispatch change」= 一次真实的开启操作；
     只在未勾选时动作，避免把已经开着的又切成关。节流：每个战斗窗口最多尝试一次/2 秒。 ---- */
  let _abAt = 0;
  function ensureAutoBattle() {
    /* ★ v2.6.1：自动战斗改为「保底」——不再有开关；只要没开「遇敌逃跑」就保证游戏自动战斗是开的 */
    if (!hasFrame('frame_Combat')) return;
    if (now() - _abAt < 2000) return;
    _abAt = now();
    try {
      const c = document.getElementById('auto_combat');
      if (c && !c.checked) {
        c.checked = true;
        c.dispatchEvent(new Event('change', { bubbles: true }));
        logEvent('已开启游戏自动战斗', { key: 'auto-combat' });
      }
    } catch (e) { /* ignore */ }
  }


  /* ---- 击杀计数（战斗/采集/一键挂机三种模式共用） ---- */
  function noteCombat() {
    if (st.phase === 'combat') return;
    st.phase = 'combat'; st.kills++; st.roundKills++;
    const nm = (st.target && st.target.name) ? String(st.target.name) : '未知';
    st.killsByName[nm] = (st.killsByName[nm] || 0) + 1;   // ★ 详细统计
    logEvent('战斗 #' + st.kills + (st.target ? ' · ' + (st.target.name || '') + (st.target.lv ? ' Lv' + st.target.lv : '') : ''), { key: 'combat:' + character.current_map });
    updateStats();
  }

  /* ── 兜底[走位卡死] ───────────────────────────────────────────
   * 症状：加速后行走途中遇敌、战斗窗口没弹出来，客户端走位循环停在那 → 人不动。
   * 判据：character.walk_to 还挂着（游戏以为还在走），但 8s 位置一动不动、且没有任何窗口。
   * 动作：nudgeRecover() 点几个不同方向的邻格，把游戏重新走起来。
   * 上限：连续 8 次无效 → 整页刷新（刷新后 autoResume 自动接着挂）。
   * 高级参数：不受影响（FREEZE_MS 写死 8s）。
   * ─────────────────────────────────────────────────────────── */
  const FREEZE_MS = 8000;

  /* ── 兜底[卡住自愈] ───────────────────────────────────────────
   * 症状：整晚空转 —— 没位移、没击杀、没经验、也没开任何窗口。
   * 判据：连续 stuckSec 秒（默认 45s）以上四项全都没变；且「本图确实有可打的怪」
   *       （本图清完等刷新是正常状态，绝不能误判成卡住）。
   * 动作：nudgeRecover() + 清 st.move/st.reach/黑名单 + 把当前目标格拉黑 60s。
   * 上限：连续 40 次仍无进展 → stop()（避免整晚空转）；第 3 次时发一条桌面通知。
   * 高级参数：阈值抖动（stuckSec 上下漂移）、节拍抖动（本函数由主循环驱动）。
   * ─────────────────────────────────────────────────────────── */

  /* ★ 卡死强恢复：像真人一样「点几个不同方向的邻近格子」把游戏重新走起来。
     真人卡住时点几下别处就能恢复；这里用同样思路：先复位 can_travel + 清队列，
     再朝 3 个不同方向的邻近可走格各点一次。期间主循环让路（st.nudging），避免打架。 */
  function nudgeRecover() {
    const cancelSeq = navCancelSeq, mapId = character.current_map, charId = character.id;
    let tried = 0;
    try {
      abortWalk();
      const pts = (window.points || []).filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');
      const cx = character.x, cy = character.y;
      const cand = pts
        .filter(p => (p.x !== cx || p.y !== cy))
        .map(p => ({ x: p.x, y: p.y, d: Math.abs(p.x - cx) + Math.abs(p.y - cy) }))
        .filter(p => p.d >= 1 && p.d <= 8)
        .sort((a, b) => a.d - b.d);
      const picks = [], seen = {};
      for (const p of cand) {
        const dir = (p.x >= cx ? 'E' : 'W') + (p.y >= cy ? 'S' : 'N');
        if (seen[dir]) continue;
        seen[dir] = 1; picks.push(p);
        if (picks.length >= 3) break;
      }
      if (!picks.length && cand.length) picks.push(cand[0]);
      if (!picks.length) return 0;
      st.nudging = now();
      picks.forEach((p, i) => {
        setTimeout(() => {
          try {
            if (cancelSeq !== navCancelSeq || character.id !== charId || character.current_map !== mapId) return;
            if (hasFrame('frame_Combat')) return;      // 已经打起来了就别再乱点
            window.can_travel = true;
            abortWalk();
            safeWalkTo(p.x, p.y);
          } catch (e) { /* ignore */ }
        }, 300 + i * 500);
      });
      tried = picks.length;
    } catch (e) { /* ignore */ }
    return tried;
  }

  function checkFrozen() {
    if (!inGame()) return;
    const F = st.frozen;
    const busy = hasFrame('frame_Combat') || hasFrame('frame_Gathering') || hasFrame('frame_CollectScrap') ||
                 hasFrame('frame_Scavenge') || hasFrame('frame_Loot') || hasFrame('frame_FeedPet') ||
                 /* ★ v1.9.2：新前端采集是 #gathering_popup（不是 frame），
                    不认它就会把“正在采集”当成“静止无进展”→ stuckSec 后点格自愈把采集打断 */
                 gatheringActive() || st.phase === 'gather' ||
                 st.repair.active || st.sell.active || st.healing || gameBusyAction();
    const pos = character.x + ',' + character.y;
    const moved = pos !== F.pos;
    F.pos = pos;
    /* ★ 已经站在 walk_to 格上 = 正常静止（游戏到达后不清 walk_to），不是卡死 */
    const arrived = character.walk_to === (character.x + '-' + character.y);
    if (busy || !character.walk_to || moved || arrived) { F.at = now(); if (moved || arrived) F.hits = 0; return; }
    if (now() - F.at < FREEZE_MS) return;
    F.at = now(); F.hits++;
    /* ★ 先用「点几个不同的格子」强恢复；连续 8 次都无效 → 整页刷新兜底（默认行为，不再提供开关）。 */
    const nudged = nudgeRecover();
    st.move = null; st.reach = null;
    if (F.hits >= 8) {   /* ★ 卡死刷新改为默认行为 */
      logEvent('游戏卡死（走位 ' + (FREEZE_MS / 1000) + 's 无位移），强恢复无效，自动刷新页面');
      setStatus('游戏卡死，正在刷新页面…');
      saveCfgNow();
      setTimeout(() => { try { location.reload(); } catch (e) { /* ignore */ } }, 300);
      return;
    }
    logEvent('走位卡死，已强恢复（第 ' + F.hits + ' 次' + (nudged ? '，试走 ' + nudged + ' 个方向' : '') + '）');
    setStatus('检测到走位卡死，已复位（第 ' + F.hits + ' 次）…');
  }

  function checkStuck() {
    if (!cfg.stuckSec || !inGame()) return;
    const W = st.watch;
    const exp = character.current_exp || 0;
    const busy = (st.move && st.move.segment && st.move.segment.phase === 'pause') ||
                 hasFrame('frame_Combat') || hasFrame('frame_Gathering') || hasFrame('frame_CollectScrap') ||
                 hasFrame('frame_Scavenge') || hasFrame('frame_Loot') || hasFrame('frame_FeedPet') ||
                 /* ★ v1.9.2：新前端采集是 #gathering_popup（不是 frame），
                    不认它就会把“正在采集”当成“静止无进展”→ stuckSec 后点格自愈把采集打断 */
                 gatheringActive() || st.phase === 'gather' ||
                 st.repair.active || st.sell.active || st.healing || gameBusyAction();
    const moved = W.x !== character.x || W.y !== character.y;
    const progressed = moved || W.kills !== st.kills || W.exp !== exp;
    if (progressed || busy) {
      W.x = character.x; W.y = character.y; W.exp = exp; W.kills = st.kills; W.at = now();
      if (progressed) W.heals = 0;
      return;
    }
    if (now() - W.at < jitterVal(cfg.stuckSec) * 1000) return;
    // ★ 关键：只有「本图确实有可打的怪却毫无进展」才算卡死。
    //   「本图清完、等刷新」是正常状态，绝不能误判成卡住而反复复位/停机。
    if (st.phase === 'idle' && !attackableEnemies().length) { W.at = now(); return; }
    W.at = now(); W.heals++;
    if (W.heals === 3) notify('挂机可能卡住了', '已连续 3 次无任何进展，正在尝试自愈');
    // ★ 门槛从 10 提到 40：卡死优先靠「点格强恢复」自救，不再轻易整段挂机退出
    if (W.heals > 40) { stop('连续 ' + W.heals + ' 次无任何进展，已自动停止（请检查角色状态）'); return; }
    const t = st.target;
    nudgeRecover();
    st.move = null; st.reach = null; st.blacklist = {};
    if (t) blacklistTile(t.key, 60000);
    st.target = null;
    logEvent('卡住自愈（' + cfg.stuckSec + 's 无任何进展，第 ' + W.heals + ' 次）' + (t ? '，跳过 ' + (t.name || t.key) : ''));
    setStatus('检测到卡住，已自动复位（第 ' + W.heals + ' 次）…');
  }

  /* ── 兜底[锁屏 / 切后台] ────────────────────────────────────────
   * 症状：锁屏或切到后台后挂机「卡住」。
   * 根因：页面变 hidden → Chrome 暂停 requestAnimationFrame 并把定时器降频
   *       （隐藏页最低 1s；隐藏 >5 分钟进入「密集节流」→ 每分钟约 1 次）→
   *       主循环（rhythmTimer 链式 setTimeout）几乎停摆，游戏走格动画也停。
   * 次生问题：解锁回来第一次 tick 时 now() 已过去很久 →
   *       checkFrozen（8s 无位移）判「走位卡死」→ 连续 8 次直接自动刷新页面；
   *       checkStuck 也会反复自愈 + 拉黑目标。
   * 动作：回到前台且离开 >3s → 重置所有「基于时间」的看门狗时间戳（不动累计统计）。
   * 说明：脚本侧只能消除「误判」；锁屏期间的降频需在浏览器/系统层面解决。
   * ─────────────────────────────────────────────────────────── */
  let _bgAwayAt = 0;
  function resetWatchdogsAfterBackground() {
    const t = now();
    st.watch = { x: character.x, y: character.y, exp: character.current_exp || 0, kills: st.kills || 0, at: t, heals: 0 };
    st.frozen = { pos: character.x + ',' + character.y, at: t, hits: 0 };
    st.lastStats = 0;
    st.noSupplyAt = 0;
    st.visitedAt = 0;
    if (!st.entity) st.entity = { at: 0 }; st.entity.at = 0;
    st.gatherIdleSince = 0; st.gatherResync = 0;
    if (st.nudging && t - st.nudging > 2600) st.nudging = 0;
    if (st.settling && t - st.settling > 40000) st.settling = 0;
    if (st.move) { st.move.at = t; st.move.lastPosAt = t; st.move.lastPos = ''; st.move.retryAt = t; }
    if (navPending) navPending.nextAt = 0;
  }
  function onVisibilityChange() {
    try {
      if (document.visibilityState === 'hidden') {
        _bgAwayAt = now();
        if (running) setStatus('页面已切到后台 / 锁屏：浏览器会降频，挂机可能变慢…');
        return;
      }
      const away = _bgAwayAt ? (now() - _bgAwayAt) : 0;
      _bgAwayAt = 0;
      if (away > 3000) {
        resetWatchdogsAfterBackground();
        logEvent('回到前台（后台 ' + Math.round(away / 1000) + 's）：已重置看门狗时间戳，避免误判卡死');
        if (running) setStatus('已回到前台，继续挂机');
      }
    } catch (e) { /* ignore */ }
  }

  /* ---- 阵亡处理：挂机时人不在屏幕前，「自动点 Continue 复活」是刚需 ---- */
  let defeatAt = 0, defeatTries = 0;
  function resetDefeat() { defeatAt = 0; defeatTries = 0; }
  function handleDefeat() {
    const box = document.getElementById('battle_defeat');
    if (!box) return;
    st.phase = 'dead';
    if (!defeatAt) {
      defeatAt = now(); defeatTries = 0;
      st.deaths = (st.deaths || 0) + 1;   // ★ 详细统计
      logEvent('角色阵亡，准备自动复活…');
      notify('角色阵亡', '正在尝试自动复活');
    }
    const waited = now() - defeatAt;
    if (waited < 3000) { setStatus('角色阵亡，3 秒后自动复活…'); return; }
    if (waited < 3000 + defeatTries * 5000) { setStatus('角色阵亡，正在复活…（第 ' + (defeatTries + 1) + ' 次）'); return; }
    defeatTries++;
    if (defeatTries > 5) { resetDefeat(); stop('角色阵亡且自动复活失败（已尝试 5 次），请手动处理'); return; }
    try {
      const btn = box.querySelector('button');
      if (btn) humanClick(btn);
      else if (typeof window.respawn === 'function') humanDefer(function () { try { window.respawn(); } catch (e) { /* ignore */ } });
    } catch (e) { /* ignore */ }
    logEvent('点击复活（第 ' + defeatTries + ' 次）');
    setStatus('角色阵亡，正在复活…（第 ' + defeatTries + ' 次）');
  }

  /* ======================= 21. 自动爬塔（Abyssal Tower） =======================
   * 实测机制（2026-10-19，账号 723412117@qq.com / char #1378）：
   *   · 必须在城镇里才能进塔（野外请求 /modal/abyssal_tower/1 返回 "Must be in Town"）。
   *   · 入口：createDialog('Abyssal Tower','','ajax','/modal/abyssal_tower/<diff>') → 传送到 map 900。
   *   · map 900（Abyssal Tower Entrance）：走到 tower_gate 格 → 进入第 1 层（map 901）。
   *   · 每层（901+）Help 格写明：Step1 杀光本层所有怪 → Step2 进入下一层 → Step3 领奖。
   *   · 下一层入口 = 本层的 tower_gate 格（action=tower_gate）。
   * ==================================================================== */
  const TOWER_MAP_MIN = 900, TOWER_MAP_MAX = 911;
  const TOWER_DIFF_CN = { 1: 'Normal', 2: 'Nightmare', 3: 'Chaos' };
  /* ★★ 待确认（2026-10-20）：据玩家反馈，深渊塔【每 10 层需要交一把「与当前等级匹配的钥匙」】才能过这一层。
     · 钥匙 Tier（按等级）：Copper 1-9 / Iron 10-19 / Bronze 20-29 / Steel 30-39 / Mithril 40-49。
     · ⚠ 具体交互【尚未实测确认】：在 tower_gate 弹窗里怎么交？交完是直接进下一层、还是要再点一次 Enter？
       测试账号 723412117@qq.com 的角色最高只有 Lv8，打不到第 10 层，所以暂时抓不到那个弹窗。
     · 待办：有高等级号时 → 爬到第 10 层 → 抓 frame_TowerGate 的 DOM → 确认「交钥匙」按钮 / 接口 → 在 stepTower 里实现：
       预计逻辑 = 检测到钥匙要求时，若背包里没有对应 Tier 的钥匙 → stop('爬塔：第 N 层需要 X 钥匙，已停止')；
       有钥匙 → 在弹窗里点「交钥匙」，然后继续。
     · 层数目前是本地计数（进塔=1，每次成功进下一层 +1，见 st.towerFloor），正好可用来判断是否到 10 的倍数。 */
  function isTowerMap(id) { id = +id; return id >= TOWER_MAP_MIN && id <= TOWER_MAP_MAX; }

  /* 扫描当前地图上的塔相关格子 */
  function towerTiles() {
    const out = [];
    $$q('.map_table [action][coords]').forEach(el => {
      const a = el.getAttribute('action'); if (!a) return;
      const c = (el.getAttribute('coords') || '').split('-');
      const x = parseInt(c[0], 10), y = parseInt(c[1], 10);
      if (!isFinite(x) || !isFinite(y)) return;
      out.push({ action: a, x: x, y: y, name: (el.getAttribute('name') || ''), key: x + '-' + y });
    });
    return out;
  }
  /* 下一层入口候选（按优先级）：tower_gate > 名字含 Abyssal Tower 的 gate > entrance。
     ★ 优先返回「能走过去的」——本层地图可能被墙分成两半，tower_gate 在另一半时走不到，
       这时退回到能走到的 entrance（第 1 层的「下一层」其实就在 entrance 那侧）。 */
  function towerGateCandidates() {
    const tiles = towerTiles();
    const out = [];
    tiles.filter(t => t.action === 'tower_gate').forEach(t => out.push(t));
    tiles.filter(t => t.action === 'gate' && !/entrance/i.test(t.name) && /abyssal/i.test(t.name)).forEach(t => out.push(t));
    tiles.filter(t => t.action === 'entrance').forEach(t => out.push(t));
    return out;
  }
  function towerNextGate() {
    const cands = towerGateCandidates();
    if (!cands.length) return null;
    const byDist = function (list) {
      let best = null, bd = Infinity;
      list.forEach(t => { const d = manhattan(character.x, character.y, t.x, t.y); if (d < bd) { bd = d; best = t; } });
      return best;
    };
    const reach = cands.filter(t => isReachable(t.x, t.y));
    /* ★ 本层同时有 tower_gate（真正的下一层入口）、gate（名字含 Abyssal Tower 的出口门，data-poi=exit）
       和 entrance（通往本层上半区的入口）。
       · 能走到 tower_gate → 优先它（否则站在出口门旁边会误选出口门，被 useGate() 带出塔）；
       · tower_gate 走不到（如第 1 层还没走 entrance）→ 退回「能走到的最近候选」（通常是 entrance，踩上去传送到上半区）；
       · 都走不到 → 返回最近候选，交给上层报「走不到」。 */
    const reachTower = reach.filter(t => t.action === 'tower_gate');
    if (reachTower.length) return byDist(reachTower);
    if (reach.length) return byDist(reach);
    return byDist(cands);
  }
  /* 入口旁边的可走格（用于「走开再走回来」触发格子动作）。
     ★ 实测：只走开 1 格再回来常常不触发（走格动画太短），要走开 2-5 格。 */
  function towerAdjacentTile(x, y) {
    const set = reachableSet();
    const pts = window.points || [];
    let best = null, bd = Infinity;
    pts.forEach(p => {
      const d = Math.abs(p.x - x) + Math.abs(p.y - y);
      if (d < 2 || d > 5) return;
      if (set && !set.has(p.x + ',' + p.y)) return;
      if (d < bd) { bd = d; best = p; }
    });
    if (best) return { x: best.x, y: best.y };
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i = 0; i < dirs.length; i++) { const nx = x + dirs[i][0], ny = y + dirs[i][1]; if (set && set.has(nx + ',' + ny)) return { x: nx, y: ny }; }
    return null;
  }
  /* ★ v2.6.107：本层「房间之间的门」—— 一层塔被一道门分成两个房间，先清一边、过门、再清另一边。
     实测/用户确认：第 1 层的门是 entrance（通往上半区，且被任务锁住）；其它层是名字含 Abyssal Tower 的 gate。
     真正的「下一层入口」是 tower_gate，这里必须排除它。 */
  function towerRoomDoor() {
    const cur = +character.current_map;
    const dt = window.door_tiles || {};
    const out = [];
    /* ★ 最可靠的判据：door_tiles 里「目的地 = 本图自己」的门 = 同层两个房间之间的传送门
       （实测 map 901：`901→901 @26,36`；而塔的出口是 `901→900 @42,41`，不能混）。
       这样绝不会把「出塔的出口门」当成房间门。 */
    Object.keys(dt).forEach(function (to) {
      if (+to !== cur) return;
      const p = String(dt[to]).replace('ID', '').split('-');
      const x = +p[0], y = +p[1];
      if (!(x > 0 && y > 0)) return;
      const el = document.querySelector('.map_table .tile_poi[coords="' + x + '-' + y + '"]');
      out.push({ x: x, y: y, action: el ? String(el.getAttribute('action') || '') : '', name: el ? String(el.getAttribute('name') || '') : '' });
    });
    /* 兜底：door_tiles 还没读到自环门时，用本层的 entrance 格 */
    if (!out.length) towerTiles().forEach(function (t) { if (t.action === 'entrance') out.push(t); });
    if (!out.length) return null;
    /* ★ v2.6.108：优先「本层还没走过的门」—— 一层可能被多道门切成多个区域，
       要「清一个区域 → 过一道没走过的门 → 再清」反复，直到本层清空。
       门都走过了还够不到怪 → 返回 null（上层报状态，不再来回穿门）。 */
    const used = st.towerDoorsUsed || {};
    const fresh = out.filter(function (t) { return !used[t.x + '-' + t.y]; });
    if (!fresh.length) return null;
    const reach = fresh.filter(function (t) { return isReachable(t.x, t.y); });
    const list = reach.length ? reach : fresh;
    let best = null, bd = Infinity;
    list.forEach(function (t) { const d = manhattan(character.x, character.y, t.x, t.y); if (d < bd) { bd = d; best = t; } });
    return best;
  }
  function isInTownNow() { try { return inGame() && MapDB.isTown(character.current_map); } catch (e) { return false; } }
  function nearestTowerTown() {
    let best = null, bd = Infinity, wgBest = 0;
    serviceTowns().forEach(t => {
      if (t.noId || !t.id) return;
      let hops; try { hops = navRoute(character.current_map, +t.id); } catch (e) { hops = null; }
      if (hops) { if (hops.length < bd) { bd = hops.length; best = +t.id; } return; }
      /* ★ v2.6.86：没有步行路线但传送点能到的城镇 → 作为兜底（否则「找不到可用的城镇」） */
      if (!wgBest && t.viaWg) wgBest = +t.id;
    });
    return best || wgBest;
  }
  /* 开塔：diff 1/2/3。必须在城镇。 */
  function openTower(diff) {
    diff = (diff === 2 || diff === 3) ? diff : 1;
    st.tq = null;   /* ★ 新一轮爬塔：清掉上一轮的前置任务跟随状态 */
    st.towerFloor = 0; st.towerGateSeen = false;   /* ★ 新一轮爬塔：层数从 0 起（进塔后算第 1 层） */
    if (typeof window.createDialog !== 'function') { setStatus('爬塔：游戏接口未就绪'); return; }
    try {
      /* ★ 先开「难度选择」窗（这一步才会定义 startAbyssalTower），再点 Start —— 和真人操作一致。
         直接请求 /modal/abyssal_tower/<diff> 返回的是一段 <script>，createDialog 不一定可靠地执行它（实测卡住）。 */
      window.createDialog('Abyssal Tower', '', 'ajax', '/modal/abyssal_tower', true);
    } catch (e) { logEvent('爬塔：打开难度窗失败 ' + (e && e.message)); return; }
    setTimeout(function () {
      try {
        if (typeof window.startAbyssalTower === 'function') { window.startAbyssalTower(diff); logEvent('爬塔：进入 ' + TOWER_DIFF_CN[diff]); return; }
        const btn = document.querySelector('#frame_AbyssalTower button[onclick*="startAbyssalTower"]');
        if (btn) { btn.click(); logEvent('爬塔：进入 ' + TOWER_DIFF_CN[diff] + '（点按钮）'); return; }
        window.createDialog('Abyssal Tower', '', 'ajax', '/modal/abyssal_tower/' + diff, true);
        logEvent('爬塔：进入 ' + TOWER_DIFF_CN[diff] + '（兜底请求）');
      } catch (e) { logEvent('爬塔：进入失败 ' + (e && e.message)); }
    }, 1200);
  }

  /* 不在塔里：去城镇 → 开塔 */
  function stepTowerEnter() {
    if (isInTownNow()) {
      if (now() - (st.towerOpenAt || 0) < 12000) { setStatus('爬塔：正在进入塔…'); return; }
      st.towerOpenAt = now();
      openTower(cfg.towerDiff || 1);
      return;
    }
    if (navBusy) { setStatus('爬塔：前往城镇…'); return; }
    const town = cfg.towerTown || nearestTowerTown();
    if (!town) { setStatus('爬塔：找不到可用的城镇（先进游戏或去传送站看一眼）'); return; }
    if (now() - (st.towerNavAt || 0) < 20000) { setStatus('爬塔：前往城镇 ' + townName(town) + '…'); return; }
    st.towerNavAt = now();
    logEvent('爬塔：前往城镇 ' + townName(town));
    navToMap(town).then(function (ok) { if (!ok) logEvent('爬塔：前往城镇失败'); }, function () {});
  }

  /* ---- 爬塔前置任务：自动完成第 1 层 entrance 要求的任务链（The Note / Finding The Key） ----
   * 机制（实测 2026-10-20）：entrance 被任务锁住时，它的弹窗里带一个 guidePath 链接 → 指向「当前该做的任务」的起点；
   *   走到起点会弹 frame_Quest（[data-quest-root]，含 .coordinates 目标 + Accept/Finish 按钮）；
   *   点按钮 → 按 .coordinates 走到下一步 → 再点 → …做完后回 entrance 读下一个要求，直到入口解锁。
   * 全程只认 DOM 结构（data-quest-root / .coordinates / 按钮文案），不依赖界面语言。
   * 返回 true = 正在处理任务（上层别做别的）；false = 没有任务要求（入口已解锁，交给正常爬塔逻辑）。 */
  function stepTowerQuest() {
    const tq = st.tq || (st.tq = {});
    /* A) frame_Quest 打开 → 读坐标 / 点按钮 */
    const f = document.getElementById('frame_Quest');
    const root = f && f.querySelector('[data-quest-root]');
    if (root) {
      const coord = root.querySelector('.coordinates');
      const m = coord && (coord.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
      const btns = Array.prototype.slice.call(root.querySelectorAll('a,button'));
      const btn = btns.filter(function (x) { return /accept quest|finish/i.test(x.textContent); })[0];
      if (btn) {
        if (!tq.clickAt || now() - tq.clickAt > 2500) {
          tq.clickAt = now();
          try { btn.click(); } catch (e) { /* ignore */ }
          logEvent('爬塔任务：' + btn.textContent.trim() + (m ? ' → ' + m[1] + '-' + m[2] : ''));
        }
        tq.target = m ? [+m[1], +m[2]] : null;
        tq.at = 0; tq.off = null; tq.retries = 0;
        return true;
      }
      if (m) { tq.target = [+m[1], +m[2]]; tq.at = 0; tq.off = null; tq.retries = 0; setStatus('爬塔任务：前往 ' + m[1] + '-' + m[2]); return true; }
      return true;
    }
    /* B) 没窗：没有目标 → 回 entrance 读「当前该做的任务」 */
    if (!tq.target) {
      const ent = towerTiles().filter(function (t) { return t.action === 'entrance'; })[0];
      if (!ent) return false;
      if (character.x === ent.x && character.y === ent.y) {
        const ef = document.getElementById('frame_Entrance');
        const a = ef && ef.querySelector('a[onclick*="guidePath"]');
        const mm = a && ((a.getAttribute('onclick') || '').match(/guidePath\(\s*\d+\s*,\s*(\d+)\s*,\s*(\d+)/));
        if (mm) { tq.target = [+mm[1], +mm[2]]; tq.at = 0; tq.off = null; tq.retries = 0; logEvent('爬塔任务：去起点 ' + mm[1] + '-' + mm[2]); return true; }
        return false;   /* 入口弹窗没有任务要求 → 已解锁 */
      }
      if (navBusy || st.move) { setStatus('爬塔任务：回入口读要求…'); return true; }
      st.target = null; startMove(ent.x, ent.y, 'tower', '入口'); return true;
    }
    /* C) 走到目标格 */
    const t = tq.target;
    if (tq.off) {
      const o = tq.off;
      if (character.x === o.x && character.y === o.y) {
        if (!o.at) { o.at = now(); return true; }
        if (now() - o.at < 1200) return true;
        tq.off = null; st.target = null; startMove(o.gx, o.gy, 'tower', '任务点');
      } else if (!st.move) { st.target = null; startMove(o.x, o.y, 'tower', '任务点旁'); }
      return true;
    }
    if (character.x === t[0] && character.y === t[1]) {
      if (!tq.at) { tq.at = now(); setStatus('爬塔任务：已到 ' + t[0] + '-' + t[1] + '，等待触发…'); return true; }
      if (now() - tq.at < 2500) return true;
      tq.retries = (tq.retries || 0) + 1;
      if (tq.retries > 3) { tq.target = null; tq.retries = 0; tq.at = 0; logEvent('爬塔任务：' + t[0] + '-' + t[1] + ' 无任务，回入口'); return true; }
      const off = towerAdjacentTile(t[0], t[1]);
      if (off) { tq.off = { x: off.x, y: off.y, gx: t[0], gy: t[1] }; tq.at = 0; logEvent('爬塔任务：走开再走回 ' + t[0] + '-' + t[1]); }
      else { setStatus('爬塔任务：已在 ' + t[0] + '-' + t[1] + '，等待触发…'); }
      return true;
    }
    tq.at = 0;
    if (!isReachable(t[0], t[1])) { setStatus('爬塔任务：目标 ' + t[0] + '-' + t[1] + ' 走不到'); return true; }
    st.target = null; startMove(t[0], t[1], 'tower', '任务点'); return true;
  }

  /* 塔内主循环：复用战斗引擎杀怪，清完就走下一层入口 */
  function stepTower() {
    if (!inGame()) { setStatus('等待进入游戏…'); return; }
    if (!isTowerMap(character.current_map)) { st.phase = 'idle'; stepTowerEnter(); return; }
    const tg = document.getElementById('frame_TowerGate');
    // 900 是塔外入口，不是第 1 层；先结算跨门计层，再判断停止层数。
    if (+character.current_map === TOWER_MAP_MIN) st.towerFloor = 0;
    else if (!tg && st.towerGateSeen) {
      st.towerGateSeen = false; st.towerFloor = (st.towerFloor || 0) + 1;
      st.towerRoomTries = 0; st.towerDoorsUsed = {};
      logEvent('爬塔：进入第 ' + st.towerFloor + ' 层');
    } else if (!st.towerFloor) st.towerFloor = 1;

    /* ★ 停止条件（放最前，阵亡要在自动复活之前拦下） */
    if (cfg.towerStopDeath && document.getElementById('battle_defeat')) { stop('爬塔：角色阵亡，按设置停止'); return; }
    if (cfg.towerStopSupply && suppliesEmpty()) { stop('爬塔：补给耗尽，按设置停止'); return; }
    if (cfg.towerStopFloor > 0 && st.towerFloor >= cfg.towerStopFloor && !document.getElementById('frame_TowerGate')) { stop('爬塔：已到第 ' + st.towerFloor + ' 层，按设置停止'); return; }

    if (hasFrame('frame_Combat')) { noteCombat(); setStatus('爬塔：战斗中…（游戏自动战斗）'); return; }
    if (handleFrames()) return;
    /* ★ 前置任务跟随：一旦开始（有目标 / 正在走开走回），每 tick 都优先跑，
       否则角色一离开 entrance 那一格，stepTowerQuest 就不再被调用 → 目标丢失 → 被普通逻辑拉回入口。 */
    if (st.tq && (st.tq.target || st.tq.off)) { st.phase = 'quest'; if (stepTowerQuest()) return; }
    /* ★ frame_TowerGate 检查 + 层数计数：必须放在索敌之前。
       否则「点 Enter 进下一层 → 立刻刷出新怪 → pickTarget 命中」会在到达计数那行之前 return，
       层数永远不涨（也就永远触发不了「爬到第 N 层停止」）。
       实测（2026-10-20）：走到 tower_gate 会打开 frame_TowerGate（标题 'Prove Yourself Worthy'，
       正文 'Clear the floor / Slay the N remaining enemies'），里面有「Enter」按钮（/modal/tower_gate?enter）。 */
    if (tg) {
      /* ★ v2.6.107：塔门弹窗正文写着「Clear the floor / Slay the N remaining enemies」。
         N > 0 = 本层还没清完（另一半房间的怪）→ 盲目点 Enter 没用，会在这里死循环。
         读不到数字就按老逻辑走（保守）。 */
      const remainM = /(\d+)\s*remaining/i.exec(tg.textContent || '');
      const remain = remainM ? +remainM[1] : 0;
      if (remain > 0) {
        st.phase = 'wait';
        setStatus('爬塔：本层还剩 ' + remain + ' 只怪，先清完再下楼');
        if (now() - (st.towerRemainLogAt || 0) > 20000) { st.towerRemainLogAt = now(); logEvent('爬塔：塔门提示还剩 ' + remain + ' 只怪 → 先回去清完'); }
        st.towerGateSeen = false;              /* 我们自己关的窗 → 不能算「进层成功」 */
        try { closeFrameById('frame_TowerGate'); } catch (e) { /* ignore */ }
        return;
      }
      st.towerGateSeen = true;
      st.phase = 'wait'; setStatus('爬塔：进入下一层…');
      if (!st.towerEntered || now() - st.towerEntered > 8000) {
        st.towerEntered = now();
        const btn = tg.querySelector('.frame-content button, .frame-content a.btn') || tg.querySelector('button');
        if (btn) { btn.click(); logEvent('爬塔：点击进入下一层'); }
        else { try { createDialog('Tower Gate', '', 'ajax', '/modal/tower_gate?enter', true); logEvent('爬塔：进入下一层（兜底请求）'); } catch (e) { /* ignore */ } }
      }
      return;
    }
    st.towerEntered = 0;
    const healing = supply();
    if (st.repair.active || st.sell.active) return;
    if (st.mapSwitch.active || navBusy) { setStatus(st.statusText); return; }
    if (retargetCombat.tick()) return;
    if (checkMove()) return;
    try {
      if (character.walk_to && walkQueue[character.id] && walkQueue[character.id].length) {
        st.phase = 'move'; setStatus('爬塔：移动中…'); return;
      }
    } catch (e) { /* ignore */ }
    if (pollSmithTrip()) return;
    if (healing) { setStatus('爬塔：回血中…'); return; }

    /* ★ 站上入口不触发（游戏只在「走进这一格」时执行格子动作）→ 走开一格再走回来 */
    if (st.towerOff) {
      const o = st.towerOff;
      if (character.x === o.x && character.y === o.y) {
        if (!o.at) { o.at = now(); return; }
        if (now() - o.at < 1200) return;          /* ★ 在入口旁站一下再走回，走格动画才完整 */
        st.towerOff = null; st.towerGateAt = now(); st.target = null;
        startMove(o.gx, o.gy, 'tower', '下一层入口');
      } else if (!st.move) {
        st.target = null;
        startMove(o.x, o.y, 'tower', '入口旁');
      }
      return;
    }

    /* 1) 还有可打的怪 → 打 */
    const t = pickTarget();
    if (t) {
      if (t.skip) return;
      st.target = t.enemy || null;
      startMove(t.x, t.y, t.kind, t.label);
      return;
    }

    /* 1.5) ★ v2.6.107：本层被一道门分成两个房间 —— 另一侧房间的怪「走不到」（不在可达集合里），
       pickTarget 会跳过它们 → 脚本误以为本层清完去下楼，结果被塔门拦住。
       所以只要还有走不到的怪，就先去把「房间门」踩一遍（过门到另一侧），清完才能下楼。
       用 st.towerRoomTries 限制次数，避免门踩不动时死循环。 */
    /* ★ v2.6.108：一层塔被若干道「房间门」切成多个区域 —— 别的区域的怪「走不到」，
       pickTarget 会跳过它们 → 脚本会误以为本层清完去下楼。
       通用做法（不假定只有 2 个房间）：只要还有够不到的怪，就去踩一道「本层还没走过的」房间门，
       过门继续清；反复「清区域 → 过门」直到本层一只怪都不剩，才去下一层入口。
       房间门判据 = door_tiles 里「目的地 = 本图自己」的自环门（实测 map 901：901→901 @26,36）。 */
    if (unreachableEnemies() > 0) {
      const door = towerRoomDoor();
      if (!door) {
        st.phase = 'idle';
        setStatus('爬塔：还剩 ' + unreachableEnemies() + ' 只怪够不到（本层房间门都走过了）…');
        if (now() - (st.towerDoorLogAt || 0) > 30000) { st.towerDoorLogAt = now(); logEvent('爬塔：本层还有 ' + unreachableEnemies() + ' 只怪够不到，房间门都试过了 → 这层可能有走不到的区域'); }
        return;
      }
      /* 第 1 层的房间门是 entrance，可能被前置任务锁住 → 交给 stepTowerQuest */
      if (door.action === 'entrance') {
        const ef = document.getElementById('frame_Entrance');
        if (ef && ef.querySelector('a[onclick*="guidePath"]')) {
          st.phase = 'quest';
          if (stepTowerQuest()) return;
        }
      }
      if (character.x === door.x && character.y === door.y) {
        st.phase = 'wait'; setStatus('爬塔：过房间门 → 下一个区域…');
        if (!st.towerDoorAt) st.towerDoorAt = now();
        if (now() - st.towerDoorAt > 2500) {
          st.towerDoorAt = now();
          const dk = door.x + '-' + door.y;
          st.towerDoorsUsed = st.towerDoorsUsed || {};
          st.towerDoorsUsed[dk] = 1;                 /* 这道门走过了 → 下次换别的门 */
          let done = false;
          try {
            const act = (typeof window.getTileActionAt === 'function') ? window.getTileActionAt(door.x, door.y) : null;
            if (act && typeof window.execTileAction === 'function') { window.execTileAction(act, false); logEvent('爬塔：触发房间门（' + act + ' @' + dk + '）'); done = true; }
          } catch (e) { /* ignore */ }
          if (!done) {
            const off = towerAdjacentTile(door.x, door.y);
            if (off) { st.towerOff = { x: off.x, y: off.y, gx: door.x, gy: door.y }; st.towerDoorAt = 0; logEvent('爬塔：房间门未触发 → 走开再走回'); }
            else safeWalkTo(door.x, door.y);
          }
        }
        return;
      }
      if (isReachable(door.x, door.y)) {
        st.target = null;
        startMove(door.x, door.y, 'tower', '房间门');
        return;
      }
      st.phase = 'idle';
      setStatus('爬塔：房间门（' + door.x + '-' + door.y + '）走不到…');
      return;
    }
    st.towerDoorsUsed = {};   /* 本层清空 → 清掉「已走过的门」，下一层重新开始 */

    /* 2) 本层清完 → 去下一层入口 */
    const gate = towerNextGate();
    if (!gate) { st.phase = 'idle'; setStatus('爬塔：本层没找到通往下一层的入口，等待…'); return; }
    if (character.x === gate.x && character.y === gate.y) {
      /* ★ 第 1 层的「下一层」入口其实是 entrance，但它被任务锁住（The Note / Finding The Key）。
         检测到任务提示就明确报出来，别让玩家以为脚本坏了。 */
      if (gate.action === 'entrance') {
        /* ★ 锁住时 entrance 弹窗里会带一个 guidePath 链接（指向当前该做的任务的起点）→ 交给 stepTowerQuest 自动做掉。
           只认 DOM 结构，不依赖界面语言。 */
        const ef = document.getElementById('frame_Entrance');
        const locked = !!(ef && ef.querySelector('a[onclick*="guidePath"]'));
        if (locked) {
          st.phase = 'quest';
          if (stepTowerQuest()) return;
          st.phase = 'idle';
          setStatus('爬塔：本层入口被任务锁住（需先完成 The Note / Finding The Key）');
          if (now() - (st.towerQuestLogAt || 0) > 60000) { st.towerQuestLogAt = now(); logEvent('爬塔：入口需要任务（The Note / Finding The Key），先去做任务再回来'); }
          return;
        }
      }
      st.phase = 'wait'; setStatus('爬塔：已到下一层入口，等待传送…');
      if (!st.towerGateAt) st.towerGateAt = now();
      if (now() - st.towerGateAt > 2500) {
        st.towerGateAt = now();
        /* ★ 站上去不会自动触发（游戏只在「走进这一格」时执行格子动作）→ 直接调游戏自己的 execTileAction。
           实测：execTileAction(getTileActionAt(x,y), false) 能可靠触发 tower_gate 传送。 */
        let done = false;
        try {
          const act = (typeof window.getTileActionAt === 'function') ? window.getTileActionAt(gate.x, gate.y) : null;
          if (act && typeof window.execTileAction === 'function') { window.execTileAction(act, false); logEvent('爬塔：触发入口（' + act + '）'); done = true; }
        } catch (e) { /* ignore */ }
        if (!done) {
          const off = towerAdjacentTile(gate.x, gate.y);
          if (off) { st.towerOff = { x: off.x, y: off.y, gx: gate.x, gy: gate.y }; st.towerGateAt = 0; logEvent('爬塔：入口未触发 → 走开再走回'); }
          else safeWalkTo(gate.x, gate.y);
        }
      }
      return;
    }
    if (!isReachable(gate.x, gate.y)) {
      st.phase = 'idle';
      setStatus('爬塔：下一层入口（' + gate.x + '-' + gate.y + '）走不到，等待…');
      return;
    }
    st.target = null;
    startMove(gate.x, gate.y, 'tower', '下一层入口');
  }

  /* ---- 一键挂机：有怪按优先级打怪，无怪则采集，都没有就等刷新 ---- */
  function stepAuto() {
    if (hasFrame('frame_Combat')) { noteCombat(); setStatus('战斗中…（游戏自动战斗）'); return; }
    if (retargetCombat.tick()) return;   /* ★ 途中持续索敌：更优目标立刻切换 */
    if (checkMove()) return;
    if (hasFrame('frame_Scavenge') || hasFrame('frame_Loot')) {
      st.phase = 'wait'; takeAllLoot(); setStatus('战斗收尾中…'); return;
    }

    const inGather = hasFrame('frame_Gathering') || hasFrame('frame_CollectScrap') || gatheringActive();
    if (inGather && !st.inCollect) { st.inCollect = true; countGather(); logEvent('开始采集', { key: 'gather:' + character.current_map }); }
    if (!inGather && st.inCollect) st.inCollect = false;

    const healing = supply();
    if (pollSmithTrip()) return;
    /* ★ 还没补到阈值 → 原地等，别急着去下一个怪（否则战斗间隙只吃一瓶就跑了） */
    if (healing) { setStatus('回血中…（补到阈值后再继续寻敌）'); return; }

    // 1) 优先打怪（战斗优先级：星级 → 名单 → 距离；★ 不套用「采集中断条件」星级门槛）
    const t = combatTarget();
    if (t) {
      if (inGather) closeGatheringWindows();
      st.target = t.enemy;
      startMove(t.x, t.y, t.kind, t.label);
      return;
    }

    // 2) 无怪 → 先捡地面资源（★ 仅在允许采集时）
    if (cfg.autoGather && cfg.gatherScrap) {
      const r = nearestResource();
      if (r) {
        if (inGather) closeGatheringWindows();
        startMove(r.x, r.y, 'res', '资源·' + (r.name || r.action));
        return;
      }
    }

    // 3) 再回采集点（★ 仅在允许采集时）
    const name = cfg.autoGather ? effectiveGatherPoint() : '';
    if (name) {
      const spot = findGatheringSpot(name);
      if (spot) {
        if (character.x === spot.x && character.y === spot.y) {
          if (gatheringActive() && gatheringTurning()) { st.phase = 'gather'; st.gatherRetryAt = 0; st.gatherIdleSince = 0; setStatus('采集中…（游戏自动循环）'); return; }
          /* ★ v2.6.158：先给游戏 1.2s 自动开采的机会，避免「刚到位、弹窗还没渲染」就误判没在采、白重开一次。 */
          if (!st.gatherIdleSince) st.gatherIdleSince = now();
          if (now() - st.gatherIdleSince < 1200) { st.phase = 'wait'; setStatus('已就位，等待采集开始…'); return; }
          if (now() - st.gatherRetryAt > 5000) {
            st.gatherRetryAt = now();
            closeGatheringWindows();
            if (startGatheringHere()) { setStatus('重新开始采集…'); return; }
          }
          st.phase = 'wait'; setStatus('已就位，等待采集开始…'); return;
        }
        st.gatherRetryAt = 0;
        st.gatherIdleSince = 0;
        startMove(spot.x, spot.y, 'gather', '采集点·' + spot.name);
        return;
      }
    }

    // 3) 既没怪也没采集点：把「为什么没得打」说清楚（名单过滤 / 不可达 / 真清完）
    st.phase = 'idle'; st.target = null;
    const nl = monsterList().length;
    const stuck = unreachableEnemies();
    const hint = cfg.autoGather ? '（可在「挂机」页选采集点边采边等）' : '（已关自动采集，可开「切图刷怪」）';
    const _dg = targetDiagText(targetDiag());
    if (name) setStatus('本图无怪、也没有可到达的「' + name + '」，等待刷新…' + _dg);
    else if (nl) setStatus('本图没有名单内的怪物（名单 ' + nl + ' 项）' + hint + _dg);
    else if (stuck) setStatus('本图可到达的怪物已清完（另有 ' + stuck + ' 只被门/障碍挡住）' + hint + _dg);
    else setStatus('本图已清完，等待怪物刷新…' + hint + _dg);
    autoMapSwitchMaybe();
  }

  /* ======================= 14.9 多角色轮转（Multi-Character Idle Rotation） =======================
   * 游戏 1.0 的 Gather Queue / Idle Mode：
   *   · 站在采集点上 → GET /modal/professions?tab=gathering&start=1 启动离线采集
   *     （受工具耐久限制；启动后游戏会把你弹回选角页；奖励在下次登录该角色时结算）
   *   · 队列是【账号级】的（3 槽，第 3 槽 Noble 专属），跨角色 / 离线继续
   *   · 队列读取：GET /modal/professions?tab=gathering → #gather_slot_<n>
   *     （label = "<角色名> - <地点> (Lv.<tier>) - <资源>"；[data-countdown-epoch] = 完成时间戳(秒)）
   *   · 切角色 = 整页跳转 GET /choose_char?id=<id> → 轮转状态必须落 localStorage
   * 本模块：1 主角色 + 最多 3 副角色；主角色正常挂机，副角色各自 idle；
   * 副角色任务到期 → 切过去 → 维修 → 存仓 → 回挂机点重启 idle → 切回主角色。
   * ===================================================================== */
  const ROT_KEY = 'norroth_autofarm_rot_v1';
  let rot = null;
  let mcSeq = 0;             // 轮转独立换代，避免停止后立即重启接收旧请求

  function mcLoadRot() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(ROT_KEY) || 'null'); } catch (e) { o = null; }
    if (!o || typeof o !== 'object') o = {};
    if (typeof o.on !== 'boolean') o.on = false;
    if (!o.mainId) o.mainId = null;
    if (!o.phase) o.phase = 'MAIN';
    if (!o.idle || typeof o.idle !== 'object') o.idle = {};
    if (!o.fail || typeof o.fail !== 'object') o.fail = {};
    /* ★ v2.6.152：mainRun 已废弃（调度器不再管理主角色挂机）；老数据里的该字段被忽略。 */
    if (!('switching' in o)) o.switching = null;   /* ★ 正在切号：页面跳转期间不重复触发行程 */
    if (typeof o.paused !== 'boolean') o.paused = false;   /* ★ v2.6.79：暂停轮转（保留队列/记录，不切号不跑行程） */
    rot = o;
    return rot;
  }
  function mcSaveRot() { try { if (rot) { rot.updatedAt = now(); localStorage.setItem(ROT_KEY, JSON.stringify(rot)); } } catch (e) { /* ignore */ } }

  function mcChars() { return Array.isArray(cfg.mcChars) ? cfg.mcChars : []; }
  function mcMain() { return mcChars().filter(c => c && c.role === 'main' && c.id)[0] || null; }
  function mcAlts() { return mcChars().filter(c => c && c.role !== 'main' && c.id && c.enabled !== false); }
  function mcAltById(id) { return mcAlts().filter(c => String(c.id) === String(id))[0] || null; }
  function mcAltByName(nm) { const k = normName(nm); return mcAlts().filter(c => normName(c.name) === k)[0] || null; }
  /* ★ 切号保护：轮转进行中，当前角色是不是「主角色」？（未开轮转时恒为 true） */
  function isMainCharNow() {
    try {
      if (!(cfg.multiChar && rot && rot.on)) return true;
      const main = mcMain();
      if (!main) return true;
      return String(character && character.id) === String(main.id);
    } catch (e) { return true; }
  }

  /* ★ 切角色：游戏内直接 GET /choose_char?id=X 会被服务端忽略（重定向回 / 仍是当前角色）；
     正确流程：先 /switch_char 退出到选角页，再 /choose_char?id=X 进入目标角色。 */
  function mcSwitch(id) {
    const t = String(id);
    const seq = mcSeq;
    /* ★ 记录「正在切号」：切号是整页跳转，完成前当前页仍是旧角色，
       mcTick 若在这段窗口里再触发一次行程 → 会重复启动 idle 并误报失败。 */
    try { if (rot) { rot.switching = { from: inGame() ? String(character.id) : null, to: t, at: now() }; mcSaveRot(); } } catch (e) { /* ignore */ }
    let done = false;
    const go = function () { if (done || seq !== mcSeq) return; done = true; try { location.href = '/choose_char?id=' + encodeURIComponent(t); } catch (e) { /* ignore */ } };
    try {
      fetch('/switch_char', { credentials: 'same-origin' }).catch(function () { /* ignore */ }).then(go);
      setTimeout(go, 2500);   /* 兜底：fetch 卡住也要切 */
    } catch (e) { go(); }
  }

  /* 读账号级采集队列（在游戏里就能读，不需要在采集点上） */
  async function mcQueue() {
    const r = await fetch('/modal/professions?tab=gathering', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const html = await r.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out = [];
    /* ★ v2.6.19b：已排队的槽位 = 游戏自己给的 id="gather_slot_N"（空槽没有这个 id）。
       实测 markup（2026-10-19，角色排队中）：
         <div class="divblock" id="gather_slot_0">
           <span class="label label-normal">Noble - Owranbu River (Lv. 7) - Elm</span>
           <div class="gathering_bar"><span data-countdown-epoch="..."><b class=timer>..</b></span></div>
           <button class="btn btn-danger" onclick="...cancel=3960...">Cancel</button>
         </div>
       标签在 .label（**不在** .gathering_bar 里 —— 里面那个 span 是倒计时），倒计时在 [data-countdown-epoch]。 */
    const tab = doc.getElementById('tab_gathering');
    if (!tab) return out;
    const parseSlot = function (el) {
      const lab = el.querySelector('.label');
      const label = lab ? String(lab.textContent || '').trim() : '';
      if (!label) return null;
      const cd = el.querySelector('[data-countdown-epoch]');
      const epoch = cd ? (+cd.getAttribute('data-countdown-epoch') || 0) : 0;
      const barLen = el.querySelector('.bar_length');
      const pct = barLen ? (barLen.getAttribute('style') || '') : '';
      const m = /^(.*?)\s+-\s+(.*?)\s*\(Lv\.?\s*(\d+)\)\s*-\s*(.*)$/.exec(label);
      return { slot: (+String(el.id || '').replace('gather_slot_', '') || 0), label: label, epoch: epoch, pct: pct,
               name: m ? m[1].trim() : label.split(/\s+-\s+/)[0].trim(),
               loc: m ? m[2].trim() : '', tier: m ? +m[3] : 0, res: m ? m[4].trim() : '' };
    };
    tab.querySelectorAll('[id^="gather_slot_"]').forEach(function (el) { const o = parseSlot(el); if (o) out.push(o); });
    /* 兜底：万一以后 id 变了 —— 用「槽位里有 .label」判定已排队（空槽只有 .gathering_bar > span，没有 .label） */
    if (!out.length) {
      tab.querySelectorAll('.divblock, .divblock_dark').forEach(function (el) {
        if (el.querySelector('[id^="gather_slot_"]') || !el.querySelector('.label') || !el.querySelector('.gathering_bar')) return;   /* 排除 Idle 信息块（它有 .label 但没有 .gathering_bar） */
        const o = parseSlot(el); if (o) out.push(o);
      });
    }
    return out;
  }

  /* 读职业等级（账号共享）：/modal/professions 的 .experience_bar.<prof>_experience */
  async function mcProfLevels() {
    const r = await fetch('/modal/professions', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const html = await r.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out = {};
    doc.querySelectorAll('.experience_bar').forEach(function (el) {
      const m = /([a-z]+)_experience/.exec(el.className || '');
      if (!m) return;
      const lv = el.querySelector('#skill_level');
      out[m[1]] = lv ? (+lv.textContent.trim() || 0) : 0;
    });
    return out;
  }

  /* ★ 多角色：启动前校验。技能等级账号共享，可提前查；缺配置 / 职业未解锁直接跳过，避免白切角色 */
  let _mcProfCache = { at: 0, lv: null };
  async function mcProfLevelsCached() {
    if (_mcProfCache.lv && now() - _mcProfCache.at < 300000) return _mcProfCache.lv;
    try { _mcProfCache = { at: now(), lv: await mcProfLevels() }; } catch (e) { /* ignore */ }
    return _mcProfCache.lv || {};
  }
  /* 同步配置校验：必须有挂机地图 + 采集点坐标 */
  function mcCanGather(alt) {
    if (!alt) return false;
    if (!alt.gatherMap) { mcSkipAlt(alt, '未设置挂机地图'); return false; }
    if (!(alt.nodeX > 0 && alt.nodeY > 0)) { mcSkipAlt(alt, '未设置采集点坐标'); return false; }
    /* ★ v2.6.96：副角色必须有自己的维修城镇（不再回落到主角色的设置） */
    if (!alt.serviceTown) { mcSkipAlt(alt, '未设置维修城镇'); return false; }
    return true;
  }
  function mcSkipAlt(alt, msg) {
    const rec = rot.idle[alt.id] || (rot.idle[alt.id] = {});
    if (rec.fail && rec.failMsg === msg) return;
    rec.fail = true; rec.failAt = now(); rec.epoch = null; rec.est = 0; rec.failMsg = msg;
    logEvent('多角色：跳过副角色「' + alt.name + '」— ' + msg);
    mcSaveRot(); mcRender();
  }
  /* ★ 启动前校验（职业等级账号共享，可提前查） */
  async function mcValidateAll() {
    const lv = await mcProfLevelsCached();
    const bad = [];
    mcAlts().forEach(function (alt) {
      if (!alt.gatherMap) { mcSkipAlt(alt, '未设置挂机地图'); bad.push(alt.name + '缺挂机地图'); return; }
      if (!(alt.nodeX > 0 && alt.nodeY > 0)) { mcSkipAlt(alt, '未设置采集点坐标'); bad.push(alt.name + '缺采集点'); return; }
      if (!alt.serviceTown) { mcSkipAlt(alt, '未设置维修城镇'); bad.push(alt.name + '缺维修城镇'); return; }
      if (alt.profession && !(lv[alt.profession] > 0)) { mcSkipAlt(alt, '职业「' + alt.profession + '」未解锁或等级为 0'); bad.push(alt.name + '职业未解锁'); return; }
      /* ★ 提醒：采集点不属于选定的图（行程会自愈，但先提个醒） */
      try {
        const tiles = MapDB.gatherTiles(alt.gatherMap) || [];
        if (tiles.length && !tiles.some(function (q) { return +q[0] === +alt.nodeX && +q[1] === +alt.nodeY; })) {
          logEvent('多角色校验：「' + alt.name + '」的采集点 ' + alt.nodeX + '-' + alt.nodeY + ' 不属于「' + navMapName(alt.gatherMap) + '」，行程会自动改走本图最近采集点');
        }
      } catch (e) { /* ignore */ }
      const rec = rot.idle[alt.id]; if (rec && rec.fail && rec.failMsg && !/^未设置/.test(rec.failMsg)) { rec.fail = false; rec.failMsg = ''; }
    });
    mcSaveRot(); mcRender();
    if (bad.length) { setStatus('多角色：校验发现问题 — ' + bad.join('；')); logEvent('多角色校验：' + bad.join('；')); }
    else setStatus('多角色：校验通过（' + mcAlts().length + ' 个副角色）');
    return bad;
  }

  /* 把「44 min」「0s」「1h 5m」等时长文本换成分钟 */
  function mcParseDurMin(str) {
    if (!str) return 0;
    let min = 0, m;
    const re = /(\d+)\s*(hours|hour|hrs|hr|h|minutes|minute|mins|min|m|seconds|second|secs|sec|s|小时|分钟|秒)(?![a-z])/gi;
    while ((m = re.exec(str))) {
      const v = +m[1], u = m[2].toLowerCase();
      if (u.charAt(0) === 'h' || u.indexOf('时') >= 0) min += v * 60;
      else if (u.charAt(0) === 'm' || u.indexOf('分') >= 0) min += v;
      else min += v / 60;
    }
    return Math.round(min);
  }
  /* 站在采集点上时读「You can gather for X (Y turns)」+ 「Limited by: …」
     注意：工具耐久为 0 时游戏显示「0s (0 turns)」，所以不能只认 min 单位。 */
  let _mcGatherRaw = '';   /* ★ 上一次读到的采集页原文（诊断用） */
  async function mcIdleInfo() {
    const r = await fetch('/modal/professions?tab=gathering', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const html = await r.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tab = doc.getElementById('tab_gathering');
    if (!tab) { _mcGatherRaw = '(无 tab_gathering)'; return null; }
    _mcGatherRaw = tab.textContent.replace(/\s+/g, ' ');
    /* ★ v2.6.19：不再按「You can gather for X (Y turns)」文案匹配。
       用游戏自己的 DOM 锚点：Idle Mode 图标 div[name="idle_mode"] → 它所在的 .divblock，
       里面两个 <b> 依次是「时长」「回合数」（回合数是纯数字，语言无关）。
       Limited by 取 .label.label-default。 */
    const icon = tab.querySelector('div[name="idle_mode"]');
    const block = icon ? (icon.closest('.divblock') || icon.parentNode) : null;
    if (!block) return null;
    const bs = block.querySelectorAll('b');
    if (bs.length < 2) return null;
    const dur = String(bs[0].textContent || '').trim();
    const turns = parseInt(String(bs[1].textContent || '').replace(/[^\d]/g, ''), 10);
    if (!isFinite(turns)) return null;
    const limEl = block.querySelector('.label.label-default') || block.querySelector('.label');
    const limitedBy = limEl ? String(limEl.textContent || '').replace(/^[^\w\u4e00-\u9fa5]+/, '').replace(/^(?:Limited by|限制于|受限于)\s*[:：]\s*/i, '').trim() : '';
    return { min: mcParseDurMin(dur), turns: turns, dur: dur, limitedBy: limitedBy };
  }

  /* 启动 idle（服务端开始离线采集）；响应脚本会跳 /switch_char，我们自己控制跳转 */
  async function mcStartIdle() {
    const r = await fetch('/modal/professions?tab=gathering&start=1', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const t = await r.text();
    /* ★ v2.6.19：成功信号 = 响应里带「回选角页」的跳转脚本（URL 语言无关），或文案（中英双语）。 */
    return /switch_char|Idle\s*Mode\s*started|离线模式|已开始离线/i.test(t);
  }

  /* 主循环钩子：true = 本 tick 已被接管（副角色行程），false = 走正常逻辑（主角色 / 未启用） */
  function mcTick() {
    if (!cfg.multiChar) return false;
    if (!rot) mcLoadRot();
    if (!rot.on) return false;
    if (!inGame()) return false;
    /* ★ 切号后游戏会弹「Idle Mode Results」离线结算框：随时点掉，避免遮罩卡住后续操作 */
    try { closeIdleResultDialog(); } catch (e) { /* ignore */ }
    /* ★ 切号进行中：等页面跳到目标角色；期间不重复触发行程（否则会重复启动 idle / 误报失败） */
    if (rot.switching) {
      if (String(character.id) === String(rot.switching.to)) { rot.switching = null; mcSaveRot(); }
      else if (now() - (rot.switching.at || 0) < 45000) return true;
      else { rot.switching = null; mcSaveRot(); }
    }
    const main = mcMain();
    if (!main) return false;
    if (String(character.id) === String(main.id)) {
      /* ★ v2.6.152：多角色调度器只管副角色 —— 主角色的挂机完全由挂机模块自己管理
         （用户操作 / 断线续挂 autoResume），这里绝不 beginRun、绝不恢复主角色挂机。
         原来这里有一块「切回主角色自动恢复 rot.mainRun」的逻辑：它越权启动了主角色挂机，
         导致「停止挂机后 ~1.2s 又被调度器拉起来」。已删除。 */
      /* ★ v2.6.79：暂停中不读队列 —— mcWatchQueue() 会 mcBeginTrip() → mcSwitch() 切号，
         实测把守卫只放在下面（副角色分支）根本挡不住：主角色页每 20s 读一次队列就把号切走了。 */
      if (!rot.paused) mcWatchQueue();
      return false;
    }
    /* ★ v2.6.79：暂停中 —— 不启动副角色行程、也不切号（人在副角色页时由这里兜底） */
    if (rot.paused) return false;
    const alt = mcAltById(character.id);
    if (!alt) return false;
    if (!st.mcBusy) {
      st.mcBusy = true;
      mcRunTrip(alt).catch(function () { /* ignore */ }).then(function () { st.mcBusy = false; });
    }
    return true;
  }

  /* ★ 该去「领取 + 重启」吗？
     队列里有该角色的条目 = 服务器认为它有任务：
       · epoch 有值且在将来 → 正在跑，等
       · epoch 有值且已过期 → 完成
       · epoch = 0（没有倒计时）→ 已完成待领取（任务跑完但没去收）
     刚启动的任务可能短暂没有倒计时，所以用「启动时记的预计完成时间 est / startedAt」挡住误判。 */
  function mcDue(rec) {
    if (!rec || rec.fail) return false;
    /* 兜底[多角色]：副角色任务失败后 180s 内不重试（避免反复切号白折腾） */
    if (rec.failAt && now() - rec.failAt < 180000) return false;
    if (rec.epoch) return now() >= rec.epoch * 1000;                   /* 有倒计时：到点才算完成 */
    if (rec.queued) {
      if (rec.est && now() < rec.est) return false;                    /* 我们启动时记的预计完成时间还没到 */
      if (rec.startedAt && now() - rec.startedAt < 120000) return false; /* 刚启动 2 分钟内先别动 */
      return true;                                                     /* 无倒计时 = 已完成待领取 */
    }
    /* ★ v2.6.19b：队列里没有它，但启动时记的预计完成时间已过（+2 分钟宽限）→ 也算完成，
       避免「服务端没登记 / 名字没对上」时永久卡在「启动中」。 */
    if (rec.est && now() >= rec.est + 120000) return true;
    return false;
  }
  /* ★ v2.6.21：把服务器采集队列映射到各副角色状态（queued / epoch / label）。
     抽出来是为了让「刷新」按钮也能真的更新状态 —— 原来只有 mcWatchQueue 会写，而且被节流 20s，
     点「刷新」只更新了内部缓存，面板状态根本不动。 */
  function mcApplyQueue(list) {
    if (!rot) mcLoadRot();
    const alts = mcAlts();
    /* 先清掉上一轮的「在队列里」标记，再按本轮的队列重打 */
    alts.forEach(function (a) { const r = rot.idle[a.id]; if (r) r.queued = false; });
    let hit = 0;
    (list || []).forEach(function (s) {
      const a = mcAltByName(s.name);
      if (!a) return;
      const rec = rot.idle[a.id] || (rot.idle[a.id] = {});
      rec.epoch = s.epoch; rec.queued = true; rec.label = s.label; rec.res = s.res; rec.loc = s.loc; rec.fail = false;
      hit++;
    });
    return hit;
  }
  /* ★ v2.6.21：手动「刷新」——真的去读服务器队列并更新各副角色状态（不触发轮转）。 */
  async function mcRefreshStatus() {
    if (!rot) mcLoadRot();
    try {
      const list = await mcQueue();
      _mcQueueCache = list;
      const hit = mcApplyQueue(list);
      mcSaveRot(); mcRender();
      setStatus('多角色：已刷新（队列 ' + (list || []).length + ' 条 · 匹配 ' + hit + ' 个副角色）');
      return list;
    } catch (e) {
      mcRender();
      setStatus('多角色：刷新失败 ' + (e && e.message ? e.message : e));
      return [];
    }
  }
  /* 主角色：定期读队列 → 更新各副角色 epoch → 到期 / 未启动 就切过去 */
  function mcWatchQueue() {
    if (!cfg.multiChar || !rot || !rot.on || rot.paused) return;
    /* ★ v2.6.157：优先级 Overlord > 活动 > 多角色离线 —— 两者进行中都不切号。 */
    if (cfg.autoOverlord && ovlHolding()) return;
    if (cfg.autoEvent && eventHolding()) return;
    if (rot.tripAlt) return;
    /* ★ v2.6.16：主角色正在维修 / 清包 / 存仓行程中 → 别切号。
       切号是整页跳转，会把正在跑的行程当场打断（表现为「触发维修→传送到城镇→什么都没发生」）。 */
    if (st.repair.active || st.sell.active || st.bank.active || st.tripManual) return;
    if (now() - (rot.lastQueueAt || 0) < rhythm(20000)) return;
    rot.lastQueueAt = now();
    const rotation = rot, charId = character.id, seq = mcSeq;
    mcQueue().then(function (list) {
      if (seq !== mcSeq || rot !== rotation || !cfg.multiChar || !rot.on || rot.paused || !inGame() || character.id !== charId) return;
      if (cfg.autoOverlord && ovlHolding()) return;
      if (rot.tripAlt || st.repair.active || st.sell.active || st.bank.active || st.tripManual) return;
      const alts = mcAlts();
      mcApplyQueue(list);
      mcSaveRot(); mcRender();
      /* ★ 真人化：任务完成后不立刻切，先随机等一段（避免 4 个号像流水线一样精确交接）
         ★ 完成判定含「epoch=0 的已完成待领取」（见 mcDue）
         ★ 多个副角色同时完成时「只等一次」：用全局 rot.rotWaitUntil，等完就一个接一个轮过去，
           不再给每个号各等一遍。没有待轮转的号时自动清零，下一批重新计时。 */
      let anyDue = false;
      for (let i = 0; i < alts.length; i++) { if (mcDue(rot.idle[alts[i].id])) { anyDue = true; break; } }
      if (!anyDue) { if (rot.rotWaitUntil) { rot.rotWaitUntil = 0; mcSaveRot(); } }
      else if (!rot.rotWaitUntil) {
        const w = humanRotWaitMs();
        rot.rotWaitUntil = now() + w; mcSaveRot(); mcRender();
        if (w > 0) logEvent('多角色：有副角色已完成 → 随机等待 ' + Math.round(w / 1000) + 's 再开始轮换');
      }
      for (let i = 0; i < alts.length; i++) {
        if (!mcDue(rot.idle[alts[i].id])) continue;
        if (now() >= (rot.rotWaitUntil || 0)) { mcBeginTrip(alts[i], false); return; }
      }
      /* 从未启动（队列里也没有）→ 首次启动 */
      for (let i = 0; i < alts.length; i++) { if (!rot.idle[alts[i].id]) { if (mcCanGather(alts[i])) { mcBeginTrip(alts[i], true); return; } } }
      /* ★ 队列一直没回填（服务端没登记 / 任务被取消）→ 用启动时读到的实际时长兜底，再挂一轮 */
      for (let i = 0; i < alts.length; i++) { const rec = rot.idle[alts[i].id]; if (rec && !rec.fail && !rec.queued && rec.est && now() >= rec.est + 120000) { if (mcCanGather(alts[i])) { mcBeginTrip(alts[i], true); return; } } }
      for (let i = 0; i < alts.length; i++) { const rec = rot.idle[alts[i].id]; if (rec && rec.fail && now() - (rec.failAt || 0) > 600000) { if (mcCanGather(alts[i])) { mcBeginTrip(alts[i], true); return; } } }
    }).catch(function () { /* ignore */ });
  }

  function mcBeginTrip(alt, first) {
    /* ★ v2.6.152：不再记录「主角色挂机状态」—— 主角色的挂机完全由挂机模块自己管理。 */
    if (rot.idle[alt.id]) rot.idle[alt.id].readyAt = 0;   /* ★ 已开始行程 → 清掉待命延迟 */
    rot.phase = 'ALT_TRIP'; rot.tripAlt = alt.id; rot.step = 'ENTER'; rot.firstStart = !!first;
    mcSaveRot();
    logEvent('多角色：' + (first ? '首次启动' : '采集完成') + ' → 切到副角色「' + alt.name + '」');
    setStatus('多角色：切换到副角色「' + alt.name + '」…');
    mcSwitch(alt.id);
  }

  /* ★ 走到采集点后，服务端位置可能还没跟上（客户端在采集点，服务端说「不在采集点」）。
     实测：这种失同步可以持续 60 秒以上；「走开一格再走回」能立刻强制同步。 */
  function mcAdjWalkTile(tx, ty) {
    const pts = window.points || [];
    const cand = [[tx + 1, ty], [tx - 1, ty], [tx, ty + 1], [tx, ty - 1], [tx + 1, ty + 1], [tx - 1, ty - 1]];
    for (let i = 0; i < cand.length; i++) { const p = cand[i]; if (pts.some(function (q) { return q.x === p[0] && q.y === p[1]; })) return p; }
    return null;
  }
  async function mcSettleAtSpot(alive, tx, ty) {
    let info = await mcIdleInfo();
    for (let k = 0; k < 5 && !info && alive(); k++) {
      const n2 = mcAdjWalkTile(tx, ty);
      if (!n2) { await sleep(1500); info = await mcIdleInfo(); continue; }
      logEvent('多角色：服务端还没确认「' + tx + '-' + ty + '」是采集点 → 走开一格再走回（第 ' + (k + 1) + ' 次）');
      await navWalkTile(n2[0], n2[1], { timeoutMs: 25000, alive: alive, cond: function () { return character.x === n2[0] && character.y === n2[1]; } });
      if (!alive()) return null;
      await sleep(800);
      await navWalkTile(tx, ty, { timeoutMs: 30000, alive: alive, cond: function () { return character.x === tx && character.y === ty; } });
      if (!alive()) return null;
      await sleep(1200);
      info = await mcIdleInfo();
    }
    return info;
  }
  /* 副角色页：维修 → 存仓 → 去挂机点 → 重启 idle → 切回主角色 */
  async function mcRunTrip(alt) {
    /* ★ v2.6.22：角色被改成主角色 / 被停用后，正在跑的副角色行程要立刻停（否则会一直乱跑） */
    const seq = mcSeq;
    const alive = function () { return seq === mcSeq && cfg.multiChar && rot && rot.on && !rot.paused && inGame() && String(character.id) === String(alt.id) && !!mcAltById(alt.id); };
    let repaired = false;
    async function doRepair() {
      try {
        const rr = await runRestock({ repair: true, sell: false, deposit: false, tag: '多角色：' });
        repaired = !!(rr && rr.repaired);
        if (rr && rr.repairErr) logEvent('多角色：维修失败 ' + rr.repairErr);
      } catch (e) { logEvent('多角色：维修失败 ' + (e && e.message ? e.message : e)); }
    }
    /* ★ 目标格必须是「本图采集点」：否则走到门/普通格会换图或采不了 → 自动改走本图最近采集点 */
    function isGatherTile(x, y) {
      return $$q('.map_table .tile_poi[action="gathering"]').some(function (el) {
        const p = (el.getAttribute('coords') || '').split('-'); return +p[0] === +x && +p[1] === +y;
      });
    }
    async function goSpot() {
      if (alt.gatherMap && String(character.current_map) !== String(alt.gatherMap)) {
        setStatus('多角色：导航到「' + navMapName(+alt.gatherMap) + '」…');
        const ok = await navToMap(+alt.gatherMap, { alive: alive });
        if (!ok && String(character.current_map) !== String(alt.gatherMap)) return false;
      }
      if (!alive()) return false;
      /* ★ 先校验目标格：不是本图采集点（或未配）→ 改用本图最近的采集点，并回写配置 */
      let tx = +alt.nodeX, ty = +alt.nodeY;
      if (!(tx > 0 && ty > 0) || !isGatherTile(tx, ty)) {
        const near = nearestGatherTile();
        if (near) {
          logEvent('多角色：副角色「' + alt.name + '」的采集点 ' + (tx > 0 ? (tx + '-' + ty) : '未设置') + ' 不是「' + currentMapName() + '」的采集点 → 改走 ' + near.x + '-' + near.y + (near.name ? '（' + near.name + '）' : ''));
          tx = near.x; ty = near.y;
          alt.nodeX = near.x; alt.nodeY = near.y; alt.res = near.name || alt.res; alt.profession = near.prof || alt.profession;
          saveCfg(); mcRender();
        }
      }
      if (tx > 0 && ty > 0 && !(character.x === tx && character.y === ty)) {
        setStatus('多角色：前往采集点 ' + tx + '-' + ty + '…');
        const r = await navWalkTile(tx, ty, { timeoutMs: 90000, alive: alive,
          cond: function () { return character.x === tx && character.y === ty; } });
        if (r !== 'ok') return false;
      }
      /* ★ 兜底：走过去的路上若误踩门换了图 → 再导航回来一次 */
      if (alt.gatherMap && String(character.current_map) !== String(alt.gatherMap)) {
        setStatus('多角色：误入「' + currentMapName() + '」，返回「' + navMapName(+alt.gatherMap) + '」…');
        await navToMap(+alt.gatherMap, { alive: alive });
        if (!alive()) return false;
        if (String(character.current_map) !== String(alt.gatherMap)) return false;
        if (tx > 0 && ty > 0 && !(character.x === tx && character.y === ty)) {
          const r2 = await navWalkTile(tx, ty, { timeoutMs: 90000, alive: alive,
            cond: function () { return character.x === tx && character.y === ty; } });
          if (r2 !== 'ok') return false;
        }
      }
      return true;
    }
    try {
      st.tripManual = true; st.altTrip = true; st.tripTown = alt.serviceTown || ''; st.tripHome = alt.gatherMap ? String(alt.gatherMap) : '';
      setStatus('多角色：副角色「' + alt.name + '」— 结算 / 维修 / 存仓 / 重启 idle…');
      logEvent('多角色：进入副角色「' + alt.name + '」（' + currentMapName() + '）');
      /* ★ 切到副角色后游戏会弹「Idle Mode Results」离线结算框：先领掉，否则遮罩挡住后续点击 */
      try { await claimIdleRewards(); } catch (e) { /* ignore */ }
      if (!alive()) return;
      /* ★ 一次进城：维修 → 存仓 → 出城（不再各自来回一趟）。
         ★ 「修」勾了就进城维修，**是否真要修按「休整」页的维修阈值（cfg.repairDurPct）判断**；
           「存」勾了就**直接存仓**（不看背包剩余，能存的全存）。 */
      if (alt.repairOn || alt.depositOn) {
        try {
          const rr = await runRepairAndDeposit({ repair: alt.repairOn, deposit: alt.depositOn });
          repaired = !!(rr && rr.repaired);
        } catch (e) { logEvent('多角色：维修/存仓失败 ' + (e && e.message ? e.message : e)); }
        if (!alive()) return;
      }
      if (!await goSpot()) { mcTripFail(alt, '前往采集点失败'); return; }
      if (!alive()) return;
      /* ★ 走到采集点后：先多读几次；仍不行就「走开一格再走回」强制同步服务端位置 */
      let info = await mcSettleAtSpot(alive, +alt.nodeX, +alt.nodeY);
      /* ★ 工具耐久为 0 → 采不动：自动去维修一次，再回采集点重试 */
      if ((!info || !info.turns) && !repaired && alt.serviceTown) {
        logEvent('多角色：副角色「' + alt.name + '」工具采不动（' + (info ? info.dur : '—') + '），先去维修…');
        await doRepair();
        if (!alive()) return;
        if (!await goSpot()) { mcTripFail(alt, '维修后返回采集点失败'); return; }
        if (!alive()) return;
        info = await mcSettleAtSpot(alive, +alt.nodeX, +alt.nodeY);
      }
      if (!info || !info.turns) {
        const why = (info && info.limitedBy) ? info.limitedBy
          : ('不在采集点（当前 ' + currentMapName() + ' ' + character.x + '-' + character.y + '；目标 ' + (alt.gatherMap ? navMapName(alt.gatherMap) : '?') + ' ' + (alt.nodeX > 0 ? (alt.nodeX + '-' + alt.nodeY) : '?') + '）');
        logEvent('多角色诊断：采集页 = ' + String(_mcGatherRaw || '').slice(0, 240));
        mcTripFail(alt, '采不了：' + why);
        return;
      }
      await humanPause();   /* ★ 真人化：启动 idle 也算一个动作 */
      if (!alive()) return;
      const ok = await mcStartIdle();
      if (!alive()) return;
      if (!ok) { mcTripFail(alt, '启动 idle 失败'); return; }
      rot.idle[alt.id] = { startedAt: now(), epoch: null, est: now() + info.min * 60000, min: info.min, turns: info.turns, fail: false, failMsg: '' };
      rot.fail[alt.id] = 0;
      logEvent('多角色：副角色「' + alt.name + '」idle 已启动（' + info.dur + ' / ' + info.turns + ' 回合）');
      const main = mcMain();
      rot.phase = 'MAIN'; rot.tripAlt = null; rot.step = null;
      mcSaveRot(); mcRender();
      if (main) { setStatus('多角色：切回主角色「' + main.name + '」…'); mcSwitch(main.id); }
    } catch (e) {
      mcTripFail(alt, e && e.message ? e.message : String(e));
    } finally {
      st.tripManual = false; st.altTrip = false; st.tripTown = ''; st.tripHome = '';
    }
  }

  function mcTripFail(alt, msg) {
    rot.fail[alt.id] = (rot.fail[alt.id] || 0) + 1;
    logEvent('多角色：副角色「' + alt.name + '」失败（' + msg + '），第 ' + rot.fail[alt.id] + ' 次');
    setStatus('多角色：副角色「' + alt.name + '」失败：' + msg);
    rot.idle[alt.id] = { startedAt: now(), epoch: null, fail: true, failAt: now() };
    const main = mcMain();
    rot.phase = 'MAIN'; rot.tripAlt = null; rot.step = null;
    mcSaveRot(); mcRender();
    if (main) mcSwitch(main.id);
  }

  /* 队列 + 各副角色状态（面板显示） */
  let _mcQueueCache = null;
  function mcFmtEpoch(epoch) {
    if (!epoch) return '—';
    let ms = epoch * 1000 - now(); if (ms < 0) ms = 0;
    const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + 'h' : '') + m + 'm' + (ss < 10 ? '0' : '') + ss + 's';
  }
  /* ★ 副角色配置下拉：挂机地图 / 维修存仓城镇（每个角色可各不相同） */
  function mcMapOptions(sel) {
    const opts = [], seen = {};
    const add = function (id, label) { id = String(id); if (!id || seen[id]) return; seen[id] = 1; opts.push({ id: id, label: label }); };
    try {
      MapDB.list().forEach(function (r) {
        if (!r || !r.id) return;
        if (!r.visited && !(r.g && r.g.length)) return;
        add(r.id, (r.name || ('#' + r.id)) + ' #' + r.id);   /* ★ v2.6.63：同名图（Swamp 有 6 张）靠 id 区分 */
      });
    } catch (e) { /* ignore */ }
    if (sel) add(sel, (navMapName(sel) || ('#' + sel)));
    opts.sort(function (a, b) { return (+a.id) - (+b.id); });
    return opts;
  }
  function mcTownOptions(sel) {
    let towns = [];
    try { towns = serviceTowns(); } catch (e) { towns = []; }
    const opts = towns.map(function (t) { return { id: String(t.id), label: (t.type === 'City' ? '🏙 ' : '') + t.name + (t.smith ? ' ⚒' : '') }; });
    if (sel && !opts.filter(function (o) { return o.id === String(sel); }).length) opts.push({ id: String(sel), label: (navMapName(sel) || ('#' + sel)) });
    return opts;
  }
  /* ★ 采集点下拉：列出该图学到的采集点（名称 + 坐标），选一个 = 决定采什么 */
  function mcNodeOptions(c) {
    const tiles = [], seen = {};
    const cur = (c.nodeX > 0 && c.nodeY > 0) ? (c.nodeX + '-' + c.nodeY) : '';
    const push = function (x, y, nm) {
      if (!(x > 0 && y > 0)) return;
      const k = x + '-' + y; if (seen[k]) return; seen[k] = 1;
      tiles.push({ v: k, label: k + ' ' + (nm || '采集点') });
    };
    try { (MapDB.gatherTiles(c.gatherMap) || []).forEach(function (t) { push(+t[0], +t[1], String(t[2] || '')); }); } catch (e) { /* ignore */ }
    if (cur && !seen[cur]) push(+c.nodeX, +c.nodeY, c.res || '');
    tiles.sort(function (a, b) { return a.label.localeCompare(b.label); });
    return '<option value="">（未选·站到采集点后点◎）</option>' +
      tiles.map(function (o) { return '<option value="' + o.v + '"' + (o.v === cur ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>'; }).join('');
  }
  function mcRender() {
    const box = document.getElementById('nr-mc-list');
    if (box) {
      const chars = mcChars();
      if (!chars.length) box.innerHTML = '<div class="pathmsg">还没有角色：到【选角页】点「读取角色」，或点某行「用当前」把当前角色加进来。</div>';
      else box.innerHTML = chars.map(function (c) {
        const rec = (rot && rot.idle) ? rot.idle[c.id] : null;
        let stt;
        if (c.role === 'main') stt = '<span style="color:#8fa3bd">主角色</span>';
        else if (rec && rec.fail) stt = '<span style="color:#ff8a8a">失败·稍后重试</span>';
        else if (rec && rec.epoch) stt = '<span style="color:#7fd08a">采集中 ' + mcFmtEpoch(rec.epoch) + '</span>';
        else if (rec && mcDue(rec)) stt = '<span style="color:#ffd76e">待领取</span>';
        else if (rec && rec.est && now() < rec.est) stt = '<span style="color:#7fd08a">采集中 ' + mcFmtEpoch(Math.round(rec.est / 1000)) + '（估）</span>';
        else if (rec) stt = '<span style="color:#e0c46a">启动中…</span>';
        else stt = '<span style="color:#8fa3bd">未启动</span>';
        const isMain = c.role === 'main';
        const mapOpts = mcMapOptions(c.gatherMap).map(function (o) { return '<option value="' + o.id + '"' + (String(c.gatherMap) === o.id ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>'; }).join('');
        const townOpts = mcTownOptions(c.serviceTown).map(function (o) { return '<option value="' + o.id + '"' + (String(c.serviceTown) === o.id ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>'; }).join('');
        const nodeOpts = mcNodeOptions(c);
        return '<div class="mc-row" data-id="' + c.id + '">' +
          '<div class="mc-h">' +
            '<input type="checkbox" class="chk nr-mc-en" ' + (isMain ? 'checked disabled title="主角色始终启用；切成副角色后可取消"' : (c.enabled !== false ? 'checked' : '')) + '>' +
            '<span class="nm" title="#' + c.id + '">' + escapeHtml(c.name || ('#' + c.id)) + '</span>' +
            '<select class="nr-mc-role" title="主 / 副角色"><option value="alt"' + (!isMain ? ' selected' : '') + '>副</option><option value="main"' + (isMain ? ' selected' : '') + '>主</option></select>' +
            '<span class="stt">' + stt + '</span>' +
            '<a class="nr-mc-fill" title="把当前角色的位置填给这一行（不改名字）">◎</a>' +
          '</div>' +
          (isMain ? '' :
          '<div class="mc-b">' +
            '<span class="fld"><span class="lb">图</span><select class="nr-mc-map" title="挂机地图' + (c.gatherMap ? (' · ' + navMapName(c.gatherMap) + ' [' + c.gatherMap + ']') : '') + '">' + mapOpts + '</select></span>' +
            '<span class="fld"><span class="lb">采</span><select class="nr-mc-node" title="采集点' + (c.res ? (' · ' + c.res + (c.nodeX > 0 ? (' ' + c.nodeX + '-' + c.nodeY) : '')) : '') + '">' + nodeOpts + '</select></span>' +
            '<span class="fld"><span class="lb">城</span><select class="nr-mc-town" title="维修/存仓城镇' + (c.serviceTown ? (' · ' + navMapName(c.serviceTown) + ' [' + c.serviceTown + ']') : '') + '"><option value="">（未设置 · 不能运行）</option>' + townOpts + '</select></span>' +
            '<span class="fld2">' +
              '<label title="进城先维修（是否要修按「休整」页的维修阈值判断；阈值也在「休整」页设）"><input type="checkbox" class="chk nr-mc-rep" ' + (c.repairOn ? 'checked' : '') + '>修</label>' +
              '<label title="进城直接存仓（不看背包剩余，能存的全存）"><input type="checkbox" class="chk nr-mc-dep" ' + (c.depositOn ? 'checked' : '') + '>存</label>' +
            '</span>' +
          '</div>') +
        '</div>';
      }).join('');
    }
  }
  function mcPollQueue() { mcQueue().then(function (l) { _mcQueueCache = l; mcRender(); }).catch(function () { /* ignore */ }); }

  /* ★ 在【选角页】读 char_data，**按游戏实际名单重置** cfg.mcChars：
     名字以游戏为准；数量与游戏一致（多出来的脏行直接丢）；
     同一角色保留原有的位置/城镇/开关配置。 */
  function mcReadChars() {
    let arr = null;
    try { arr = (typeof char_data !== 'undefined') ? char_data : null; } catch (e) { arr = null; }
    if (!arr || !arr.length) { setStatus('多角色：请在【选角页】点「读取角色」（游戏内读不到角色列表）'); return 0; }
    const old = Array.isArray(cfg.mcChars) ? cfg.mcChars : [];
    const byId = {};
    /* 重复 id（历史脏数据）：优先保留「有位置配置」的那条 */
    const cfgScore = function (o) { return (o.gatherMap ? 2 : 0) + ((o.nodeX > 0 && o.nodeY > 0) ? 1 : 0) + (o.serviceTown ? 1 : 0); };
    old.forEach(function (x) {
      if (!x || !x.id) return;
      const k = String(x.id), prev = byId[k];
      if (!prev || cfgScore(x) > cfgScore(prev)) byId[k] = x;
    });
    const mainId = (mcMain() || {}).id || null;
    const next = [], seen = {};
    let added = 0, renamed = 0;
    arr.forEach(function (c) {
      if (!c || !c.id) return;
      const k = String(c.id);
      if (seen[k]) return;                       /* 去重 */
      seen[k] = 1;
      const name = c.name || ('#' + c.id);
      let e = byId[k];
      if (e) { if (e.name !== name) { e.name = name; renamed++; } }
      else { e = { id: +c.id, name: name, role: 'alt', enabled: true, gatherMap: '', nodeX: 0, nodeY: 0, res: '', profession: '', serviceTown: '', repairOn: false, depositOn: false }; added++; }
      next.push(e);
    });
    const dropped = old.filter(function (x) { return x && x.id && !seen[String(x.id)]; }).length;
    /* 主角色：原来那个还在就保留；否则第一个当主 */
    next.forEach(function (x) { x.role = (mainId && String(x.id) === String(mainId)) ? 'main' : 'alt'; });
    if (!next.some(function (x) { return x.role === 'main'; }) && next.length) next[0].role = 'main';
    next.forEach(function (x) { if (x.role === 'main') x.enabled = true; });
    cfg.mcChars = next;
    /* 轮转记录里被删角色的残留也清掉 */
    if (rot) {
      if (rot.idle) Object.keys(rot.idle).forEach(function (k) { if (!seen[k]) delete rot.idle[k]; });
      if (rot.fail) Object.keys(rot.fail).forEach(function (k) { if (!seen[k]) delete rot.fail[k]; });
      if (rot.mainId && !seen[String(rot.mainId)]) rot.mainId = (next[0] || {}).id || null;
    }
    saveCfg(); mcSaveRot(); mcRender();
    setStatus('多角色：已按实际重置为 ' + next.length + ' 个角色（新增 ' + added + ' · 改名 ' + renamed + ' · 删除 ' + dropped + '）');
    return added;
  }

  /* ★ 用「当前位置」填充某一行的挂机地图 / 采集点 / 城镇 —— 只填位置，绝不改 id / 名字 */
  function mcFillCurrent(id) {
    const c = cfg.mcChars.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!inGame()) { setStatus('多角色：请先进入游戏再点「◎」'); return; }
    const curId = character.id, curName = character.char_name || ('#' + curId);
    let tgt = c;
    /* ★ 位置只属于当前角色：点的行不是当前角色就拒绝（避免把 A 的位置写进 B） */
    if (tgt && tgt.id && String(tgt.id) !== String(curId)) {
      setStatus('多角色：当前是 #' + curId + '（' + curName + '），但这一行是 #' + tgt.id + ' —— 请切到该角色后再填位置');
      return;
    }
    if (!tgt) {
      tgt = { id: curId, name: curName, role: 'alt', enabled: true, gatherMap: '', nodeX: 0, nodeY: 0, res: '', profession: '', serviceTown: '', repairOn: false, depositOn: false };
      if (!mcMain()) tgt.role = 'main';   /* 新建且还没有主角色时才自动当主 */
      cfg.mcChars.push(tgt);
    } else if (!tgt.id) { tgt.id = curId; tgt.name = tgt.name || curName; }
    /* ★ 只写位置字段：id / name / role / enabled / 维修存仓开关 都不动 */
    tgt.gatherMap = String(character.current_map);
    const spot = nearestGatherTile();
    if (spot) { tgt.nodeX = spot.x; tgt.nodeY = spot.y; tgt.res = spot.name || tgt.res; tgt.profession = spot.prof || tgt.profession; }
    saveCfg(); mcRender();
    setStatus('多角色：已把当前位置填给「' + tgt.name + '」' + (spot ? '（图 ' + tgt.gatherMap + ' · 采集点 ' + spot.x + '-' + spot.y + (spot.name ? ' · ' + spot.name : '') + '）' : '（本图没找到采集点）'));
  }
  function nearestGatherTile() {
    if (!inGame()) return null;
    let best = null, bd = Infinity;
    $$q('.map_table .tile_poi[action="gathering"]').forEach(function (el) {
      const p = (el.getAttribute('coords') || '').split('-');
      const x = +p[0], y = +p[1];
      if (!(x > 0 && y > 0)) return;
      const d = manhattan(character.x, character.y, x, y);
      if (d < bd) { bd = d; best = { x: x, y: y, name: el.getAttribute('name') || '', prof: gatherProfOf(el.getAttribute('data-poi') || el.getAttribute('name') || '') }; }
    });
    return best;
  }
  /* ★ v2.6.19：传入 data-poi（poi_xx）或采集点名字都行；poi 走游戏映射，名字只作兜底。 */
  function gatherProfOf(v) {
    const s0 = String(v || '').trim();
    if (!s0) return '';
    if (/^poi_\d+$/.test(s0)) return POI_PROF[s0] || '';   /* DOM：游戏内部 poi id */
    const n = s0.toLowerCase();
    if (/fish|minnow|pier/.test(n)) return 'fishing';
    if (/quarry|slate|fieldstone|stone/.test(n)) return 'quarrying';
    if (/mine|ore|copper|iron|tin|coal/.test(n)) return 'mining';
    if (/chop|log|grove|wood/.test(n)) return 'chopping';
    if (/farm|plant|soil|field|silk|cotton|jute|nettle/.test(n)) return 'farming';   /* ★ v2.6.19：Silk/Cotton/Jute/Nettle Field */
    if (/forag|mushroom|patch|nest/.test(n)) return 'foraging';
    return '';
  }

  /* 开启/关闭多角色轮转 */
  function mcSetOn(on) {
    mcSeq++;
    cfg.multiChar = !!on;
    if (!rot) mcLoadRot();
    rot.on = !!on;
    if (!on) rot.paused = false;          /* ★ v2.6.79：关掉多角色时一并清掉暂停态 */
    if (on) {
      const main = mcMain();
      rot.mainId = main ? main.id : (inGame() ? character.id : rot.mainId);
      if (inGame()) {
        const me = cfg.mcChars.filter(function (x) { return String(x.id) === String(character.id); })[0];
        if (!me) { cfg.mcChars.push({ id: character.id, name: character.char_name || ('#' + character.id), role: mcMain() ? 'alt' : 'main', enabled: true, gatherMap: String(character.current_map), nodeX: 0, nodeY: 0, profession: '', serviceTown: '', repairOn: false, depositOn: false }); }
      }
    }
    saveCfg(); mcSaveRot(); syncUI(); mcRender();
    if (on) mcValidateAll();
    setStatus(on ? '多角色离线：已开启' : '多角色离线：已关闭');
  }
  /* ★ v2.6.22：改主 / 副角色 —— 必须同步重置轮转状态。
     之前只改了 cfg.mcChars 的 role，rot.mainId / rot.idle / rot.tripAlt / st.mcBusy 全是旧的 →
     「刚改成主角色」的角色还在跑副角色的行程（用户反馈：一直乱跑）。 */
  function mcSetRole(c, role) {
    if (!c) return;
    mcSeq++;
    if (!rot) mcLoadRot();
    const toMain = (role === 'main');
    const changed = ((c.role === 'main') !== toMain);
    c.role = toMain ? 'main' : 'alt';
    if (toMain) {
      c.enabled = true;
      cfg.mcChars.forEach(function (x) { if (String(x.id) !== String(c.id)) x.role = 'alt'; });
      rot.mainId = c.id;
      /* 新主角色不该再背副角色的 idle 记录 / 行程 */
      delete rot.idle[c.id]; delete rot.fail[c.id];
      if (String(rot.tripAlt) === String(c.id)) { rot.tripAlt = null; rot.phase = 'MAIN'; rot.step = null; rot.firstStart = false; }
      st.mcBusy = false; st.altTrip = false;
    } else {
      if (String(rot.mainId) === String(c.id)) rot.mainId = (mcMain() || {}).id || null;
      delete rot.idle[c.id]; delete rot.fail[c.id];
    }
    saveCfg(); mcSaveRot(); mcRender();
    if (changed) logEvent('多角色：把「' + (c.name || ('#' + c.id)) + '」设为' + (toMain ? '主角色' : '副角色') + '（已重置轮转状态）');
  }
  /* 启动全部（清空 idle 记录 → 主角色控制器会把每个副角色依次启动） */
  function mcStartAll() {
    mcSeq++;
    if (!rot) mcLoadRot();
    rot.idle = {}; rot.fail = {}; rot.phase = 'MAIN'; rot.tripAlt = null; rot.step = null; rot.switching = null; rot.rotWaitUntil = 0;
    rot.on = true; rot.paused = false; cfg.multiChar = true;
    saveCfg(); mcSaveRot(); syncUI(); mcRender();
    mcValidateAll();
    setStatus('多角色：开始逐个启动副角色 idle…');
  }
  /* ★ v2.6.79：「启动全部 / 停止」合并成一个按钮 —— 按当前状态切换文案与动作 */
  function mcToggle() {
    if (!rot) mcLoadRot();
    if (rot.on) mcStopAll(); else mcStartAll();
  }
  /* ★ v2.6.79：暂停 / 继续。
     和「停止」的区别：停止 = 关掉多角色（cfg.multiChar=false）并切回主角色；
     暂停 = 保留多角色的一切状态（队列、idle 记录、主角色挂机标记），只是不再切号、不再跑副角色行程。
     暂停时若人在副角色页，先切回主角色 —— 否则那个副角色页会按普通挂机逻辑自己乱跑。 */
  function mcTogglePause() {
    mcSeq++;
    if (!rot) mcLoadRot();
    rot.paused = !rot.paused;
    mcSaveRot();
    if (rot.paused) {
      const main = mcMain();
      logEvent('多角色：已暂停轮转（保留队列与记录，主角色照常挂机）');
      setStatus('多角色：已暂停（主角色照常挂机；点「继续」恢复轮转）');
      if (main && inGame() && String(character.id) !== String(main.id)) mcSwitch(main.id);
    } else {
      logEvent('多角色：已继续轮转');
      setStatus('多角色：已继续轮转');
    }
    syncUI(); mcRender();
  }
  /* 同步两个按钮的文案 / 状态（syncUI 会调） */
  function syncMcBtns() {
    const on = !!(rot && rot.on);
    const paused = !!(rot && rot.paused);
    const tg = document.getElementById('nr-mc-toggle');
    if (tg) {
      tg.textContent = on ? '■ 停止' : '▶ 启动全部';
      tg.title = on
        ? '停止轮转并切回主角色。'
        : '清空轮转记录，逐个启动副角色离线采集。';
      tg.classList.toggle('on', on);
    }
    const ps = document.getElementById('nr-mc-pause');
    if (ps) {
      ps.textContent = paused ? '▶ 继续' : '⏸ 暂停';
      ps.title = paused
        ? '按原队列继续轮转。'
        : '保留队列并暂停切号；主角色照常挂机。';
      ps.classList.toggle('on', paused);
      ps.disabled = !on;
    }
    const hint = document.getElementById('nr-mc-hint');
    if (hint) {
      if (paused) { hint.textContent = '⏸ 轮转已暂停：不再切号 / 跑副角色行程，主角色照常挂机。点「▶ 继续」恢复。'; hint.style.color = '#ffd76e'; }
      else if (on) { hint.textContent = '轮转进行中：副角色 idle 到期会自动切号 → 维修 / 存仓 → 重启 idle → 切回主角色。'; hint.style.color = '#7ee081'; }
      else { hint.textContent = ''; }
    }
  }
  /* ★ 停止：关闭轮转；若当前在副角色页 → 切回主角色。
     ★ v2.6.152：不再替主角色写「续挂标记」—— 主角色的挂机完全由挂机模块自己管理。 */
  function mcStopAll() {
    mcSeq++;
    if (!rot) mcLoadRot();
    const main = mcMain();
    rot.on = false; rot.paused = false; rot.phase = 'MAIN'; rot.tripAlt = null; rot.step = null; rot.switching = null; rot.rotWaitUntil = 0;
    cfg.multiChar = false;
    saveCfg(); mcSaveRot(); syncUI(); mcRender();
    logEvent('多角色离线：已停止' + (main ? '，切回主角色「' + main.name + '」' : ''));
    setStatus('多角色离线：已停止');
    if (main && inGame() && String(character.id) !== String(main.id)) mcSwitch(main.id);
  }

  /* ======================= 15. 主循环 ======================= */

  function tick() {
    if (!running) return;
    /* ★ 心跳刷新运行标记：原来只在开始挂机时写一次时间戳，
       一旦挂机超过 RUN_TTL(10 分钟) 后页面被刷新/被浏览器回收，续挂判定会因「太旧」而放弃。
       这里每 20 秒刷新一次，让「断线续挂」按最后活动时间算。 */
    if (now() - st.runMarkAt > 20000) { st.runMarkAt = now(); markRunning(st.mode); saveDetStats(); }
    try { step(); } catch (e) { setStatus('出错：' + e.message); }
  }

  function step() {
    if (!inGame()) { setStatus('等待进入游戏…'); return; }

    const dead = !!document.getElementById('battle_defeat');
    if (dead && st.mode === 'tower' && cfg.towerStopDeath) { stop('爬塔：角色阵亡，按设置停止'); return; }
    if (dead && cfg.autoRespawn) { handleDefeat(); return; }
    if (!dead && defeatAt) {
      resetDefeat(); logEvent('已复活，继续挂机'); setStatus('已复活，继续挂机');
      /* ★ v2.6.119：死亡后登记「待办目的地 = 挂机图」→ 没到之前不开始任务，中途被带偏会自动重规划 */
      if (cfg.farmMap) navSetPending(cfg.farmMap, '阵亡复活');
      // ★ 复活后若不在挂机地图，延迟几秒（等游戏刷新位置）再自动导航回去
      if (cfg.farmMap) setTimeout(() => {
        if (running && !st.returning && String(character.current_map) !== String(cfg.farmMap)) returnToFarm();
      }, 4000);
    }
    if (dead) { stop('角色已阵亡，已停止挂机（请手动复活后重新开始）'); return; }

    // ★ 阵亡复活后正在导航回挂机地图：主循环让路
    if (st.returning) { setStatus('正在导航回挂机地图…'); return; }

    // ★ 多角色轮转：副角色行程进行中 → 主循环让路；否则主角色盯队列 + 正常挂机
    if (st.mcBusy) { setStatus(st.statusText); return; }
    if (cfg.multiChar && rot && rot.on && mcTick()) return;

    /* ── 兜底[回图] ───────────────────────────────────────────────
     * 症状：复活后只试一次太脆（传送站/网络抖一下、或那次导航失败，就永远回不去）。
     * 判据：还在重生泉水、挂机地图不是泉水、没在维修/清包/切图/导航。
     * 动作：returnToFarm()（内部 navToMap 显式允许传送出来）。
     * 上限：不停止；连续失败按 30s→60s→120s→240s→300s 退避（st.returnFails）。
     * 高级参数：不受影响。
     * ─────────────────────────────────────────────────────────── */
    /* ★ v2.6.119：回图不再在这里写死 —— 统一由 nav 模块的「待办目的地」负责（见 navPendingTick）。
       死亡时 navSetPending(挂机图)，没到之前不开始任务，中途被带偏会自动重规划。 */

    // ★ 兜底[切图卡住]：加载页卡住时接管本 tick（别在加载页上走位/交互）
    if (checkMapLoad()) return;
    // ★ 兜底[换图没重画]：服务端换图了但客户端没重画 → 调游戏 loadTravel() 重画（不刷新网页）
    if (checkMapRender()) return;
    // ★ 兜底[怪物列表过期]：定期强制拉一次实体列表（人多抢怪时，画面上的怪可能已经被别人杀了）
    checkEntityFresh();
    // ★ 卡死强恢复进行中：主循环短暂让路，避免和「点格」抢发 walkTo
    if (st.nudging && now() - st.nudging < 2600) { setStatus('卡住自愈：正在试探走位…'); return; }
    // ★ 兜底[落位]进行中：主循环让路，避免和 settleAtSpot 抢发 walkTo
    if (st.settling && now() - st.settling < 40000) { setStatus('落位：正在同步服务端位置…'); return; }

    verifyPotion();

    /* ★ v2.6.117：没吃的 / 没药了 → 暂停挂机（用户要求）。
       判据：需要补血/补蓝（低于阈值）但背包里已经没有可用的对应物品，且持续 >4s（防误判）。
       动作：stop()。补货后重新开始即可。 */
    if (cfg.pauseNoSupply && cfg.bagScanned) {
      if (suppliesEmpty()) {
        if (!st.noSupplyAt) st.noSupplyAt = now();
        else if (now() - st.noSupplyAt > 4000) { stop('没吃的了：补血/补蓝物品已用完，已暂停挂机'); return; }
      } else st.noSupplyAt = 0;
    } else st.noSupplyAt = 0;

    if (now() - st.lastStats > 1200) {
      st.lastStats = now();
      updatePerf();
      if (cfg.questMonsters && now() - _questCache.at > rhythm(QUEST_TTL)) refreshQuestTargets().then(() => { updateStats(); renderRankList(); }).catch(() => {});
      updateStats();
      refreshCurMap();
      syncRunButtons();
      if (now() - st.visitedAt > 8000) { st.visitedAt = now(); recordVisit(); }   // ★ 记录拜访过的地图/城镇
      pollBagGain();                                                             // ★ 定期读背包，统计「获得」
    }

    // 战利品窗口放在最前面且战斗中也不跳过（塔里进层的掉落曾因「战斗中先 return」被清掉）
    if (hasFrame('frame_Loot')) takeAllLoot();
    if (eventCombatActive() || !(st.mode === 'gather' && cfg.gatherFlee)) ensureAutoBattle();   // ★ 新前端：确保游戏自动战斗处于开启状态（只采集+遇怪逃跑时不接管；活动战斗区强制开）

    // 维修 / 清包流程进行中：由 runRepair / runSell 接管
    if (st.repair.active || st.sell.active) { supply(); return; }

    if (st.map !== character.current_map) {
      const from = st.map;
      st.map = character.current_map;
      st.blacklist = {}; st.roundKills = 0; st.move = null; st.reach = null;
      detectGatherPoints(true);
      renderRankList();
      if (from != null) { logEvent('换图 → ' + currentMapName()); st.watch.at = now(); }
      /* ★ v2.6.111：换图后立刻核对「客户端到底画没画新图」，没画就调游戏 loadTravel() 重画 */
      scheduleRenderCheck(from, character.current_map);
      recordVisit();
      /* ★ 到图即刷新：换图瞬间 DOM 还没渲染完，快照守卫会拒绝；2.5 秒后再实测一次 */
      try { poiLearnNow(); } catch (e) { /* ignore */ }
      setTimeout(function () { try { poiLearnNow(); } catch (e) { /* ignore */ } }, 2500);
    }
    gatherPointsTick();   /* ★ 换图瞬间 .map_table 可能还没渲染完 → 下拉被清空，这里补一次 */

    if (st.mapSwitch.active || navBusy) { setStatus(st.statusText); return; }

    sweepStrayFrames();   /* ★ 意外弹窗（踩到 NPC / 服务格）自动关掉，避免卡住 */
    closeIdleResultDialog();  /* ★ 离线模式结算弹窗（Idle Mode Results）随时点掉 */

    checkFrozen();
    checkStuck();
    // ★ 刚触发强恢复：本 tick 到此为止，别和「点格」抢发 walkTo
    if (st.nudging && now() - st.nudging < 2600) { setStatus('卡住自愈：正在试探走位…'); return; }
    if (st.settling && now() - st.settling < 40000) { setStatus('落位：正在同步服务端位置…'); return; }

    /* ★ 战斗中不计入走位超时（2026-09-21 实测根因）：
       三个模式都是「先判 frame_Combat 就 return」，checkMove() 排在后面 →
       整场战斗期间 checkMove() 根本不会被调用，st.move 带着战斗前的 at 活过战斗。
       战斗结束后 checkMove() 第一次运行，now() - m.at 已经把「走位时间 + 战斗时间」
       一起算进 cfg.moveTimeout（默认 15 秒）→ 走超时分支 → 把「本来要去找的那一格」
       黑名单 30 秒。表现就是「寻敌途中打了一架，打完脚本就当目标已经没了」。
       这里让战斗时间不计入超时预算（一行覆盖 auto / battle / gather 三个模式）。 */
    if (hasFrame('frame_Combat') && st.move) st.move.at = now();

    /* ★ 活动自动进入：战斗 / 采集 / 爬塔 都生效。进入 / 返回期间接管本 tick；
       在活动图里 → 强制走采集逻辑（无论当前任务是什么），出来后再继续原任务。 */
    /* ★ v2.6.135：Overlord（世界 Boss）自动参战 */
    if (ovlTick()) return;
    if (eventTick()) return;
    /* ★ v2.6.119：导航「待办目的地」—— 没到目的地就不开始任务，中途偏离会自动重规划 */
    if (navPendingTick()) return;
    /* ★ v2.6.160：兜底[回图] —— 采集 / 一键挂机 / 战斗 期间被「非阵亡」原因带离挂机地图 → 自动回图 */
    if (homeGuardTick()) return;
    /* ★ v2.6.101：活动战斗区里 → 不管当前任务是什么，都走下面的战斗逻辑 */
    if (eventCombatActive()) {
      ensureAutoBattle();
    } else {
      if (cfg.autoEvent && st.event && st.event.on && String(character.current_map) === String(EVENT_MAP_ID)) { stepGather(); return; }
      if (st.mode === 'gather') { stepGather(); return; }
      if (st.mode === 'auto') { stepAuto(); return; }
      if (st.mode === 'tower') { stepTower(); return; }
    }

    if (hasFrame('frame_Combat')) {
      noteCombat();
      setStatus('战斗中…（游戏自动战斗）');
      return;
    }

    if (handleFrames()) return;
    const healing = supply();
    if (retargetCombat.tick()) return;   /* ★ 途中持续索敌：更优目标立刻切换 */
    if (checkMove()) return;

    // 游戏自身正在移动（如战斗结束后自动续走原目标）→ 等它走完，避免抢发指令
    try {
      if (character.walk_to && walkQueue[character.id] && walkQueue[character.id].length) {
        st.phase = 'move';
        setStatus('移动中… → ' + character.walk_to);
        return;
      }
    } catch (e) { /* ignore */ }
    if (pollSmithTrip()) return;
    /* ★ 补到阈值再开始下一个寻敌（否则战斗间隙只吃一瓶就走） */
    if (healing) { setStatus('回血中…（补到阈值后再继续寻敌）'); return; }

    const t = pickTarget();
    if (!t) {
      st.phase = 'idle';
      st.target = null;
      const nl = monsterList().length;
      const stuck = unreachableEnemies();
      const _dg = targetDiagText(targetDiag());
      setStatus((nl
        ? ('本图没有名单内的怪物（名单 ' + nl + ' 项），等待刷新…')
        : (stuck ? ('本图可到达的怪物已清完（另有 ' + stuck + ' 只被门/障碍挡住），等待刷新…')
                 : '本图已清完，等待怪物刷新…')) + _dg);
      autoMapSwitchMaybe();
      return;
    }
    st.mapSwitch.idleSince = 0;
    if (t.skip) return;

    st.target = t.enemy || null;
    startMove(t.x, t.y, t.kind, t.label);
  }

  /* 一次扫描同时喂饱「统计行」「星级计数」，避免每 1.2 秒把 DOM 扫三遍 */
  function updateStats() {
    const list = inGame() ? scanEnemies() : [];
    applyRankCounts(rankCounts(list));
    const el = document.getElementById('nr-stats');
    if (!el) return;
    const atk = inGame() ? attackableFrom(list) : [];
    const res = inGame() ? scanResources().length : 0;
    const rows = [];
    rows.push('击杀 <b>' + st.roundKills + '</b> · 累计 <b>' + st.kills + '</b> · 采集 <b>' + st.gathers + '</b>' +
              ((running || st.paused) && st.runStart ? ' · 已挂 <b>' + fmtDur(runElapsedMs()) + '</b>' : ''));
    rows.push('本图怪物 <b>' + atk.length + '</b>/' + list.length + ' 可打 · 资源点 <b>' + res + '</b>');
    if (cfg.farmMap || cfg.farmMapLocked) {
      const off = inGame() && cfg.farmMap && String(character.current_map) !== String(cfg.farmMap);
      const lockTag = cfg.farmMapLocked ? ' <span style="color:#ffc061">🔒 已锁定</span>' : ' <span style="color:#7f8ea6">🔓 未锁定</span>';
      rows.push('挂机地图 <b>' + (cfg.farmMap ? townName(cfg.farmMap) : '（未记录）') + '</b>' + (cfg.farmMap ? ' <span style="color:#7f8ea6">#' + cfg.farmMap + '</span>' : '') + lockTag + (off ? ' <span style="color:#ffc061">（当前不在该图）</span>' : ''));
    }
    const perf = perfText();
    if (perf) {
      const span = perfSpanMin();
      rows.push('效率 <b>' + perf + '</b>' + (span >= 0.5 ? ' <span style="color:#7f8ea6">（近 ' + span.toFixed(1) + ' 分）</span>' : ''));
    }
    const cr = coinRatePerMin();
    if (cr > 0) rows.push('金币 <b>' + fmtCoin(cr) + '/分</b>');
    if (inGame() && character.max_exp) {
      const mins = minutesToLevel();
      rows.push('经验 <b>' + character.current_exp + '</b>/' + character.max_exp +
                ' · 预计 <b>' + (mins == null ? '—' : (mins < 1 ? '<1' : Math.round(mins))) + '</b> 分钟升级');
    }
    if (st.sell.cap) rows.push('背包剩余 <b>' + st.sell.free + '</b> / ' + st.sell.cap + ' 格');
    if (st.pet.max) rows.push('宠物 Lv.' + st.pet.level + ' · <b>' + st.pet.energy + '</b>/' + st.pet.max + ' · T' + st.pet.tier + ' ×' + st.pet.food);
    else if (cfg.petFeedOn) rows.push('宠物 <b>未装备</b>（自动喂宠已开）');
    el.innerHTML = rows.join('<br>');
    applyHighlightSelf();
    updateHeader();
  }

  /* 把星级计数写进星级列表（原先由 updateRankCounts 单独扫一遍 DOM） */
  function applyRankCounts(counts) {
    const box = document.getElementById('nr-ranklist');
    if (!box) return;
    box.querySelectorAll('.rank').forEach(row => {
      const cb = row.querySelector('input.chk');
      if (!cb) return;
      const c = row.querySelector('.cnt');
      if (c) c.textContent = (counts[cb.dataset.rank] || 0) + ' 只';
    });
  }

  function rankCounts(list) {
    const counts = {};
    (list || scanEnemies()).forEach(e => { counts[e.rank] = (counts[e.rank] || 0) + 1; });
    return counts;
  }

  /* ======================= 16. 界面 ======================= */
  /* 风格与「动画加速器」保持一致：暗色、紧凑、pointer 拖动、窗口缩放自动钳制不飘 */

  const CSS = `
  #nr-panel{--nr-line:#2f3444;--nr-line2:#3c4356;--nr-muted:#8e93a6;--nr-text:#e7e9f0;
    --nr-accent:#4a9eff;--nr-ok:#35c46a;--nr-warn:#ffc061;--nr-danger:#e05555;
    position:fixed;z-index:2147483100;width:512px;font:12px/1.5 "Segoe UI",system-ui,"Microsoft YaHei",sans-serif;
    color:var(--nr-text);background:linear-gradient(180deg,#1e212a,#13151b);
    border:1px solid #343846;border-radius:12px;
    box-shadow:0 16px 44px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.045);
    user-select:none;overflow:hidden}
  #nr-panel.min{width:auto}
  #nr-head{display:flex;align-items:center;gap:7px;padding:8px 10px;cursor:move;
    background:linear-gradient(180deg,#2d3242,#21242e);border-bottom:1px solid #343846;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
  #nr-head .t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:700;white-space:nowrap;font-size:12px;letter-spacing:.2px;color:#f2f4fa;
    text-shadow:0 1px 2px rgba(0,0,0,.5)}
  #nr-head .ver{font-size:9.5px;color:#7f869a;background:#1b1f29;border:1px solid #2f3444;
    border-radius:20px;padding:1px 6px;flex:none;letter-spacing:.3px;cursor:pointer}
  /* ★ v2.6.77：发现新版本时版本号角标变金色并可点（点开安装页） */
  #nr-head .ver.upd{color:#ffd76e;background:#3a2f14;border-color:#7a6320;
    box-shadow:0 0 6px rgba(255,215,110,.45)}
  #nr-head .hsel{flex:none;background:#1b1f29;color:#c9d0e0;border:1px solid #2f3444;border-radius:6px;
    font-size:10px;padding:1px 2px;outline:none;cursor:pointer;max-width:66px}
  #nr-head .hbtn.on{background:#3d5170;border-color:#4d6a8f}
  #nr-head .dot{width:8px;height:8px;border-radius:50%;background:#5a6070;flex:none;
    box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);transition:background .2s,box-shadow .2s}
  #nr-head .dot.on{background:radial-gradient(circle at 35% 35%,#7ef0a4,#2ea44f);
    box-shadow:0 0 8px rgba(62,196,111,.85),inset 0 0 0 1px rgba(0,0,0,.2)}
  #nr-head .dot.err{background:radial-gradient(circle at 35% 35%,#ff8a8a,#c33);box-shadow:0 0 8px rgba(224,85,85,.8)}
  #nr-head .fold{display:inline-block;cursor:pointer;padding:0 6px;opacity:.8;font-size:22px;line-height:1;transition:opacity .15s,transform .15s}
  #nr-head .fold:hover{opacity:1}
  /* ★ 折叠态（#nr-panel.min）：标题/版本收起，改显示「当前动作 + 运行时间 + 迷你开始/暂停」，
     这样不展开面板也能看到在干什么、并直接暂停/继续。 */
  #nr-head .act,#nr-head .rt,#nr-head .hbtn{display:none}
  #nr-head .act{flex:1 1 auto;min-width:0;font-size:11.5px;font-weight:600;color:#cfd6e6;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.2px}
  #nr-head .rt{flex:none;box-sizing:border-box;width:62px;text-align:center;font-size:12.5px;
    font-weight:600;font-variant-numeric:tabular-nums;color:#9fd0ff;background:none;border:0;
    text-shadow:0 1px 2px rgba(0,0,0,.5)}
  /* 与面板其它次级按钮同一套中性灰（#nr-panel button），不用红/绿色块抢眼；
     图标用内联 SVG，几何中心就是按钮中心，不会像字符那样受字体行高/基线影响 */
  #nr-panel #nr-head .hbtn{flex:none;align-items:center;justify-content:center;
    box-sizing:border-box;width:24px;height:24px;padding:0;margin:0;border-radius:8px;
    font-family:inherit;line-height:1;cursor:pointer;color:#cdd3e2;
    background:linear-gradient(180deg,#2b3140,#232734);border:1px solid #3a4152;
    transition:background .15s,color .15s,border-color .15s,transform .06s}
  #nr-panel #nr-head .hbtn:hover{background:linear-gradient(180deg,#353c4e,#2a3040);color:#fff;border-color:#4a5368}
  #nr-panel #nr-head .hbtn:active{transform:translateY(1px)}
  #nr-panel #nr-head .hbtn.run{color:#ffc061}
  #nr-panel #nr-head .hbtn.run:hover{color:#ffd76e}
  #nr-panel #nr-head .hbtn svg{display:block;width:12px;height:12px;fill:currentColor;pointer-events:none}
  #nr-panel.min{width:300px;max-width:none}
  #nr-panel.min #nr-head{padding:6px 9px}
  #nr-panel.min #nr-head .t,#nr-panel.min #nr-head .ver,#nr-panel.min #nr-head .seg{display:none}
  #nr-panel.min #nr-head .act{display:block}
  #nr-panel.min #nr-head .rt{display:inline-block}
  #nr-panel.min #nr-head .hbtn{display:inline-flex}
  #nr-panel.min #nr-head .fold{display:inline-block}
  /* ★ v2.6.1：原版/工作台 + 版本号 + 折叠按钮 都移到标题栏右端（底部栏已删除） */
  #nr-head .seg{display:inline-flex;flex:none;border:1px solid #2f3444;border-radius:8px;overflow:hidden}
  #nr-head .seg>button{border:0;border-radius:0;padding:3px 7px;font-size:10px;background:#1b1f29;color:#98a0b4}
  #nr-head .seg>button:hover{background:#2b3140;color:#dfe4f0}
  #nr-head .seg>button.on{background:linear-gradient(180deg,#3f83dd,#2f66b8);color:#fff;font-weight:700}
  /* 左右两栏：左边设置，右边信息面板（状态 / 统计 / 日志）。折叠时整块 #nr-body 隐藏，右侧栏一并收起 */
  #nr-body{display:flex;gap:11px;padding:10px;max-height:calc(100vh - 48px);overflow-y:auto;overflow-x:hidden}
  #nr-main{flex:1 1 auto;min-width:0}
  #nr-side{flex:0 0 202px;min-width:0;border-left:1px solid #2b3040;padding-left:11px;
    display:flex;flex-direction:column;gap:0}
  #nr-panel.min #nr-body{display:none}
  #nr-tabs{display:flex;flex-wrap:nowrap;gap:3px;margin-bottom:10px}
  #nr-tabs .tab{flex:1 1 0;min-width:0;text-align:center;padding:5px 2px;white-space:nowrap;border-radius:8px;background:#232734;color:#98a0b4;
    cursor:pointer;font-size:11px;border:1px solid #2f3444;transition:background .15s,color .15s,border-color .15s,box-shadow .15s}
  #nr-tabs .tab:hover{background:#2b3140;color:#dfe4f0;border-color:#3c4356}
  #nr-tabs .tab.on{background:linear-gradient(180deg,#3f83dd,#2f66b8);border-color:#4f90e6;color:#fff;font-weight:700;
    box-shadow:0 2px 10px rgba(63,131,221,.35)}
  .pane{display:none}
  .pane.on{display:block}
  .row{display:flex;align-items:center;gap:7px;margin-bottom:6px}
  .row>label{flex:1;color:#b9b9c4;font-size:11.5px;line-height:1.35}
  .lbl{display:block;color:#8b8b96;font-size:10.5px;margin:8px 0 4px}
  #nr-panel input[type=text],#nr-panel input[type=number],#nr-panel select,#nr-panel textarea{
    width:100%;box-sizing:border-box;padding:5px 8px;background:#1a1d26;border:1px solid #363c4d;border-radius:8px;
    color:var(--nr-text);font-size:11.5px;font-family:inherit;outline:none;
    transition:border-color .15s,box-shadow .15s,background .15s}
  #nr-panel input[type=text]:hover,#nr-panel input[type=number]:hover,#nr-panel select:hover,#nr-panel textarea:hover{border-color:#434a5e}
  /* 游戏自带样式会把 textarea 撑高（rows=1 实测 100px），这里强制压回一行，仍可纵向拖大 */
  #nr-panel textarea{resize:vertical;line-height:1.5;height:auto;min-height:26px;max-height:220px;overflow-y:auto}
  #nr-panel input:focus,#nr-panel select:focus,#nr-panel textarea:focus{border-color:var(--nr-accent);
    box-shadow:0 0 0 3px rgba(74,158,255,.16);background:#1d2130}
  #nr-panel input[readonly]{background:#15181f;color:#7f869a}
  #nr-panel input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:4px;
    background:linear-gradient(90deg,#3a4152,#2b3040);outline:none;padding:0;border:none;cursor:pointer}
  #nr-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;
    background:radial-gradient(circle at 35% 30%,#7ab6ff,#2f7fe0);border:2px solid rgba(255,255,255,.18);
    cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.45)}
  .kv{display:flex;justify-content:space-between;font-size:10.5px;color:#8b8b96;margin-top:5px}
  .nr-prev{display:flex;align-items:center;gap:6px;font-size:10.5px;color:#8fa3bd;margin:2px 0 6px;min-height:18px}
  .nr-prev img{width:18px;height:18px;flex:none;image-rendering:pixelated;border-radius:3px}
  .nr-prev .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nr-prev .ct{flex:none;color:#ffd76e;font-weight:600}
  .kv b{color:#7ee081;font-weight:600;font-variant-numeric:tabular-nums}
  .note{margin-top:7px;font-size:10px;color:#6b6b78;line-height:1.55}
  #nr-panel select option{background:#1d1d24;color:#e8e8ea}
  /* ★ 游戏自带样式里有 .half{width:50%}，会把这一行压成半宽；这里用 #nr-panel 提权并显式 width:100% */
  #nr-panel .half{display:flex;gap:6px;width:100%}
  #nr-panel .half>div{flex:1 1 0;min-width:0}
  /* 标签与输入框同一排（用于「清包触发格数 [ ] / 售卖等级≤ [ ]」） */
  #nr-panel .half>div.inline{display:flex;align-items:center;gap:6px;min-width:0}
  #nr-panel .half>div.inline>span{flex:none;white-space:nowrap;color:#8b8b96;font-size:10.5px}
  #nr-panel .half>div.inline>input{flex:1 1 0;width:auto;min-width:0}
  /* ★ 复选框：原来底色 #1d1d24 + 边 #55555f 跟面板底色几乎一样，深色下基本看不见。
     现在提亮底色/描边，并用 #nr-panel 提高优先级，防止被游戏自带样式覆盖。 */
  /* ★ 游戏自带 CSS 有 input[type=checkbox]{position:absolute;opacity:0;height:0}（它用自定义样式代替原生勾选框），
     不显式写 opacity 就会被盖成透明 → 面板勾选框全部看不见。这里强制恢复。 */
  #nr-panel input.chk{-webkit-appearance:none;appearance:none;box-sizing:border-box;flex:none;width:16px;height:16px;margin:0;
    background:#333a4b;border:1.5px solid #8b93a8;border-radius:5px;position:relative;cursor:pointer;opacity:1;
    transition:background .15s,border-color .15s,box-shadow .15s}
  #nr-panel input.chk:hover{border-color:#c3cbdd;background:#3d4557}
  #nr-panel input.chk:checked{background:linear-gradient(180deg,#3ec46f,#2a9c55);border-color:#4bd06f;
    box-shadow:0 0 8px rgba(62,196,111,.35)}
  #nr-panel input.chk:checked::after{content:"";position:absolute;left:5px;top:1.5px;width:4px;height:9px;
    border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
  #nr-panel input.chk:disabled{opacity:.45;cursor:not-allowed}
  .ranklist{border:1px solid #2f3444;border-radius:9px;padding:4px;max-height:138px;overflow:auto;background:#181b23}
  .rank{display:flex;align-items:center;gap:6px;padding:3px 6px;font-size:11px;border-radius:7px;cursor:pointer;
    transition:background .12s,box-shadow .12s}
  .rank:hover{background:#232734}
  /* ★ 选中态：整行加背景色，一眼能看出哪几个星级在打 */
  .rank.on{background:linear-gradient(90deg,rgba(53,196,106,.18),rgba(53,196,106,.05));
    box-shadow:inset 0 0 0 1px rgba(53,196,106,.38)}
  .rank.on:hover{background:linear-gradient(90deg,rgba(53,196,106,.26),rgba(53,196,106,.1))}
  .rank.off{opacity:.42}
  .rank .st{min-width:26px;color:var(--nr-warn);font-size:10px;letter-spacing:-1px}
  .rank .nm{flex:1;color:#cfcfd6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rank .cnt{color:#8b8b96;font-size:10px;min-width:30px;text-align:right}
  .rank .mv{cursor:pointer;color:#6b6b78;padding:0 2px;font-size:10px}
  .rank .mv:hover{color:#fff}
  .rank .mv.dis{opacity:.2;cursor:default}
  /* 紧凑选项网格：一行放两个，文字短、带边框，一眼看出是可点的开关 */
  .opts{display:flex;flex-wrap:wrap;gap:5px 6px;margin-top:7px}
  /* ★ 复选框脱离文档流贴左边，文字在整块里居中（原来复选框占位把文字挤到右边，看着不居中） */
  .opts>label{position:relative;display:flex;align-items:center;justify-content:center;flex:1 1 45%;min-width:0;font-size:11px;
    color:#c3c9d8;line-height:1.2;cursor:pointer;padding:5px 24px;border-radius:8px;background:#1e2230;border:1px solid #2f3444;
    box-sizing:border-box;text-align:center;transition:background .15s,border-color .15s,color .15s}
  #nr-panel .opts>label>input.chk{position:absolute;left:8px;top:50%;transform:translateY(-50%)}
  .opts>label:only-child{flex:1 1 100%}
  .opts>label:hover{background:#262c3c;border-color:#3c4356;color:#e7e9f0}
  .opts>label:has(input:checked){background:linear-gradient(180deg,rgba(53,196,106,.2),rgba(53,196,106,.07));
    border-color:rgba(53,196,106,.5);color:#dcf3e4}
  .btns{display:flex;gap:6px;margin-top:9px}
  #nr-panel button{cursor:pointer;border-radius:8px;font-size:11.5px;font-family:inherit;padding:7px 10px;
    background:linear-gradient(180deg,#2b3140,#232734);color:#cdd3e2;border:1px solid #3a4152;
    transition:background .15s,color .15s,border-color .15s,box-shadow .15s,transform .06s}
  #nr-panel button:hover{background:linear-gradient(180deg,#353c4e,#2a3040);color:#fff;border-color:#4a5368}
  #nr-panel button:active{transform:translateY(1px)}
  #nr-panel button:disabled{opacity:.38;cursor:not-allowed;transform:none;box-shadow:none}
  #nr-panel button.pri{flex:1;background:linear-gradient(180deg,#3ec46f,#2a9c55);border-color:#45d47c;color:#fff;font-weight:700;
    box-shadow:0 2px 12px rgba(62,196,111,.3)}
  #nr-panel button.pri:hover{background:linear-gradient(180deg,#4ad47c,#31ab5e)}
  #nr-panel button.pri:disabled{background:#25402f;border-color:#2c4a36}
  #nr-panel button.dan{flex:1;background:linear-gradient(180deg,#e05555,#b83b3b);border-color:#e56a6a;color:#fff;font-weight:700;
    box-shadow:0 2px 12px rgba(224,85,85,.25)}
  #nr-panel button.dan:hover{background:linear-gradient(180deg,#ea6565,#c44545)}
  #nr-panel button.dan:disabled{background:#3f2429;border-color:#4a2b31}
  #nr-panel button.mini{padding:5px 8px;font-size:10.5px}
  /* ★ v2.6.79：多角色的「启动全部/停止」「暂停/继续」是同一个按钮的两种状态，用 .on 标出当前生效的那个 */
  #nr-panel button.mini.on{background:linear-gradient(180deg,#3d5170,#31415a);border-color:#4d6a8f;color:#eaf1ff}
  #nr-panel button.mini[disabled]{opacity:.45;cursor:default}
  /* ★ v2.6.55：怪物名单标签可点（切优先名单 / 黑名单） */
  #nr-panel #nr-mobmode:hover{color:#dfe4f0}
  #nr-panel #nr-mobmode.nr-mobblack{color:#ff8a8a !important;border-bottom:1px dashed #e05555}
  /* ★ v2.6.54：挂机地图「锁定」按钮的选中态 */
  #nr-panel button.on{background:linear-gradient(180deg,#c9a227,#a8841a);border-color:#e0c46a;color:#fff;font-weight:700}
  #nr-panel button.on:hover{background:linear-gradient(180deg,#d8b134,#b8921f)}
  /* ★ v2.6.76：面板内确认弹窗（锁定地图替换询问） */
  .nr-ask{position:fixed;inset:0;z-index:2147483200;background:rgba(6,8,12,.55);display:flex;align-items:center;justify-content:center;font:12px/1.5 "Segoe UI",system-ui,"Microsoft YaHei",sans-serif}
  .nr-ask-box{width:300px;max-width:calc(100vw - 32px);background:linear-gradient(180deg,#1e212a,#13151b);border:1px solid #343846;border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.62);padding:14px 15px;color:#e7e9f0}
  .nr-ask-msg{font-size:12px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
  .nr-ask-btns{display:flex;gap:8px;margin-top:13px}
  .nr-ask-btns button{flex:1;cursor:pointer;border-radius:8px;font-size:11.5px;font-family:inherit;padding:7px 10px;background:linear-gradient(180deg,#2b3140,#232734);color:#cdd3e2;border:1px solid #3a4152}
  .nr-ask-btns button:hover{background:linear-gradient(180deg,#353c4e,#2a3040);color:#fff;border-color:#4a5368}
  .nr-ask-btns button.pri{background:linear-gradient(180deg,#3ec46f,#2a9c55);border-color:#45d47c;color:#fff;font-weight:700}
  .nr-ask-btns button.pri:hover{background:linear-gradient(180deg,#4ad47c,#31ab5e)}
  /* ★ v2.6.76：全局行「复选框 / 下拉框 / 迷你按钮」三者等高（对齐「遇敌逃跑 / 阵亡复活」） */
  #nr-panel #nr-common .opts>label,
  #nr-panel #nr-common .opts>select,
  #nr-panel #nr-common .opts>button{height:26px;box-sizing:border-box;padding-top:0;padding-bottom:0}
  #nr-panel #nr-common .opts>button{padding-left:6px;padding-right:6px}
  #nr-status{font-size:10.5px;color:#a6adc0;min-height:15px;word-break:break-all;line-height:1.55;
    padding:6px 8px;border-radius:8px;background:#181b23;border:1px solid #262b38}
  #nr-stats{margin-top:6px;font-size:10.5px;color:var(--nr-muted);line-height:1.75}
  #nr-stats b{color:#4ed07f;font-weight:700;font-variant-numeric:tabular-nums}
  .pathmsg{margin-top:5px;font-size:10.5px;color:#7ee081;min-height:12px;word-break:break-all}
  /* ★ 多角色列表：紧凑、统一字号（面板 #nr-main 只有 ~269px 宽） */
  #nr-panel #nr-mc-list{font-size:10.5px;line-height:1.35}
  /* ★ 多角色块标题：字体调小，与列表一致 */
  /* ★ 紧凑：块内边距与标签间距收窄（加速页 / 多角色块共用） */
  #nr-panel .divblock_dark{padding:5px 7px}
  /* ★ 挂机页：任务分段选择器 + 任务专属区块 */
  #nr-panel #nr-task{display:flex;border:1px solid #2f3444;border-radius:8px;overflow:hidden;margin-top:2px}
  #nr-panel #nr-task>button{flex:1 1 0;min-width:0;border:0;border-radius:0;padding:5px 6px;font-size:11px;background:#1b1f29;color:#98a0b4}
  #nr-panel #nr-task>button:hover{background:#2b3140;color:#dfe4f0}
  #nr-panel #nr-task>button.on{background:linear-gradient(180deg,#3f83dd,#2f66b8);color:#fff;font-weight:700}
  /* ★ v2.6.74：战斗索敌模式（优先任务 / 优先距离 / 全图列表）三选一，一排 */
  #nr-panel #nr-tmode{display:flex;border:1px solid #2f3444;border-radius:8px;overflow:hidden;margin-top:7px}
  #nr-panel #nr-tmode>button{flex:1 1 0;min-width:0;border:0;border-radius:0;padding:5px 6px;font-size:11px;background:#1b1f29;color:#98a0b4}
  #nr-panel #nr-tmode>button:hover{background:#2b3140;color:#dfe4f0}
  #nr-panel #nr-tmode>button.on{background:linear-gradient(180deg,#3f83dd,#2f66b8);color:#fff;font-weight:700}
  /* ★ v2.6.13：运行中任务区块「半锁定」——只是看着像锁，控件仍可用 */
  #nr-panel .nr-taskbox.locked::before{content:attr(data-lock);display:block;margin:2px 0 5px;padding:3px 6px;border:1px dashed #5a4a2a;border-radius:6px;background:rgba(255,215,110,.07);color:#e0c46a;font-size:10.5px;line-height:1.4}
  #nr-panel .nr-taskbox.locked select,#nr-panel .nr-taskbox.locked input,#nr-panel .nr-taskbox.locked textarea,
  #nr-panel .nr-taskbox.locked .ranklist,#nr-panel .nr-taskbox.locked .pathmsg,#nr-panel .nr-taskbox.locked .lbl,
  #nr-panel .nr-taskbox.locked label,#nr-panel .nr-taskbox.locked #nr-tmode{opacity:.55}
  /* ★ 加速页：每行「开关 + 参数」挤在一行；输入框更矮（填 0 / 空 = 关闭） */
  #nr-panel .nr-srow{display:flex;align-items:center;gap:4px;flex-wrap:nowrap;min-width:0}
  #nr-panel .nr-srow+.nr-srow{margin-top:3px}
  #nr-panel .nr-srow>label{display:inline-flex;align-items:center;gap:5px;flex:0 1 auto;min-width:0;font-size:10.5px;color:#c3c9d8;white-space:nowrap}
  #nr-panel .nr-srow>label>input.chk{width:14px;height:14px;flex:none}
  #nr-panel .nr-srow>.nr-sl{flex:none;white-space:nowrap;color:#8b8b96;font-size:10.5px}
  #nr-panel .nr-srow>input.nr-snum{flex:0 1 auto;width:46px;min-width:34px;padding:2px 3px;font-size:10.5px;text-align:center;height:auto;line-height:1.3}
  #nr-panel .divblock_dark>label{font-size:10.5px;color:#c3c9d8;display:inline-flex;align-items:center;gap:5px;margin:1px 0}
  #nr-panel .divblock_dark>label>input.chk{width:14px;height:14px}
  #nr-panel #nr-mc-list .mc-row{border:1px solid rgba(255,255,255,.09);border-radius:7px;padding:4px 6px;margin:2px 0;background:#191c24}
  #nr-panel #nr-mc-list .mc-h{display:flex;align-items:center;gap:5px}
  #nr-panel #nr-mc-list .mc-h .nm{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#dfe4f0}
  #nr-panel #nr-mc-list .mc-h .stt{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #nr-panel #nr-mc-list .mc-b{display:grid;grid-template-columns:1fr 1.2fr;gap:4px 6px;margin-top:3px}
  #nr-panel #nr-mc-list .fld{display:flex;align-items:center;gap:3px;min-width:0}
  #nr-panel #nr-mc-list .fld .lb{flex:none;color:#7f869a}
  #nr-panel #nr-mc-list .fld select{flex:1 1 auto;min-width:0;width:auto;padding:2px 3px;font-size:10.5px;border-radius:6px}
  #nr-panel #nr-mc-list .fld2{display:flex;align-items:center;gap:6px}
  /* ★ 修/存 做成「开关片」：选中变绿，一眼看出是开关、也有点击反馈 */
  #nr-panel #nr-mc-list .fld2 label{display:inline-flex;align-items:center;gap:4px;padding:2px 7px 2px 5px;border-radius:7px;
    border:1px solid #3a4152;background:#1e2230;color:#9aa3b8;cursor:pointer;
    transition:background .15s,border-color .15s,color .15s}
  #nr-panel #nr-mc-list .fld2 label:hover{background:#262c3c;border-color:#4a5368;color:#dfe4f0}
  #nr-panel #nr-mc-list .fld2 label:has(input:checked){background:linear-gradient(180deg,rgba(53,196,106,.24),rgba(53,196,106,.09));
    border-color:rgba(53,196,106,.55);color:#dcf3e4;font-weight:600}
  #nr-panel #nr-mc-list select.nr-mc-role{flex:none;width:40px;padding:2px 2px;font-size:10.5px;border-radius:6px}
  #nr-panel #nr-mc-list input.chk{width:13px;height:13px;border-radius:4px}
  #nr-panel #nr-mc-list input.chk:checked::after{left:4px;top:1px;width:3px;height:7px}
  #nr-panel #nr-mc-list .nr-mc-fill{flex:none;color:#8fa3bd;cursor:pointer;padding:0 2px;font-size:12px}
  #nr-panel #nr-mc-list .nr-mc-fill:hover{color:#fff}
  #nr-ordertip{color:#ffd76e;margin-top:4px;min-height:0}
  #nr-detbar{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 8px;
    border-radius:8px;background:#181b23;border:1px solid #262b38;font-size:10.5px;color:var(--nr-muted);
    cursor:pointer;transition:background .15s,color .15s,border-color .15s}
  #nr-detbar:hover{background:#1f2431;color:#cdd3e2;border-color:#333a4a}
  #nr-det{margin-top:5px;max-height:190px;overflow-y:auto;font-size:10px;line-height:1.5;
    color:#9aa1b5;background:#141720;border:1px solid #262b38;border-radius:8px;padding:5px 7px}
  #nr-det .dsec{margin-bottom:6px}
  #nr-det .dsec>b{color:#cdd3e2;display:block;margin-bottom:2px}
  #nr-det .drow{display:flex;justify-content:space-between;gap:8px}
  #nr-det .drow>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #nr-det .drow>b{color:#4ed07f;flex:none;font-variant-numeric:tabular-nums}
  #nr-det .dempty{color:#5f6678}
  #nr-logbar{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 8px;
    border-radius:8px;background:#181b23;border:1px solid #262b38;font-size:10.5px;color:var(--nr-muted);
    cursor:pointer;transition:background .15s,color .15s,border-color .15s}
  #nr-logbar:hover{background:#1f2431;color:#cdd3e2;border-color:#333a4a}
  #nr-log{display:block;flex:1 1 auto;margin-top:5px;min-height:64px;max-height:180px;overflow-y:auto;font-size:10px;line-height:1.55;
    color:#9aa1b5;background:#141720;border:1px solid #262b38;border-radius:8px;padding:5px 7px}
  #nr-log .lrow{display:flex;gap:6px;margin-bottom:2px}
  #nr-log .lt{color:#5f6678;flex:none;font-variant-numeric:tabular-nums}
  /* 细滚动条，跟深色主题统一 */
  #nr-body::-webkit-scrollbar,#nr-log::-webkit-scrollbar,.ranklist::-webkit-scrollbar{width:9px;height:9px}
  #nr-body::-webkit-scrollbar-track,#nr-log::-webkit-scrollbar-track,.ranklist::-webkit-scrollbar-track{background:transparent}
  #nr-body::-webkit-scrollbar-thumb,#nr-log::-webkit-scrollbar-thumb,.ranklist::-webkit-scrollbar-thumb{
    background:#39404f;border-radius:5px;border:2px solid transparent;background-clip:content-box}
  #nr-body::-webkit-scrollbar-thumb:hover,#nr-log::-webkit-scrollbar-thumb:hover,.ranklist::-webkit-scrollbar-thumb:hover{
    background:#4b5468;background-clip:content-box}
  /* ★ 世界地图「地名悬浮 tooltip」里的「资源点 / 怪物」
     游戏 tooltip 本身：max-width 400px / padding 25px / 14px arial / 字色 #eebb66（金字）
     这里用小一号的深色 chip，压住游戏那行「按技能去重、没名字」的大图标，避免抢主次 */
  .ui-tooltip-content .nr-wm{margin-top:9px;font:14px/1.5 "Segoe UI",system-ui,"Microsoft YaHei",sans-serif;color:#c9cfdd;max-width:340px}
  .ui-tooltip-content .nr-wm-sep{height:1px;background:rgba(255,255,255,.14);margin:0 0 8px}
  .ui-tooltip-content .nr-wm-sec{margin-top:5px}
  .ui-tooltip-content .nr-wm-sec:first-of-type{margin-top:0}
  .ui-tooltip-content .nr-wm-h{display:inline-block;min-width:46px;font-size:13px;color:#9aa3b6;vertical-align:top;padding-top:3px}
  .ui-tooltip-content .nr-wm-h.g{color:#7ee081}
  .ui-tooltip-content .nr-wm-h.m{color:#ffc061}
  .ui-tooltip-content .nr-wm-chips{display:inline}
  .ui-tooltip-content .nr-wm-chip{display:inline-flex;align-items:center;margin:0 5px 5px 0;padding:2px 10px 2px 4px;
    border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
    font-size:13px;color:#e6ebf5;white-space:nowrap;vertical-align:middle}
  .ui-tooltip-content .nr-wm-chip img{height:20px;width:20px;object-fit:contain;border-radius:4px;flex:none;margin-right:5px}
  .ui-tooltip-content .nr-wm-chip.g{border-color:rgba(53,196,106,.45)}
  .ui-tooltip-content .nr-wm-chip.m{border-color:rgba(255,192,97,.35)}
.ui-tooltip-content .nr-wm-h.s{color:#7fb6ff}
.ui-tooltip-content .nr-wm-note{margin-top:6px;font-size:12.5px;line-height:1.5;color:#8fd0a0}
.ui-tooltip-content .nr-wm-note .k{color:#6f8a7a}
.ui-tooltip-content .nr-wm-chip.s{border-color:rgba(127,182,255,.35)}
  /* 只有被我们装饰过的 tooltip 才把游戏那行 40px 图标缩小，避免和 chip 重复抢版面 */
  .ui-tooltip-content:has(.nr-wm) h2 img.rounded{height:22px;opacity:.75}
  `;

  let els = {}, dragging = null;

  function buildUI() {
    // 清理旧版本注入的游戏边框皮肤；小伴侣面板始终使用第 16 节的固定暗色样式。
    try {
      const oldSkinStyle = document.getElementById('nr-native-style');
      if (oldSkinStyle) oldSkinStyle.remove();
      const oldPanel = document.getElementById('nr-panel');
      if (oldPanel) oldPanel.classList.remove('nr-native');
    } catch (e) { /* ignore */ }
    if (document.getElementById('nr-panel')) return true;
    if (!document.body || !document.head) return false;

    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    const panel = h('div', { id: 'nr-panel' });
    panel.innerHTML = `
      <div id="nr-head">
        <span class="dot" id="nr-dot"></span>
        <span class="t" id="nr-title">Norroth 小伴侣</span>
        <span class="act" id="nr-hact"></span>
        <span class="rt" id="nr-hrt">0:00</span>
        <button class="hbtn" id="nr-hbtn" type="button" title="开始挂机"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.8 2.6 9.2 6 3.8 9.4Z"/></svg></button>
        <button class="hbtn" id="nr-skinmute" type="button" title="静音（工作外观开启时生效）">🔇</button>
        <div id="nr-gameskin" class="seg" title="游戏界面外观：原版 / 工作台（只影响游戏界面，不影响本面板）">
          <button type="button" data-skin="off">原版</button>
          <button type="button" data-skin="grid">工作台</button>
        </div>
        <span class="ver" id="nr-ver">v${SCRIPT_VER}</span>
        <span class="fold" id="nr-fold" title="折叠面板">▾</span>
      </div>
      <div id="nr-body">
        <div id="nr-main">
        <div id="nr-tabs">
          <div class="tab on" data-tab="idle">挂机</div>
          <div class="tab" data-tab="mc">多角色</div>
          <div class="tab" data-tab="food">食物</div>
          <div class="tab" data-tab="service">休整</div>
          <div class="tab" data-tab="speed">高级</div>
        </div>

        <div class="pane on" data-pane="idle">
          <div class="divblock_dark" id="nr-common">
            <div class="opts" style="margin-top:0">
              <label id="nr-flee-wrap" title="勾选即生效；战斗、爬塔运行时禁用。"><input type="checkbox" class="chk" id="nr-gatherflee">遇敌逃跑</label>
              <label><input type="checkbox" class="chk" id="nr-autorespawn">阵亡复活</label>
              <label title="自动关掉游戏因踩到 NPC / 服务格而弹出的挡路窗口；你自己开的窗口保留。"><input type="checkbox" class="chk" id="nr-sweepframes">自动关弹窗</label>
              <label title="给自己加金色描边，人多时一眼找到自己。"><input type="checkbox" class="chk" id="nr-highlight">高亮自己</label>
            </div>
            <div class="opts" style="margin-top:5px">
              <label style="flex:0 0 calc(50% - 3px);max-width:calc(50% - 3px)" title="活动开启时进入，结束后回原图续挂；爬塔时不进入。"><input type="checkbox" class="chk" id="nr-autoevent">自动进活动</label>
              <select id="nr-eventres" style="flex:1 1 0;min-width:0" title="活动中采集指定资源，或按角色等级进入战斗区。">
                <option value="">自动（同外面）</option>
                <option value="mining">采矿</option>
                <option value="quarrying">采石</option>
                <option value="chopping">伐木</option>
                <option value="farming">耕种</option>
                <option value="fishing">钓鱼</option>
                <option value="foraging">觅食</option>
                <option value="combat">⚔ 战斗（按等级进战斗区）</option>
              </select>
              <button class="mini" id="nr-fmlock" style="flex:0 0 64px;white-space:nowrap" title="锁定「当前所在地图」为挂机地图（再点一下 = 释放）">🔒 锁定</button>
            </div>
          </div>

          <div class="seg" id="nr-task" style="margin-top:6px">
            <button type="button" data-task="battle">战斗</button>
            <button type="button" data-task="gather">采集</button>
            <button type="button" data-task="tower">爬塔</button>
          </div>

          <div class="nr-taskbox" data-task="battle">
            <div class="ranklist" id="nr-ranklist"></div>
            <div class="pathmsg" id="nr-ordertip" style="white-space:pre-wrap"></div>
            <div class="row" style="align-items:center">
              <span class="lbl" id="nr-mobmode" style="margin:0;flex:none;cursor:pointer;user-select:none">怪物名单</span>
              <textarea id="nr-mobfilter" rows="1" placeholder="例：Bear" style="flex:1;min-width:0"></textarea>
              <input type="number" id="nr-lvmin" min="0" max="999" step="1" placeholder="最低" title="只打等级在此范围内的怪（0 / 留空 = 不限）" style="width:40px;flex:none">
              <span style="color:#8fa3bd;flex:none">–</span>
              <input type="number" id="nr-lvmax" min="0" max="999" step="1" placeholder="最高" title="只打等级在此范围内的怪（0 / 留空 = 不限）" style="width:40px;flex:none">
            </div>
            <div class="seg" id="nr-tmode">
              <button type="button" data-tmode="priority" title="只打手填名单与未完成任务怪；按星级、距离排序，忽略名单顺序。">优先任务</button>
              <button type="button" data-tmode="distance" title="所有符合筛选的怪按距离排序，忽略名单与星级顺序。">优先距离</button>
              <button type="button" data-tmode="all" title="所有符合筛选的怪都打，名单内优先；组内按星级、距离排序。">全图列表</button>
            </div>
            <div class="opts">
              <label title="本图没怪时去采集点采集。与「切图刷怪」2 选 1。"><input type="checkbox" class="chk" id="nr-autogather">无怪采集</label>
              <label title="本图没怪时，去隔壁图打怪（等级/名单/黑名单/星级都按当前筛选判定，不合适的邻图自动跳过），清完再回挂机图刷新。需本图有普通门。与「无怪采集」2 选 1。"><input type="checkbox" class="chk" id="nr-automapswitch">切图刷怪</label>
            </div>
          </div>

          <div class="nr-taskbox" data-task="gather" style="display:none">
            <span class="lbl" title="挂机时去这里采集。">采集点</span>
            <div class="row">
              <select id="nr-gpoint" style="flex:1"></select>
              <button class="mini" id="nr-gdetect">识别</button>
            </div>
            <span class="lbl">采集中断条件</span>
            <select id="nr-gintrank">
              <option value="any">任意怪都打断</option>
              <option value="r1">★1 星以上（冠军+）</option>
              <option value="r2">★2 星以上（稀有+）</option>
              <option value="r3">★3 星（精英）</option>
            </select>
            <div class="opts">
              <label title="采集被怪打断就去打；不勾 = 只采集，不主动打怪。"><input type="checkbox" class="chk" id="nr-ginterrupt">采集中断打怪</label>
              <label title="捡地面资源（蘑菇 / 残骸 / 种植…）。不勾 = 一律不捡。"><input type="checkbox" class="chk" id="nr-gscrap">拾取资源</label>
            </div>
          </div>

          <div class="nr-taskbox" data-task="tower" style="display:none">
            <span class="lbl">难度</span>
            <select id="nr-towerdiff">
              <option value="1">Normal（普通）</option>
              <option value="2">Nightmare（噩梦·需 Normal 20 层）</option>
              <option value="3">Chaos（混沌·需 Nightmare 40 层）</option>
            </select>
            <span class="lbl">出发城镇</span>
            <div class="row">
              <select id="nr-towntown" style="flex:1"></select>
            </div>
            <div class="opts">
              <label title="角色阵亡就停止挂机（不自动复活继续）。"><input type="checkbox" class="chk" id="nr-towerstopdeath">阵亡停止</label>
              <label title="补血/补蓝药耗尽就停止挂机。"><input type="checkbox" class="chk" id="nr-towerstopsupply">补给空停止</label>
            </div>
            <div class="row" style="align-items:center">
              <span class="lbl" style="margin:0;flex:none">爬到</span>
              <input type="number" id="nr-towerstopfloor" min="0" max="9999" step="1" placeholder="0" title="爬到第 N 层就停止（0 / 留空 = 不限）" style="width:56px;flex:none">
              <span class="lbl" style="margin:0;flex:none">层停止（0=不限）</span>
            </div>
            <div class="pathmsg" style="color:#8fa3bd">流程：城镇 → 开塔 → 逐层「杀光怪 → 走下一层入口」，直到打不动 / 被弹出。</div>
          </div>

          <div class="btns">
            <button class="pri" id="nr-start" title="开始 / 暂停（暂停会保留本次统计，可再点继续）">▶ 开始挂机</button>
            <button class="dan" id="nr-stop" disabled title="停止全部活动（清空运行标记与计时，统计保留）">■ 停止</button>
          </div>
        </div>

        <div class="pane" data-pane="mc">
          <div class="divblock_dark" style="margin-top:4px">
            <label title="副角色各自离线采集；完成后自动切过去维修 / 存仓并重启，再切回主角色。"><input type="checkbox" class="chk" id="nr-mc">多角色离线（1 主 + 3 副）</label>
            <div id="nr-mc-list" style="margin-top:3px"></div>
            <div class="row" style="margin-top:3px">
              <button class="mini" id="nr-mc-read" title="选角页 = 读取角色名单；游戏中 = 刷新采集队列与状态。">刷新</button>
              <button class="mini" id="nr-mc-toggle" title="启动全部：清空记录，逐个启动每个副角色的 idle">▶ 启动全部</button>
              <button class="mini" id="nr-mc-pause" title="暂停多角色轮转：保留队列与记录，不再切号 / 跑副角色行程；主角色照常挂机。再点一次继续。">⏸ 暂停</button>
            </div>
            <div id="nr-mc-hint" class="pathmsg" style="margin-top:2px"></div>
          </div>
        </div>

        <div class="pane" data-pane="food">
          <span class="lbl" title="留空 = 自动选背包里数量最多的补血物品（含食物）。">补血药</span>
          <select id="nr-hppotion"></select>
          <div class="nr-prev" id="nr-hpprev"></div>
          <span class="lbl" title="留空 = 自动选背包里数量最多的补蓝物品。">补蓝药</span>
          <select id="nr-mppotion"></select>
          <div class="nr-prev" id="nr-mpprev"></div>
          <div class="half" style="margin-top:6px">
            <div><span class="lbl">补血阈值</span><input type="number" id="nr-hppct" min="1" max="100" step="1"></div>
            <div><span class="lbl">补蓝阈值</span><input type="number" id="nr-mppct" min="1" max="100" step="1"></div>
          </div>
          <div class="opts">
            <label title="按血量、蓝量阈值补药；未挂机时也生效。"><input type="checkbox" class="chk" id="nr-potion">自动补药</label>
            <label><input type="checkbox" class="chk" id="nr-petfeed">自动喂宠</label>
            <label title="需要补血/补蓝但背包里已经没有对应物品时，暂停挂机（避免一直挨打）。"><input type="checkbox" class="chk" id="nr-pausesupply">没吃的就暂停</label>
          </div>
          <div class="half" style="margin-top:6px">
            <div><span class="lbl">吃药间隔(毫秒)</span><input type="number" id="nr-potdelay" min="700" max="10000" step="100"></div>
            <div><span class="lbl">&nbsp;</span><button id="nr-scan" style="width:100%;padding:5px 10px">扫描背包</button></div>
          </div>
          <div class="half" style="margin-top:6px">
            <div><span class="lbl">喂食阈值</span><input type="number" id="nr-petpct" min="1" max="100" step="1"></div>
            <div><span class="lbl">&nbsp;</span><button id="nr-petnow" style="width:100%;padding:5px 10px" title="手动喂一次，用来确认喂宠是否正常">立即喂食</button></div>
          </div>
        </div>

        <div class="pane" data-pane="service">
          <span class="lbl">维修/清包城镇（传送站城市 🏙，未拜访也能选）</span>
          <div class="row">
            <select id="nr-town" style="flex:1"></select>
            <button class="mini" id="nr-townrefresh">刷新</button>
          </div>
          <div class="opts">
            <label title="导航可用城市传送：Noble 免费；否则经传送站消耗 Spirit Essence。"><input type="checkbox" class="chk" id="nr-usewaygatecity">城市传送点</label>
            <label title="导航可经传送站前往已解锁的野外锚点，消耗 Spirit Essence。"><input type="checkbox" class="chk" id="nr-usewaygatewild">野外传送点</label>
          </div>
          <div class="row">
            <button class="mini" id="nr-importmaprec" style="flex:1" title="导入「地图记录器」导出的 JSON 文件，补充内置导航图">📥 导入地图 JSON</button>
            <button class="mini" id="nr-exportmaprec" style="flex:1" title="导出边玩边学到的地图数据（格式和地图记录器一致）">📤 导出地图 JSON</button>
            <input type="file" id="nr-maprecfile" accept=".json,application/json" style="display:none">
          </div>
          <div class="opts">
            <label><input type="checkbox" class="chk" id="nr-repairon">自动维修</label>
          </div>
          <div class="half" style="margin-top:6px">
            <div class="inline"><span title="任一装备耐久 ≤ 上限 × 该百分比就去维修（不含宠物：宠物耐久靠食物回，由自动喂宠负责）。">维修阈值(%)</span><input type="number" id="nr-repairdurpct" min="1" max="100" step="1"></div>
          </div>
          <div class="kv" id="nr-durinfo" style="color:#8fa3bd;font-size:10.5px;line-height:1.5;margin-top:4px"></div>
          <div class="opts">
            <label><input type="checkbox" class="chk" id="nr-sellon" title="背包快满时去铁匠出售/拆解低品质装备（可与「自动存仓」同时开）">自动清包</label>
            <label><input type="checkbox" class="chk" id="nr-depositon" title="背包达阈值时存材料及符合品质条件的装备；失败跳过，可与清包同开。">自动存仓</label>
          </div>
          <div class="half" style="margin-top:8px">
            <div class="inline"><span>背包剩余 ≤</span><input type="number" id="nr-sellfree" min="1" step="1" title="背包剩余格数 ≤ 该值就去休整（清包 / 存仓共用）"></div>
            <div class="inline"><span>等级≤</span><input type="number" id="nr-sellmaxlv" min="0" step="1" title="处理等级 ≤ 该值的装备（0 = 不限等级）"></div>
          </div>
          <div class="half" style="margin-top:6px">
            <div class="inline"><span>操作</span><select id="nr-clearaction" title="自动清包的方式：出售换金币 / 拆解换材料"><option value="sell">出售</option><option value="salvage">拆解</option></select></div>
            <div class="inline"><span>品质低于</span><select id="nr-sellrarity" title="清包：低于所选品质（普通仅灰装；不限则全品质）。存仓：达到所选品质（不限则不存装备）。"><option value="">不限</option><option value="normal">普通（仅灰色）</option><option value="magic">魔法</option><option value="rare">稀有</option><option value="epic">史诗</option><option value="mystical">神秘</option><option value="ascended">飞升</option><option value="legendary">传说</option><option value="relic">遗物</option><option value="unique">独特</option></select></div>
          </div>
          <div class="row" style="margin-top:6px">
            <button class="pri" id="nr-sellnow" style="flex:1">🧰 立即维护</button>
          </div>
          <div class="pathmsg" id="nr-pathmsg"></div>
        </div>

        <div class="pane" data-pane="speed">
          <span class="lbl" title="仅加速战斗动画；移动、采集、生产等保持原速。">加速倍率（1 ~ 5，1 = 原速）</span>
          <div class="row">
            <input type="range" id="nr-speedk" min="1" max="5" step="0.1" style="flex:1">
            <span id="nr-speedval" style="min-width:40px;text-align:right;color:#ffd76e;font-weight:700;font-size:11.5px">5×</span>
          </div>
          <div class="kv"><span>移动速度</span><b id="nr-speedrate">— 格/秒</b></div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <span class="nr-sl" style="flex:none" title="缩放游戏弹窗，100% 为原大小；不影响助手面板。">窗口缩放</span>
              <input type="range" id="nr-winscale" min="20" max="100" step="5" style="flex:1">
              <span id="nr-winscaleval" style="min-width:44px;text-align:right;color:#ffd76e;font-weight:700;font-size:11.5px">100%</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="移动、点击等动作前随机等待指定毫秒；不含补药。范围全为 0 时关闭。"><input type="checkbox" class="chk" id="nr-humandelay">随机间隔</label>
              <span class="nr-sl">最小</span><input type="number" id="nr-hdmin" min="0" max="60000" step="50" class="nr-snum">
              <span class="nr-sl">最大</span><input type="number" id="nr-hdmax" min="0" max="60000" step="50" class="nr-snum">
              <span class="nr-sl">ms</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="需开启随机间隔。短周期按其毫秒范围延后；长周期按幅度百分比上下浮动（0 按 10%）。"><input type="checkbox" class="chk" id="nr-humrhythm">节拍抖动</label>
              <label title="补药、喂宠、维修、背包、自愈与分段距离阈值上下浮动 ±幅度%；小整数至少 ±1。幅度也用于节拍抖动。"><input type="checkbox" class="chk" id="nr-humjitter">阈值抖动</label>
              <span class="nr-sl">幅度</span><input type="number" id="nr-humjitterpct" min="0" max="50" step="1" class="nr-snum">
              <span class="nr-sl">%</span>
            </div>
            <div class="nr-srow">
              <label title="以「概率%」在动作前额外插一段「时长 最小~最大 ms」的停顿（像人中途去看别的东西）。和「随机间隔」叠加生效；两个都关 = 动作立即发出。"><input type="checkbox" class="chk" id="nr-hummicro">微停顿</label>
              <span class="nr-sl">概率</span><input type="number" id="nr-hummicro_pct" min="0" max="100" step="1" class="nr-snum">
              <span class="nr-sl">%</span>
              <span class="nr-sl">时长</span><input type="number" id="nr-hummicro_min" min="0" max="600000" step="500" class="nr-snum">
              <span class="nr-sl">~</span><input type="number" id="nr-hummicro_max" min="0" max="600000" step="500" class="nr-snum">
              <span class="nr-sl">ms</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="多角色轮转：副角色任务完成后，先随机等 等待 最小~最大 秒再切下一个角色（只在开了「多角色离线」时生效）。填 0 = 不等待，轮完立刻切。"><input type="checkbox" class="chk" id="nr-humrotwait">轮转间隔</label>
              <span class="nr-sl">等待</span><input type="number" id="nr-humrotwait_min" min="0" max="86400" step="10" class="nr-snum">
              <span class="nr-sl">~</span><input type="number" id="nr-humrotwait_max" min="0" max="86400" step="10" class="nr-snum">
              <span class="nr-sl">秒</span>
            </div>
            <div class="nr-srow">
              <label title="按设定分钟间隔打开只读面板，2.5~6.5 秒后关闭；战斗、移动、休整时跳过。"><input type="checkbox" class="chk" id="nr-humidleact">随机浏览面板</label>
              <span class="nr-sl">间隔</span><input type="number" id="nr-humidleact_min" min="1" max="1440" step="1" class="nr-snum">
              <span class="nr-sl">~</span><input type="number" id="nr-humidleact_max" min="1" max="1440" step="1" class="nr-snum">
              <span class="nr-sl">分钟</span>
            </div>
            <div class="nr-srow">
              <label title="每次开始移动时，有「概率%」先往旁边走 1~2 格（避开采集点 / 资源点格子），到了再走真正的目标。只影响路径，不影响最终到达。"><input type="checkbox" class="chk" id="nr-hummistake">随机偏移移动</label>
              <span class="nr-sl">概率</span><input type="number" id="nr-hummistake_pct" min="0" max="50" step="1" class="nr-snum">
              <span class="nr-sl">%</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="普通追怪、采集与休整、多角色行程的长距离走位，先到目标前一格停顿再到达；跨图走门、爬塔作战和 Boss 作战不适用。"><input type="checkbox" class="chk" id="nr-navseg">分段导航</label>
              <span class="nr-sl">长距离</span><input type="number" id="nr-navseg_dist" min="3" max="200" step="1" class="nr-snum">
              <span class="nr-sl">格</span>
              <span class="nr-sl" title="两段式导航在目标「前一格」停下后，等多久再走最后一段（固定毫秒数，默认 300ms）。">停顿</span>
              <input type="number" id="nr-navseg_pause" min="0" max="60000" step="50" class="nr-snum" title="段间停顿(ms)">
              <span class="nr-sl">ms</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="需 Lv30+；服务器时间 01/10/19 点刷新。按设定提前秒数进房打 Boss，打完直接离场（奖励走邮件，不再开宝箱）。"><input type="checkbox" class="chk" id="nr-autoovl">自动打 Overlord</label>
              <span class="nr-sl">提前</span><input type="number" id="nr-ovl_lead" min="0" max="600" step="5" class="nr-snum" title="刷新前多少秒开始蹲点">
              <span class="nr-sl">秒</span>
              <span class="nr-sl" title="进房后多久还没开打就兜底离场（秒）；不影响已开打的长战斗。">空等</span><input type="number" id="nr-ovl_leave" min="30" max="3600" step="30" class="nr-snum" title="进房后多久还没开打就兜底离场(秒)">
              <span class="nr-sl">秒</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <label title="补齐未探索地图并去除迷雾；点击可看详情，传送仍受游戏条件限制。"><input type="checkbox" class="chk" id="nr-wmunlock">解锁世界地图</label>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <button class="mini" id="nr-bestsync" type="button" style="flex:1" title="扫描账号图鉴并上传公共仓库供 Wiki 共享；约 20 秒，可取消。">图鉴同步</button>
              <button class="mini" id="nr-mapsync" type="button" style="flex:1" title="上传本地地图并合并公共数据，每张图保留更新时间较新的记录。">地图同步</button>
            </div>
            <div class="nr-srow" style="margin-top:4px">
              <span id="nr-bestsyncstate" style="flex:1;min-width:0;color:#9aa4b2;font-size:10.5px;white-space:normal;line-height:1.3">图鉴：点「图鉴同步」（静默上传，无需令牌）</span>
              <button class="mini" id="nr-bestcancel" type="button" style="display:none">取消</button>
            </div>
            <div class="nr-srow" style="margin-top:2px">
              <span id="nr-mapsyncstate" style="flex:1;min-width:0;color:#9aa4b2;font-size:10.5px;white-space:normal;line-height:1.3">地图：点「地图同步」（上传本地 + 拉取公共）</span>
            </div>
          </div>

          <div class="divblock_dark" style="margin-top:4px">
            <div class="nr-srow">
              <span class="nr-sl" style="flex:none" title="油猴按设置自动更新；进入游戏也会检查，版本号变金色时可点击更新。">在线更新</span>
              <span id="nr-updstate" style="flex:1;color:#9aa4b2;font-size:10.5px">当前 v${SCRIPT_VER}</span>
              <button class="mini" id="nr-updcheck" type="button" title="立即检查远端是否有新版本（绕过 5 分钟节流）">检查更新</button>
            </div>
          </div>
        </div>

        </div>
        <div id="nr-side">
          <div id="nr-status">就绪</div>
          <div id="nr-stats"></div>
          <div id="nr-detbar"><span id="nr-dettoggle">▸ 详细统计</span><span id="nr-detclear">清空</span></div>
          <div id="nr-det"></div>
          <div id="nr-logbar"><span id="nr-logtoggle" title="高频操作按 30 秒汇总，地图更新按 60 秒汇总；显示本段次数与最近一条信息。">操作日志 (0)</span><span><span id="nr-logexport" title="导出诊断日志（txt，自动抹掉网址与凭据）">导出</span> <span id="nr-logclear">清空</span></span></div>
          <div id="nr-log"></div>
        </div>
      </div>
      `;
    document.body.appendChild(panel);

    els.panel = panel;
    els.head = panel.querySelector('#nr-head');
    els.dot = panel.querySelector('#nr-dot');
    els.fold = panel.querySelector('#nr-fold');

    bindPanel(panel);
    placePanel(true);
    window.addEventListener('resize', () => placePanel(false));   // ★ 窗口缩放自动钳制，不再飘出屏幕
    /* ★ 面板自身也会变高（切标签页、统计行渲染完、展开日志），
       只在初始化时钳制一次是不够的 —— 面板会长出视口底部。
       用 ResizeObserver 盯住面板尺寸，一变就重新钳制。 */
    if (typeof ResizeObserver === 'function') {
      try { new ResizeObserver(() => placePanel(false)).observe(panel); } catch (e) { /* ignore */ }
    }
    syncUI();
    try { applySkin(); } catch (e) { /* ignore */ }
    detectGatherPoints(true);
    renderRankList();
    recordVisit();
    renderTownSelect();
    renderDet();
    renderPotionSelects();
    updateStats();
    refreshCurMap();
    syncRunButtons();
    refreshBagInfo(true);
    renderLog();
    updateHeader();
    return true;
  }

  /* 面板定位：统一用 left/top（不用 right，避免滚动条宽度导致基准漂移）。
   * ★ cfg.uiX/uiY 存的是「用户想要的位置」，只在拖动 / 双击复位时改变；
   *   渲染时只把它钳制进视口，绝不回写。
   *   这样面板临时变高（切标签页、展开日志、统计行渲染完）不会把用户的位置永久改掉，
   *   缩回去还能回到原处 —— 这是 v1.6.0「缩放后面板乱飘」的根因。 */
  function placePanel(init) {
    const p = els.panel;
    if (!p) return;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const w = p.offsetWidth || 268;
    const hh = p.offsetHeight || 40;
    if (init && (cfg.uiX == null || cfg.uiY == null)) {
      cfg.uiX = Math.max(8, vw - w - 16);
      cfg.uiY = Math.max(8, vh - hh - 16);
      saveCfg();
    }
    const wantX = (cfg.uiX == null) ? 16 : cfg.uiX;
    const wantY = (cfg.uiY == null) ? 16 : cfg.uiY;
    // 面板比视口还大时贴左上角（高度由 #nr-body 的 max-height 兜底滚动）
    p.style.left = Math.round(clamp(wantX, 0, Math.max(0, vw - w))) + 'px';
    p.style.top = Math.round(clamp(wantY, 0, Math.max(0, vh - hh))) + 'px';
  }

  function bindPanel(panel) {
    // 拖动（pointer 事件 + setPointerCapture，拖到 iframe 上也不丢）
    els.head.addEventListener('pointerdown', e => {
      /* ★ v2.6.17：标题栏里的按钮/下拉/输入不触发拖动（否则 pointer capture 会吞掉 click，工作台按钮点不动）
         ★ v2.6.77：加上 #nr-ver —— 版本号角标要能点（点开在线更新安装页）；
         实测（puppeteer 真实鼠标事件）：不加这一项时 pointerdown 触发拖动 + setPointerCapture，
         后续 click 被吞掉，programmatic .click() 却能过 —— 是个只有真点才复现的坑。 */
      if (e.target.closest('#nr-fold,#nr-ver,#nr-hbtn,#nr-gameskin,#nr-skinmute,button,select,input,a')) return;
      dragging = { dx: e.clientX - panel.offsetLeft, dy: e.clientY - panel.offsetTop };
      els.head.setPointerCapture(e.pointerId);
    });
    els.head.addEventListener('pointermove', e => {
      if (!dragging) return;
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      cfg.uiX = clamp(e.clientX - dragging.dx, 0, Math.max(0, vw - panel.offsetWidth));
      cfg.uiY = clamp(e.clientY - dragging.dy, 0, Math.max(0, vh - panel.offsetHeight));
      panel.style.left = Math.round(cfg.uiX) + 'px';
      panel.style.top = Math.round(cfg.uiY) + 'px';
    });
    els.head.addEventListener('pointerup', e => {
      if (dragging) { dragging = null; saveCfg(); }
      try { els.head.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    els.head.addEventListener('dblclick', e => {
      if (e.target.closest('#nr-fold,#nr-ver,#nr-hbtn,#nr-gameskin,#nr-skinmute,button,select,input,a')) return;
      cfg.uiX = null; cfg.uiY = null; placePanel(true);
    });

    els.fold.addEventListener('click', () => {
      cfg.uiFold = !cfg.uiFold; saveCfg(); syncUI();
    });

    /* ★ 折叠态标题栏的迷你按钮：与主按钮同一套三态（开始 / 暂停 / 继续） */
    const hbtn = panel.querySelector('#nr-hbtn');
    if (hbtn) hbtn.addEventListener('click', e => { e.stopPropagation(); toggleRun(cfg.runMode); });

    panel.querySelectorAll('#nr-tabs .tab').forEach(t => {
      t.addEventListener('click', () => {
        cfg.uiTab = t.dataset.tab; saveCfg(); syncUI();
        if (t.dataset.tab === 'service') renderTownSelect();   // ★ 切到该页时刷新城镇列表
        if (t.dataset.tab === 'idle' && cfg.questMonsters) {
          refreshQuestTargets(true).then(() => { renderRankList(); updateStats(); }).catch(() => {});
        }
      });
    });

    /* ★ v2.6.74：战斗索敌模式（优先任务 / 优先距离 / 全图列表）三选一 */
    (function () {
      const seg = document.getElementById('nr-tmode');
      if (!seg) return;
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const m = b.dataset.tmode;
          if (['priority', 'distance', 'all'].indexOf(m) < 0) return;
          cfg.targetMode = m;
          /* 派生字段：保持原有筛选 / 排序代码不变 */
          cfg.nameFirst = (m === 'all');
          cfg.questMonsters = (m === 'priority' || m === 'all');
          saveCfg();
          invalidateMonsterList();
          if (cfg.questMonsters) refreshQuestTargets(true).then(() => { renderRankList(); updateStats(); }).catch(() => {});
          else { renderRankList(); updateStats(); }
          syncUI();
          setStatus('索敌模式：' + ({ priority: '优先任务', distance: '优先距离', all: '全图列表' }[m]) + '（' + ({ priority: '只打名单怪', distance: '全打·谁近打谁', all: '全打·名单先打' }[m]) + '）');
        });
      });
    })();
    bindCheck('nr-gscrap', 'gatherScrap');
    bindCheck('nr-autoevent', 'autoEvent');
    bindCheck('nr-autoovl', 'autoOverlord');
    bindNum('nr-ovl_lead', 'ovlLeadSec', 0);
    bindNum('nr-ovl_leave', 'ovlLeaveSec', 30);
    (function () {
      const er = document.getElementById('nr-eventres');
      if (er) { er.value = cfg.eventRes || ''; er.addEventListener('change', () => { cfg.eventRes = (['fishing','mining','chopping','farming','quarrying','foraging','combat'].indexOf(er.value) >= 0) ? er.value : ''; saveCfg(); }); }
    })();
    bindCheck('nr-gatherflee', 'gatherFlee');
    /* ★ 多角色轮转 */
    (function () {
      const mcChk = panel.querySelector('#nr-mc');
      if (mcChk) mcChk.addEventListener('change', function () { mcSetOn(mcChk.checked); });
      const mcRead = panel.querySelector('#nr-mc-read');
      if (mcRead) mcRead.addEventListener('click', function () {
        /* ★ 选角页 = 读取角色；游戏中 = 刷新采集队列与状态 */
        if (inGame()) { setStatus('多角色：刷新采集队列 / 状态…'); mcRefreshStatus(); }   /* ★ v2.6.21：真的更新状态 */
        else { mcReadChars(); }
      });
      const mcTG = panel.querySelector('#nr-mc-toggle'); if (mcTG) mcTG.addEventListener('click', function () { mcToggle(); });
      const mcPS = panel.querySelector('#nr-mc-pause'); if (mcPS) mcPS.addEventListener('click', function () { mcTogglePause(); });
      const mcList = panel.querySelector('#nr-mc-list');
      if (mcList) {
        mcList.addEventListener('change', function (e) {
          const row = e.target.closest ? e.target.closest('.mc-row') : null; if (!row) return;
          const c = cfg.mcChars.filter(function (x) { return String(x.id) === row.getAttribute('data-id'); })[0]; if (!c) return;
          if (e.target.classList.contains('nr-mc-en')) c.enabled = (c.role === 'main') ? true : e.target.checked;
          else if (e.target.classList.contains('nr-mc-role')) mcSetRole(c, e.target.value);   /* ★ v2.6.22：同步重置轮转状态 */
          else if (e.target.classList.contains('nr-mc-map')) {
            c.gatherMap = e.target.value;
            /* ★ 换了图：原来选的采集点大概率不属于新图 → 清掉，避免走到非采集点 */
            if (c.nodeX > 0) {
              let tiles = []; try { tiles = MapDB.gatherTiles(c.gatherMap) || []; } catch (er) { tiles = []; }
              const belongs = tiles.some(function (q) { return +q[0] === +c.nodeX && +q[1] === +c.nodeY; });
              if (tiles.length && !belongs) { c.nodeX = 0; c.nodeY = 0; c.res = ''; c.profession = ''; }
            }
          }
          else if (e.target.classList.contains('nr-mc-node')) {
            const v = e.target.value;
            if (v) {
              const p = v.split('-'); c.nodeX = +p[0]; c.nodeY = +p[1];
              const t = (MapDB.gatherTiles(c.gatherMap) || []).filter(function (q) { return +q[0] === c.nodeX && +q[1] === c.nodeY; })[0];
              if (t) { c.res = String(t[2] || ''); c.profession = gatherProfOf(c.res) || c.profession; }
            } else { c.nodeX = 0; c.nodeY = 0; }
          }
          else if (e.target.classList.contains('nr-mc-town')) c.serviceTown = e.target.value;
          else if (e.target.classList.contains('nr-mc-rep')) c.repairOn = e.target.checked;
          else if (e.target.classList.contains('nr-mc-dep')) c.depositOn = e.target.checked;
          saveCfg(); mcRender();
        });
        mcList.addEventListener('click', function (e) {
          const f = e.target.closest ? e.target.closest('.nr-mc-fill') : null; if (!f) return;
          const row = f.closest('.mc-row'); if (!row) return;
          mcFillCurrent(row.getAttribute('data-id'));
        });
      }
    })();
    bindCheck('nr-usewaygatecity', 'useWaygateCity');
    bindCheck('nr-usewaygatewild', 'useWaygateWild');
    (function () {
      const lo = document.getElementById('nr-lvmin'), hi = document.getElementById('nr-lvmax');
      const sync = () => { cfg.monsterLvMin = Math.max(0, Math.min(999, Math.round(+(lo && lo.value) || 0))); cfg.monsterLvMax = Math.max(0, Math.min(999, Math.round(+(hi && hi.value) || 0))); saveCfg(); updateStats(); };
      if (lo) lo.addEventListener('change', sync);
      if (hi) hi.addEventListener('change', sync);
    })();
    bindCheck('nr-highlight', 'highlightSelf', applyHighlightSelf);
    (function () {
      const g = document.getElementById('nr-gameskin');
      if (g) g.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { setSkin(b.dataset.skin); }); });
    })();
    /* ★ 任务选择器（战斗 / 采集 / 爬塔） */
    (function () {
      const seg = document.getElementById('nr-task');
      if (!seg) return;
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const t = b.dataset.task;
          /* ★ v2.6.13：运行中（未暂停）只切「查看」，不改正在跑的任务；
             换任务必须「停止」→「开始挂机」（会重置统计）。 */
          const locked = running && !st.paused;
          cfg.uiTask = t;
          if (locked) {
            saveCfg(); renderTaskUI();
            setStatus(t === cfg.task ? ('查看：' + TASK_CN[t])
                                     : ('运行中：仅切换查看（当前任务：' + TASK_CN[cfg.task] + '）· 换任务请先「停止」'));
            return;
          }
          cfg.task = t; saveCfg();
          deriveRunMode(); syncUI();
          setStatus('任务：' + TASK_CN[t]);
        });
      });
    })();
    /* ★ 爬塔设置：难度 / 出发城镇 */
    (function () {
      const d = document.getElementById('nr-towerdiff');
      if (d) d.addEventListener('change', function () { cfg.towerDiff = +d.value || 1; saveCfg(); });
      const tsd = document.getElementById('nr-towerstopdeath');
      if (tsd) tsd.addEventListener('change', function () { cfg.towerStopDeath = tsd.checked; saveCfg(); });
      const tss = document.getElementById('nr-towerstopsupply');
      if (tss) tss.addEventListener('change', function () { cfg.towerStopSupply = tss.checked; saveCfg(); });
      const tsf = document.getElementById('nr-towerstopfloor');
      if (tsf) tsf.addEventListener('change', function () { cfg.towerStopFloor = Math.max(0, Math.round(+tsf.value || 0)); saveCfg(); });
      const t = document.getElementById('nr-towntown');
      if (t) t.addEventListener('change', function () { cfg.towerTown = t.value || ''; saveCfg(); });
    })();
    /* ★ 「无怪采集」与「切图刷怪」2 选 1 */
    (function () {
      const ag = document.getElementById('nr-autogather');
      const ms = document.getElementById('nr-automapswitch');
      if (ag) ag.addEventListener('change', function () {
        cfg.autoGather = ag.checked; saveCfg();
        if (ag.checked && ms) { ms.checked = false; cfg.autoMapSwitch = false; saveCfg(); }
        deriveRunMode();
      });
      if (ms) ms.addEventListener('change', function () {
        cfg.autoMapSwitch = ms.checked; saveCfg();
        if (ms.checked && ag) { ag.checked = false; cfg.autoGather = false; saveCfg(); }
        deriveRunMode();
      });
    })();
    bindCheck('nr-autorespawn', 'autoRespawn');
    bindCheck('nr-sweepframes', 'sweepFrames');
    bindCheck('nr-wmunlock', 'worldMapUnlock');
    (function () {
      const el = document.getElementById('nr-petfeed');
      if (el) el.addEventListener('change', () => togglePetFeed(el.checked));
    })();
    const petNowBtn = panel.querySelector('#nr-petnow');
    if (petNowBtn) petNowBtn.addEventListener('click', feedPetNowManual);
    (function () {
      const el = document.getElementById('nr-potion');
      if (el) el.addEventListener('change', () => setPotionOn(el.checked));
    })();
    bindCheck('nr-pausesupply', 'pauseNoSupply');
    bindCheck('nr-repairon', 'repairOn');
    (function () {
      const mb = document.getElementById('nr-skinmute');
      if (mb) { mb.classList.toggle('on', !!cfg.skinMute); mb.addEventListener('click', function () { cfg.skinMute = !cfg.skinMute; saveCfg(); applySkinMute(); mb.classList.toggle('on', !!cfg.skinMute); }); }
    })();
    bindNum('nr-repairdurpct', 'repairDurPct', 1);
    /* ★ 「自动清包」与「自动存仓」可同时开（休整顺序：清包 → 存仓 → 修理） */
    (function () {
      const sellEl = document.getElementById('nr-sellon');
      const depEl = document.getElementById('nr-depositon');
      if (sellEl) { sellEl.checked = !!cfg.sellOn; sellEl.addEventListener('change', () => { cfg.sellOn = sellEl.checked; saveCfg(); updateStats(); refreshBagInfo(true); }); }
      if (depEl) { depEl.checked = !!cfg.autoDeposit; depEl.addEventListener('change', () => { cfg.autoDeposit = depEl.checked; saveCfg(); updateStats(); refreshBagInfo(true); }); }
      const act = document.getElementById('nr-clearaction');
      if (act) { act.value = cfg.clearAction || 'sell'; act.addEventListener('change', () => { cfg.clearAction = (act.value === 'salvage') ? 'salvage' : 'sell'; saveCfg(); refreshBagInfo(true); }); }
      const rar = document.getElementById('nr-sellrarity');
      if (rar) { rar.value = cfg.sellRarity || ''; rar.addEventListener('change', () => { cfg.sellRarity = (RARITY_ORDER.indexOf(rar.value) >= 0) ? rar.value : ''; saveCfg(); refreshBagInfo(true); }); }
    })();
    bindNum('nr-hppct', 'hpPct', 1);
    bindNum('nr-mppct', 'mpPct', 1);
    bindNum('nr-petpct', 'petEnergyPct', 1);
    bindNum('nr-potdelay', 'potionDelayMs', 700);
    bindNum('nr-sellfree', 'sellFreeMin', 1);
    bindNum('nr-sellmaxlv', 'sellEquipMaxLv', 0);

    /* ★ v2.6.76：挂机地图锁定（开关式，无独立「释放」按钮）——
       点一下 = 锁定当前所在地图；再点一下 = 释放（解锁）。 */
    const fmLock = panel.querySelector('#nr-fmlock');
    if (fmLock) fmLock.addEventListener('click', () => {
      if (cfg.farmMapLocked) {
        cfg.farmMapLocked = false; saveCfg(); syncFarmMapUI(); updateStats();
        logEvent('挂机地图已释放（解锁）');
        setStatus('已释放挂机地图锁定：下次开始挂机按当时所在地图重新锁定');
        return;
      }
      /* ★ v2.6.62：锁定 = 锁定「当前所在地图」。 */
      const prev = cfg.farmMap;
      if (inGame()) cfg.farmMap = String(character.current_map);
      cfg.farmMapLocked = true; saveCfg(); syncFarmMapUI(); updateStats();
      if (cfg.farmMap) {
        const nm = townName(cfg.farmMap) + '（#' + cfg.farmMap + '）';
        logEvent('挂机地图已锁定：' + nm + ((prev && String(prev) !== String(cfg.farmMap)) ? '（原记录 ' + townName(prev) + ' #' + prev + ' 已替换）' : ''));
        setStatus('已锁定挂机地图「' + nm + '」（重新开始 / 切图都不会再改；再点一下 = 释放）');
      } else setStatus('已锁定挂机地图（还没记录到地图：进游戏后再点一次，或直接开始挂机）');
    });

    const mob = panel.querySelector('#nr-mobfilter');
    const mobMode = panel.querySelector('#nr-mobmode');
    if (mobMode) mobMode.addEventListener('click', () => {
      /* 先把当前输入框内容存回当前名单，再切换编辑对象 */
      if (cfg.mobListMode === 'black') cfg.monsterBlacklist = mob.value; else cfg.monsterFilter = mob.value;
      cfg.mobListMode = (cfg.mobListMode === 'black') ? 'white' : 'black';
      saveCfg(); syncMobListUI(); renderRankList(); updateStats();
      setStatus(cfg.mobListMode === 'black' ? '怪物名单 → 黑名单（这里的怪不打）' : '怪物名单 → 优先名单');
    });
    mob.addEventListener('change', () => {
      if (cfg.mobListMode === 'black') cfg.monsterBlacklist = mob.value; else cfg.monsterFilter = mob.value;
      saveCfg(); invalidateMonsterList(); renderRankList(); updateStats();
    });

    panel.querySelector('#nr-ranklist').addEventListener('change', e => {
      const cb = e.target.closest('input.chk');
      if (!cb) return;
      const rank = cb.dataset.rank;
      const i = cfg.rankOff.indexOf(rank);
      if (cb.checked) { if (i >= 0) cfg.rankOff.splice(i, 1); }
      else if (i < 0) cfg.rankOff.push(rank);
      const row = cb.closest('.rank');
      if (row) { row.classList.toggle('on', cb.checked); row.classList.toggle('off', !cb.checked); }
      saveCfg(); updateStats();
    });
    panel.querySelector('#nr-ranklist').addEventListener('click', e => {
      // 点整行 = 勾选/取消该星级（复选框本身很小，不好点）
      const row = e.target.closest('.rank');
      const cbx = e.target.closest('input.chk');
      if (row && !e.target.closest('.mv') && !cbx) {
        const c = row.querySelector('input.chk');
        if (c) { c.checked = !c.checked; c.dispatchEvent(new Event('change', { bubbles: true })); }
        return;
      }
      const mv = e.target.closest('.mv');
      if (!mv || mv.classList.contains('dis')) return;
      const rank = mv.dataset.rank, dir = +mv.dataset.dir;
      const i = cfg.rankOrder.indexOf(rank);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cfg.rankOrder.length) return;
      cfg.rankOrder.splice(i, 1);
      cfg.rankOrder.splice(j, 0, rank);
      saveCfg(); renderRankList(); updateStats();
    });

    bindCheck('nr-ginterrupt', 'gatherInterrupt', onModeSwitch);
    const gir = panel.querySelector('#nr-gintrank');
    gir.addEventListener('change', () => { cfg.gatherInterruptRank = gir.value; saveCfg(); });

    const gp = panel.querySelector('#nr-gpoint');
    gp.addEventListener('change', () => { cfg.gatherPoint = gp.value; saveCfg(); });
    panel.querySelector('#nr-gdetect').addEventListener('click', () => detectGatherPoints(false));

    panel.querySelector('#nr-hppotion').addEventListener('change', e => { cfg.hpPotion = e.target.value; saveCfg(); renderPotionPreviews(); });
    panel.querySelector('#nr-mppotion').addEventListener('change', e => { cfg.mpPotion = e.target.value; saveCfg(); renderPotionPreviews(); });
    panel.querySelector('#nr-scan').addEventListener('click', () => { scanBag(); });

    /* ★ 已移除「当前地图-识别」功能 */
    const townSel = panel.querySelector('#nr-town');
    if (townSel) townSel.addEventListener('change', () => { cfg.serviceTown = townSel.value; saveCfg(); verifyPath(); });
    const townRefresh = panel.querySelector('#nr-townrefresh');
    if (townRefresh) townRefresh.addEventListener('click', () => { recordVisit(); renderTownSelect(); verifyPath(); });
    const impBtn = panel.querySelector('#nr-importmaprec');
    const impFile = panel.querySelector('#nr-maprecfile');
    if (impBtn && impFile) {
      impBtn.addEventListener('click', () => impFile.click());
      impFile.addEventListener('change', () => {
        const f = impFile.files && impFile.files[0];
        if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const o = JSON.parse(String(rd.result));
            const n = navImportRecorder(true, o);
            renderTownSelect(); verifyPath();
            setStatus('已导入 JSON：新增 ' + n + ' 条路线（共 ' + MapDB.edgeCount() + ' 条）');
          } catch (e) { setStatus('导入失败：' + (e && e.message ? e.message : String(e))); }
          impFile.value = '';
        };
        rd.readAsText(f);
      });
    }
    const expBtn = panel.querySelector('#nr-exportmaprec');
    if (expBtn) expBtn.addEventListener('click', exportPoiLearn);
    panel.querySelector('#nr-sellnow').addEventListener('click', () => repairSellNow());
    ['nr-sellfree', 'nr-sellmaxlv', 'nr-clearaction', 'nr-sellrarity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => refreshBagInfo(true));
    });

    // 加速页
    const sk = panel.querySelector('#nr-speedk');
    sk.addEventListener('input', () => applySpeedK(+sk.value));
    const ws = panel.querySelector('#nr-winscale');
    if (ws) ws.addEventListener('input', () => applyWinScale(+ws.value));
    /* ★ 真人化动作间隔 */
    bindCheck('nr-humandelay', 'humanDelay');
    bindNum('nr-hdmin', 'humanDelayMin', 0);
    bindNum('nr-hdmax', 'humanDelayMax', 0);
    bindCheck('nr-humrhythm', 'humanRhythm');
    bindCheck('nr-humjitter', 'humanJitter');
    bindNum('nr-humjitterpct', 'humanJitterPct', 0);
    bindCheck('nr-hummicro', 'humanMicroOn');
    bindNum('nr-hummicro_pct', 'humanMicroPct', 0);
    bindNum('nr-hummicro_min', 'humanMicroMin', 0);
    bindNum('nr-hummicro_max', 'humanMicroMax', 0);
    bindCheck('nr-humrotwait', 'humanRotWaitOn');
    bindNum('nr-humrotwait_min', 'humanRotWaitMin', 0);
    bindNum('nr-humrotwait_max', 'humanRotWaitMax', 0);
    bindCheck('nr-humidleact', 'humanIdleActOn');
    bindNum('nr-humidleact_min', 'humanIdleActMin', 1);
    bindNum('nr-humidleact_max', 'humanIdleActMax', 1);
    bindCheck('nr-hummistake', 'humanMistakeOn');
    bindNum('nr-hummistake_pct', 'humanMistakePct', 0);
    bindCheck('nr-navseg', 'navSegOn');
    bindNum('nr-navseg_dist', 'navSegDist', 3);
    bindNum('nr-navseg_pause', 'navSegPauseMs', 0);

    panel.querySelector('#nr-start').addEventListener('click', () => {
      /* ★ v2.6.13：未运行时，先把「查看中的任务」应用为当前任务再开始；
         运行中点它 = 暂停，不动任务（换任务请先「停止」）。 */
      if (!running) {
        if (cfg.uiTask && cfg.uiTask !== cfg.task) { cfg.task = cfg.uiTask; saveCfg(); }
        deriveRunMode();
      }
      toggleRun(cfg.runMode);
    });
    const stopBtn = panel.querySelector('#nr-stop');
    if (stopBtn) stopBtn.addEventListener('click', () => stop());

    // 日志：常开显示，只保留「清空」
    panel.querySelector('#nr-logbar').addEventListener('click', e => {
      if (e.target.id === 'nr-logclear') { st.log = []; renderLog(); saveLogSoon(); }
      if (e.target.id === 'nr-logexport') { exportErrorLog(); }
    });
    const bestCancelEl = panel.querySelector('#nr-bestcancel');
    if (bestCancelEl) bestCancelEl.addEventListener('click', function () { _bestCancel = true; });
    const bestSyncEl = panel.querySelector('#nr-bestsync');
    if (bestSyncEl) bestSyncEl.addEventListener('click', function () { syncBestiary(); });
    const mapSyncEl = panel.querySelector('#nr-mapsync');
    if (mapSyncEl) mapSyncEl.addEventListener('click', function () { syncMaps(); });
    /* 图鉴同步：静默 —— 令牌由 Pages 上的 norroth-gh-token.txt 提供，界面不暴露任何令牌输入 */
    // 详细统计：点标题栏展开/收起，点「清空」清零
    const detbar = panel.querySelector('#nr-detbar');
    if (detbar) detbar.addEventListener('click', e => {
      if (e.target.id === 'nr-detclear') {
        st.killsByName = {}; st.gathersByKind = {}; st.gainedByKey = {}; st.gainedByRarity = {}; st.soldByRarity = {}; st.deaths = 0;
        st.kills = 0; st.roundKills = 0; st.gathers = 0;
        saveDetStats(); renderDet(); updateStats(); return;
      }
      st.detOpen = !st.detOpen; renderDet();
    });

  }

  /* ★ v2.6.0：任务（战斗 / 采集 / 爬塔）决定运行模式；「无怪采集」只在战斗任务下影响模式。
     采集任务 → gather；战斗任务 → autoGather ? auto : battle；爬塔 → 占位（UI 拦住开始）。 */
  function deriveRunMode() {
    const m = (cfg.task === 'tower') ? 'tower' : ((cfg.task === 'gather') ? 'gather' : (cfg.autoGather ? 'auto' : 'battle'));
    if (cfg.runMode !== m) {
      cfg.runMode = m; saveCfg();
      if (running && !st.paused) { st.mode = m; setStatus('已切换为「' + MODE_CN[m] + '」'); logEvent('模式切换 → ' + MODE_CN[m]); }
    }
    return m;
  }
  /* 任务专属区块显隐 + 「遇敌逃跑」只在采集任务可用 */
  function renderTaskUI() {
    const p = els.panel; if (!p) return;
    /* ★ v2.6.13：按钮高亮 / 区块显隐 → 跟随「查看中的任务」(cfg.uiTask)；
       运行中把区块标成「半锁定」（只是外观，控件仍可用）。 */
    const t = cfg.uiTask || cfg.task || 'battle';
    const locked = !!(running && !st.paused);
    /* ★ 锁文案 = 正在运行的任务（战斗 / 采集 / 爬塔） */
    const _runTask = cfg.task || 'battle';
    const _lockMsg = '🔒 ' + (TASK_CN[_runTask] || _runTask) + '运行中 · 请勿修改该页面';
    try { p.querySelectorAll('#nr-task>button').forEach(function (b) { b.classList.toggle('on', b.dataset.task === t); }); } catch (e) { /* ignore */ }
    try { p.querySelectorAll('.nr-taskbox').forEach(function (x) {
      x.style.display = (x.dataset.task === t) ? '' : 'none';
      x.classList.toggle('locked', locked);
      if (locked) x.setAttribute('data-lock', _lockMsg); else x.removeAttribute('data-lock');
    }); } catch (e) { /* ignore */ }
    /* ★ v2.6.124：「遇敌逃跑」不再只在采集任务可用 —— 勾上即生效（不需要开始挂机），
       只在「战斗 / 爬塔」任务运行中自动屏蔽。控件保持始终可用。 */
    const flee = document.getElementById('nr-gatherflee');
    if (flee) {
      flee.disabled = false;
      try { const w = document.getElementById('nr-flee-wrap'); if (w) w.style.opacity = ''; } catch (e) { /* ignore */ }
    }
  }
  function onModeSwitch() { deriveRunMode(); renderTaskUI(); }

  /* ======================= 18c. 工作外观（v1.9.0） =======================
   * 目标：让游戏页面看起来像「工程图 / 调度看板」，但**元素照常可见、可点、脚本照常工作**。
   * ★ 只用 CSS 覆盖，绝不 display:none / visibility:hidden / opacity:0：
   *   脚本多处靠 getComputedStyle(...).display 判状态（isDamaged / gatheringActive / 弹窗），
   *   藏元素会直接让脚本误判（例如以为装备破损 → 立刻跑去维修）。
   * 结构：#window_map（木纹底）→ #map_container → .map_table（地形 JPG）/ #players_container（单位）；
   *   HUD 在 body 下：.icons_hud / .character_hud / #window_chat / #hud_chat；弹窗在 #frame_container。
   * 档位：gray = 去色（保留地形）；grid = 去色 + 地形贴图换成网格（更像工程图）。
   * ===================================================================== */
  const SKIN_TITLE = '数据看板 · 内部';
  const SKIN_CSS = [
    /* 去色：只罩游戏表面，不碰小伴侣面板 */
    'html.nr-skin #window_map,html.nr-skin #frame_container,html.nr-skin #note_container,',
    'html.nr-skin #floating_chats_container,html.nr-skin #window_chat,html.nr-skin #hud_chat,',
    'html.nr-skin .icons_hud,html.nr-skin .character_hud{filter:grayscale(.94) contrast(.86) brightness(1.1)}',
    /* 木纹 / 底图换纯色 */
    'html.nr-skin #window_map{background-image:none!important;background-color:#eef0f3!important}',
    'html.nr-skin .icons_hud,html.nr-skin .character_hud,html.nr-skin #window_chat{background-image:none!important;background-color:#e8eaee!important}',
    /* 关掉动画/过渡（只限游戏区） */
    'html.nr-skin #window_map *,html.nr-skin .icons_hud *,html.nr-skin .character_hud *{animation:none!important;transition:none!important}',
    /* 左上头像 / 右上小地图 -> 灰度色块（元素保留，脚本不读它们） */
    'html.nr-skin .character_hud .avatar,html.nr-skin .character_hud .avatar img,',
    'html.nr-skin #mini_map,html.nr-skin .avatar_border,html.nr-skin .avatar_border img{',
    'filter:grayscale(1) contrast(0) brightness(1.15)!important;background-color:#c9ced6!important}',
    'html.nr-skin .character_hud .character_level_dark{filter:grayscale(1) contrast(0) brightness(1.1)!important}',
    /* 字体换系统字体 */
    'html.nr-skin #window_map,html.nr-skin .icons_hud,html.nr-skin .character_hud,html.nr-skin #window_chat{font-family:"Segoe UI",system-ui,"Microsoft YaHei",sans-serif!important}',
    /* 工作台档：地形贴图换成 48px 网格 */
    'html.nr-skin-grid .map_table{background-image:repeating-linear-gradient(0deg,#dfe3e8 0 1px,transparent 1px 48px),repeating-linear-gradient(90deg,#dfe3e8 0 1px,transparent 1px 48px)!important;background-color:#fafbfc!important;filter:none!important}',
    'html.nr-skin-grid .map_table .tile,html.nr-skin-grid .map_table .tile_poi{border-color:transparent!important}'
  ].join('');

  let _skinHowlerMuted = null, _skinMutedEls = [], _skinBaseTitle = null;
  function skinOn() { try { return !!(cfg && cfg.skin && cfg.skin !== 'off'); } catch (e) { return false; } }
  function applySkinMute() {
    const on = skinOn() && !!cfg.skinMute;
    try {
      const H = window.Howler;
      if (H && typeof H.mute === 'function') {
        if (on) { if (_skinHowlerMuted == null) _skinHowlerMuted = !!H.muted; H.mute(true); }
        else if (_skinHowlerMuted != null) { H.mute(_skinHowlerMuted); _skinHowlerMuted = null; }
      }
    } catch (e) { /* ignore */ }
    try {
      if (on) { $$q('audio, video').forEach(function (a) { if (!a.muted) { a.muted = true; _skinMutedEls.push(a); } }); }
      else { _skinMutedEls.forEach(function (a) { try { a.muted = false; } catch (e) {} }); _skinMutedEls = []; }
    } catch (e) { /* ignore */ }
  }
  function applySkinTitle() {
    try {
      if (skinOn()) { if (_skinBaseTitle == null) _skinBaseTitle = document.title; if (document.title !== SKIN_TITLE) document.title = SKIN_TITLE; }
      else if (_skinBaseTitle != null) { document.title = _skinBaseTitle; _skinBaseTitle = null; }
    } catch (e) { /* ignore */ }
  }
  function applySkin() {
    const on = skinOn();
    try {
      let st = document.getElementById('nr-skin-style');
      if (!st) { st = document.createElement('style'); st.id = 'nr-skin-style'; document.head.appendChild(st); }
      if (st.textContent !== SKIN_CSS) st.textContent = SKIN_CSS;
    } catch (e) { /* ignore */ }
    try {
      const cl = document.documentElement.classList;
      cl.toggle('nr-skin', !!on);
      cl.toggle('nr-skin-grid', cfg.skin === 'grid');
    } catch (e) { /* ignore */ }
    applySkinMute(); applySkinTitle(); applyHighlightSelf();
    try { const g = document.getElementById('nr-gameskin'); if (g) g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.skin === cfg.skin); }); } catch (e) { /* ignore */ }
    try { const b = document.getElementById('nr-skinmute'); if (b) b.classList.toggle('on', !!cfg.skinMute); } catch (e) { /* ignore */ }
    try { updateHeader(); } catch (e) { /* ignore */ }
  }
  function setSkin(v) {
    cfg.skin = (v === 'grid') ? 'grid' : 'off';
    if (cfg.skin !== 'off') cfg.skinLast = 'grid';
    saveCfg(); applySkin();
    setStatus(cfg.skin === 'off' ? '游戏界面：原版' : '游戏界面：工作台');
  }
  /* 热键 Ctrl+Shift+X：原版 ↔ 上一个工作外观 */
  document.addEventListener('keydown', function (e) {
    try {
      if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return;
      if (String(e.key || '').toLowerCase() !== 'x') return;
      e.preventDefault(); e.stopPropagation();
      setSkin(skinOn() ? 'off' : (cfg.skinLast || 'grid'));
    } catch (err) { /* ignore */ }
  }, true);

  /* ★ v1.8.0：面板上实时显示耐久状态（方便调提前量） */
  function renderDurInfo() {
    const el = document.getElementById('nr-durinfo');
    if (!el) return;
    if (!inGame()) { el.textContent = ''; return; }
    const w = durWorst(st.dur && st.dur.list);
    const bits = [];
    bits.push(w ? ('最低 ' + w.name + ' ' + w.cur + '/' + w.max + '（' + Math.round(w.pct * 100) + '%）')
                : '耐久：尚未读取（等 30s 自动刷新）');
    const r = repairNeeded();
    bits.push(r ? ('→ 需维修：' + (REPAIR_REASON_CN[r] || r)) : ('→ 无需维修（阈值 ' + cfg.repairDurPct + '%）'));
    el.textContent = bits.join(' · ');
  }

  function bindCheck(id, key, after) {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = !!cfg[key];
    el.addEventListener('change', () => { cfg[key] = el.checked; saveCfg(); if (after) after(); updateStats(); });
  }

  function bindNum(id, key, min) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = cfg[key];
    el.addEventListener('change', () => {
      let v = parseFloat(el.value);
      if (isNaN(v) || v < min) v = min;
      if (el.hasAttribute('max') && Number.isFinite(+el.max)) v = Math.min(v, +el.max);
      cfg[key] = v; el.value = v; saveCfg();
    });
  }

  function syncUI() {
    const p = els.panel;
    if (!p) return;
    p.classList.toggle('min', !!cfg.uiFold);
    if (els.fold) els.fold.textContent = cfg.uiFold ? '▸' : '▾';
    try { const g = document.getElementById('nr-gameskin'); if (g) g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.skin === cfg.skin); }); } catch (e) { /* ignore */ }
    p.querySelectorAll('#nr-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === cfg.uiTab));
    p.querySelectorAll('.pane').forEach(x => x.classList.toggle('on', x.dataset.pane === cfg.uiTab));
    try { renderTaskUI(); } catch (e) { /* ignore */ }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
    set('nr-autorespawn', cfg.autoRespawn);
    try { const _ts = document.getElementById('nr-tmode'); if (_ts) _ts.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.tmode === (cfg.targetMode || 'priority')); }); } catch (e) { /* ignore */ }
    set('nr-sweepframes', cfg.sweepFrames);
    set('nr-wmunlock', cfg.worldMapUnlock);
    set('nr-gscrap', cfg.gatherScrap); set('nr-autoevent', cfg.autoEvent);
    try { const _er = document.getElementById('nr-eventres'); if (_er) _er.value = cfg.eventRes || ''; } catch (e) { /* ignore */ }
    set('nr-gatherflee', cfg.gatherFlee);
    set('nr-mc', cfg.multiChar); try { mcRender(); } catch (e) { /* ignore */ } try { syncMcBtns(); } catch (e) { /* ignore */ }
    set('nr-highlight', cfg.highlightSelf);
    set('nr-usewaygatecity', cfg.useWaygateCity);
    set('nr-usewaygatewild', cfg.useWaygateWild);
    set('nr-autogather', cfg.autoGather); set('nr-automapswitch', cfg.autoMapSwitch);
    try { const td = document.getElementById('nr-towerdiff'); if (td) td.value = String(cfg.towerDiff || 1); } catch (e) { /* ignore */ }
    try { const tsd = document.getElementById('nr-towerstopdeath'); if (tsd) tsd.checked = !!cfg.towerStopDeath; } catch (e) { /* ignore */ }
    try { const tss = document.getElementById('nr-towerstopsupply'); if (tss) tss.checked = !!cfg.towerStopSupply; } catch (e) { /* ignore */ }
    try { const tsf = document.getElementById('nr-towerstopfloor'); if (tsf) tsf.value = cfg.towerStopFloor ? String(cfg.towerStopFloor) : ''; } catch (e) { /* ignore */ }
    try { renderTowerTownSelect(); } catch (e) { /* ignore */ }
    set('nr-petfeed', cfg.petFeedOn); syncPotionButton(); set('nr-pausesupply', cfg.pauseNoSupply);
    set('nr-repairon', cfg.repairOn); set('nr-sellon', cfg.sellOn); set('nr-depositon', cfg.autoDeposit);
    try { const _ca = document.getElementById('nr-clearaction'); if (_ca) _ca.value = cfg.clearAction || 'sell'; } catch (e) { /* ignore */ }
    try { const _sr = document.getElementById('nr-sellrarity'); if (_sr) _sr.value = cfg.sellRarity || ''; } catch (e) { /* ignore */ }
    set('nr-ginterrupt', cfg.gatherInterrupt);
    const gir = document.getElementById('nr-gintrank'); if (gir) gir.value = cfg.gatherInterruptRank;
    const sk = document.getElementById('nr-speedk'); if (sk) sk.value = cfg.speedK;
    const sv = document.getElementById('nr-speedval'); if (sv) sv.textContent = cfg.speedK + '×';
    const ws = document.getElementById('nr-winscale'); if (ws) ws.value = cfg.winScale;
    const wsv = document.getElementById('nr-winscaleval'); if (wsv) wsv.textContent = cfg.winScale + '%';
    const num = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    num('nr-hppct', cfg.hpPct); num('nr-mppct', cfg.mpPct); num('nr-petpct', cfg.petEnergyPct);
    num('nr-potdelay', cfg.potionDelayMs);
    set('nr-humandelay', cfg.humanDelay); num('nr-hdmin', cfg.humanDelayMin); num('nr-hdmax', cfg.humanDelayMax);
    set('nr-humrhythm', cfg.humanRhythm); set('nr-humjitter', cfg.humanJitter); num('nr-humjitterpct', cfg.humanJitterPct);
    set('nr-hummicro', cfg.humanMicroOn); num('nr-hummicro_pct', cfg.humanMicroPct); num('nr-hummicro_min', cfg.humanMicroMin); num('nr-hummicro_max', cfg.humanMicroMax);
    set('nr-humrotwait', cfg.humanRotWaitOn); num('nr-humrotwait_min', cfg.humanRotWaitMin); num('nr-humrotwait_max', cfg.humanRotWaitMax);
    set('nr-humidleact', cfg.humanIdleActOn); num('nr-humidleact_min', cfg.humanIdleActMin); num('nr-humidleact_max', cfg.humanIdleActMax);
    set('nr-hummistake', cfg.humanMistakeOn); num('nr-hummistake_pct', cfg.humanMistakePct);
    set('nr-navseg', cfg.navSegOn); num('nr-navseg_dist', cfg.navSegDist);
    num('nr-navseg_pause', cfg.navSegPauseMs);
    set('nr-autoovl', cfg.autoOverlord); num('nr-ovl_lead', cfg.ovlLeadSec); num('nr-ovl_leave', cfg.ovlLeaveSec);
    try { syncFarmMapUI(); } catch (e) { /* ignore */ }
    num('nr-sellfree', cfg.sellFreeMin); num('nr-sellmaxlv', cfg.sellEquipMaxLv);
    num('nr-repairdurpct', cfg.repairDurPct);
    num('nr-lvmin', cfg.monsterLvMin || 0); num('nr-lvmax', cfg.monsterLvMax || 0);
    renderDurInfo();
    renderTownSelect();
    try { syncMobListUI(); } catch (e) { /* ignore */ }
    const gp = document.getElementById('nr-gpoint'); if (gp && cfg.gatherPoint) gp.value = cfg.gatherPoint;
    renderDet();
    placePanel(false);
    updateHeader();
  }

  /* ★ v2.6.55：怪物名单标签 / 输入框的状态同步（优先名单 ↔ 黑名单） */
  function syncMobListUI() {
    const lb = document.getElementById('nr-mobmode');
    const ta = document.getElementById('nr-mobfilter');
    const black = cfg.mobListMode === 'black';
    if (lb) {
      lb.textContent = black ? '黑名单' : '怪物名单';
      lb.classList.toggle('nr-mobblack', black);
      lb.title = black
        ? '当前编辑「黑名单」：这里面的怪一律不打（和星级 / 等级 / 索敌模式都无关）。点一下切回「优先名单」。'
        : '当前编辑「优先名单」：「优先任务」模式下只打名单里的怪；「全图列表」模式下名单只决定先打谁（名单外的也打）；「优先距离」模式下名单完全不生效。点一下切到「黑名单」。';
    }
    if (ta) {
      ta.value = black ? (cfg.monsterBlacklist || '') : (cfg.monsterFilter || '');
      ta.placeholder = black ? '例：Rat King（不打）' : '例：Bear';
    }
  }
  /* ★ v2.6.76：挂机地图锁定按钮的状态同步（开关式） */
  function syncFarmMapUI() {
    const b = document.getElementById('nr-fmlock');
    const locked = !!cfg.farmMapLocked;
    if (b) {
      b.classList.toggle('on', locked);
      b.textContent = locked ? '🔒 已锁定' : '🔒 锁定';
      b.title = locked
        ? ('已锁定挂机地图「' + (cfg.farmMap ? townName(cfg.farmMap) + ' #' + cfg.farmMap : '（未记录）') + '」：重新开始挂机 / 切图都不会再改它。再点一下 = 释放。')
        : '锁定「当前所在地图」为挂机地图。开始战斗 / 采集挂机时若未锁定，会自动锁定当前地图。';
    }
  }
  function renderRankList() {
    const box = document.getElementById('nr-ranklist');
    if (!box) return;
    const counts = rankCounts();
    const list = monsterList();
    box.innerHTML = '';
    cfg.rankOrder.forEach((rank, i) => {
      const on = cfg.rankOff.indexOf(rank) < 0;
      const row = h('div', { class: 'rank ' + (on ? 'on' : 'off') });
      row.appendChild(h('span', { class: 'st', text: RANK_STAR[rank] || '' }));
      const cb = h('input', { type: 'checkbox', class: 'chk' });
      cb.checked = cfg.rankOff.indexOf(rank) < 0;
      cb.setAttribute('data-rank', rank);
      row.appendChild(cb);
      row.appendChild(h('span', { class: 'nm', text: RANK_CN[rank] || rank }));
      row.appendChild(h('span', { class: 'cnt', text: (counts[rank] || 0) + ' 只' }));
      const up = h('span', { class: 'mv' + (i === 0 ? ' dis' : ''), text: '↑' });
      up.setAttribute('data-rank', rank); up.setAttribute('data-dir', '-1');
      const dn = h('span', { class: 'mv' + (i === cfg.rankOrder.length - 1 ? ' dis' : ''), text: '↓' });
      dn.setAttribute('data-rank', rank); dn.setAttribute('data-dir', '1');
      row.appendChild(up); row.appendChild(dn);
      box.appendChild(row);
    });
    // 名单顺序预览（放在滚动区外，避免被截断）—— 显示全部（任务名单 + 手填）
    const tip = document.getElementById('nr-ordertip');
    if (tip) {
      let t = '';
      /* ★ v2.6.76：名单只分「在名单 / 不在名单」两级 → 不显示序号（序号会误导） */
      if (list.length) t = '优先名单（共 ' + list.length + '，同优先级）：' + list.join('  ');
      else if (cfg.questMonsters && !_questCache.at) t = '优先名单：任务名单读取中…（也可在下面手填）';
      if (cfg.targetMode === 'distance') t = (t ? t + '\n' : '') + '（优先距离：名单不参与选怪，只按距离）';
      else if (cfg.targetMode === 'all' && list.length) t = (t ? t + '\n' : '') + '（全图列表：名单外的怪也打，只是排在名单怪后面）';
      /* ★ v2.6.55：黑名单也预览一下 */
      const bl = parseLines(cfg.monsterBlacklist || '');
      if (bl.length) t += (t ? '\n' : '') + '黑名单（共 ' + bl.length + '，不打）：' + bl.map((n, i) => (i + 1) + '.' + n).join('  ');
      tip.textContent = t;
    }
  }

  /* ★ 详细统计（可折叠）：击杀/采集/装备稀有度/死亡 */
  function renderDet() {
    const box = document.getElementById('nr-det');
    if (!box) return;
    const tg = document.getElementById('nr-dettoggle');
    if (tg) tg.textContent = (st.detOpen ? '▾ ' : '▸ ') + '详细统计';
    box.style.display = st.detOpen ? 'block' : 'none';
    if (!st.detOpen) return;
    const rowsHTML = (obj, unit) => {
      const ks = Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
      if (!ks.length) return '<div class="dempty">暂无</div>';
      return ks.map(k => '<div class="drow"><span>' + escapeHtml(k) + '</span><b>' + obj[k] + (unit || '') + '</b></div>').join('');
    };
    const rarRows = obj => {
      const ks = Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
      if (!ks.length) return '<div class="dempty">暂无</div>';
      return ks.map(k => '<div class="drow"><span>' + rarityCN(k) + '</span><b>' + obj[k] + ' 件</b></div>').join('');
    };
    const sum = o => Object.keys(o).reduce((a, k) => a + o[k], 0);
    const sec = [];
    sec.push('<div class="dsec"><b>击杀（共 ' + sum(st.killsByName) + '）</b>' + rowsHTML(st.killsByName, ' 只') + '</div>');
    sec.push('<div class="dsec"><b>采集（共 ' + sum(st.gathersByKind) + '）</b>' + rowsHTML(st.gathersByKind, ' 次') + '</div>');
    sec.push('<div class="dsec"><b>获得装备（按稀有度）</b>' + rarRows(st.gainedByRarity) + '</div>');
    sec.push('<div class="dsec"><b>获得物品（共 ' + sum(st.gainedByKey) + '）</b>' + rowsHTML(st.gainedByKey, '') + '</div>');
    if (Object.keys(st.soldByRarity).length) sec.push('<div class="dsec"><b>已卖装备（按稀有度）</b>' + rarRows(st.soldByRarity) + '</div>');
    sec.push('<div class="dsec"><b>死亡次数</b><div class="drow"><span>本次</span><b>' + st.deaths + ' 次</b></div></div>');
    box.innerHTML = sec.join('');
  }

  /* ★ 融合：药水下拉下方的「物品预览」（小图标 + 名称 + 数量），图标来自实时背包。 */
  function renderPotionPreviews() {
    const fill = (prevId, selId, kind) => {
      const box = document.getElementById(prevId);
      if (!box) return;
      const sel = document.getElementById(selId);
      const chosen = sel ? sel.value : '';
      const list = (cfg.bagList || []).filter(it => heals(it, kind) && it.count > 0);
      const it = chosen ? list.find(x => x.key === chosen) : list.slice().sort((a, b) => b.count - a.count)[0];
      box.textContent = '';
      if (!it) { box.textContent = '（未扫描到可用物品，点「扫描背包」）'; return; }
      const img = document.createElement('img');
      img.alt = ''; img.src = _iconCache.get(it.key) || ('/images/icons/res_' + it.key + '.gif');
      img.onerror = function () { this.style.visibility = 'hidden'; };
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = it.name || it.key;
      const ct = document.createElement('span'); ct.className = 'ct'; ct.textContent = '×' + it.count;
      box.appendChild(img); box.appendChild(nm); box.appendChild(ct);
    };
    fill('nr-hpprev', 'nr-hppotion', 'hp');
    fill('nr-mpprev', 'nr-mppotion', 'mp');
  }

  function renderPotionSelects() {
    /* ★ 补血下拉只列「真的回 HP」的物品，补蓝只列「真的回 MP」的（含食物 / 双补药） */
    const fill = (id, cur, kind) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '';
      sel.appendChild(h('option', { value: '', text: '自动选择（数量最多的）' }));
      (cfg.bagList || []).filter(it => heals(it, kind)).forEach(it => {
        const hi = healInfo(it.key);
        const tag = kind === 'hp' ? ('+' + hi.life + 'HP') : ('+' + hi.mana + 'MP');
        const dual = (hi.life > 0 && hi.mana > 0) ? '★ ' : '';
        sel.appendChild(h('option', { value: it.key, text: dual + '[' + tag + '] ' + it.name + ' ×' + it.count }));
      });
      sel.value = cur || '';
      if (sel.value !== (cur || '')) sel.value = '';
    };
    fill('nr-hppotion', cfg.hpPotion, 'hp');
    fill('nr-mppotion', cfg.mpPotion, 'mp');
    renderPotionPreviews();
  }

  /* ★ 「当前地图-识别」功能已移除（2026-10-20）：没什么实际作用。refreshCurMap 保留为空实现，兼容旧调用。 */
  function refreshCurMap() { /* no-op */ }

  /* ★ 城镇下拉：只列「真能维修/清包」的图（类型 = City 或该图有 smith）。
     野外传送点（带 waygate 图标但没有 smith）不列 —— 见 serviceTowns() 的说明。 */
  function renderTownSelect() {
    const sel = document.getElementById('nr-town');
    if (!sel) return;
    const towns = serviceTowns();
    sel.innerHTML = '';
    if (!towns.length) {
      sel.appendChild(h('option', { value: '', text: '（没有可用城镇，先进游戏或去传送站看一眼）' }));
      sel.value = '';
      return;
    }
    sel.appendChild(h('option', { value: '', text: '（未选择）' }));
    towns.forEach(t => {
      const why = t.noId ? '（未探索·暂不可选）' : (t.reachable ? (t.viaWg ? '（可传送）' : '') : '（暂无路线·暂不可选）');
      const tag = (t.type === 'City' ? '🏙 ' : '') + t.name
        + (t.smith ? ' ⚒' : '')
        + why
        + (/^d+$/.test(t.id) ? ' [' + t.id + ']' : '');
      const opt = h('option', { value: t.id, text: tag });
      if (!t.reachable) opt.disabled = true;            /* ★ 没路线/没 id 的先停用，避免选了必然失败 */
      sel.appendChild(opt);
    });
    sel.value = cfg.serviceTown || '';
    if (sel.value !== (cfg.serviceTown || '')) sel.value = '';
    try { renderTowerTownSelect(); } catch (e) { /* ignore */ }
  }

  /* ★ 爬塔出发城镇下拉（空 = 自动选最近的城镇） */
  function renderTowerTownSelect() {
    const sel = document.getElementById('nr-towntown');
    if (!sel) return;
    const towns = serviceTowns();
    sel.innerHTML = '';
    sel.appendChild(h('option', { value: '', text: '自动（最近的城镇）' }));
    towns.forEach(t => {
      const why = t.noId ? '（未探索·暂不可选）' : (t.reachable ? (t.viaWg ? '（可传送）' : '') : '（暂无路线·暂不可选）');
      const tag = (t.type === 'City' ? '🏙 ' : '') + t.name + why;
      const opt = h('option', { value: t.id, text: tag });
      if (!t.reachable) opt.disabled = true;
      sel.appendChild(opt);
    });
    sel.value = cfg.towerTown || '';
    if (sel.value !== (cfg.towerTown || '')) sel.value = '';
  }

  async function verifyPath() {
    const msg = document.getElementById('nr-pathmsg');
    if (!inGame()) { if (msg) msg.textContent = '（请先进入游戏）'; return; }
    if (!cfg.serviceTown) { if (msg) msg.textContent = ''; return; }
    try {
      navLearn();
      const plan = navRoute(character.current_map, +cfg.serviceTown);
      if (!plan) {
        /* ★ v2.6.86：没有步行路线 ≠ 到不了 —— 勾了传送点的话可以传送过去 */
        const wg = waygateReachable(cfg.serviceTown);
        if (msg) msg.textContent = wg
          ? '✓ 无步行路线，但可用传送点到达「' + townName(cfg.serviceTown) + '」'
          : '✗ 暂无到「' + townName(cfg.serviceTown) + '」的路线（该区域还没探索过；也可勾选「城市/野外传送点」）';
        return;
      }
      const names = [character.current_map].concat(plan).map(id => navMapName(id) + '[' + id + ']');
      if (msg) msg.textContent = '路线（' + plan.length + ' 跳）：' + names.join(' → ');
    } catch (e) {
      if (msg) msg.textContent = '✗ ' + (e && e.message ? e.message : String(e));
    }
  }

  /* ★ 定期读一次背包：算「本次挂机获得」的增量（readBag 内部会 applyBagDiff） */
  function pollBagGain() {
    if (now() - st.bagReadAt < 20000) return;
    st.bagReadAt = now();
    readBag().then(bag => {
      if (!bag) return;
      st.sell.free = bag.free; st.sell.cap = bag.cap;
      updateStats();
    }).catch(() => { /* ignore */ });
  }

  async function refreshBagInfo(force) {
    if (st.repair.active || st.sell.active) return;
    if (!force && now() - st.sell.lastCheck < rhythm(BAG_CHECK_MS)) return;
    st.sell.lastCheck = now();
    try {
      const bag = await readBag();
      if (!bag) return;
      st.sell.free = bag.free; st.sell.cap = bag.cap;
      updateStats();
    } catch (e) { /* ignore */ }
  }

  /* ======================= 17. 启动 / 停止 ======================= */

  let resumeTimer = null;

  /* ★ 切号保护：记录「上次挂机的角色」，换了角色就不自动续挂（否则小号会去做大号的事） */
  const markRunning = mode => { try { const c = (typeof character === 'object' && character) || {}; localStorage.setItem(RUN_KEY, JSON.stringify({ mode: mode, at: now(), charId: c.id || null, charName: c.char_name || '' })); } catch (e) { /* ignore */ } };
  const clearRunMark = () => { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* ignore */ } };

  function tryResumeAfterReload() {
    if (!cfg.autoResume || running) return;
    let rec = null;
    try { rec = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); } catch (e) { rec = null; }
    if (!rec || !rec.at || (rec.mode !== 'battle' && rec.mode !== 'gather' && rec.mode !== 'auto' && rec.mode !== 'tower')) { clearRunMark(); return; }
    if (now() - rec.at > RUN_TTL) { clearRunMark(); return; }
    const what = rec.mode === 'gather' ? '采集' : (rec.mode === 'auto' ? '一键挂机' : '战斗');
    setStatus('检测到上次是' + what + '中，等待游戏就绪后自动继续…');
    const deadline = now() + RUN_TTL;
    resumeTimer = setInterval(() => {
      if (!cfg.autoResume || running) { clearInterval(resumeTimer); resumeTimer = null; return; }
      if (document.getElementById('battle_defeat')) {
        clearInterval(resumeTimer); resumeTimer = null; clearRunMark();
        setStatus('角色已阵亡，未自动恢复（复活后可手动开始）');
        return;
      }
      if (inGame()) {
        /* ★ 切号保护：上次挂机的是另一个角色 → 不续挂（但保留标记，切回去还能恢复） */
        const curId = (typeof character === 'object' && character && character.id) ? character.id : null;
        if (rec.charId && curId && String(rec.charId) !== String(curId)) {
          clearInterval(resumeTimer); resumeTimer = null;
          setStatus('角色已切换（上次挂机 #' + rec.charId + '，当前 #' + curId + '），不自动续挂');
          logEvent('切号保护：上次挂机角色 #' + rec.charId + '，当前 #' + curId + '，取消自动续挂');
          return;
        }
        clearInterval(resumeTimer); resumeTimer = null; beginRun(rec.mode, { resume: true }); setStatus('已自动恢复上次的' + what); return;
      }
      if (now() > deadline) { clearInterval(resumeTimer); resumeTimer = null; setStatus('等待游戏就绪超时，未自动恢复'); }
    }, 500);
  }

  function beginRun(mode, opts) {
    if (mode !== 'auto' && mode !== 'battle' && mode !== 'gather' && mode !== 'tower') mode = 'battle';
    if (running && st.mode === mode) return;
    if (running) stop();
    if (!inGame()) { setStatus('请先进入游戏'); return; }
    st.paused = false;
    runSeq++;
    running = true;
    st.mode = mode;
    st.kills = 0; st.gathers = 0; st.roundKills = 0;
    st.move = null; st.blacklist = {}; st.reach = null;
    st.potionFail = {}; st.inCollect = false; st.target = null;
    st.map = character ? character.current_map : null;
    Object.assign(st.repair, { active: false, cooldownUntil: 0, failCount: 0, smith: null });
    Object.assign(st.sell, { active: false, cooldownUntil: 0, lastCheck: 0, force: false });
    st.gatherRetryAt = 0;
    st.gatherFighting = false;
    st.gatherIdleSince = 0; st.gatherResync = 0;
    eventReset(); st.event.lastCheckAt = 0;
    st.dur = null; st.durBusy = false; st.gatherDur = null;
    st.watch = { x: 0, y: 0, exp: 0, kills: 0, at: 0, heals: 0 };
    st.frozen = { pos: '', at: 0, hits: 0 };
    st.perf = { samples: [], lastAt: 0, lastExp: 0, total: 0 };
    st.runStart = now();
    st.runElapsed = 0;
    st.returnRetryAt = 0; st.returnFails = 0;
    if (!(opts && opts.resume) && (!isTowerMap(character.current_map) || +character.current_map === TOWER_MAP_MIN)) {
      st.towerFloor = 0; st.towerGateSeen = false; st.towerEntered = 0;
      st.towerGateAt = 0; st.towerOff = null; st.tq = null;
      st.towerNavAt = 0; st.towerOpenAt = 0; st.towerQuestLogAt = 0;
      st.towerRoomTries = 0; st.towerDoorAt = 0; st.towerRemainLogAt = 0;
      st.towerDoorsUsed = {}; st.towerDoorLogAt = 0;
    }
    // ★ 详细统计按「本次挂机」重置
    st.killsByName = {}; st.gathersByKind = {}; st.gainedByKey = {}; st.gainedByRarity = {}; st.soldByRarity = {}; st.deaths = 0;
    st.bagReadAt = 0;
    initBagSnap();
    /* ★ 挂机地图只在「用户主动开始」时更新：
       - 断线续挂 / 复活后自动恢复（opts.resume）沿用上次记录，别把复活点覆盖成挂机地图；
       - 站在重生泉水（1000）上开始时也不覆盖 —— 那里没怪，一旦覆盖就再也回不去了（实测踩过）。 */
    const curMap = character ? String(character.current_map) : '';
    /* ★ v2.6.54：锁定后不再改写挂机地图（用户要求：不再因为切图 / 重新开始而变化）。 */
    if (cfg.farmMapLocked) {
      if (!cfg.farmMap && curMap) cfg.farmMap = curMap;   // 锁了但还没记录过 → 用当前地图补上
      else if (cfg.farmMap && curMap && String(curMap) !== String(cfg.farmMap)) {
        logEvent('挂机地图已锁定 → 保持「' + townName(cfg.farmMap) + '」（当前在「' + currentMapName() + '」）');
      }
    } else if (curMap && !(opts && opts.resume) && curMap !== String(RESPAWN_MAP)) cfg.farmMap = curMap;
    else if (curMap && !cfg.farmMap) cfg.farmMap = curMap;   // 兜底：还没有挂机地图时至少记一个
    /* ★ v2.6.76：采集 / 一键挂机开始时固定采集点 —— 运行期间下拉不再随换图变化。 */
    if (mode === 'gather' || mode === 'auto') {
      const _gp = document.getElementById('nr-gpoint');
      const _gv = _gp ? String(_gp.value || '').trim() : '';
      if (_gv) cfg.gatherPoint = _gv;
    }
    cfg.runMode = mode; saveCfg();
    resetDefeat();
    clearNotifyTitle();
    try {
      if (cfg.notifyOnStop && typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
    } catch (e) { /* ignore */ }
    refreshCurMap();
    const what = mode === 'gather' ? '采集' : (mode === 'auto' ? '一键挂机' : (mode === 'tower' ? '爬塔' : '战斗'));
    setStatus('已开始' + what);
    logEvent('开始' + what);
    /* ★ v2.6.149：开始 / 断线续挂都先核对是否还在挂机地图，不在就先回图再干活。
       覆盖「锁定图 ≠ 当前图」的两种情况：弹窗选「保持原图」，或刷新后续挂。
       爬塔模式自己的导航负责，不插手。 */
    if (mode !== 'tower') ensureAtFarmMap((opts && opts.resume) ? '断线续挂' : '开始挂机');
    if (!timer) timer = rhythmTimer(tick, TICK);
    markRunning(mode);
    syncRunButtons();
  }

  /* 已挂机时长（暂停期间不计） */
  function runElapsedMs() {
    return (st.runElapsed || 0) + ((running && st.runStart) ? (now() - st.runStart) : 0);
  }

  /* ★ 折叠标题栏迷你按钮的图标：用 SVG 而不是▶/⏸ 字符，
     字符在不同字体下的行高/基线不一样，会看起来“没居中”。 */
  const ICON_PLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.8 2.6 9.2 6 3.8 9.4Z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="3.4" y="2.6" width="1.9" height="6.8" rx=".6"/><rect x="6.7" y="2.6" width="1.9" height="6.8" rx=".6"/></svg>';

  function syncRunButtons() {
    const el = id => document.getElementById(id);
    const busy = st.repair.active || st.sell.active;
    const lbl = running ? '⏸ 暂停' : (st.paused ? '▶ 继续' : null);
    const s = el('nr-start');
    if (s) { s.textContent = lbl || '▶ 开始挂机'; s.classList.toggle('dan', running); s.classList.toggle('pri', !running); }
    const sn = el('nr-sellnow'); if (sn) sn.disabled = busy;
    const hb = el('nr-hbtn');                       // ★ 折叠态迷你开始/暂停
    if (hb) {
      hb.innerHTML = running ? ICON_PAUSE : ICON_PLAY;
      hb.title = running ? '暂停挂机（保留本次统计）' : (st.paused ? '继续挂机' : '开始挂机');
      hb.classList.toggle('run', running);
    }
    const stp = el('nr-stop'); if (stp) stp.disabled = !(running || st.paused);
    if (els.dot) {
      els.dot.className = 'dot' + (running ? ' on' : '');
    }
    /* ★ v2.6.13：运行态变了 → 同步任务区块的「半锁定」外观 */
    try { renderTaskUI(); } catch (e) { /* ignore */ }
  }

  /* ★ 暂停：停掉循环，但保留本次统计与挂机地图 */
  function pause() {
    if (!running) return;
    st.runElapsed = runElapsedMs();
    runSeq++;
    navCancelSeq++; navBusy = false; navHideBar();
    running = false;
    st.paused = true;
    clearRunMark();
    if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
    if (timer) { stopTimer(timer); timer = null; }
    navAutoSeq++;
    st.mapSwitch.active = false; st.mapSwitch.idleSince = 0; st.roam = { idx: 0, bad: {} };
    st.phase = 'idle'; st.move = null; st.gatherFighting = false;
    eventReset(); st.event.lastCheckAt = 0;
    st.repair.active = false; st.sell.active = false; st.sell.force = false;
    st.bank.active = false; st.bank.force = false; st.tripManual = false;
    resetDefeat(); closeSellFrame(); abortWalk();
    closeGatheringWindows();
    logEvent('已暂停挂机（本次统计保留）');
    setStatus('已暂停（本次统计保留）');
    syncRunButtons();
  }

  /* ★ 继续：从暂停恢复，不清空统计 */
  function resume() {
    if (running || !st.paused) return;
    if (!inGame()) { setStatus('请先进入游戏'); return; }
    st.paused = false;
    runSeq++;
    running = true;
    st.runStart = now();
    /* ★ 修 bug：原来只清 st.move / st.phase。暂停期间换图/切号后，st.reach / st.inCollect /
       st.gatherRetryAt 等会带着旧值回来 → 「显示继续采集却不动」。这里和 beginRun 一样全部复位。 */
    st.move = null; st.phase = 'idle';
    st.blacklist = {}; st.reach = null; st.target = null;
    st.gatherRetryAt = 0; st.gatherFighting = false; st.inCollect = false;
    st.gatherDur = null; st.dur = null; st.gatherIdleSince = 0; st.gatherResync = 0;
    const what = st.mode === 'gather' ? '采集' : (st.mode === 'auto' ? '一键挂机' : (st.mode === 'tower' ? '爬塔' : '战斗'));
    logEvent('继续' + what);
    /* ★ v2.6.148：继续挂机先核对「是不是还在挂机地图」——暂停期间被带离就先回图再干活。
       爬塔模式自己的导航负责，不插手。 */
    if (st.mode !== 'tower' && ensureAtFarmMap('继续' + what)) {
      /* 状态与待办导航已在 ensureAtFarmMap 里设好 */
    } else {
      setStatus('已继续' + what);
    }
    if (!timer) timer = rhythmTimer(tick, TICK);
    markRunning(st.mode);
    syncRunButtons();
  }

  /* ★ v2.6.76：开始挂机前处理挂机地图锁定（战斗 / 采集 / 一键挂机）：
     · 未锁定 → 自动把当前地图设为锁定地图；
     · 已锁定但当前地图不同 → 弹窗问是否替换。
     爬塔不参与；断线续挂 / 复活恢复（opts.resume）不弹窗、不改写。 */
  async function ensureFarmMapLock(mode) {
    if (mode === 'tower') return;
    if (!inGame()) return;
    const curMap = character ? String(character.current_map) : '';
    if (!curMap || curMap === String(RESPAWN_MAP)) return;
    if (!cfg.farmMapLocked) {
      cfg.farmMap = curMap; cfg.farmMapLocked = true; saveCfg(); syncFarmMapUI(); updateStats();
      logEvent('未锁定挂机地图 → 自动锁定当前地图「' + currentMapName() + '」（#' + curMap + '）');
      return;
    }
    if (cfg.farmMap && String(cfg.farmMap) !== curMap) {
      const ok = await nrConfirm(
        '已锁定挂机地图「' + townName(cfg.farmMap) + ' #' + cfg.farmMap + '」，\n' +
        '但你现在在「' + currentMapName() + ' #' + curMap + '」。\n\n' +
        '是否把挂机地图替换为当前地图？',
        '替换', '保持原图');
      if (ok) {
        logEvent('挂机地图替换：' + townName(cfg.farmMap) + ' #' + cfg.farmMap + ' → ' + currentMapName() + ' #' + curMap);
        cfg.farmMap = curMap; saveCfg(); syncFarmMapUI(); updateStats();
      } else {
        logEvent('保持锁定挂机地图「' + townName(cfg.farmMap) + '」，当前在「' + currentMapName() + '」');
      }
    }
  }

  /* ★ 开始 / 暂停 / 继续 三态合并到一个按钮 */
  async function toggleRun(mode) {
    if (running) { pause(); return; }
    /* ★ 暂停中再点：一律「继续」，即使中途换了模式也不清统计
       （原来 mode 变了会走 beginRun → 静默清空本次统计，容易误伤） */
    if (st.paused) { st.mode = mode; resume(); return; }
    try { await ensureFarmMapLock(mode); } catch (e) { /* ignore */ }
    beginRun(mode);
  }

  /* 清理运行态（不写日志 / 不改状态栏），供 stop() 与手动行程收尾复用 */
  function stopCore() {
    navCancelSeq++; navBusy = false; navHideBar();
    runSeq++;
    running = false;
    st.paused = false;
    st.runElapsed = 0;
    st.mode = null;
    navClearPending();
    st.tripManual = false;
    st.altTrip = false;
    st.target = null;
    clearRunMark();
    if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
    if (timer) { stopTimer(timer); timer = null; }
    navAutoSeq++;                                        // ★ 让正在跑的自动切图立即中止
    st.mapSwitch.active = false; st.mapSwitch.idleSince = 0; st.roam = { idx: 0, bad: {} };
    st.homeOffSince = 0; st.homeGuardAt = 0;
    st.phase = 'idle';
    st.move = null;
    st.gatherFighting = false;
    st.gatherDur = null;
    eventReset(); st.event.lastCheckAt = 0;
    st.repair.active = false;
    st.sell.active = false; st.sell.force = false;
    st.bank.active = false; st.bank.force = false;
    resetDefeat();
    closeSellFrame();
    abortWalk();
    // 采集/拾取是游戏自己在循环的，只停插件定时器不够，必须把这类窗口关掉
    closeGatheringWindows();
    /* ★ v2.6.76：停止后解除采集点冻结，让下拉按当前地图重新同步。 */
    try { detectGatherPoints(true); } catch (e) { /* ignore */ }
  }

  function stop(reason) {
    stopCore();
    if (reason) { logEvent('已停止：' + reason); notify('挂机已停止', reason); }
    else logEvent('已停止挂机');
    try { localStorage.setItem(STOP_KEY, JSON.stringify({ reason: reason || '手动停止', t: (new Date()).toTimeString().slice(0, 8) })); } catch (e) { /* ignore */ }
    setStatus(reason ? ('已停止：' + reason) : '已停止');
    syncRunButtons();
  }

  /* ======================= 18. 初始化 ======================= */

  /* ★ 地图数据（MapDB，第 11 节）在 boot() 之前就已初始化完毕。 */
  let navReady = false;

  /* ======================= 17b. 在线更新（v2.6.77） =======================
   * 远端版本号来源：<UPD_META>，由 tools/publish_userscript.ps1 在每次发布时生成，
   * 形如 {"version":"2.6.77","date":"2026-10-21","notes":"...","url":"..."}。
   * 行为：
   *   1) boot() 里调一次 checkUpdate()（5 分钟节流，落 localStorage）；
   *   2) 远端更高 -> 右上角版本号变金色可点角标 + 日志 + 桌面通知；
   *   3) 点角标 / 高级页「检查更新」按钮 -> 打开 UPD_SCRIPT，交给 Tampermonkey 弹安装框。
   * 失败（离线 / 被墙 / 404）一律静默，绝不影响挂机。
   * ---------------------------------------------------------------------- */
  let updInfo = null;      // { version, url, notes } —— 远端有新版时才非空

  function verParts(v) { return String(v || '').split('.').map(function (x) { return parseInt(x, 10) || 0; }); }
  /* a > b -> 1 / a < b -> -1 / 相等 -> 0 */
  function verCmp(a, b) {
    const x = verParts(a), y = verParts(b), n = Math.max(x.length, y.length);
    for (let i = 0; i < n; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0 ? 1 : -1; }
    return 0;
  }

  function paintUpdateBadge() {
    const el = document.getElementById('nr-ver');
    if (el) {
      if (updInfo) {
        el.classList.add('upd');
        el.textContent = 'v' + SCRIPT_VER + ' ↑' + updInfo.version;
        el.title = '发现新版本 v' + updInfo.version + '（当前 v' + SCRIPT_VER + '）\n点击更新' +
                   (updInfo.notes ? '\n' + updInfo.notes : '');
      } else {
        el.classList.remove('upd');
        el.textContent = 'v' + SCRIPT_VER;
        el.title = '当前版本 v' + SCRIPT_VER;
      }
      el.style.cursor = 'pointer';
    }
    const st2 = document.getElementById('nr-updstate');
    if (st2) {
      st2.textContent = updInfo
        ? ('发现新版本 v' + updInfo.version + '（当前 v' + SCRIPT_VER + '）')
        : ('已是最新 v' + SCRIPT_VER);
      st2.style.color = updInfo ? '#ffd76e' : '#9aa4b2';
    }
  }

  function openUpdate() {
    const url = (updInfo && updInfo.url) || UPD_SCRIPT;
    logEvent('在线更新：打开安装页 ' + url);
    try { window.open(url, '_blank', 'noopener'); } catch (e) { try { location.href = url; } catch (e2) { /* ignore */ } }
  }

  function checkUpdate(force) {
    try {
      if (!force) {
        const last = parseInt(localStorage.getItem('nr_upd_at') || '0', 10) || 0;
        if (Date.now() - last < UPD_MIN_MS) { paintUpdateBadge(); return; }
      }
      localStorage.setItem('nr_upd_at', String(Date.now()));
    } catch (e) { /* 隐私模式等：不节流，继续查 */ }
    try {
      const ctl = (typeof AbortController === 'function') ? new AbortController() : null;
      if (ctl) setTimeout(function () { try { ctl.abort(); } catch (e) { /* ignore */ } }, 8000);
      fetch(UPD_META + '?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.version) return;
          if (verCmp(j.version, SCRIPT_VER) <= 0) { updInfo = null; paintUpdateBadge(); return; }
          updInfo = j;
          paintUpdateBadge();
          logEvent('在线更新：发现新版本 v' + j.version + '（当前 v' + SCRIPT_VER + '）');
          notify('小伴侣有新版本 v' + j.version, '点面板右上角版本号即可更新');
        })
        .catch(function () { /* 离线 / 网络异常：静默 */ });
    } catch (e) { /* ignore */ }
  }

  function boot() {
    if (!document.body || !document.head) { setTimeout(boot, 300); return; }
    loadLog();                                           // ★ 先读回上次的日志/停止原因
    loadDetStats();                                      // ★ 读回详细统计
    if (!buildUI()) { setTimeout(boot, 300); return; }   // 面板没建起来就继续等
    if (cfg.autoPotion) startPotionLoop();               // ★ 药品独立循环：开着就自己跑，不等挂机
    if (cfg.petFeedOn) startPetLoop();                   // ★ 喂宠独立循环：开着就自己跑，不等挂机
    installSpeedPatch();                                 // 动画加速：jQuery 可能还没加载，交给下面的轮询
    applyWinScale(cfg.winScale);                         // ★ 高级：套用弹窗缩放
    startSpeedMeter();
    mcLoadRot();                                         // ★ 多角色轮转状态（落盘）
    try { syncMcBtns(); } catch (e) { /* ignore */ }      // ★ v2.6.79：按落盘状态刷「启动全部/停止」「暂停/继续」
    tryResumeAfterReload();
    try { document.addEventListener('visibilitychange', onVisibilityChange); } catch (e) { /* ignore */ }
    /* ★ v2.6.77：在线更新 —— 版本号角标可点 + 每次进游戏查一次远端版本 */
    const vEl = document.getElementById('nr-ver');
    if (vEl) vEl.addEventListener('click', function () { if (updInfo) openUpdate(); });
    const upBtn = document.getElementById('nr-updcheck');
    if (upBtn) upBtn.addEventListener('click', function () { checkUpdate(true); });
    paintUpdateBadge();
    checkUpdate(false);
  }

  /* ── 兜底[安装器] ─────────────────────────────────────────────
   * 症状：jQuery / 游戏客户端异步加载，脚本启动时补丁装不上。
   * 判据：installSpeedPatch() 返回 false（jQuery 还没就绪）。
   * 动作：轮询重装（另见 installZoomUnlock 的 2s 轮询、installMapCoordFix 的幂等重试）。
   * 上限：600 次。
   * 高级参数：不受影响。
   * ─────────────────────────────────────────────────────────── */
  let spdTries = 0;
  /* ★ 空闲时也每 5 秒刷一次统计（挂机时由主循环负责），否则「攻速/连击」等异步读到的信息不会渲染 */
  rhythmTimer(() => { if (!running && document.getElementById('nr-stats')) { try { updateStats(); } catch (e) { /* ignore */ } } }, 5000);
  /* ★ v2.6.57：休整页的耐久信息定期刷新（原来只在 syncUI 时更新，盯着看也不会变）。
     周期走 rhythm()：开了「节拍抖动」就会在 30s 上下浮动；
     readEquipDur(false) 自带 30s 缓存（同样受 rhythm 影响），缓存新就不发请求，不会和主循环重复请求。 */
  rhythmTimer(function () {
    if (!inGame()) { try { renderDurInfo(); } catch (e) { /* ignore */ } return; }
    readEquipDur(false).then(function () { try { renderDurInfo(); } catch (e) { /* ignore */ } },
                              function () { try { renderDurInfo(); } catch (e) { /* ignore */ } });
  }, 30000);
  /* ★ 多角色：定期刷新采集队列显示 */
  rhythmTimer(function () { if (cfg.multiChar) { try { mcPollQueue(); } catch (e) { /* ignore */ } } }, 15000);
  /* ★ 真人化：无用操作（随机开面板再关） */
  rhythmTimer(function () { try { idleActTick(); } catch (e) { /* ignore */ } }, 30000);
  /* ★ 多角色轮转：独立于挂机的调度器（切角色后页面重载，挂机不一定是开着的） */
  rhythmTimer(function () { try { if (cfg.multiChar && rot && rot.on) mcTick(); } catch (e) { /* ignore */ } }, 1200);
  /* ★ 多角色：副角色页遇怪不还手（关自动战斗 + 逃跑），行程期间每 0.7s 检查一次 */
  setInterval(function () { try { if (st.altTrip) altPageCombatPolicy(); } catch (e) { /* ignore */ } }, 700);
  /* ★ 离线模式结算弹窗：多角色模式下即使没开挂机也点掉（切号后常出现；单人模式不打扰） */
  rhythmTimer(function () { try { if (cfg.multiChar) closeIdleResultDialog(); } catch (e) { /* ignore */ } }, 5000);

  const spdBoot = setInterval(() => {
    spdTries++;
    if (installSpeedPatch() || spdTries > 600) clearInterval(spdBoot);
  }, 100);
  window.addEventListener('load', () => installSpeedPatch());

  boot();

  /* ======================= 18b. 地图缩放解锁（新前端） =======================
   * 新前端自带滚轮缩放：给 #map_container 设 transform: scale(s)，s ∈ [1,2]（step 0.2），
   * 而且 wheel 处理器里 e.preventDefault() 会把浏览器的 Ctrl+滚轮缩放也一起挡掉。
   * 这里：
   *   1) Ctrl/⌘ + 滚轮 → 直接放行（stopImmediatePropagation 拦下游戏的处理器，让它不再 preventDefault）→ 浏览器缩放；
   *   2) 普通滚轮 → 用更宽的范围缩放 #map_container，并同步 .map_table 的 font-size(=12/scale，游戏原逻辑)。
   * 用 document 的 capture 阶段监听，先于游戏绑在 #map_container 上的处理器跑。
   *
   * ★★ v1.9.3 修「缩放后点击错位」：
   *   新前端把「屏幕坐标 → 地图本地坐标」抽成了全局函数
   *     mapEventToLocalXY(e, el, scale) => { click_x: (e.clientX - rect.left)/scale - 100, ... }
   *   其中 rect 来自 getBoundingClientRect()（**会被我们的 transform 影响**），
   *   而 scale 用的是它自己那个闭包变量（只在游戏自己的滚轮处理器里变）。
   *   我们自己改 transform 后，游戏那边 scale 还是旧值 → 除错 → 点哪都偏。
   *   所以这里把 mapEventToLocalXY 包一层，强制用 DOM 上**真实**的缩放值。
   *   拿不到这个函数（旧前端 legacy，点击换算写死在页面里）就不接管滚轮，
   *   免得把点击搞坏 —— 旧前端本来也没有滚轮缩放。
   * 可用 cfg.zoomUnlock 关闭（默认开）。
   * ============================================================== */
  const ZOOM_MIN = 0.4, ZOOM_MAX = 4, ZOOM_STEP = 0.2;
  let _zoomWheelBound = false;

  /* 读 #map_container 当前真实的 CSS 缩放（transform 矩阵首项）；谁设的都算 */
  function currentMapScale(el) {
    try {
      const node = (el && el.nodeType) ? el : ((el && el[0]) || document.getElementById('map_container'));
      if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) return 1;
      const tr = node.ownerDocument.defaultView.getComputedStyle(node).transform;
      if (!tr || tr === 'none') return 1;
      const m = /matrix(?:3d)?\(([^)]+)\)/.exec(tr);
      if (!m) return 1;
      const s = parseFloat(m[1].split(',')[0]);
      return (isFinite(s) && s > 0) ? s : 1;
    } catch (e) { return 1; }
  }

  /* ★ 把游戏的「屏幕坐标→地图坐标」换算改成用真实缩放值（幂等） */
  function installMapCoordFix() {
    if (typeof window.mapEventToLocalXY !== 'function') return false;   // 旧前端没有这个函数
    if (window.mapEventToLocalXY.__nrFixed) return true;
    const orig = window.mapEventToLocalXY;
    const wrapped = function (e, el, scale) {
      const s = currentMapScale(el);
      return orig.call(this, e, el, (s > 0 ? s : scale));
    };
    wrapped.__nrFixed = true;
    window.mapEventToLocalXY = wrapped;
    return true;
  }

  function applyMapZoom(scale) {
    try {
      const $ = jq(); if (!$) return;
      $('#map_container').css('transform', 'scale(' + scale + ')');
      $('.map_table').css('font-size', (12 / scale) + 'px');
      if (typeof window.updateCompass === 'function') { try { window.updateCompass(); } catch (e) { /* ignore */ } }
    } catch (e) { /* ignore */ }
  }

  function installZoomUnlock() {
    if (!cfg.zoomUnlock) return;
    if (!document.getElementById('map_container')) return;   // 不在旅行地图页
    installMapCoordFix();                                    // ★ 幂等：确保坐标换算被修好
    if (_zoomWheelBound) return;
    _zoomWheelBound = true;
    document.addEventListener('wheel', function (e) {
      const t = e.target;
      const mc = (t && t.closest) ? t.closest('#map_container') : null;
      if (!mc) return;
      if (e.ctrlKey || e.metaKey) { e.stopImmediatePropagation(); return; }   // 浏览器缩放：放行
      /* ★ 只有能修好坐标换算时才接管滚轮；否则让游戏自己缩放（它自己的 scale 是自洽的） */
      if (!installMapCoordFix()) return;
      e.preventDefault();
      e.stopImmediatePropagation();                                           // 拦下游戏自己的缩放处理器
      // 地图有 1s transform 过渡：滚轮以已命令的目标值累计，不能用动画中间值。
      // 坐标换算仍由 currentMapScale 读取实时值，避免过渡期间点格偏移。
      const target = /^scale\(\s*([\d.]+)\s*\)$/.exec(mc.style.transform || '');
      const cur = target && Number.isFinite(+target[1]) && +target[1] > 0 ? +target[1] : currentMapScale(mc);
      const next = (e.deltaY > 0) ? Math.max(ZOOM_MIN, cur - ZOOM_STEP)
                                  : Math.min(ZOOM_MAX, cur + ZOOM_STEP);
      applyMapZoom(Math.round(next * 100) / 100);
    }, true);
  }
  rhythmTimer(function () { try { installZoomUnlock(); } catch (e) { /* ignore */ } }, 2000);
  installZoomUnlock();

  /* ======================= 19. 跨地图导航 =======================
   * 世界地图「Map Details」里注入「🧭 导航」按钮，自动沿地图连接走过去（不花传送卷轴）。
   *   数据源  window.door_tiles = {"目标图id": "ID<x>-<y>"}（服务端按当前图内联注入）
   *   图会随游玩自动补全（localStorage: norroth_nav_learn_v1）
   * ⚠ 站在门上再 walkTo 同格不触发换图 → 先走开一格再走回
   * ⚠ 踩到任务格会弹 frame_Quest，walkTo 被它挡住 → 导航中主动关掉
   * ⚠ 世界地图开着时 createDialog 不加载内容 → 开 Map Details 前先关世界地图
   * ============================================================== */
  /* ★ 自动学习地图信息用的 localStorage 键（边学边存） */
  const NAV_LEARN_KEY = 'norroth_nav_learn_v1';

  /* ★★ 实测快照（v1.7.0）：把「当前这张图」的真实数据抓成一份 live 记录。
     只有在该图**确实加载完**、而且 door_tiles 与地图 DOM 互相印证时才返回，否则返回 null。
     为什么需要守卫：换图那一瞬间 window.map / window.door_tiles 可能还是上一张图的，
     不校验就会把旧图的数据写到新图的 id 上。 */
  let _liveSkipLogAt = 0;
  /* ★ v2.6.106：_liveLastId/_liveLastIdAt/_liveNameMiss/LIVE_NAME_MISS_MAX 已删除 ——
     id 直接取 window.map.id，不再需要「等 id 稳定」和「按名字兜底」。 */
  /* ★ v2.6.98：出口类格子（含门 / 传送站 / 走私路线 / 秘密通路 / 副本入口 …）。
     这些是静态地图要素，进图就实测，随地图数据一起共享。 */
  const EXIT_TILE_ACTIONS = ['gate', 'waygate', 'entrance', 'event_gate', 'smugglers_route', 'dungeon',
                             'portal', 'teleport', 'secret', 'secret_passage', 'passage', 'stairs', 'tunnel', 'cave', 'exit'];
  /* ★★ v2.6.106：地图渲染的「身份 id」—— 学地图数据时唯一可靠的 key。
     实测（2026-10-22，证据 tmp/_render_body.xml + tmp/probe_maptrace2.log）：
     换图时服务端 /includes/do/travel.php 的响应里有一段脚本**原子地**设置
       character.current_map = N;  map = {..., "id": N};  window.walkable_tiles = ...;  door_tiles = ...;
     但 character.current_map 还会被另一条通道（角色状态推送）先改掉 ——
     100ms 采样 513 次里有 264 次（51%）出现 character.current_map != window.map.id。
     所以「这份 door_tiles / points / DOM 属于哪张图」的唯一可靠答案 = window.map.id。
     用 character.current_map 当 key，就会把上一张图的门写到新图名下
     （实测：Ururg 229 被写进 Trescan 281 的 4 扇门 280/323/324/342 → 回图时被传到 Ururg 原地打转）。 */
  let _rmIdWarnAt = 0;
  function renderMapId() {
    try {
      const wm = window.map;
      const id = +((wm && wm.id) || 0);
      if (id > 0) return id;
      /* 诊断：window.map 在、但没有 id（游戏改版？）→ 60 秒最多报一次，别静默失去学习能力 */
      if (wm && now() - _rmIdWarnAt > 60000) {
        _rmIdWarnAt = now();
        try { logEvent('地图渲染 id 读不到（window.map 没有 id 字段）→ 这一拍不学地图数据'); } catch (e) { /* ignore */ }
      }
      return 0;
    } catch (e) { return 0; }
  }
  /* 渲染是否「已经跟上角色状态」：两边一致 = 这次换图彻底走完（可以放心用 door_tiles） */
  function renderSynced() {
    const rid = renderMapId();
    if (!(rid > 0)) return false;
    try { return +character.current_map === rid; } catch (e) { return false; }
  }
  function liveMapSnapshot() {
    if (!inGame()) return null;
    /* ★ v2.6.106：key 改成「渲染自己的 id」（window.map.id），不再用 character.current_map。
       两者是同一段脚本原子赋值的，但 character.current_map 会被另一条通道先改掉 →
       用它当 key 就会把上一张图的门写到新图名下（假门）。
       因为 id 与 door_tiles 同源，这里也不再需要「等 id 稳定 3 秒」那道闸。 */
    const id = renderMapId();
    if (!(id > 0)) return null;
    const pts = window.points || [];
    if (!pts.length || !document.querySelector('.map_table')) return null;   /* 地图还没渲染完 */
    const poiEls = $$q('.map_table .tile_poi[action]');
    const coordSet = {};
    poiEls.forEach(function (el) { const c = el.getAttribute('coords'); if (c) coordSet[c] = 1; });
    const dt = window.door_tiles || {};
    const edges = []; let doors = 0, matched = 0;
    const actAt = {};
    poiEls.forEach(function (el) { const c = el.getAttribute('coords'); if (c) actAt[c] = String(el.getAttribute('action') || ''); });
    Object.keys(dt).forEach(function (to) {
      const p = String(dt[to]).replace('ID', '').split('-');
      const x = +p[0], y = +p[1];
      if (!(x > 0) || !(y > 0)) return;
      doors++; if (coordSet[x + '-' + y]) matched++;
      /* ★ v2.6.104：给边打类型 —— 只有 gate 可步行；副本/入口等一律 other（不参与寻路） */
      const act = actAt[x + '-' + y] || '';
      const kind = (act === 'gate') ? 'gate' : ((act === 'smugglers_route') ? 'smugglers' : 'other');
      edges.push([id, +to, x, y, kind]);
    });
    /* 一致性校验：door_tiles 里的门坐标必须能在当前地图 DOM 的 tile_poi 里找到。
       （换图瞬间两者不同步 → 直接放弃这次快照，等下一个 tick） */
    if (doors && matched < doors) {
      if (now() - _liveSkipLogAt > 60000) {
        _liveSkipLogAt = now();
        logEvent('地图实测跳过：door_tiles 与地图 DOM 不一致（' + matched + '/' + doors + '）· map' + id);
      }
      return null;
    }
    const g = [], gt = [];
    poiEls.forEach(function (el) {
      if ((el.getAttribute('action') || '') !== 'gathering') return;
      const n = (el.getAttribute('name') || '').trim();
      if (n && g.indexOf(n) < 0) g.push(n);
      const cd = (el.getAttribute('coords') || '').split('-');
      const gx = +cd[0], gy = +cd[1];
      if (n && gx > 0 && gy > 0) gt.push([gx, gy, n]);
    });
    /* ★ v2.6.98：出口类格子（走私路线 / 秘密通路 / 副本入口 / 传送站 …） */
    const exits = [];
    poiEls.forEach(function (el) {
      const a = String(el.getAttribute('action') || '');
      if (EXIT_TILE_ACTIONS.indexOf(a) < 0) return;
      const cd = (el.getAttribute('coords') || '').split('-');
      const ex = +cd[0], ey = +cd[1];
      if (!(ex > 0 && ey > 0)) return;
      exits.push([ex, ey, a, String(el.getAttribute('name') || '').trim()]);
    });
    const m = [], mon = [];
    let es = []; try { es = scanEnemies(); } catch (e) { /* ignore */ }
    es.forEach(function (e) {
      if (!e.name) return;
      if (m.indexOf(e.name) < 0) m.push(e.name);
      if (e.icon) mon.push([e.name, e.icon]);
    });
    const wm = window.map || {};
    const wmName = String(wm.name || '').trim();
    /* ★ v2.6.106：删掉 v2.6.62/65 那套「等 3 秒 + 名字不符就作废」的守卫。
       原因：id 现在直接取 window.map.id，名字和 id 同源，不可能再串图；
       而「Dark Boreal」这种同名图有 12 张（324-327/342-347/349/350），按名字校验反而会误判。
       名字只用来兜底：实测名优先，读不到才退回登记名。 */
    let refName = '';
    try { if (mapDict && mapDict.byId) refName = String(mapDict.byId[id] || '').trim(); } catch (e) { refName = ''; }
    if (!refName) { const seed = MAPDB_SEED.maps[String(id)]; if (seed && seed.name) refName = String(seed.name).trim(); }
    return { id: id, name: wmName || refName, type: String(wm.type || '').trim(), g: g, gt: gt, m: m, mon: mon, edges: edges, exits: exits };
  }

  /* ---- 到图即刷新：每到一张图 / 每 2.5 秒，用实测数据更新该 map id 的记录 ---- */
  function poiLearnNow() {
    const live = liveMapSnapshot();
    if (!live) return;
    const diff = MapDB.syncLive(live.id, live);
    if (diff.length) {
      try { renderTownSelect(); } catch (e) { /* ignore */ }
      logEvent('地图已更新：' + (live.name || '#' + live.id) + ' · ' + diff.join('；'), { key: 'map:' + live.id, windowMs: 60000 });
    }
  }

  /* 导出「边玩边学」的地图数据（格式和地图记录器一致，可被记录器 / 本脚本再次导入） */
  function exportPoiLearn() {
    try {
      const out = MapDB.exportRecorder();
      const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'norroth_maprec_' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      setStatus('已导出地图数据：' + MapDB.count() + ' 张图 / ' + MapDB.edgeCount() + ' 条连接');
      logEvent('导出地图数据 ' + MapDB.count() + ' 图');
    } catch (e) { setStatus('导出失败：' + (e && e.message ? e.message : String(e))); }
  }

  let navBusy = false;
  let navBar = null;          /* ★ v2.6.124：导航状态条（提前声明，供 navWalkPlanTo 更新进度） */

  /* ★ 地图数据来源：内置种子 MAPDB_SEED 已把导航图 + 到访记录写死，开箱即用。
   *   下面的 navImportRecorder 只在玩家「手动」点「同步记录器 / 导入 JSON」时才读记录器数据。 */
  const MAPREC_KEY = 'norroth_maprec_v1';
  let _maprecStamp = null;
  function navImportRecorder(force, data) {
    let o = data || null;
    if (!o) { try { o = JSON.parse(localStorage.getItem(MAPREC_KEY) || 'null'); } catch (e) { o = null; } }
    if (!o || !o.maps) return 0;
    const stamp = String(o.updated || '') + '|' + Object.keys(o.maps).length + '|' + (o.edges || []).length;
    if (!force && stamp === _maprecStamp) return 0;
    if (!data) _maprecStamp = stamp;
    const r = MapDB.importRecorder(o);
    if (r.edges || r.visited || r.poi) { try { renderTownSelect(); } catch (e) { /* ignore */ } }
    return r.edges;
  }
  navReady = true;

  /* ★ 自动切图会话号：stop() 时自增，正在跑的自动切图据此立即中止 */
  let navAutoSeq = 0;

  /* ★ 是不是「普通图」（用于切图时的优先级，不是硬条件）。
     以前对没拜访过的图靠名字/地貌猜（SPECIAL_NAME / SPECIAL_TERRAIN），
     结果 map260 / map235 这种还没登记的副本入口名字猜不出来 → fail-open 放行 → 踩上去就进副本。
     现在改成 fail-closed：没有可靠 type 就不认。
     ※ 真正决定「能不能切」的硬条件是门格子的 action —— 见 isSwitchableDoor()。 */
  function isNormalMap(id) {
    const t = MapDB.type(id);
    if (t) return t === 'Normal' || t === 'City';   // 普通野外图或城镇
    return false;                                   // ★ 未知图一律不放行
  }

  /* ★ 门格子的真实 action。
     window.door_tiles 只给「目标图 → 坐标」，不区分普通门和副本入口；
     服务端把每个门渲染成 .map_table .tile_poi[action]，必须现读：
       gate    = 普通出口（可以切）
       dungeon = 副本入口（踩上去就进副本，绝不切） */
  function doorTileEl(destId) {
    const dt = (window.door_tiles || {})[String(destId)];
    if (!dt) return null;
    const p = String(dt).replace('ID', '').split('-');
    const x = +p[0], y = +p[1];
    if (!(x > 0 && y > 0)) return null;
    return document.querySelector('.map_table .tile_poi[coords="' + x + '-' + y + '"]');
  }
  function doorActionTo(destId) {
    const el = doorTileEl(destId);
    return el ? (el.getAttribute('action') || '') : '';
  }
  /* 换图后地图容器有一小段渲染空窗：等门格子出现再判（读不到返回 ''，调用方按 fail-closed 处理） */
  async function doorActionToWait(destId, alive) {
    for (let w = 0; w < 10; w++) {
      const a = doorActionTo(destId);
      if (a) return a;
      if (alive && !alive()) return '';
      await sleep(300);
    }
    return '';
  }
  /* ★ 能不能切到这张图：唯一硬条件 = 门格子 action === 'gate'（副本 / 读不到格子一律不放行） */
  function isSwitchableDoor(destId) { return doorActionTo(destId) === 'gate'; }

  function navMapName(id) { return MapDB.name(id); }

  /* ★ v2.6.97：步行 ≤ 这么多跳就直走，不用传送点。
     实测踩坑：副角色在 Owranbu 修完，采集图就在隔壁（1 跳），却还跑去传送站、甚至往 Owranbu 传。 */
  const NAV_WALK_PREFER = 3;
  function navRoute(from, to) {
    /* ★ 地图 id 统一成数字：nearestTowerTown() / 城镇下拉框给的是字符串（"5"），
       而这里用严格相等（t === to）做 BFS 匹配，字符串永远匹配不上数字 → 返回 null（表现为「无步行路线」）。 */
    from = +from; to = +to;
    if (isNaN(from) || isNaN(to)) return null;
    if (from === to) return [];
    const q = [[from, []]], seen = {}; seen[from] = 1;
    while (q.length) {
      const cur = q.shift(), c = cur[0], p = cur[1];
      const nx = MapDB.adjWalk(c);
      for (let i = 0; i < nx.length; i++) {
        const t = nx[i];
        if (seen[t]) continue;
        seen[t] = 1;
        const np = p.concat(t);
        if (t === to) return np;
        q.push([t, np]);
      }
    }
    return null;
  }

  /* ★ v2.6.104：图上最短跳数（只走可步行边）；不可达 = Infinity */
  function navDist(a, b) {
    a = +a; b = +b;
    if (!(a > 0) || !(b > 0)) return Infinity;
    if (a === b) return 0;
    const q = [a], seen = {}; seen[a] = 0;
    while (q.length) {
      const c = q.shift();
      const nx = MapDB.adjWalk(c);
      for (let i = 0; i < nx.length; i++) {
        const t = nx[i];
        if (seen[t] !== undefined) continue;
        seen[t] = seen[c] + 1;
        if (t === b) return seen[t];
        q.push(t);
      }
    }
    return Infinity;
  }

  /* 自动学习：每次换图把当前图的 door_tiles 并进图里 */
  function navLearn() {
    try {
      /* ★ v2.6.106：key 用「渲染自己的 id」。用 character.current_map 会在换图瞬间
         把上一张图的门写到新图名下（假门，实测踩过）。 */
      const id = renderMapId();
      if (!(id > 0)) return;
      const dt = window.door_tiles || {};
      const store = JSON.parse(localStorage.getItem(NAV_LEARN_KEY) || '{}');
      let ch = false;
      Object.keys(dt).forEach(function (to) {
        const p = String(dt[to]).replace('ID', '').split('-');
        const x = +p[0], y = +p[1];
        if (isNaN(x) || isNaN(y)) return;
        /* ★ v2.6.106：门坐标必须真的出现在当前地图的 DOM 里才认。
           读不到格子 = 这份 door_tiles 不属于当前渲染（换图空窗）→ 整条跳过，绝不写。 */
        const el = document.querySelector('.map_table .tile_poi[coords="' + x + '-' + y + '"]');
        if (!el) return;
        const k = id + '>' + to;
        if (!store[k]) { store[k] = [x, y]; ch = true; }
        /* ★ v2.6.104：读格子 action 给边打类型（读不到 = 保留原类型，不降级） */
        const act = String(el.getAttribute('action') || '');
        const kind = (act === 'smugglers_route') ? 'smugglers' : (act === 'gate' ? 'gate' : (act ? 'other' : undefined));
        if (MapDB.addEdge(id, +to, x, y, kind)) ch = true;
      });
      if (ch) {
        localStorage.setItem(NAV_LEARN_KEY, JSON.stringify(store));
        /* ★ 学到新边 = 地图连通性变了 → 城镇下拉的「有没有路线」要跟着变，
           否则手动走一趟拿到路线后，下拉里那一项还是灰的。 */
        try { renderTownSelect(); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
  }

  /* ========================= 模块 B：地图内点到点寻路（唯一） =========================
   * 走到 (gx,gy) 并等条件成立，返回 'ok' | 'timeout' | 'cancel'。
   * 脚本里**所有「在一张图内移动」都必须走这里**（内部就是 walkTileCore 走格引擎）。
   * opts:
   *   until       'arrive'（默认，站到目标格）| 'mapChange'（换图；用于门 / 传送站，站上后会重触发）
   *   cond        自定义成功条件（优先级最高，传了就不看 until）
   *   timeoutMs   超时（战斗 / 挡路弹窗 / 阵亡等待不计入）
   *   alive()     返回 false 立即中止（cancel）
   *   combatText / onStuck  透传给走格引擎
   * ========================================================================== */
  function navWalkTile(gx, gy, opts) {
    opts = opts || {};
    const until = opts.until || 'arrive';
    let from = null;
    try { from = character.current_map; } catch (e) { return Promise.resolve('cancel'); }
    const cond = opts.cond || (until === 'mapChange'
      ? function () { return character.current_map !== from; }
      : function () { return character.x === gx && character.y === gy; });
    return walkTileCore(gx, gy, {
      timeoutMs: opts.timeoutMs,
      alive: opts.alive || function () { return true; },
      cond: cond,
      retrigger: (opts.retrigger !== undefined) ? !!opts.retrigger : (until === 'mapChange'),
      combatText: opts.combatText,
      onStuck: opts.onStuck,
      heal: supply                      /* ★ v2.6.156：导航途中也要等自动回血 */
    });
  }

  async function navHop(destId, alive) {
    for (let a = 0; a < 4; a++) {
      if (alive && !alive()) return false;
      if (character.current_map === destId) return true;
      const dt = (window.door_tiles || {})[String(destId)];
      if (!dt) return false;
      /* ★ 只走普通门：dungeon（副本入口）绝不踩 —— 这是「能不能切这张图」的唯一硬条件 */
      const act = await doorActionToWait(destId, alive);
      if (act !== 'gate') {
        setStatus('「' + navMapName(destId) + '」的入口是「' + (act || '未知') + '」，不是普通门，不切这张图');
        logEvent('拒绝切图：' + navMapName(destId) + ' 门 action=' + (act || '未知'));
        return false;
      }
      const p = String(dt).replace('ID', '').split('-');
      await navWalkTile(+p[0], +p[1], { until: 'mapChange', timeoutMs: 90000, alive: alive });
      await sleep(2500);
      if (alive && !alive()) return false;
      if (character.current_map === destId) return true;
    }
    return character.current_map === destId;
  }

  /* ======================= Smugglers Route（走私路线：付金币换图） =======================
   * 实测（2026-10-22，map 90 格子 45-60 → 目的地 Sirocco Springs #76）：
   *   格子 action = 'smugglers_route'。走到格上 → execTileAction('smugglers_route')
   *   → createDialog('Smugglers Route','','ajax','/modal/smugglers_route') → 面板 #frame_SmugglersRoute。
   *   面板内容：
   *     · 目的地 id  = .avatar 的 style 里 world_map_<id>_<wx>_<wy>.jpg（兜底 [data-map-info-id]）
   *     · 目的地名/等级 = .frame-content h2 两行
   *     · Ride 按钮 = .frame-content button.btn-danger，onclick = createDialog(...,'/modal/smugglers_route?ride',true)
   *   点 Ride **直接换图，没有二次确认**（用户确认）。
   *   花费 = 目的地等级下界 × 80 铜；脚本**不预检**金币，交给游戏 —— 没换图 = 失败 → 报错停止（不回退）。
   * ================================================================================== */

  /* 找本图的 smugglers 格子（action=smugglers_route） */
  function findSmugglersTile() {
    let el = document.querySelector('.map_table [action=smugglers_route]');
    if (el) return el;
    const tiles = Array.prototype.slice.call(document.querySelectorAll('.map_table .tile_poi'));
    return tiles.find(function (e) { return /smugglers?_route/i.test(e.getAttribute('action') || ''); }) || null;
  }

  /* 读面板里的目的地地图 id（0 = 读不到） */
  function smugglersDestId(frame) {
    if (!frame) return 0;
    try {
      const av = frame.querySelector('.avatar');
      const bg = av ? (av.getAttribute('style') || '') : '';
      const m = /world_map_(\d+)_/.exec(bg);
      if (m) return +m[1];
      const blk = frame.querySelector('[data-map-info-id]');
      if (blk) return (+blk.getAttribute('data-map-info-id')) || 0;
    } catch (e) { /* ignore */ }
    return 0;
  }

  /* 走到本图 smugglers 格子 → 开面板 → 点 Ride → 等换图。
     返回换图后的 id（失败 0）。destId 只用于「校验面板目的地是否一致」，不匹配就放弃（不乱传）。 */
  async function rideSmugglers(destId, alive) {
    if (!inGame()) return 0;
    const from = character.current_map;
    const tile = findSmugglersTile();
    if (!tile) { logEvent('走私路线：本图没有 smugglers_route 格子'); return 0; }
    const c = (tile.getAttribute('coords') || '').split('-');
    const gx = +c[0], gy = +c[1];
    if (!(gx > 0 && gy > 0)) { logEvent('走私路线：格子坐标读不到'); return 0; }
    if (!(character.x === gx && character.y === gy)) {
      await navWalkTile(gx, gy, { timeoutMs: 70000, alive: alive });
      if (alive && !alive()) return 0;
      if (!(character.x === gx && character.y === gy)) {
        logEvent('走私路线：走不到格子 ' + gx + '-' + gy + '（当前 ' + character.x + '-' + character.y + '），放弃');
        return 0;
      }
    }
    /* 开面板（可能已经开着） */
    let frame = document.getElementById('frame_SmugglersRoute');
    if (!frame) {
      humanDefer(function () { try { window.execTileAction('smugglers_route'); } catch (e) { /* ignore */ } });
      for (let i = 0; i < 30 && !frame; i++) { await sleep(300); frame = document.getElementById('frame_SmugglersRoute'); }
    }
    if (!frame) { logEvent('走私路线：面板没打开（#frame_SmugglersRoute）'); return 0; }
    await sleep(500);
    if (alive && !alive()) return 0;

    const panelDest = smugglersDestId(frame);
    if (destId && panelDest && +destId !== +panelDest) {
      logEvent('走私路线：面板目的地是「' + navMapName(panelDest) + '」，与预期「' + navMapName(destId) + '」不符 → 放弃（不乱传）');
      try { closeFrameById('frame_SmugglersRoute'); } catch (e) { /* ignore */ }
      return 0;
    }
    const btn = Array.prototype.slice.call(frame.querySelectorAll('button, a, input[type=button]'))
      .find(function (b) { return /ride/i.test((b.textContent || b.value || '').trim()); });
    if (!btn) { logEvent('走私路线：面板里没找到 Ride 按钮'); return 0; }

    setStatus('走私路线：付费前往「' + navMapName(panelDest || destId) + '」…');
    logEvent('走私路线 Ride → ' + navMapName(panelDest || destId) + '（' + (panelDest || '?') + '）');
    try { humanClick(btn); } catch (e) { /* ignore */ }
    for (let i = 0; i < 30; i++) { await sleep(500); if (character.current_map !== from) break; }
    if (character.current_map === from) {
      logEvent('走私路线：点了 Ride 但没换图（金币不够 / 未解锁？）→ 停止');
      try { closeFrameById('frame_SmugglersRoute'); } catch (e) { /* ignore */ }
      return 0;
    }
    /* ★ v2.6.161：换图后**必须等新图渲染完成**（window.map.id === character.current_map）再返回。
       否则紧接着的下一跳会拿上一张图的 window.door_tiles 规划 → 找不到门 → 过图失败
       （症状：过了 smuggler route 之后下一张图的导航卡住 / 走不动）。对照 navHop 换图后的 sleep(2500)。 */
    const readyUntil = now() + 12000;
    while (!renderSynced() && now() < readyUntil) {
      if (alive && !alive()) break;
      await sleep(200);
    }
    if (!renderSynced()) logEvent('走私路线：新图渲染未确认（door_tiles 可能未就绪），下一跳会重试');
    logEvent('走私路线：已到达 ' + currentMapName());
    return character.current_map;
  }

  /* ========================= 模块 A：地图到地图导航（唯一） ===========================
   * 决策流程（详见 skill/references/pathfinding-redesign.md）：
   *   ① cur == dest → 完成
   *   ② dest 是城市 且 城市传送点开：Noble → 世界地图免费传（无跳数限制）；失败/非 Noble → 传送站 Cities 页
   *   ③ dest 是野外锚点 且 野外传送点开：传送站逻辑(dest,'wilderness')
   *   ④ 有步行通路 → 步行（gate 边 + smuggler 边）
   *   ⑤ 无步行通路（泉水/死胡同）→ 强制传送逃生
   * 脚本里**所有「换图」都必须走这里**。
   * opts: { alive, allowCity, allowWild, walkOnly }
   * ============================================================================ */

  const WAYGATE_SLACK = 5;          /* 传送站判据里的固定 +5 */
  const FREE_FALLBACK_MAP = 5;      /* 都没开传送点时，免费传送的兜底图（El Caspar） */

  function isWildAnchor(id) {
    id = +id; if (!(id > 0)) return false;
    try { return WAYGATE_WILD.some(function (w) { return +w.id === id; }); } catch (e) { return false; }
  }
  /* 「有传送站的地图」= 城市(16) ∪ 野外锚点(22)（用户确认，不用实测学习） */
  function waygateMaps() {
    const out = [];
    try { MapDB.cities().forEach(function (c) { if (c && +c.id > 0 && out.indexOf(+c.id) < 0) out.push(+c.id); }); } catch (e) { /* ignore */ }
    try { WAYGATE_WILD.forEach(function (w) { if (w && +w.id > 0 && out.indexOf(+w.id) < 0) out.push(+w.id); }); } catch (e) { /* ignore */ }
    return out;
  }
  /* 离 cur 跳数最小的「有传送站的地图」（含 cur 自己） */
  function nearestWaygateMap(cur) {
    cur = +cur; if (!(cur > 0)) return 0;
    let best = 0, bl = Infinity;
    waygateMaps().forEach(function (id) {
      const d = navDist(cur, id);
      if (d < bl) { bl = d; best = id; }
    });
    return best;
  }
  /* Noble = buff subscription（"Noble Potion"）→ 城市世界地图传送免费。5 分钟内存缓存，传不动即清。 */
  let _nobleCache = null, _nobleAt = 0;
  function nobleActive() {
    if (_nobleCache !== null && now() - _nobleAt < 300000) return _nobleCache;
    let v = false;
    try {
      if (document.querySelector('.buff_bar img[res="subscription"]')) v = true;
      else if (character && Array.isArray(character.buffs) && character.buffs.indexOf('subscription') >= 0) v = true;
    } catch (e) { /* ignore */ }
    _nobleCache = v; _nobleAt = now();
    return v;
  }

  /* 按边类型执行一跳：smugglers → Ride；其余 → 走普通门 */
  async function navHopStep(destId, alive) {
    const kind = MapDB.edgeKind(+character.current_map, +destId);
    if (kind === 'smugglers') {
      const out = await rideSmugglers(destId, alive);
      return +out === +destId;
    }
    return await navHop(destId, alive);
  }

  /* 纯步行：沿「可步行图」逐跳走到 destId（gate + smuggler 边）。返回是否到达。 */
  async function navWalkPlanTo(destId, alive) {
    for (let guard = 0; guard < 3; guard++) {
      if (alive && !alive()) return false;
      if (+character.current_map === +destId) return true;
      const plan = navRoute(character.current_map, destId);
      if (!plan) return false;
      let failed = false;
      for (let i = 0; i < plan.length; i++) {
        if (alive && !alive()) return false;
        if (+character.current_map === +destId) return true;
        navProgressHop(i, plan.length, destId, plan[i]);   /* ★ v2.6.124：第 N/M 跳进度 */
        const ok = await navHopStep(plan[i], alive);
        if (!ok) { failed = true; break; }
      }
      if (+character.current_map === +destId) return true;
      if (!failed) return false;
      /* 走岔了：重算一次再试（最多 3 轮） */
    }
    return +character.current_map === +destId;
  }

  /* ── 导航「待办目的地」（v2.6.119）─────────────────────────────
   * 症状：导航没走到目的地就「就地开始任务」（采集 / 打怪）；或中途被带偏后不再回正。
   * 做法：设一个待办目的地；主循环每 tick 调 navPendingTick()：
   *   · 已到达 → 清除；
   *   · 没到 → 从当前位置**重新规划**（navToMap 按当前图重算路线），期间**不开始挂机任务**；
   *   · 连续失败 NAV_PENDING_MAX_TRIES 次 → 放弃并提示（避免永远不干活）。
   * 说明：这是通用的导航意图，不再写死在「阵亡回图」里 —— 任何模块都能 navSetPending()。
   * ─────────────────────────────────────────────────────────── */
  const NAV_PENDING_MAX_TRIES = 5;
  let navPending = null;   /* { dest, reason, tries, nextAt } */
  function navPendingDest() { return navPending ? navPending.dest : 0; }
  function navSetPending(dest, reason) {
    const d = +dest;
    if (!(d > 0)) return;
    if (navPending && navPending.dest === d) { if (reason) navPending.reason = String(reason); return; }
    navPending = { dest: d, reason: String(reason || ''), tries: 0, nextAt: 0 };
    logEvent('导航待办：去「' + navMapName(d) + '」' + (reason ? '（' + reason + '）' : ''));
  }
  function navClearPending(why) {
    if (!navPending) return;
    if (why) logEvent('导航待办完成：' + why);
    navPending = null;
  }
  /* ★ v2.6.148：把「当前不在挂机地图」登记成待办导航。
     暂停继续 / 断线续挂都属于「接着上次的挂机」——先回挂机地图再干活，
     否则会在暂停期间被带到的别的地图上直接开打/采集。
     返回 true = 已登记待办（主循环会先导航，不开始任务）。 */
  function ensureAtFarmMap(reason) {
    if (!cfg.farmMap) return false;
    if (!inGame()) return false;
    if (String(character.current_map) === String(cfg.farmMap)) return false;
    /* ★ v2.6.150：在活动图 / 活动战斗区里不抢导航 —— 活动模块（eventTick）自己负责进出。
       否则「切副角色收东西再切回主角色」时，恢复挂机会登记「回挂机地图」待办，
       把角色从活动图拽走 → 之后再也进不去活动（表现为「开始步行导航，不知道往哪跑」）。 */
    const _m = String(character.current_map);
    if (_m === String(EVENT_MAP_ID) || EVENT_COMBAT_MAPS[_m]) return false;
    navSetPending(cfg.farmMap, reason || '回挂机地图');
    setStatus('当前不在挂机地图，先导航回「' + navMapName(cfg.farmMap) + '」…');
    return true;
  }
  /* ★ v2.6.160：兜底[回图] —— 采集 / 一键挂机 / 战斗 期间，只要被「非阵亡」的原因
     （活动弹出、游戏自身传送、被怪推走…）带离挂机地图，就自动登记「回挂机地图」待办导航，
     由 navPendingTick 负责导航回去，回去后继续原来的任务。

     背景：阵亡回图（returnToFarm）和活动结束回图（eventTick 分支②）各自只覆盖自己那一条路径；
     其它原因把角色带离挂机图时没有任何回图逻辑 —— 实测（2026-10-26，角色 Noble #1378）：
     采集锁定 El Caspar(#5) 后把角色挪到 Brisban Pond(#6)，脚本就地开打，再也不回 #5。

     不插手的场景（各自有专门逻辑 / 属于正常行为）：
       · 没有挂机地图 / 爬塔模式 / 锁图刷怪（cfg.autoMapSwitch，本来就要离开挂机图）；
       · 正在切图、导航、维修、清包、存仓、手动行程、阵亡复活；
       · 活动进出中 / 活动图 / 活动战斗区 / Overlord 房 / 副本 / 塔（各自模块负责进出）；
       · 刚离开挂机图还没到 HOME_GUARD_DELAY_MS（抖动 / 换图渲染中）。
     上限：不停止；两次登记之间至少隔 HOME_GUARD_COOLDOWN_MS，避免和 navPendingTick 的
          「连续 5 次放弃」互相打架。 */
  const HOME_GUARD_DELAY_MS = 10000;
  const HOME_GUARD_COOLDOWN_MS = 90000;
  function homeGuardTick() {
    if (!running || !inGame()) return false;
    if (st.mode === 'tower') return false;
    if (!cfg.farmMap) return false;
    if (cfg.autoMapSwitch) return false;                 /* 锁图刷怪：本来就要在挂机图与邻图之间来回 */
    if (String(character.current_map) === String(cfg.farmMap)) { st.homeOffSince = 0; return false; }
    if (!st.homeOffSince) st.homeOffSince = now();
    if (navBusy || st.mapSwitch.active || st.returning) return false;
    if (st.repair.active || st.sell.active || st.bank.active || st.tripManual) return false;
    if (st.event && st.event.phase !== 'idle') return false;
    const m = String(character.current_map);
    if (m === String(EVENT_MAP_ID) || EVENT_COMBAT_MAPS[m]) return false;
    if (typeof ovlHolding === 'function' && ovlHolding()) return false;
    if (typeof inDungeonOrTower === 'function' && inDungeonOrTower()) return false;
    if (document.getElementById('battle_defeat')) return false;
    if (now() - st.homeOffSince < HOME_GUARD_DELAY_MS) return false;
    if (now() - (st.homeGuardAt || 0) < HOME_GUARD_COOLDOWN_MS) return false;
    st.homeGuardAt = now();
    logEvent('兜底[回图]：被带离挂机地图「' + navMapName(cfg.farmMap) + '」（当前在 ' + currentMapName() + '）→ 自动导航回去');
    navSetPending(cfg.farmMap, '回到挂机地图');
    return true;
  }

  /* 返回 true = 本 tick 被「待办导航」接管（主循环要 return，别开始任务） */
  function navPendingTick() {
    if (!navPending) return false;
    if (!running || !inGame()) return false;
    const p = navPending;
    if (+character.current_map === p.dest) { navClearPending('已到达「' + navMapName(p.dest) + '」'); return false; }
    /* 正在维修 / 清包 / 切图 / 导航 → 让路，不插手 */
    if (navBusy || st.repair.active || st.sell.active || st.mapSwitch.active) return true;
    if (now() < (p.nextAt || 0)) { setStatus('导航中 → ' + navMapName(p.dest) + '（等待重试）…'); return true; }
    p.tries = (p.tries || 0) + 1;
    if (p.tries > NAV_PENDING_MAX_TRIES) {
      const nm = navMapName(p.dest);
      navClearPending();
      logEvent('导航待办：连续 ' + NAV_PENDING_MAX_TRIES + ' 次没到「' + nm + '」→ 放弃（先就地挂机）');
      try { notify('导航放弃', '一直没到「' + nm + '」，先就地挂机'); } catch (e) { /* ignore */ }
      return false;
    }
    p.nextAt = now() + Math.min(300000, 30000 * Math.pow(2, Math.min(4, p.tries - 1)));
    logEvent('导航待办：还没到「' + navMapName(p.dest) + '」（当前 ' + currentMapName() + '）→ 重新规划（第 ' + p.tries + ' 次）');
    setStatus('导航中 → ' + navMapName(p.dest) + '（第 ' + p.tries + ' 次）…');
    (async function () {
      try {
        const ok = await navToMap(p.dest, { alive: function () { return running && navPending === p; }, allowCity: true, allowWild: true });
        if (ok && navPending === p) navClearPending('已到达「' + navMapName(p.dest) + '」');
      } catch (e) { /* ignore */ }
    })();
    return true;
  }

  /* 传送站逻辑：dist(cur,最近传送站) + 5 < dist(cur,dest) 才绕去传送站 */
  async function navWaygateLogic(dest, page, alive) {
    const cur = +character.current_map;
    const d = navDist(cur, dest);
    if (d < WAYGATE_SLACK) return false;                 /* 太近，直接走 */
    const w = nearestWaygateMap(cur);
    if (!(w > 0)) return false;
    const dw = navDist(cur, w);
    if (!(dw + WAYGATE_SLACK < d)) return false;         /* 绕去传送站不划算 */
    if (alive && !alive()) return false;
    if (+character.current_map !== w) {
      logEvent('传送站：先走到最近的有传送站的图「' + navMapName(w) + '」（' + dw + ' 跳）');
      if (!await navWalkPlanTo(w, alive)) return false;
    }
    if (alive && !alive()) return false;
    const out = await navWaygateOut(dest, alive, page, true);
    return +out === +dest;
  }

  /* 逃生目标：按开关选「城市∪锚点里离目的地跳数最小」的（平手优先城市）；都没开 → 免费图 5。 */
  function escapeTarget(dest, allowCity, allowWild) {
    if (!allowCity && !allowWild) return FREE_FALLBACK_MAP;
    const cands = [];
    if (allowCity) { try { MapDB.cities().forEach(function (c) { if (c && +c.id > 0) cands.push({ id: +c.id, city: 1 }); }); } catch (e) { /* ignore */ } }
    if (allowWild) { try { WAYGATE_WILD.forEach(function (w) { if (w && +w.id > 0) cands.push({ id: +w.id, city: 0 }); }); } catch (e) { /* ignore */ } }
    let best = 0, bl = Infinity, bc = -1;
    cands.forEach(function (c) {
      const d = navDist(c.id, dest);                      /* 到「目的地」的跳数 */
      if (best === 0 || d < bl || (d === bl && c.city > bc)) { bl = d; best = c.id; bc = c.city; }
    });
    return best;
  }

  /* 强制传送逃生（泉水/死胡同） */
  async function navEscapeStuck(dest, alive, allowCity, allowWild) {
    const cur = +character.current_map;
    if (!(cur > 0)) return false;
    const target = escapeTarget(dest, allowCity, allowWild);
    if (!(target > 0) || target === cur) return false;
    const page = isTownMap(target) ? 'cities' : 'wilderness';
    logEvent('无通路：从传送站逃生 → 「' + navMapName(target) + '」');
    let out = await navWaygateOut(target, alive, page, true, true);   /* ★ v2.6.118：卡住时允许退而求其次（随便出去一个） */
    if (!out) out = await navWalkToAnyExit(alive);        /* 本图没有传送站 → 走任意出口 */
    return !!out;
  }

  /* ★ v2.6.117：目的地是野外图（不是城市、也不是野外锚点）时，
     优先「传送到离目的地最近的传送站图（城市∪野外锚点）+ 步行」，
     而不是从当前位置一路走过去。
     场景：挂机图设 Dark Boreal（324/325/…，只有 327 是野外锚点），
           复活 / 出活动后从很远的地方走 → 又慢又容易卡。
     返回 true = 已经用这条路到达目的地。 */
  async function navTeleportNear(dest, alive, allowCity, allowWild) {
    const cur = +character.current_map;
    const D = +dest;
    if (!(D > 0) || !(cur > 0) || cur === D) return false;
    if (isTownMap(D) || isWildAnchor(D)) return false;      /* 这两种走已有分支 */
    const anchor = nearestWaygateMap(D);                    /* 离目的地最近的传送站图 */
    if (!(anchor > 0) || anchor === D) return false;
    const page = isTownMap(anchor) ? 'cities' : 'wilderness';
    if (page === 'cities' && !allowCity) return false;
    if (page === 'wilderness' && !allowWild) return false;
    const dWalk = navDist(cur, D);                          /* 从当前位置直接走到目的地 */
    const dAnchor = navDist(anchor, D);                     /* 从锚点走到目的地 */
    if (!(dAnchor < Infinity)) return false;
    /* 只有「传送到锚点再走」明显比「直接走」省时，才绕传送站（不然就直走） */
    if (!(dAnchor + WAYGATE_SLACK < dWalk)) return false;
    if (alive && !alive()) return false;
    logEvent('传送站：目的地「' + navMapName(D) + '」较远 → 先传到「' + navMapName(anchor) + '」再走（' + dAnchor + ' 跳）');
    /* 先走到「离当前位置最近的传送站图」（若当前就在传送站图则直接传） */
    const w = nearestWaygateMap(cur);
    if (w > 0 && w !== cur) {
      logEvent('传送站：先走到最近的有传送站的图「' + navMapName(w) + '」');
      if (!await navWalkPlanTo(w, alive)) return false;
    }
    if (alive && !alive()) return false;
    const out = await navWaygateOut(anchor, alive, page, true);
    if (+out !== +anchor) return false;
    if (await navWalkPlanTo(D, alive)) return true;
    return false;
  }

  /* ===== 模块 A 主函数 ===== */
  async function navToMap(destId, opts) {
    opts = opts || {};
    const dest = +destId;
    if (!inGame() || !(dest > 0)) return false;
    if (+character.current_map === dest) return true;
    const cancelSeq = navCancelSeq;
    const callerAlive = opts.alive || function () { return true; };
    const alive = function () { return cancelSeq === navCancelSeq && callerAlive(); };
    const allowCity = (opts.allowCity === undefined) ? !!cfg.useWaygateCity : !!opts.allowCity;
    const allowWild = (opts.allowWild === undefined) ? !!cfg.useWaygateWild : !!opts.allowWild;
    const walkOnly = !!opts.walkOnly;
    if (navBusy && !opts._nested) return false;
    if (!opts._nested) navBusy = true;
    try {
      navLearn();
      if (!walkOnly) {
        /* ② 目的地是城市 + 城市传送点开 */
        if (isTownMap(dest) && allowCity) {
          if (nobleActive()) {
            const out = await navWorldTeleport(dest, alive);
            if (alive && !alive()) return false;
            if (+out === dest) return true;
            _nobleCache = null;                           /* 传不动 → 可能不是 Noble 了，下次重判 */
          }
          if (await navWaygateLogic(dest, 'cities', alive)) return true;
          if (alive && !alive()) return false;
        }
        /* ③ 目的地是野外锚点 + 野外传送点开 */
        if (allowWild && isWildAnchor(dest)) {
          if (await navWaygateLogic(dest, 'wilderness', alive)) return true;
          if (alive && !alive()) return false;
        }
        /* ③.5 ★ v2.6.117：目的地是野外图（非城市 / 非锚点）→ 先传到离它最近的传送站图再走 */
        if (await navTeleportNear(dest, alive, allowCity, allowWild)) return true;
        if (alive && !alive()) return false;
      }
      /* ④ 有步行通路 → 步行 */
      if (navRoute(character.current_map, dest)) {
        if (await navWalkPlanTo(dest, alive)) return true;
        if (alive && !alive()) return false;
      }
      if (walkOnly) return +character.current_map === dest;
      /* ⑤ 无步行通路 → 有界逃生；塔层 → 塔外入口 → 城市可能需要两段。 */
      for (let attempt = 0; attempt < 3; attempt++) {
        const from = +character.current_map;
        if (!await navEscapeStuck(dest, alive, allowCity, allowWild)) break;
        if (alive && !alive()) return false;
        if (+character.current_map === dest || await navWalkPlanTo(dest, alive)) return true;
        if (alive && !alive()) return false;
        if (+character.current_map === from) break;   // 没换图不反复重试
        const readyUntil = now() + 10000;
        while (!renderSynced() && now() < readyUntil) {
          if (alive && !alive()) return false;
          await sleep(200);
        }
        if (!renderSynced()) break;                 // 不用上一张图的门继续规划
      }
      return +character.current_map === dest;
    } finally { if (!opts._nested && cancelSeq === navCancelSeq) navBusy = false; }
  }

  /* 传送门回主城（死亡恢复） */
  /* ======================= 世界地图传送（野外 → 城镇） =======================
   * 实测 2026-10-19：世界地图 = #world_map_container（openWorldMap() 打开），
   *   每张已探索地图一个 <g id="map_<id>" map_id="<id>" role="button">，只认 **pointerup**；
   *   pointerup → GET /modal/map_info?id=<id> → 打开 #frame_MapDetails。
   *   Map Details 里的按钮：
   *     · 没有传送道具 → a.btn-primary「How to Travel」 onclick="openHelp(55)"（图标 res=world_tp）
   *     · 有传送道具 / Noble → 同一个按钮变成 Teleport 动作（onclick 不再是 openHelp）
   *   所以判据：找带 world_tp/home_scroll 图标、且 onclick 不是 openHelp 的按钮 = 可以传送。
   *   ★ v2.6.104：删掉「失败冷却 5 分钟」（游戏里没这机制）。
   * ===================================================================== */
  /* 在 Map Details 里找「传送」按钮。
   * ★ 实测（Noble 账号，2026-10-19，城市 Ururg #229）：
   *   <a class="btn btn-unique" onclick="loadTravel(false,'teleport=229&cH=<token>')">
   *     <div res="subscription" hover_title="Noble Potion" coins="179700" ...></div> Free Teleport</a>
   *   → 精确判据：onclick 里带 teleport=<id>（cH 是服务端给的 token，照原样点就行）。
   *   没道具时这里只剩 openHelp(55) 的「How to Travel」→ 返回 null，交给上层走传送站/步行。 */
  function findMapDetailsTeleport(md) {
    if (!md) return null;
    const all = $$q('a,button', md);
    /* ① 精确：onclick 带 teleport=<id> */
    const direct = all.filter(function (el) { return /teleport=\d+/.test(el.getAttribute('onclick') || ''); });
    if (direct.length) return direct[0];
    /* ② 兜底：带传送类图标、且 onclick 不是 openHelp 的按钮（不同版本/道具的显示可能不同） */
    const cands = all.filter(function (el) {
      const oc = el.getAttribute('onclick') || '';
      if (/openHelp/i.test(oc)) return false;                       /* How to Travel = 没道具 */
      const hasIcon = !!el.querySelector('[res="world_tp"],[res="home_scroll"],[res="subscription"],[res="tp"]');
      const looksTp = /teleport|world_tp|home_scroll/i.test(oc);   /* ★ v2.6.19：去掉按按钮文案判断（只看 onclick/图标） */
      return hasIcon || looksTp;
    });
    return cands[0] || null;
  }
  /* 选一个「最适合传过去」的地图：目标是城镇就传它本身；否则选离目标跳数最少的城镇 */
  function worldTeleportTarget(destId) {
    const dest = +destId;
    if (isTownMap(dest)) return dest;
    /* ★ v2.6.63：优先用户自己设的「休整城镇」。
       用户是按「休整城镇就在挂机图旁边」配的，比纯粹按跳数选更符合预期。
       实测：挂机图 Swamp(117) 离 Vileton(113) 4 跳、离 Owranbu(23) 5 跳，
       但传送站没解锁 Vileton 时会退到 Owranbu —— 用户看到「复活后先传送去 Owranbu」很困惑。
       只在「不比重算出来的最优差太多（+2 跳以内）」时才优先，免得设了个很远的城镇反而绕路。 */
    let best = dest, bestLen = Infinity;
    try {
      (serviceTowns() || []).forEach(function (t) {
        const id = +t.id;
        if (!(id > 0) || id === dest) return;
        const r = navRoute(id, dest);
        if (!r) return;
        if (r.length < bestLen) { bestLen = r.length; best = id; }
      });
    } catch (e) { /* ignore */ }
    const svc = +activeServiceTown();
    if (svc > 0 && svc !== dest && svc !== best && isTownMap(svc)) {
      let sl = null; try { sl = navRoute(svc, dest); } catch (e) { sl = null; }
      if (sl && sl.length <= bestLen + 2) return svc;
    }
    return best;
  }
  function isTownMap(id) {
    try { return (typeof MapDB.isTown === 'function' && MapDB.isTown(id)) || MapDB.type(id) === 'City'; }
    catch (e) { return false; }
  }
  /* ★ 世界地图传送：打开世界地图 → 点目标图 → Map Details → 点 Teleport。返回传送后的图 id（失败 0） */
  async function navWorldTeleport(destId, alive) {
    if (!inGame()) return 0;
    const dest = +destId;
    if (!(dest > 0)) return 0;
    if (String(character.current_map) === String(dest)) return dest;
    if (typeof window.openWorldMap !== 'function') { logEvent('世界地图传送：openWorldMap 不可用'); return 0; }
    const from = character.current_map;
    try { window.openWorldMap(''); } catch (e) { return 0; }
    /* 等世界地图 marker 就绪 */
    let g = null;
    for (let i = 0; i < 20; i++) { if (alive && !alive()) return 0; await sleep(300); g = document.getElementById('map_' + dest); if (g) break; }
    const bail = function () { try { if (typeof window.closeWorldMap === 'function') window.closeWorldMap(); } catch (e) {} return 0; };
    if (!g) { logEvent('世界地图传送：世界地图里没找到地图 ' + dest + ' 的标记'); return bail(); }
    /* pointerup 打开 Map Details（世界地图标记只认 pointerup，click 无效） */
    try {
      const target = g.querySelector('rect') || g;
      const b = target.getBoundingClientRect();
      const opt = { bubbles: true, cancelable: true, view: window, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 0 };
      const fire = function (t) { try { target.dispatchEvent(new PointerEvent(t, opt)); } catch (e) { try { target.dispatchEvent(new MouseEvent(t, opt)); } catch (e2) {} } };
      fire('pointerdown'); fire('pointerup');
    } catch (e) { return bail(); }
    /* 等 Map Details */
    let md = null;
    for (let i = 0; i < 20; i++) { if (alive && !alive()) return 0; await sleep(300); md = document.getElementById('frame_MapDetails'); if (md) break; }
    await sleep(400);
    /* ★ v2.6.57：Map Details 没开出来 = 瞬时失败（世界地图还在动画 / 标记点没点中）。
       原来这种情况也会写入 5 分钟冷却 → 接下来 5 分钟所有回城都不传送、直接走路。现在不写冷却。 */
    if (!md) { logEvent('世界地图传送：Map Details 没打开（瞬时失败，不计入冷却）'); return bail(); }
    const btn = findMapDetailsTeleport(md);
    if (!btn) {
      try { if (md) closeFrameById('frame_MapDetails'); } catch (e) {}
      logEvent('世界地图传送：Map Details 里没有传送按钮（没道具 / 非 Noble）→ 改走传送站 / 步行');
      return bail();
    }
    setStatus('世界地图传送 → 「' + navMapName(dest) + '」…');
    logEvent('世界地图传送 → ' + navMapName(dest));
    try { humanClick(btn); } catch (e) { try { btn.click(); } catch (e2) {} }
    for (let i = 0; i < 40; i++) { if (alive && !alive()) break; await sleep(500); if (String(character.current_map) !== String(from)) break; }
    try { if (md) closeFrameById('frame_MapDetails'); } catch (e) {}
    if (String(character.current_map) !== String(from)) { try { if (typeof window.closeWorldMap === 'function') window.closeWorldMap(); } catch (e) {} return character.current_map; }
    return bail();
  }
  /* ★ 传送站（waygate）：走到传送站 → 打开界面 → 自动挑一个「能去、且离目标最近」的城市传送出去。
   *   主要用于「死亡后落在只有传送站的泉水图」这种没有陆路的情况。
   *   可前往的按钮长这样： onclick="createDialog('Waygate','','ajax','/modal/waygate?id=N',true)"
   *   返回传送后所在的图 id（失败返回 0）。 */
  /* ★ 传送站目的地（实测 2026-10-20，游戏里打开 gateway 面板就能看到，含未解锁项）：
     · 城市页（Cities）：见 MAPDB_SEED.cities（14 座城镇，带 map id）。
     · 野外页（Wilderness）：下面 22 个「野外锚点」，只能从传送站 Wilderness 页传过去（实测 2026-10-20）。
     注：Noble 会员可以不依赖传送站，直接在世界地图点城市 → Map Details → Free Teleport 免费传城市；
         野外锚点没有这个免费入口，只能走传送站。 */
  const WAYGATE_WILD = [
    { name: 'Fountain of Rebirth', id: 1,   lv: 1  },
    { name: 'Mirage Mountains',    id: 67,  lv: 13 },
    { name: 'Ancient Ruins',       id: 97,  lv: 13 },
    { name: 'Deep Forest',         id: 53,  lv: 14 },
    { name: 'The Shifting Tides',  id: 75,  lv: 14 },
    { name: 'Dying Forest',        id: 172, lv: 18 },
    { name: 'Desert of Illusions', id: 224, lv: 18 },
    { name: 'Marsh',               id: 121, lv: 19 },
    { name: 'Unison Obelisk',      id: 251, lv: 23 },
    { name: 'Corduin',             id: 110, lv: 24 },
    { name: 'Taiga',               id: 265, lv: 25 },
    { name: 'Haunted Forest',      id: 310, lv: 27 },
    { name: 'Necropolis',          id: 257, lv: 29 },
    { name: 'Shrubland',           id: 277, lv: 31 },
    { name: 'Rainforest',          id: 298, lv: 35 },
    { name: 'Itham’s Anchorage',    id: 291, lv: 36 },
    { name: 'Abandoned Mine',      id: 58,  lv: 41 },
    { name: 'Taiga',               id: 212, lv: 41 },
    { name: 'Orc’s Bone Road',      id: 271, lv: 43 },
    { name: 'Dark Boreal',         id: 327, lv: 45 },
    { name: 'Wardens’ Bridge',      id: 352, lv: 53 },
    { name: 'Red Desert',          id: 336, lv: 54 }
  ];

  /* ★ v2.6.86：没有步行路线 ≠ 到不了。
     勾了「城市传送点」→ 任何 City（= 传送站 Cities 页 / Noble 世界地图免费传）都能传送过去；
     勾了「野外传送点」→ 22 个野外锚点（WAYGATE_WILD）也能传过去。
     城镇下拉的「可不可选」要把这条算进去，否则「没路但传送点能到」的城镇会被误灰掉。
     （Cities 页清单 = MAPDB_SEED.cities = 所有 type==='City' 的图，与 isServiceTownById 一致。） */
  function waygateReachable(id) {
    id = +id; if (!(id > 0)) return false;
    try {
      if (cfg.useWaygateCity && isServiceTownById(id)) return true;
      if (cfg.useWaygateWild && WAYGATE_WILD.some(function (w) { return +w.id === id; })) return true;
    } catch (e) { /* WAYGATE_WILD 未就绪等 → 保守 false */ }
    return false;
  }

  function findWaygateTile() {
    let wg = document.querySelector('.map_table [action=waygate]');
    if (wg) return wg;
    const tiles = Array.prototype.slice.call(document.querySelectorAll('.map_table .tile_poi'));
    return tiles.find(function (e) {
      return /waygate/i.test(e.getAttribute('action') || '') || /waygate/i.test(e.getAttribute('name') || '');
    }) || null;
  }
  async function navWaygateOut(destId, alive, tab, strict, anyOk) {
    const wg = findWaygateTile();
    if (!wg) return 0;
    if (alive && !alive()) return 0;
    const p = (wg.getAttribute('coords') || '').split('-');
    const gx = +p[0], gy = +p[1];
    if (!(gx > 0 && gy > 0)) return 0;
    /* ★ v2.6.104：走到传送站格 —— 用 retrigger 让「走开一格再走回」重触发格子动作
       （游戏只在「走进这一格」时才 execTileAction；已经站在格上不会触发）。
       成功条件 = 面板内容到位（#tab_cities 出现）。 */
    await navWalkTile(gx, gy, {
      retrigger: true,
      cond: function () { return !!document.getElementById('tab_cities'); },
      timeoutMs: 70000,
      alive: alive
    });
    if (alive && !alive()) return 0;
    /* ★ v2.6.63：走到 ≠ 真的到（网络抖动 / 服务器位置不同步）→ 没站上格子就别硬点，记原因退出 */
    if (!(character.x === gx && character.y === gy)) {
      logEvent('传送站：走不到传送站格 ' + gx + '-' + gy + '（当前 ' + character.x + '-' + character.y + '），本次放弃');
      return 0;
    }
    /* 打开传送站界面（可能已经开着）。
       ★ v2.6.104：面板内容是 ajax 后填进来的 —— 必须等 #tab_cities 出现（只等 #frame_Waygate 会拿到空壳）；
       内容没来（网络抖动 / 限流）就关掉重开，最多 3 轮。 */
    /* 兜底：面板还没出来就直接调一次 execTileAction */
    if (!document.getElementById('tab_cities')) {
      humanDefer(function () { try { window.execTileAction('waygate'); } catch (e) { /* ignore */ } });
      for (let i = 0; i < 20; i++) { if (alive && !alive()) return 0; await sleep(300); if (document.getElementById('tab_cities')) break; }
    }
    const frame = document.getElementById('frame_Waygate');
    if (!frame || !document.getElementById('tab_cities')) { logEvent('传送站：面板内容没加载出来，放弃'); return 0; }
    await sleep(300);
    if (alive && !alive()) return 0;

    /* ★ 指定页签：'cities' 只看城市；'wilderness' 只看野外锚点。
       切不过去就**直接放弃**（回上层走陆路），绝不拿错页签的名单乱传。 */
    const tabShown = function (t) {
      const el = document.getElementById('tab_' + t);
      if (!el) return false;
      if (el.classList && el.classList.contains('no_display')) return false;
      try { if (getComputedStyle(el).display === 'none') return false; } catch (e) { /* ignore */ }
      return true;
    };
    if (tab && !tabShown(tab)) {
      try { if (typeof window.switchTab === 'function') window.switchTab(tab, 'Waygate'); } catch (e) { /* ignore */ }
      await sleep(600);
      if (!tabShown(tab)) { try { const b = document.getElementById('main_btn_' + tab); if (b) b.click(); } catch (e) { /* ignore */ } await sleep(600); }
      if (!tabShown(tab)) {
        logEvent('传送站：切不到「' + tab + '」页签 → 放弃，改走陆路');
        try { closeFrameById('frame_Waygate'); } catch (e) { /* ignore */ }
        return 0;
      }
      if (alive && !alive()) return 0;
    }

    /* 收集所有「可前往」的按钮：onclick 里带 waygate?id=N。
       ★ v2.6.104：只扫「当前显示的那个页签」的名单 —— 两个 tab 的 DOM 同时存在，不限定会串页。 */
    const collect = function () {
      const scope = (tab && document.getElementById('tab_' + tab)) || document.getElementById('tab_cities') || frame;
      const out = [];
      Array.prototype.slice.call(scope.querySelectorAll('input[type=button], a, button')).forEach(function (b) {
        const m = /waygate\?id=(\d+)/.exec(b.getAttribute('onclick') || '');
        if (!m) return;
        const id = +m[1];
        if (!(id > 0) || id === +character.current_map) return;
        if (out.indexOf(id) < 0) out.push(id);
      });
      return out;
    };
    let cands = collect();
    /* ★ v2.6.118：目标不在「本页可前往」列表里时，不再直接放弃。
       旧版会误报「没解锁 / 精华不够」并卡在原地（用户实测：在泉水说精华不足，但精华是够的，
       只是那个目的地没解锁）。现在：记清楚「本页可前往的有哪些」，再交给下面的评分逻辑
       挑一个「能到目标、路线最短」的候选；连一个能算出路线的都没有才放弃（不乱传）。 */
    if (strict && cands.indexOf(+destId) < 0) {
      logEvent('传送站：' + (tab || '?') + ' 页里没有「' + navMapName(destId) + '」→ 本页可前往：' +
        (cands.length ? cands.map(function (id) { return navMapName(id) + '(' + id + ')'; }).join('、') : '(无)') + '；改挑一个能到目标的');
    }
    /* 城市页没东西 → 切到「野外」页再扫一次（仅在未指定页签时） */
    if (!cands.length && !tab && document.getElementById('tab_wilderness')) {
      try { if (typeof window.switchTab === 'function') window.switchTab('wilderness', 'Waygate'); else document.getElementById('main_btn_wilderness').click(); } catch (e) { /* ignore */ }
      await sleep(900);
      cands = collect();
    }
    if (!cands.length) return 0;   /* 没有可前往的目的地（可能精华不够 / 都没探索） */

    /* 选一个：优先目标本身；否则选「从它出发能到目标、且路线最短」的，
       ★ 融合：路线一样长时选「精华花费最少」的（价格读不到 = 视为免费/未知，排最前）。
       宽松匹配 waygate?id=N（与语言/调用形态无关），都算不出路线时退回第一个能去的。 */
    const priceOf = function (id) {
      const b = Array.prototype.slice.call(frame.querySelectorAll('input[type=button], a, button'))
        .find(function (x) { return new RegExp('waygate\\?id=' + id + '(?!\\d)').test(x.getAttribute('onclick') || ''); });
      if (!b) return Infinity;
      const row = b.closest('div') || b.parentElement;
      const icon = row && row.querySelector('[res="spirit_essence"]');
      const host = icon && icon.parentElement;
      const txt = host ? Array.prototype.slice.call(host.childNodes).filter(function (n) { return n.nodeType === 3; })
        .map(function (n) { return n.textContent; }).join('').trim() : '';
      const m = /^\d+(?:,\d{3})*$/.exec(txt || '');
      return m ? Number(txt.replace(/,/g, '')) : Infinity;
    };
    /* ★ 融合：优先「城市」目的地（Noble 会员城市传送免费），再按「到目标剩余跳数最少」，
       最后按精华花费最少。城市判定用 MapDB（type=City / isTown）。 */
    const isCityDest = function (id) {
      try { return (typeof MapDB.isTown === 'function' && MapDB.isTown(id)) || MapDB.type(id) === 'City'; }
      catch (e) { return false; }
    };
    let best = 0;
    const scored = [];
    if (cands.indexOf(+destId) >= 0) { best = +destId; }
    else {
      /* ★ v2.6.63：用户设的「休整城镇」优先（在候选里、且能算出到目标的路线时）。 */
      const svcId = +activeServiceTown();
      for (let i = 0; i < cands.length; i++) {
        const r = navRoute(cands[i], destId);
        if (!r) continue;
        scored.push({ id: cands[i], svc: (+cands[i] === svcId) ? 0 : 1, city: isCityDest(cands[i]) ? 0 : 1, len: r.length, price: priceOf(cands[i]) });
      }
      scored.sort((a, b) => a.svc - b.svc || a.city - b.city || a.len - b.len || a.price - b.price || a.id - b.id);
      if (scored.length) best = scored[0].id;
      /* ★ v2.6.97：没有任何候选能算出「到目标」的路线时，**不要乱传**。
         原来会退回 cands[0] —— 表现就是「人明明在 Owranbu，却被传到随便一个城市」。
         现在直接放弃，让上层去走陆路 / 报错。 */
      if (!best) {
        if (anyOk) {
          /* ★ v2.6.118：算不出路线（例如目的地只能靠传送站到达、没有陆路）→
             卡在原地时「随便出去一个」也比困死强，取第一个可用目的地。 */
          best = cands[0];
          logEvent('传送站：都算不出到「' + navMapName(destId) + '」的路线 → 先传到「' + navMapName(best) + '」再想办法');
        } else {
          logEvent('传送站：' + cands.length + ' 个候选都算不出到「' + navMapName(destId) + '」的路线 → 放弃传送（不乱传）');
          try { closeFrameById('frame_Waygate'); } catch (e) { /* ignore */ }
          return 0;
        }
      }
    }
    /* 候选顺序：先 best，再按评分顺序，最后兜底原顺序（去重、最多试 4 个） */
    const order = [];
    [best].concat(scored.map(function (x) { return x.id; })).concat(cands).forEach(function (id) {
      if (id && order.indexOf(id) < 0 && order.length < 4) order.push(id);
    });

    const btnOf = function (id) {
      return Array.prototype.slice.call(frame.querySelectorAll('input[type=button], a, button'))
        .find(function (b) { return new RegExp('waygate\\?id=' + id + '(?!\\d)').test(b.getAttribute('onclick') || ''); }) || null;
    };
    const from = character.current_map;
    /* ── 兜底[传送站] ─────────────────────────────────────────────
     * 症状：点了传送按钮但没换图（城市没解锁 / 精华不足 / 按钮被禁用）→ 卡死在传送站。
     * 判据：点击后等 TP_WAIT_MS，character.current_map 没变。
     * 动作：换下一个候选（order：休整城镇 → 评分序 → 原顺序，去重，最多 4 个）。
     * 上限：整个「点传送」阶段总预算 TP_BUDGET —— 超了立刻退出（★ v2.6.65）。
     *       第 1 个候选试 2 次，其余各 1 次；每次等 TP_WAIT_MS。
     * 高级参数：不受影响。
     * ─────────────────────────────────────────────────────────── */
    /* ★ v2.6.65：v2.6.63 改成「一个点不动就换下一个」之后，最坏情况变成
       4 个候选 × 2 次 × 15 秒 ≈ 2 分钟，再加走到传送站的 70 秒 —— 表现就是「又卡住了」。
       传送要么 1~2 秒内就换图、要么永远不换，所以缩短单次等待 + 加总预算。 */
    const TP_BUDGET = 35000, TP_WAIT_MS = 8000;
    const tpT0 = now();
    for (let k = 0; k < order.length; k++) {
      if (now() - tpT0 > TP_BUDGET) {
        logEvent('传送站：已试 ' + k + ' 个候选仍没成功，超时退出（预算 ' + (TP_BUDGET / 1000) + 's）');
        break;
      }
      const want = order[k];
      if (!btnOf(want)) continue;
      setStatus('传送站：前往「' + navMapName(want) + '」…');
      logEvent('传送站 → ' + navMapName(want));
      const tries = (k === 0) ? 2 : 1;
      for (let attempt = 0; attempt < tries; attempt++) {
        /* 剩余预算不足就按剩余时间等，保证整个阶段不会超过 TP_BUDGET 太多 */
        const remain = Math.max(1500, TP_BUDGET - (now() - tpT0));
        const steps = Math.round(Math.min(TP_WAIT_MS, remain) / 500);
        const btn = btnOf(want);
        if (!btn) break;
        try { humanClick(btn); } catch (e) { /* ignore */ }
        for (let i = 0; i < steps; i++) { await sleep(500); if (character.current_map !== from) break; }
        if (character.current_map !== from) break;
        await sleep(600);
      }
      if (character.current_map !== from) break;
      logEvent('传送站：「' + navMapName(want) + '」点了没换图（按钮没生效 / 精华不足 / 未解锁），换下一个');
    }
    try { closeFrameById('frame_Waygate'); } catch (e) { /* ignore */ }
    if (character.current_map === from) logEvent('传送站：候选都没传送成功（当前在 ' + currentMapName() + '）');
    return character.current_map !== from ? character.current_map : 0;
  }

  /* ★ 兜底：没有陆路、传送站也用不了时，走到本图任意一个「出口类」格子，看能不能换图。
   *   顺序：普通门 gate → 传送站 waygate → 入口 entrance …
   *   ⚠ 绝不把 dungeon 当出口：副本入口踩上去就进副本，进去容易出来难。返回换图后的图 id（没换返回 0）。 */
  async function navWalkToAnyExit(alive) {
    const EXIT_ACTIONS = ['gate', 'waygate', 'entrance', 'event_gate', 'smugglers_route',
                          'portal', 'teleport', 'exit', 'stairs', 'tunnel', 'cave'];
    const sels = EXIT_ACTIONS.map(function (a) { return '.map_table [action=' + a + ']'; });
    for (let s = 0; s < sels.length; s++) {
      const els = Array.prototype.slice.call(document.querySelectorAll(sels[s]));
      for (let i = 0; i < els.length; i++) {
        if (alive && !alive()) return 0;
        if ((els[i].getAttribute('action') || '') === 'dungeon') continue;   /* ★ 副本入口绝不当出口 */
        const c = (els[i].getAttribute('coords') || '').split('-');
        const x = +c[0], y = +c[1];
        if (!(x > 0 && y > 0)) continue;
        if (!isReachable(x, y)) continue;
        const from = character.current_map;
        const region = reachableSet();
        /* ★ 已经在格上也要试：交给 navWalkTile 的「走开一格再走回」重触发逻辑。
             原来这里 continue 直接跳过 —— 若本图唯一出口正好在脚下，就永远出不去。 */
        await navWalkTile(x, y, {
          retrigger: true,
          cond: function () {
            return character.current_map !== from || !!(region && !region.has(character.x + ',' + character.y));
          },
          timeoutMs: 40000, alive: alive
        });
        if (character.current_map !== from) return character.current_map;
      }
    }
    return 0;
  }

  /* ---- 导航状态条 ---- */
  function navStatus(txt, pct, showStop, detail) {
    if (!navBar) {
      navBar = document.createElement('div');
      navBar.id = 'nr-navbar';
      navBar.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483200;' +
        'background:linear-gradient(180deg,#2a3242,#1b212c);border:1px solid #3d4a60;border-radius:10px;' +
        'padding:8px 14px;color:#dfe7f3;font:13px/1.5 "Microsoft YaHei",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.45);' +
        'display:flex;align-items:center;gap:10px;min-width:300px;';
      document.body.appendChild(navBar);
    }
    navBar.innerHTML = '<span style="flex:1">' + escapeHtml(txt) +
      (detail ? '<br><span style="color:#8fa3bd">' + escapeHtml(detail) + '</span>' : '') + '</span>' +
      '<span style="color:#7f8ea6;font-variant-numeric:tabular-nums">' + (pct == null ? '' : pct + '%') + '</span>' +
      (showStop ? '<a id="nr-navstop" style="cursor:pointer;color:#ff8a8a;border:1px solid #7a3b3b;border-radius:6px;padding:1px 8px;background:#3a2226">停止</a>' : '');
    if (showStop) {
      const b = document.getElementById('nr-navstop');
      if (b) b.onclick = function () {
        navCancelSeq++;
        navBusy = false;                                   /* ★ 让导航循环的 alive() 立即变 false */
        try { abortWalk(); } catch (e) { /* ignore */ }    /* ★ 立刻停住角色，别继续朝目标格走 */
        navStatus('已停止导航', null, false); setTimeout(navHideBar, 1500);
      };
    }
  }
  function navHideBar() { if (navBar) { navBar.remove(); navBar = null; } }

  /* ★ v2.6.124：恢复「第 N/M 跳」进度显示。
     v2.6.104 把 Move 按钮的导航统一到 navToMap() 时，原来内联在 navTravelTo 里的
     「(i+1)/plan.length　当前：A → B」进度条被一起删掉了（用户反馈「导航之前都有显示 X/X，现在没了」）。
     现在放回统一路径 navWalkPlanTo()：只在导航条已存在时更新（= 从世界地图「导航」按钮发起的），
     阵亡回图 / 自动切图这类后台导航不弹条，避免打扰。 */
  function navProgressHop(i, total, destId, nextId) {
    if (!navBar) return;
    const pct = (total > 0) ? Math.round((i / total) * 100) : null;
    navStatus('🧭 导航中 → ' + navMapName(destId), pct, true,
      (i + 1) + '/' + total + '　当前：' + navMapName(character.current_map) + ' → ' + navMapName(nextId));
  }

  /* ★ v2.6.104：navGoTo() 已删除 —— 统一用模块 A navToMap()。 */

  /* ★ 阵亡复活后：若不在挂机地图，自动导航回去 */
  async function returnToFarm() {
    if (st.returning) return;
    const dest = +(cfg.farmMap || 0);
    if (!dest || !inGame() || String(character.current_map) === String(dest)) { navClearPending(); return; }
    navSetPending(dest, '阵亡复活');
    st.returning = true;
    try {
      setStatus('阵亡复活：导航回挂机地图「' + townName(dest) + '」…');
      logEvent('阵亡复活，导航回挂机地图 ' + townName(dest));
      const ok = await navToMap(dest, { alive: () => running, allowCity: true, allowWild: true });   // ★ 阵亡回图：必须允许传送出来
      st.returnFails = ok ? 0 : ((st.returnFails || 0) + 1);
      if (ok) navClearPending('已到达「' + navMapName(dest) + '」');
      logEvent(ok ? '已回到挂机地图 ' + townName(dest) : '回挂机地图失败（第 ' + st.returnFails + ' 次），当前在 ' + currentMapName());
      setStatus(ok ? '已回到挂机地图，继续挂机' : '回挂机地图失败：当前在 ' + currentMapName());
    } catch (e) {
      logEvent('回挂机地图出错：' + (e && e.message ? e.message : String(e)));
    } finally { st.returning = false; }
  }

  /* ---- 导航到目标地图（Move 按钮调用）—— 纯 UI 壳，实现在模块 A ---- */
  async function navTravelTo(destId) {
    if (navBusy) { navStatus('已有导航在进行中', null, true); return false; }
    try { if (running) stop('开始跨图导航，已暂停挂机'); } catch (e) { /* ignore */ }
    navBusy = true;
    const cancelSeq = navCancelSeq;
    try {
      if (String(character.current_map) === String(destId)) { navStatus('已经在该地图了', null, false); setTimeout(navHideBar, 1800); return true; }
      const alive = function () { return cancelSeq === navCancelSeq && navBusy && inGame(); };
      navStatus('🧭 导航中 → ' + navMapName(destId), null, true);
      const ok = await navToMap(destId, { alive: alive, _nested: true });
      if (!alive()) { navHideBar(); return false; }
      if (ok) {
        navStatus('✅ 已到达 ' + navMapName(destId), 100, false);
        setTimeout(navHideBar, 2500);
        logEvent('导航到达 ' + navMapName(destId));
        return true;
      }
      navStatus('❌ 无法到达「' + navMapName(destId) + '」', null, false);
      setTimeout(navHideBar, 3500);
      return false;
    } finally { if (cancelSeq === navCancelSeq) navBusy = false; }
  }

  /* ---- 自动切图刷怪（v2.6.151）：在「挂机图 home」和一张合格的邻图之间来回刷 ----------------
   * 设计（方案 A —— home 是唯一锚点，邻图只是临时驻留点）：
   *   · 在 home  → 挑一张合格邻图走过去；到了由主循环正常打怪。
   *   · 在邻图  → 回 home（此时 home 的怪已刷新）。
   *   · 「合格」= 门 action==='gate' + 目标图 type==='Normal'
   *                + 到达后真实怪里有能通过现有过滤器（等级 / 名单 / 黑名单 / 星级）的怪；
   *                不合格就拉黑（st.roam.bad）换下一张。
   *   · 被移走（阵亡 / 活动 / 切角色）→ 现有恢复路径一律回 home（ensureAtFarmMap / returnToFarm），
   *     本函数也自愈：只要不在 home，下一轮就把角色送回 home。
   * 旧实现是「出去兜一圈立刻回来」：既不在邻图打怪，回来也太快（home 的怪没刷新）→ 无效。 */
  const ROAM_BAD_TTL = 30 * 60 * 1000;   // 判定「不合适」的邻图拉黑时长
  /* 本图（当前渲染地图）里有没有「能通过现有过滤器」的怪 —— 用到达后的真实怪数据判，不依赖离线表 */
  function roamMapHasTargets() {
    return scanEnemies().some(function (e) {
      return e.rank !== 'Player' && nameAllowed(e.name) && !mobBlacklisted(e.name) &&
             rankAllowed(e.rank) && lvAllowed(e.lv);
    });
  }
  async function navRoamStep(seq) {
    if (navBusy) return false;
    const cancelSeq = navCancelSeq;
    navBusy = true;
    /* ★ home = 挂机地图（唯一锚点）：即使当前被意外带到别处，也以它为家来回切 */
    const home = +(cfg.farmMap || character.current_map) || 0;   // ★ 统一成数字，避免 farmMap 未设时字符串比较失配
    const homeName = townName(home);
    const alive = function () { return cancelSeq === navCancelSeq && seq === navAutoSeq && running && cfg.autoMapSwitch; };
    try {
      /* ★ door_tiles 必须属于当前渲染（window.map.id == character.current_map）才敢用，
         否则换图空窗会拿到上一张图的门。 */
      if (!renderSynced()) return false;
      /* ① 不在 home（在邻图，或被丢到别处）→ 回 home。home 是唯一锚点。 */
      if (+character.current_map !== home) {
        st.move = null; abortWalk();
        if (!alive()) return false;
        setStatus('切图刷怪：返回挂机图 ' + homeName + ' …');
        logEvent('自动切图：返回 ' + homeName + '（当前 ' + currentMapName() + '）');
        const back = await navToMap(home, { alive: alive, _nested: true });
        if (back) { logEvent('自动切图：已回到 ' + homeName); setStatus('切图完成，已回到 ' + homeName); }
        else if (alive()) setStatus('切图失败（回程），当前在 ' + currentMapName());
        return !!back;
      }
      /* ② 在 home → 挑一张合格邻图 */
      const dt = window.door_tiles || {};
      const all = Object.keys(dt).map(Number).filter(function (k) { return k !== home; });
      /* ★ 唯一硬条件：门格子的 action 必须是 gate。dungeon（副本入口）一律不切。 */
      const gateOk = all.filter(isSwitchableDoor);
      const blocked = all.filter(function (k) { return !isSwitchableDoor(k); });
      if (blocked.length) logEvent('切图跳过（不是普通门）：' + blocked.map(function (k) { return navMapName(k) + '[' + (doorActionTo(k) || '?') + ']'; }).join('、'));
      /* 候选 = 本图所有「普通门」邻图，排除：城镇（没怪）、已知不合适的（st.roam.bad）。
         ★ v2.6.153 修回归：不再硬性要求 MapDB.type==='Normal'。
         种子数据里 329 张图有 206 张没有 type（MapDB.type 返回 ''），硬过滤会把绝大多数邻图挡掉，
         表现为「切图刷怪完全没反应」。真正「能不能打」由到达后的真实怪数据 + 现有过滤器判定
         （roamMapHasTargets）。副本入口已由门格子 action!=='gate' 排除，放宽是安全的。 */
      const tnow = now();
      const badCnt = gateOk.filter(function (k) { return st.roam.bad[k] > tnow; }).length;
      const pool = gateOk.filter(function (k) {
        if (MapDB.type(k) === 'City') return false;          /* 城镇没有怪，别去 */
        return !(st.roam.bad[k] > tnow);                     /* 已判定不合适的邻图跳过 */
      });
      if (!pool.length) {
        logEvent('切图：本图没有可切的普通邻图（门 ' + all.length + ' 个 / 普通门 ' + gateOk.length + ' 个 / 已拉黑 ' + badCnt + ' 个），原地等刷新');
        setStatus('本图没有可切的普通邻图（都不合适或只剩副本入口），原地等刷新');
        return false;
      }
      /* 优先已知的普通野外图（type==='Normal'），未知类型的排后面（仍会去，靠到达后判定） */
      pool.sort(function (a, b) { return (MapDB.type(b) === 'Normal' ? 1 : 0) - (MapDB.type(a) === 'Normal' ? 1 : 0); });
      /* 轮转：从上次的下一个开始，避免连续切同一张（不再是 Math.random） */
      const destId = pool[st.roam.idx++ % pool.length];
      st.move = null; abortWalk();
      closeFrameById('frame_Gathering'); closeFrameById('frame_CollectScrap');
      if (!alive()) return false;
      setStatus('切图刷怪：' + homeName + ' → ' + navMapName(destId) + ' …');
      logEvent('自动切图：去 ' + navMapName(destId));
      if (!await navToMap(destId, { alive: alive, _nested: true })) { if (alive()) setStatus('切图失败（去程）'); return false; }
      await sleep(1200);
      if (!alive()) return false;
      recordVisit();
      /* 到了之后确认是普通野外图：万一进了副本/城镇，立刻记下并返回 */
      const mt = (window.map && window.map.type) || '';
      if (mt && mt !== 'Normal' && mt !== 'City') {
        logEvent('切图：' + navMapName(destId) + ' 是「' + mt + '」属于副本/特殊区域，立即返回');
        setStatus('「' + navMapName(destId) + '」是特殊区域，返回…');
        await navToMap(home, { alive: alive, _nested: true });
        return false;
      }
      /* ★ 合格性判定：用到达后的真实怪数据 + 现有过滤器（等级 / 名单 / 黑名单 / 星级）。
         没有任何怪能通过 → 这张图不适合 → 拉黑换下一张。 */
      if (!roamMapHasTargets()) {
        const seen = scanEnemies();
        logEvent('切图：' + navMapName(destId) + ' 没有符合筛选的怪（' +
          (seen.length ? seen.map(function (e) { return e.name + (e.lv ? ' Lv' + e.lv : ''); }).join('、') : '本图无怪') +
          '）→ 拉黑，换下一张');
        st.roam.bad[destId] = now() + ROAM_BAD_TTL;
        setStatus('「' + navMapName(destId) + '」没有合适的怪，返回…');
        await navToMap(home, { alive: alive, _nested: true });
        return false;
      }
      /* 合格 → 就地打怪（主循环接管）；等本图清完 / 无怪时再由 autoMapSwitchMaybe 触发回 home */
      setStatus('切图刷怪：在 ' + navMapName(destId) + ' 打怪中…');
      logEvent('自动切图：开始在 ' + navMapName(destId) + ' 打怪（有符合筛选的怪）');
      return true;
    } catch (e) {
      setStatus('切图出错：' + (e && e.message ? e.message : String(e)));
      return false;
    } finally {
      if (cancelSeq === navCancelSeq && seq === navAutoSeq) {
        navBusy = false;
        st.blacklist = {}; st.roundKills = 0; st.move = null; st.reach = null;
        st.mapSwitch.lastAt = now(); st.mapSwitch.idleSince = 0;
      }
    }
  }

  /* ---- 修正：关世界地图前，先把还开着的「地名悬浮 tooltip」正常关掉 ----
   * 地名 tooltip 是游戏的 jQuery UI tooltip（track:true → 跟着鼠标走）。
   * 它的关闭动作是绑在 <g class="tooltip2"> 元素上的 mouseleave，
   * 而 closeWorldMap() 是直接 .remove() 掉整个 #world_map_container：
   * 元素一没，mouseleave 永远不会触发 → tooltip 不关、
   * document 上的 mousemove 跟随也解绑不掉，
   * 那个「地图框」就一直粘在鼠标上了。
   * 所以任何关闭世界地图的路径（点地图开 Map Details / 按 M / ESC / 换图），
   * 都先主动把 tooltip close 一次。 */
  function navCloseWorldMapTooltip() {
    const box = document.getElementById('world_map_container');
    if (!box) return;                     /* 世界地图没开，不可能有粘住的 tooltip */
    /* ★ 世界地图的「拖动地图」状态是游戏自己的全局 window.mouseDown：
     *   它在 #world_map 的 pointerdown 里置 true，靠 #world_map 的 pointerup /
     *   pointerleave 复位。我们是在 .circle-animated 的 pointerup 里调
     *   closeWorldMap() 的 —— 容器一 remove，jQuery 会把 #world_map 上的
     *   pointerup 处理器一起清掉，那句 window.mouseDown = false 就永远不执行，
     *   拖拽状态被留在 true。这里替游戏把它复位。 */
    try { window.mouseDown = false; window.did_move = false; } catch (e) { /* ignore */ }
    try {
      const $j = window.jQuery;
      if (!$j || !$j.fn || !$j.fn.tooltip) return;
      $j(box).find('.tooltip2').each(function () {
        /* 没初始化过 tooltip 的元素会抛错，忽略即可 */
        try { $j(this).tooltip('close'); } catch (e) { /* ignore */ }
      });
    } catch (e) { /* ignore */ }
  }
  (function () {
    const orig = window.closeWorldMap;
    if (typeof orig !== 'function') return;
    window.closeWorldMap = function () {
      try { navCloseWorldMapTooltip(); } catch (e) { /* ignore */ }
      return orig.apply(this, arguments);
    };
  })();

  /* ---- 修正：世界地图开着时 createDialog 不加载内容 ---- */
  (function () {
    const orig = window.createDialog;
    if (typeof orig !== 'function') return;
    window.createDialog = function () {
      if (arguments[0] === 'Map Details' && document.getElementById('world_map_container')) {
        try { window.closeWorldMap(); } catch (e) { /* ignore */ }
      }
      return orig.apply(this, arguments);
    };
  })();

  /* 采集点图标：按名字归到游戏对应的采集技能图标 */
  const GATHER_ICONS = [[/pier|dock/i, 'fishing'], [/mine/i, 'mining'], [/quarry/i, 'quarrying'],
                        [/grove/i, 'chopping'], [/field/i, 'farming'], [/patch/i, 'foraging']];
  function gatherIconOf(name) {
    for (let i = 0; i < GATHER_ICONS.length; i++) if (GATHER_ICONS[i][0].test(name)) return GATHER_ICONS[i][1];
    return 'foraging';
  }

  /* ---- 世界地图：把「资源点 / 怪物」塞进地名悬浮 tooltip ----
   * 游戏的地名 tooltip 内容就是 <g map_id=N content="..."> 的 content 属性，
   * 而 tooltip 的 open 回调每次都现读这个属性 → 我们只要改属性，鼠标一移上去就是新的。
   * （原来这些信息是点开「Map Details」才显示的，现在改成悬浮即见。） */
  const WM_BASE_ATTR = 'data-nr-wm-base';      /* 记下游戏原始 content，之后都从它重建，避免叠加 */

  /* ---- 世界地图 tooltip 的「全图数据」（v2.6.81）----
   * 以前只有「去过的图」才有资源点 / 怪物（MapDB 靠踩图学），未探索的图 tooltip 是空的。
   * 这里补一份**不依赖探索**的静态数据：
   *   · 采集点：官方 Wiki「采集点」页 141 条（专业 + 层级 + 等级），按世界坐标匹配到地图 → 覆盖 86 张图；
   *     条目总数正好等于 map_info 里采集图标的数量（fishing37+mining21+quarrying18+chopping27+farming19+foraging19=141），两边互相印证。
   *   · 怪物：官方 Wiki「敌人」页的「群系」列表 + 等级区间反推（群系命中 且 等级区间与地图等级有交集）。
   *     对已探索的 111 张非城镇图校验：**召回 99.2% / 精确 99.5%**（基本等于真值）。城镇（38 张）是安全区，不推怪。
   *   · 地标：map_info 图标（副本 / 世界BOSS / 召唤图腾 / 商队路线 / 码头 / 邮箱 / 传送站），380/380。
   * 数据来源：data/wiki_official_1.0/site-data/{gathering,bestiary}.json + data/bestiary.json + data/map_meta_1.0.json。
   * 有踩图学到的真实数据时优先用真实的（真实点位名 / 真实怪物名单），没有才用这份推算。 */
const WM_POI_MON=[["Angry Egg",198],["Ankheg",110],["Ape Brute",203],["Arcane Imp",182],["Armored Ram",221],["Arynx",128],["Badger",8],["Basilisk",165],["Bear",19],["Beaver",11],["Berserker",186],["Bison",37],["Blood Queen",121],["Blue Stirge",171],["Bog Worm",118],["Boggard",119],["Bogleech",120],["Bone Scarab",51],["Brute Spider",99],["Carrion Harpy",132],["Cassowary",104],["Catoblepas",130],["Centaur",96],["Cockatrice",109],["Cockroach",47],["Cougar",30],["Crocodile",22],["Decaying Worm",116],["Deer",3],["Drow",111],["Druid",97],["Dryad",113],["Dune Glider",105],["Dwarven Caster",224],["Dwarven Guard",222],["Dwarven Hunter",223],["Eel",52],["Faery",199],["Fire Elemental",205],["Foliage Shaman",24],["Forest Guardian",112],["Frost Elemental",178],["Frostbinder",43],["Ghost Pirate",141],["Giant Vulture",185],["Gnoll Warlock",153],["Gnoll Warrior",129],["Goblin Engineer",217],["Goblin Pyro",54],["Goblin Soldier",55],["Hare",5],["Hydra",173],["Hypnotic Bat",28],["Killer Centipede",49],["Knight",67],["Komodo Basilisk",225],["Leech",45],["Light Elemental",204],["Lightning Elemental",179],["Lizardman",87],["Loot Goblin",230],["Luminous Plant",202],["Mana Webber",101],["Merfolk",88],["Miner",64],["Monstrous Bat",29],["Monstrous Worm",16],["Mothman",114],["Mountain Troll",86],["Mutated Lizardman",152],["Myconid",115],["Nomadic Cleric",175],["Ogre Mage",183],["Ooze",193],["Orc Hunter",159],["Orc Warlock",160],["Orc Warrior",158],["Owlbear",106],["Peasant",13],["Phantom Miner",214],["Phoenix",172],["Pirate",57],["Polar Bear",167],["Purifier",40],["Purple Worm",143],["Raider",103],["Rat",1],["Red Stirge",170],["River Troll",56],["Rust Monster",213],["Salamanderoid",10],["Sasquatch",65],["Scorpion",27],["Skeleton",147],["Skeleton Archer",148],["Skeleton Mage",149],["Skeleton Warrior",150],["Snake",2],["Snapping Turtle",23],["Snow Rabbit",237],["Sphinx",184],["Spitter",100],["Stone Centipede",166],["Stone Hulk",108],["Succubus",176],["Swamp Dragon",151],["Tarn Linnorm",122],["Terastodon",131],["Thorny Vines",62],["Tiger",25],["Toad",4],["Toxic Toad",21],["Troglodyte",14],["Troll Boar",117],["Valkyrie",187],["Vampire Bat",135],["Venomous Viper",195],["Vine Sniper",201],["Wandering Ent",98],["Warg",161],["Wasp",168],["Wendigo",107],["Werebat",216],["Wererat Slinger",71],["Wererat Soldier",70],["Wererat Wizard",72],["Werewolf",95],["Wild Dog",6],["Wild Hog",20],["Wisp Phantom",174],["Wizard",181],["Wolf",32],["Woodland Snake",15],["Woodland Spider",33],["Wraith",200],["Wyvern",138],["Xorn",215],["Yak",188],["Zombie",146],["Zombie Horse",177],["Zombie Pirate",89]];
const WM_POI={"2":{"m":[6,132]},"3":{"m":[91]},"4":{"g":[["foraging","1","1"]],"m":[50,120,127],"s":["mailbox"]},"5":{"g":[["fishing","1","1"],["foraging","1","1"]],"s":["mailbox","waygate"]},"6":{"g":[["fishing","1","1-3"],["quarrying","1","1-3"]],"m":[28,50,97,120,127]},"7":{"m":[11,28,90,97,120,127,128]},"8":{"g":[["mining","1","4-6"],["quarrying","1","6-9"]],"m":[48,52,64,66,97,112]},"9":{"g":[["mining","1","4-6"],["quarrying","1","6-9"]],"m":[48,52,64,66,97,108,112]},"10":{"g":[["quarrying","1","4-6"]],"m":[11,48,49,131]},"11":{"g":[["farming","1","1-3"]],"m":[28,50,97,120,127]},"12":{"m":[6,9,28,78,132]},"13":{"g":[["fishing","1","5-6"]],"m":[6,8,9,28,78,128,131,132,133]},"14":{"g":[["farming","1","4-6"],["fishing","1","4-6"],["foraging","1","4-6"]],"m":[9,26,88,90,98,110,111]},"15":{"g":[["fishing","2","7-10"]],"m":[26,88,90,98,110,111]},"16":{"g":[["farming","2","10"],["fishing","2","10"]],"s":["dock","mailbox","waygate"]},"17":{"g":[["chopping","1","1-3"],["farming","1","1-3"],["fishing","1","1-3"],["foraging","1","1-3"],["mining","1","1-3"]],"m":[6,9,28,78,132]},"18":{"g":[["chopping","1","4-6"],["fishing","1","4-6"]],"m":[9,26,88,90,98,110,111]},"19":{"g":[["fishing","2","7-10"]],"m":[26,88,90,98,110,111]},"20":{"g":[["chopping","1","1-3"],["farming","1","1-3"],["fishing","1","1-3"]],"m":[28,50,97,120,127]},"21":{"g":[["chopping","1","4-6"]],"m":[6,8,9,28,78,128,131,132,133]},"22":{"g":[["chopping","2","7-10"],["farming","2","7-10"],["fishing","2","7-10"],["foraging","2","7-10"],["mining","2","7-10"]],"m":[6,8,78,128,131,132,133]},"23":{"s":["mailbox","waygate"]},"24":{"m":[11,48,49,131],"s":["dungeon"]},"25":{"m":[11,28,90,97,120,127,128]},"26":{"m":[48,52,64,66,97,108,112],"s":["dungeon"]},"27":{"m":[48,52,66,97,108,112],"s":["dungeon"]},"28":{"m":[27,31,67,70,113]},"29":{"g":[["chopping","2","12-13"],["fishing","2","12-13"]],"m":[27,31,67,70,113]},"30":{"m":[27,31,67,70,113],"s":["dungeon"]},"31":{"m":[26,59,63,68]},"32":{"g":[["fishing","2","14-15"]],"m":[26,59,63,68],"s":["dungeon"]},"33":{"m":[43,81,140],"s":["dungeon"]},"34":{"m":[24,36,56,86],"s":["dungeon"]},"35":{"m":[24,26,36,56,86],"s":["dungeon"]},"36":{"m":[123,124,125],"s":["dungeon"]},"37":{"m":[48,78,112]},"38":{"m":[48,78,112]},"39":{"m":[48,78,112]},"40":{"m":[48,52,64,66,97,112]},"41":{"m":[17,20,32,71,85,92]},"42":{"m":[48,52,66,97,108,112]},"43":{"m":[48,52,66,97,108,112]},"44":{"g":[["chopping","1","1-3"],["farming","1","1-3"],["fishing","1","1-3"],["foraging","1","1-3"],["mining","1","1-3"]],"m":[78]},"45":{"m":[48,52,66,97,112],"s":["dungeon"]},"46":{"m":[8,115]},"47":{"m":[8,115]},"48":{"m":[22,30,48,49,77,118,126]},"49":{"g":[["chopping","2","11-12"]],"m":[22,30,48,49,77,118,126],"s":["dungeon"]},"50":{"m":[22,30,48,49,77,118,126]},"51":{"m":[22,30,48,49,77,118,126]},"52":{"g":[["fishing","2","14-15"]],"m":[22,30,48,49,77,118,126]},"53":{"g":[["chopping","2","14-15"]],"s":["waygate"]},"54":{"m":[22,30,48,49,77,118,126]},"55":{"g":[["quarrying","2","14-15"]],"m":[22,30,48,49,77,118,126]},"56":{"g":[["quarrying","5","41-42"]],"m":[29,47,79,89,122,136]},"57":{"g":[["quarrying","5","41-42"]],"m":[29,47,79,89,122,136]},"58":{"g":[["fishing","5","41-42"],["quarrying","5","41-42"]],"s":["waygate"]},"59":{"g":[["quarrying","5","41-42"]],"m":[29,47,79,89,122,136]},"61":{"m":[17,20,32,71,85,92]},"62":{"m":[17,20,32,71,85,92],"s":["caravan","mailbox"]},"63":{"m":[17,20,32,71,85,92]},"64":{"m":[17,20,32,71,85,92]},"65":{"g":[["mining","2","11-12"],["quarrying","2","11-12"]],"m":[17,20,32,71,85,92]},"66":{"m":[17,20,32,71,85,92]},"67":{"s":["caravan","mailbox","waygate"]},"68":{"g":[["chopping","4","30"],["fishing","4","30"]],"m":[21,74,75,76,107,119],"s":["dungeon"]},"69":{"g":[["chopping","4","30"],["fishing","4","30"]],"m":[94,95,96,103],"s":["dungeon"]},"72":{"m":[17,20,32,71,85,92]},"73":{"m":[17,20,32,71,85,92]},"74":{"m":[17,20,32,71,85,92]},"75":{"s":["caravan","mailbox","waygate"]},"76":{"m":[17,20,32,71,85,92],"s":["caravan","mailbox"]},"77":{"m":[40]},"78":{"m":[40]},"83":{"m":[17,20,32,71,85,92]},"84":{"m":[17,20,32,71,80,85,92]},"85":{"g":[["chopping","2","16-17"],["fishing","2","16-17"]],"m":[15,26,59,63],"s":["caravan","mailbox"]},"87":{"m":[15,26,59,63],"s":["caravan","mailbox"]},"90":{"m":[17,20,32,71,85,92],"s":["caravan","mailbox"]},"91":{"s":["mailbox","waygate"]},"92":{"m":[5,19,45,46,92,107]},"93":{"m":[5,19,45,46,92,107]},"94":{"g":[["mining","2","14-15"]],"m":[17,20,32,71,85,92]},"95":{"g":[["mining","2","16-17"]],"m":[17,20,32,71,80,85,92]},"96":{"m":[17,20,32,71,85,92]},"97":{"s":["totem","waygate"]},"98":{"m":[17,20,32,71,85,92]},"99":{"m":[17,20,32,71,85,92],"s":["caravan","mailbox"]},"100":{"g":[["farming","2","14-15"],["foraging","2","14-15"]],"m":[17,20,32,71,85,92]},"106":{"m":[5,19,45,46,92,107]},"107":{"m":[5,19,45,46,92,107]},"110":{"s":["caravan","mailbox","waygate"]},"111":{"m":[18,62,101]},"112":{"m":[11,48,49,68],"s":["dock"]},"113":{"s":["mailbox","waygate"]},"114":{"m":[14,15,16,53,106]},"115":{"m":[12,14,15,16,106]},"116":{"g":[["chopping","3","19-20"],["farming","3","19-20"],["fishing","3","19-20"]],"m":[12,14,15,16,106]},"117":{"m":[51,69,105,129]},"118":{"m":[51,69,105,129]},"119":{"m":[51,69,105,129]},"120":{"m":[51,69,105,129]},"121":{"s":["totem","waygate"]},"122":{"g":[["fishing","3","19-20"],["foraging","3","19-20"]],"m":[12,14,15,16,106],"s":["dungeon"]},"123":{"g":[["chopping","4","29-30"],["fishing","4","29-30"],["foraging","4","29-30"]],"m":[51,69,105,129]},"124":{"g":[["foraging","3","26-28"]],"m":[51,69,105,129]},"125":{"m":[51,69,105,129]},"126":{"g":[["fishing","3","19-20"]],"m":[12,14,15,16,106]},"127":{"m":[12,14,15,16,106]},"128":{"m":[12,14,15,16,106]},"129":{"m":[12,14,15,16,106]},"130":{"m":[48,52,66,97,108,112],"s":["dungeon"]},"131":{"m":[94,95,96,103],"s":["dungeon"]},"133":{"m":[3,41,58,72,130]},"134":{"s":["mailbox","waygate"]},"135":{"m":[48,52,66,97,112]},"136":{"m":[63],"s":["dungeon"]},"137":{"g":[["fishing","2","17-18"],["foraging","2","17-18"]],"m":[12,14,15,16,106]},"138":{"m":[29,47,79,89,122,136],"s":["dungeon"]},"139":{"m":[29,47,79,89,122,136]},"141":{"m":[29,47,79,89,122,136]},"142":{"m":[29,47,79,89,122,136]},"143":{"s":["dock","mailbox","waygate"]},"169":{"s":["dock","mailbox","waygate"]},"170":{"m":[27,31,67,70,113]},"171":{"m":[27,31,67,70,113]},"172":{"g":[["chopping","2","18-19"],["farming","2","18-19"],["foraging","2","18-19"]],"s":["totem","waygate"]},"179":{"m":[22,30,48,49,77,118,126]},"180":{"g":[["chopping","4","31-33"],["farming","4","31-33"],["foraging","4","31-33"]],"m":[1,23,29,40,121]},"181":{"m":[1,23,29,40,121]},"182":{"m":[1,23,29,40,121]},"183":{"s":["mailbox","waygate"]},"184":{"m":[1,23,29,40,121]},"185":{"g":[["mining","4","34-37"]],"m":[1,23,29,40,121]},"186":{"g":[["chopping","4","38-39"],["fishing","4","38-39"]],"m":[1,23,29,40,121]},"187":{"m":[1,23,29,40,121],"s":["dungeon","totem"]},"188":{"m":[1,23,29,40,121]},"189":{"m":[1,23,29,40,121]},"190":{"m":[5,19,45,46,92,107]},"191":{"m":[5,19,45,46,92,107]},"192":{"m":[5,19,45,46,92,107]},"193":{"m":[5,19,45,46,92,107]},"194":{"m":[5,19,45,46,92,107]},"195":{"g":[["mining","3","19-20"],["quarrying","3","19-20"]],"m":[5,19,45,46,92,107]},"196":{"m":[5,19,45,46,92,107],"s":["caravan","mailbox"]},"197":{"m":[5,19,45,46,92,107]},"198":{"m":[5,19,45,46,92,107]},"199":{"m":[5,19,45,46,92,107]},"200":{"g":[["fishing","3","21-22"]],"m":[94,95,96,139]},"201":{"s":["mailbox","waygate"]},"202":{"m":[94,95,96,139]},"203":{"m":[94,95,96,139]},"204":{"g":[["chopping","3","19-20"],["farming","3","19-20"],["fishing","3","19-20"]]},"209":{"m":[5,19,45,46,92,107],"s":["caravan","mailbox"]},"210":{"m":[20,32,71,85]},"211":{"m":[10,25,42,82,114,137],"s":["caravan","mailbox"]},"212":{"g":[["mining","5","41-42"]],"s":["waygate","worldboss"]},"213":{"g":[["farming","5","43-44"]],"m":[10,25,42,82,114,137]},"214":{"g":[["chopping","5","45-46"]],"m":[10,25,42,82,114,137]},"215":{"m":[10,25,42,82,114,137]},"216":{"m":[10,25,42,82,114,137]},"217":{"m":[10,25,42,82,114,137]},"218":{"g":[["mining","2","14-15"]],"m":[17,20,32,71,85,92]},"219":{"m":[17,20,32,71,85,92]},"220":{"m":[17,20,32,71,80,85,92]},"221":{"m":[48,65,66,84,103],"s":["caravan","mailbox"]},"222":{"g":[["quarrying","2","16-17"]],"m":[17,20,32,71,80,85,92]},"224":{"s":["waygate"]},"225":{"m":[17,20,32,71,80,85,92]},"226":{"m":[17,20,32,71,80,85,92],"s":["caravan","mailbox"]},"227":{"g":[["chopping","3","21-22"]],"m":[19,21,74,75,76,107]},"228":{"g":[["farming","3","21-22"],["fishing","3","21-22"],["foraging","3","21-22"]],"m":[19,21,74,75,76,107]},"229":{"s":["caravan","mailbox","waygate"]},"230":{"m":[7,102]},"231":{"m":[94,95,96,139]},"232":{"m":[94,95,96,103],"s":["worldboss"]},"233":{"m":[94,95,96,103],"s":["worldboss"]},"234":{"m":[48,65,66,84,103],"s":["dungeon"]},"235":{"m":[48,66,84,103],"s":["dungeon"]},"239":{"m":[17,20,32,71,80,85,92],"s":["caravan","mailbox"]},"240":{"m":[19,21,75,76,107]},"241":{"m":[17,20,32,71,80,85,92]},"243":{"m":[17,20,32,71,80,85,92]},"244":{"m":[7,44,75,76,102]},"245":{"m":[7,44,75,76,102]},"246":{"m":[7,44,75,76,102]},"247":{"m":[48,65,66,84,103]},"248":{"g":[["mining","3","20-21"],["quarrying","3","20-21"]],"m":[7,44,74,75,76,102]},"249":{"m":[7,44,74,75,76,102]},"250":{"m":[20,32,71,85]},"251":{"s":["waygate"]},"252":{"m":[94,95,96,139]},"253":{"m":[94,95,96,139]},"254":{"m":[94,95,96,139]},"255":{"m":[94,95,96,139]},"256":{"m":[94,95,96,139]},"257":{"g":[["mining","4","29-30"],["quarrying","4","29-30"]],"s":["waygate"]},"260":{"g":[["fishing","3","19-20"],["foraging","3","19-20"]],"m":[13,87],"s":["dungeon"]},"262":{"m":[20,32,71,85]},"263":{"m":[20,32,71,85]},"264":{"m":[20,32,71,85]},"265":{"s":["totem","waygate"]},"266":{"g":[["mining","3","27-28"]],"m":[10,25,42,82,114]},"267":{"g":[["fishing","3","27-28"]],"m":[10,25,42,82,114]},"268":{"g":[["chopping","4","29-30"]],"m":[10,25,42,82,114,137]},"269":{"g":[["farming","5","40-41"]],"m":[74,75,76,107]},"271":{"g":[["chopping","5","43-44"]],"s":["waygate"]},"275":{"m":[19,21,74,75,76,107]},"276":{"m":[19,21,74,75,76,107],"s":["dungeon"]},"277":{"g":[["chopping","4","31-33"],["farming","4","31-33"],["fishing","4","31-33"],["foraging","4","31-33"]],"s":["waygate"]},"278":{"m":[74,75,76,107,119]},"279":{"g":[["mining","4","34-35"]],"m":[29,103]},"280":{"m":[74,75,76,107,119]},"281":{"g":[["farming","4","30"],["foraging","4","30"]],"s":["mailbox","waygate"]},"282":{"m":[10,25,42,82,114,137]},"283":{"g":[["quarrying","4","31-32"]],"m":[10,25,42,82,114,137]},"284":{"s":["mailbox","waygate"]},"285":{"m":[10,25,42,82,114,137]},"286":{"m":[10,25,42,82,114,137],"s":["dungeon"]},"287":{"m":[25,42,82,137]},"288":{"m":[37,63],"s":["caravan","mailbox"]},"289":{"g":[["fishing","4","34-35"]],"m":[37,63]},"290":{"m":[37,63]},"291":{"g":[["fishing","4","36-37"],["mining","4","36-37"]],"s":["waygate","worldboss"]},"293":{"m":[2,39,61,109,117],"s":["caravan","mailbox"]},"294":{"g":[["chopping","4","31-32"],["fishing","4","31-32"]],"m":[2,39,61,109,117]},"295":{"g":[["mining","4","33-34"]],"m":[2,39,61,109,117]},"296":{"m":[2,39,61,109,117]},"297":{"g":[["chopping","4","35-36"]],"m":[2,39,61,109,117]},"298":{"s":["waygate"]},"301":{"m":[2,39,61,109,117]},"302":{"m":[2,39,61,109,117],"s":["dungeon"]},"304":{"m":[2,39,61,109,117]},"306":{"g":[["fishing","5","39-40"]],"m":[2,39,61,109,117]},"307":{"g":[["chopping","5","41-42"]],"m":[2,39,61,109,117]},"308":{"m":[94,95,96,139]},"309":{"m":[94,95,96,139]},"310":{"g":[["chopping","3","27-28"],["farming","3","27-28"],["fishing","3","27-28"],["foraging","3","27-28"],["mining","3","27-28"]],"s":["totem","waygate"]},"311":{"g":[["chopping","3","27-28"],["farming","3","27-28"],["fishing","3","27-28"],["foraging","3","27-28"],["mining","3","27-28"]],"m":[94,95,96,103]},"316":{"g":[["farming","5","43-45"],["foraging","5","43-45"]],"m":[2,39,61,109,117]},"317":{"s":["mailbox","waygate"]},"318":{"m":[65,83,100],"s":["worldboss"]},"319":{"s":["worldboss"]},"320":{"g":[["mining","5","41-42"]],"m":[25,42,82,137]},"321":{"m":[2,39,61,109,117]},"322":{"m":[2,39,117]},"323":{"g":[["fishing","4","34-35"]],"m":[37,63],"s":["dock"]},"324":{"m":[4,33,34,35,55]},"325":{"g":[["mining","5","41-42"]],"m":[4,33,34,35,55]},"326":{"g":[["fishing","5","43-44"]],"m":[4,33,34,35,55],"s":["dungeon","totem"]},"327":{"g":[["chopping","5","45-46"]],"s":["waygate","worldboss"]},"329":{"m":[4,33,34,35,55]},"330":{"g":[["quarrying","6","49-50"]],"m":[4,33,34,35,55]},"332":{"m":[4,33,34,35,55]},"333":{"g":[["fishing","5","40-42"],["mining","5","40-42"]],"m":[41,54,58,72,130]},"334":{"m":[41,54,58,72,130]},"335":{"m":[41,54,58,72,130]},"336":{"s":["waygate"]},"337":{"g":[["quarrying","6","57-59"]]},"338":{"s":["dungeon"]},"342":{"m":[4,33,34,35,55]},"343":{"m":[4,33,34,35,55]},"344":{"m":[4,33,34,35,55]},"345":{"m":[4,33,34,35,55]},"346":{"g":[["farming","5","47-48"],["foraging","5","47-48"],["quarrying","5","47-48"]],"m":[4,33,34,35,55],"s":["caravan","mailbox"]},"347":{"g":[["chopping","5","48-49"]],"m":[4,33,34,35,55]},"348":{"s":["mailbox","waygate"]},"350":{"g":[["chopping","6","51-52"]]},"351":{"g":[["farming","6","52-53"],["fishing","6","52-53"],["foraging","6","52-53"]]},"352":{"s":["totem","waygate"]},"353":{"g":[["fishing","6","54-55"],["quarrying","6","54-55"]]},"354":{"g":[["mining","6","55-56"]]},"357":{"s":["worldboss"]},"358":{"s":["worldboss"]},"360":{"s":["mailbox","waygate"]},"363":{"g":[["mining","6","51-52"]],"s":["dungeon"]},"901":{"m":[50,120,127]},"903":{"m":[17,20,32,71,80,85,92]},"906":{"m":[10,25,42,82,114,137]},"1000":{"s":["waygate"]},"1001":{"m":[82]},"1002":{"m":[82]},"1003":{"m":[82]},"1004":{"m":[10,25,42,82,114]},"1005":{"m":[10,25,42,82,114,137]},"1006":{"m":[10,25,42,82,114,137]},"1007":{"m":[10,25,42,82,114,137]},"1027":{"m":[104]},"1028":{"m":[104]},"1029":{"m":[104]},"1030":{"m":[104]},"1031":{"m":[104]},"1032":{"m":[104]},"1033":{"m":[104]},"1041":{"m":[11,28,50,90,97,120,127,128]},"1042":{"m":[11,97,120,127,128]},"1066":{"m":[116]},"1067":{"m":[50,116]},"1068":{"m":[71,116]},"1069":{"m":[71,116]},"1070":{"m":[71,116]},"1071":{"m":[116]},"1072":{"m":[116]},"1145":{"m":[11,48,49,131]},"1146":{"m":[11,48,49,68,131]},"1147":{"m":[48,49,68]},"1157":{"m":[43,93]},"1158":{"m":[43,52,93]},"1159":{"m":[43,52,93]},"1160":{"m":[43,93,139]},"1161":{"m":[43,93,139]},"1162":{"m":[43,93]},"1163":{"m":[43,93]},"1183":{"m":[135]},"1184":{"m":[135]},"1185":{"m":[135]},"1186":{"m":[135]},"1187":{"m":[135]},"1188":{"m":[135]},"1189":{"m":[135]},"2001":{"m":[6,132]},"2002":{"m":[6,8,78,128,131,132,133]},"2003":{"m":[6]},"2100":{"m":[6,8,9,28,78,128,131,132,133]}};
  const WM_PROF_EN = { fishing: 'Fishing', mining: 'Mining', quarrying: 'Quarrying', chopping: 'Chopping', farming: 'Farming', foraging: 'Foraging' };
  const WM_LAND_EN = { dungeon: 'Dungeon', worldboss: 'World Boss', totem: 'Summoning Totem', caravan: 'Smugglers Route', dock: 'Dock', mailbox: 'Mailbox', waygate: 'Waygate' };

  /* ======================= 19c. 世界地图 POI 实时数据（v2.6.82） =======================
   * tooltip 的「资源点 / 怪物」原来是内嵌快照，会过期（实测：游戏敌人页 157 条 vs 内嵌 141 条，少 16 个）。
   * 游戏自己就把这两张表放在帮助页里，可以直接读：
   *   GET /modal/help_detail?id=49 → 采集点（专业 + 地图名 + Tier + Level + openWorldMap('wx/wy')）
   *   GET /modal/help_detail?id=53 → 敌人（名字 + 图标 + Level Range + Biome）
   * 进游戏后拉一次、缓存 24 小时，实时重建每张图的 POI；拉不到就回退内嵌快照 WM_POI。
   * 地标（副本/世界BOSS/图腾/商队/码头/邮箱/传送站）来自 map_info 图标，没有批量接口，仍用内嵌快照。
   * ============================================================================= */
  const WM_LIVE_KEY = 'norroth_wm_live_v1';
  const WM_LIVE_TTL = 24 * 3600 * 1000;
  let _wmPoi = WM_POI;            /* 当前生效的 POI 表（实时优先，回退内嵌） */
  let _wmMon = WM_POI_MON;        /* 当前生效的怪物表 [名字, 图标id] */
  let _wmFetchState = '';         /* '' 未开始 | 'loading' | 'ok' | 'fail' */

  /* 采集点页 → { 'wx/wy': [[专业, 层级, 等级], ...] } */
  function wmParseGather(html) {
    const out = {};
    const parts = String(html).split(/res-icon-\w+\s+small_icon[^>]*><\/div>\s*([A-Za-z]+)\s*<\/h2>/);
    for (let i = 1; i + 1 < parts.length; i += 2) {
      const prof = String(parts[i]).toLowerCase();
      const seg = parts[i + 1];
      const re = /openWorldMap\('(\d+\/\d+)'\)[\s\S]{0,400}?col-xs-3">([^<]*)<\/div>[\s\S]{0,200}?col-xs-3">Tier\s*([^<]*)<\/div>[\s\S]{0,200}?col-xs-3">Level\s*([^<]*)<\/div>/g;
      let m;
      while ((m = re.exec(seg))) {
        const key = m[1];
        (out[key] = out[key] || []).push([prof, String(m[3]).trim(), String(m[4]).trim()]);
      }
    }
    return out;
  }

  /* 敌人页 → [{ n:名字, ic:图标id, lv:[a,b], bi:[群系...] }] */
  function wmParseEnemies(html) {
    const out = [];
    const blocks = String(html).split(/class="divblock[^"]*search-this"/).slice(1);
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const nm = (b.match(/<h2[^>]*>\s*([^<]+?)\s*<\/h2>/) || [])[1];
      if (!nm) continue;
      const ic = (b.match(/enemy_(\d+)\.gif/) || [])[1];
      const lvs = (b.match(/Level Range:<\/b>\s*([^<]*)</) || [])[1] || '';
      const bis = (b.match(/Biome:<\/b>\s*([^<]*)</) || [])[1] || '';
      const r = /(\d+)\s*-\s*(\d+)/.exec(lvs);
      const one = /(\d+)/.exec(lvs);
      out.push({
        n: nm.trim(),
        ic: ic ? +ic : 0,
        lv: r ? [+r[1], +r[2]] : (one ? [+one[1], +one[1]] : null),
        bi: bis.split(',').map(function (x) { return x.trim(); }).filter(Boolean)
      });
    }
    return out;
  }

  function wmLvRange(txt) {
    const r = /(\d+)\s*-\s*(\d+)/.exec(txt || '');
    if (r) return [+r[1], +r[2]];
    const n = /(\d+)/.exec(txt || '');
    return n ? [+n[1], +n[1]] : null;
  }

  /* 用实时数据重建每张图的 POI（结构同 WM_POI；地标沿用内嵌快照） */
  function wmBuildPoi(gather, enemies) {
    const poi = {};
    const coordIdx = {}, meta = {};
    for (let i = 0; i < WM_UNLOCK_MAPS.length; i++) {
      const m = WM_UNLOCK_MAPS[i];
      const id = String(m[0]);
      meta[id] = { lv: m[2], biome: m[3] };
      const key = m[5] + '/' + m[6];
      (coordIdx[key] = coordIdx[key] || []).push(id);
    }
    /* 采集点：世界坐标 → 该坐标下的所有地图 */
    Object.keys(gather).forEach(function (coord) {
      const ids = coordIdx[coord];
      if (!ids) return;
      ids.forEach(function (id) { (poi[id] = poi[id] || {}).g = gather[coord]; });
    });
    /* 城镇（内嵌快照里带 waygate 地标的）是安全区，不推怪 */
    const townOf = {};
    Object.keys(WM_POI).forEach(function (id) {
      const sp = WM_POI[id].s;
      if (sp && sp.indexOf('waygate') >= 0) townOf[id] = 1;
    });
    /* 怪物：群系命中 + 等级区间有交集 */
    Object.keys(meta).forEach(function (id) {
      const mm = meta[id];
      if (townOf[id] || !mm.biome) return;
      const ml = wmLvRange(mm.lv);
      const ms = [];
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.bi.indexOf(mm.biome) < 0) continue;
        if (e.lv && ml && (e.lv[1] < ml[0] || e.lv[0] > ml[1])) continue;
        ms.push(i);
      }
      if (ms.length) (poi[id] = poi[id] || {}).m = ms;
    });
    /* 地标沿用内嵌快照（map_info 图标没有批量接口）；
       实时没算出来的（活动大厅 / 特殊图）也回退内嵌，保证不丢信息 */
    Object.keys(WM_POI).forEach(function (id) {
      const e = WM_POI[id];
      const cur = poi[id] = poi[id] || {};
      if (e.s) cur.s = e.s;
      if (!cur.g && e.g) cur.g = e.g;
      if (!cur.m && e.m) cur.m = e.m;
    });
    return poi;
  }

  async function wmFetchLivePoi() {
    if (_wmFetchState === 'loading') return;
    if (!inGame()) { _wmFetchState = ''; return; }   /* 还没进世界，等下一轮 */
    _wmFetchState = 'loading';
    try {
      const get = function (u) {
        return fetch(u, { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
          .then(function (r) { return r.text(); });
      };
      const both = await Promise.all([get('/modal/help_detail?id=49'), get('/modal/help_detail?id=53')]);
      const gather = wmParseGather(both[0]);
      const enemies = wmParseEnemies(both[1]);
      const nCoord = Object.keys(gather).length;
      if (!nCoord || !enemies.length) throw new Error('解析为空（采集点坐标 ' + nCoord + ' / 敌人 ' + enemies.length + '）');
      const mon = enemies.map(function (e) { return [e.n, e.ic]; });
      const poi = wmBuildPoi(gather, enemies);
      _wmPoi = poi; _wmMon = mon; _wmFetchState = 'ok';
      try { localStorage.setItem(WM_LIVE_KEY, JSON.stringify({ at: now(), mon: mon, poi: poi })); } catch (e) { /* ignore */ }
      logEvent('世界地图数据：已实时更新（采集点坐标 ' + nCoord + ' 个 / 敌人 ' + enemies.length + ' 种）');
    } catch (e) {
      _wmFetchState = 'fail';
      logEvent('世界地图数据：实时读取失败，用内置快照（' + (e && e.message ? e.message : e) + '）');
    }
  }

  /* 启动时：有新鲜缓存就直接用，否则后台拉一次（不阻塞任何东西） */
  function wmLoadLivePoi() {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(WM_LIVE_KEY) || 'null'); } catch (e) { cached = null; }
    if (cached && cached.poi && cached.mon) {
      _wmPoi = cached.poi; _wmMon = cached.mon; _wmFetchState = 'ok';
      if (now() - (cached.at || 0) < WM_LIVE_TTL) return;   /* 还新鲜 → 不拉 */
    }
    wmFetchLivePoi();
  }

  function navWmPoiBlock(mapId) {
    const key = String(mapId);
    const gs = MapDB.g(key);            /* 内置 + 边玩边学，MapDB 已合并（真实点位名） */
    const ms = MapDB.m(key);            /* 同上（真实怪物名单） */
    const wp = _wmPoi[key] || null;     /* ★ v2.6.81 起：全图数据（v2.6.82 起优先用实时拉到的） */
    const mon = MapDB.monAll();
    const chip = function (cls, icon, name) {
      return '<span class="nr-wm-chip ' + cls + '">' +
             (icon ? '<img src="' + icon + '" alt="">' : '') + escapeHtml(name) + '</span>';
    };
    /* 资源点：真实点位名 + Wiki 层级（T）合并显示（v2.6.126）
       · 本地扫到过 → 用真实点位名，并按「专业」从 Wiki 数据补上 T（例：Copper Mine T1）；
       · 本地没扫到 → 用 Wiki 的「专业 T层级 · Lv等级」；
       · 本地扫到过、但 Wiki 还列了别的专业 → 一并补上（不丢信息）。 */
    let gChips = '';
    if (gs.length) {
      const wikiTierOf = function (prof) {
        if (!wp || !wp.g) return '';
        const hit = wp.g.find(function (x) { return x[0] === prof && x[1]; });
        return hit ? hit[1] : '';
      };
      const realProfs = {};
      gChips = gs.map(function (nm) {
        const prof = gatherIconOf(nm);
        realProfs[prof] = 1;
        const t = wikiTierOf(prof);
        return chip('g', '/images/icons/' + prof + '.gif', nm + (t ? ' T' + t : ''));
      }).join('');
      if (wp && wp.g) {
        gChips += wp.g.filter(function (g) { return !realProfs[g[0]]; }).map(function (g) {
          const lbl = (WM_PROF_EN[g[0]] || g[0]) + (g[1] ? ' T' + g[1] : '') + (g[2] ? ' · Lv' + g[2] : '');
          return chip('g', '/images/icons/' + g[0] + '.gif', lbl);
        }).join('');
      }
    } else if (wp && wp.g) {
      gChips = wp.g.map(function (g) {
        const lbl = (WM_PROF_EN[g[0]] || g[0]) + (g[1] ? ' T' + g[1] : '') + (g[2] ? ' · Lv' + g[2] : '');
        return chip('g', '/images/icons/' + g[0] + '.gif', lbl);
      }).join('');
    }
    /* 怪物：真实名单优先；没有就用图鉴（群系 + 等级）推算 */
    let mChips = '';
    if (ms.length) {
      /* ★★ 2026-09-22 修：这里原来写的是 `mon[nm] || monL[nm]`，而 `monL` 是 MapDB 重构前的遗留变量
         （老代码：`mon = NAV_EMBED.mon, monL = _poiLearn.mon`），现在脚本里根本没有它。
         于是**只要某张图的怪里有一个不在图鉴里**（例：map64 Droughtlands 的 "Ruin Guard"），
         这一行就抛 ReferenceError → navDecorateWorldMap 的循环整个中断 →
         世界地图上「这张图以及排在它后面的所有图」的怪/资源点全部不显示（看起来就像怪被漏掉了）。
         MapDB.mon 本身已经是「内置图鉴 + 边玩边学」的合并结果，不需要再兜底查 monL。 */
      const monIdOf = function (nm) { const n = parseInt(mon[nm], 10); return isNaN(n) ? null : n; };
      const msSorted = ms.slice().sort(function (a, b) {
        const ia = monIdOf(a), ib = monIdOf(b);
        if (ia != null && ib != null) return (ia - ib) || a.localeCompare(b);
        if (ia != null) return -1;                 /* 有 id 的在前 */
        if (ib != null) return 1;
        return a.localeCompare(b);                 /* 都没 id → 按名字 */
      });
      mChips = msSorted.map(function (nm) {
        const id = mon[nm];
        return chip('m', id ? '/images/maps/items/enemy_' + id + '.gif' : '', nm);
      }).join('');
    } else if (wp && wp.m) {
      mChips = wp.m.map(function (i) {
        const e = _wmMon[i] || [];
        return chip('m', e[1] ? '/images/maps/items/enemy_' + e[1] + '.gif' : '', e[0] || '');
      }).join('');
    }
    /* 地标（副本 / 世界BOSS / 召唤图腾 / 商队路线 / 码头 / 邮箱 / 传送站） */
    let sChips = '';
    if (wp && wp.s) {
      sChips = wp.s.map(function (x) { return chip('s', '/images/icons/' + x + '.gif', WM_LAND_EN[x] || x); }).join('');
    }
    /* ★ v2.6.100：这张图在本地 MapDB 里有实测记录 → 加一行备注（哪些数据、多少、什么时候更新的）。
       注意：资源点 / 怪物两栏本来就「真实数据优先、没有才用推算」，这一行是让人一眼看出「这张图我扫过」。 */
    let noteHtml = '';
    try {
      const r = MapDB.get(key);
      if (r) {
        const nG = (r.g || []).length, nGt = (r.gt || []).length, nM = (r.m || []).length, nEx = (r.ex || []).length;
        const nEdge = MapDB.adj(key).length;
        if (r.visited || nG || nGt || nM || nEx || nEdge) {
          const parts = [];
          if (nG) parts.push('采集点 ' + nG);
          if (nM) parts.push('怪物 ' + nM);
          if (nEx) parts.push('出口 ' + nEx);
          if (nEdge) parts.push('门 ' + nEdge);
          let when = '';
          if (r.at) {
            try {
              const d = new Date(r.at);
              const p2 = function (n) { return (n < 10 ? '0' : '') + n; };
              when = (d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
            } catch (e) { when = ''; }
          }
          noteHtml = '<div class="nr-wm-note">📋 本地已记录' +
            (parts.length ? '：' + parts.join(' · ') : '') +
            (when ? ' <span class="k">· 更新 ' + when + '</span>' : '') + '</div>';
        }
      }
    } catch (e) { /* ignore */ }
    if (!gChips && !mChips && !sChips && !noteHtml) return '';
    const sec = function (label, cls, chips) {
      return '<div class="nr-wm-sec"><span class="nr-wm-h ' + cls + '">' + label + '</span>' +
             '<span class="nr-wm-chips">' + chips + '</span></div>';
    };
    return '<div class="nr-wm"><div class="nr-wm-sep"></div>' +
           (gChips ? sec('资源点', 'g', gChips) : '') +
           (mChips ? sec('怪物', 'm', mChips) : '') +
           (sChips ? sec('地标', 's', sChips) : '') +
           noteHtml + '</div>';
  }

  /* ======================= 19b. 世界地图「解锁未访问地图」(v2.6.80) =======================
   * 游戏的世界地图只渲染「角色访问过的」地图节点（实测 2026-10-21：整张图只有 11 个 <g map_id>），
   * 未访问的地图连 DOM 都没有，而且整幅地图还盖着一层战争迷雾（rect.world-map-fog + #fogMask）。
   * 但服务端并不拦：GET /modal/map_info?id=N 对任何 id 都返回完整内容（实测 380/380 全成功），
   * 点击节点也只是 createDialog(..., '/modal/map_info?id=N')，不需要额外授权。
   * 所以这里用抓好的全量世界坐标（data/map_meta_1.0.json，380 张 / 379 个有坐标）在客户端补齐：
   *   · 按 <g map_id=N transform="translate(wx-8,wy-8)"> 注入缺失的地图点（和游戏原生节点同款式）；
   *   · 去掉 rect.world-map-fog（迷雾遮罩）→ 整幅地图清晰可见；
   *   · 注入的节点绑自己的 pointerup → 和原生节点一样打开真实的 Map Details（可看详情 / 传送）。
   * 由 cfg.worldMapUnlock 控制（默认开）。数据每行：[id, name, level, biome, continent, wx, wy]。
   * 坐标来源：世界地图缩略图文件名 world_map_<id>_<wx>_<wy>.jpg / location[wx/wy]（两处冗余互校）。
   * ============================================================================= */
  const WM_UNLOCK_MAPS = [[1,"Fountain of Rebirth","1","Enchanted Forest","",887,1797],[2,"Lower Fountain’s Descent","1","Temperate Forest","Arodas",721,1783],[3,"Sasquatch Grotto","1","Underground","Arodas",731,1721],[4,"Upper Fountain’s Descent","1","Grassland","Arodas",814,1683],[5,"El Caspar","1","Grassland","Arodas",871,1551],[6,"Brisban Pond","1-3","Grassland","Arodas",721,1499],[7,"Akelay Foothills","4-6","Grassland","Arodas",771,1445],[8,"Akelay Cave Level 1","4-6","Underground","Arodas",738,1440],[9,"Akelay Cave Level 2","6-9","Underground","Arodas",738,1440],[10,"Mount Akelay","4-6","Mountain","Arodas",767,1413],[11,"Elena’s Crossroad","1-3","Grassland","Arodas",869,1435],[12,"Forested Canyon","4-5","Temperate Forest","Arodas",878,1328],[13,"Tree of Life","5-6","Temperate Forest","Arodas",804,1231],[14,"Arodas Lakeshore","4-6","Coastal","Arodas",625,1464],[15,"Arodas Beach","7-10","Coastal","Arodas",583,1367],[16,"Elundi","10","Temperate Forest","Arodas",585,1250],[17,"Southern Foothill","1-3","Temperate Forest","Arodas",925,1672],[18,"Bay’s Alley","4-6","Coastal","Arodas",974,1729],[19,"Bay’s Alley","7-10","Coastal","Arodas",1047,1754],[20,"Windy Fields","1-3","Grassland","Arodas",1026,1539],[21,"Forest Of Owranbu","4-6","Temperate Forest","Arodas",1093,1584],[22,"Owranbu River","7-10","Temperate Forest","Arodas",1182,1558],[23,"Owranbu","10","Temperate Forest","Arodas",1285,1561],[24,"Manor’s Courtyard","4-6","Mountain","Arodas",1054,1452],[25,"Laverne Foothill","4-6","Grassland","Arodas",990,1397],[26,"Grasping Maze","6-7","Underground","Arodas",799,1208],[27,"Heart of the Tree","7","Underground","",799,1208],[28,"Dying Forest","10-11","Dying Forest","Arodas",1345,1650],[29,"Dead Leaves Tiara","12-13","Dying Forest","",1323,1681],[30,"Venom Arch Forest","14-15","Dying Forest","",1387,1728],[31,"Pirate Wreck Foothill","11-13","Coastal","Arodas",1106,1775],[32,"Pirate Wreck Beach","14-15","Coastal","Arodas",1135,1837],[33,"The Pirate Wreck","15-16","Shipwreck","Arodas",1107,1883],[34,"Sewers","1-3","Sewers","Arodas",826,1537],[35,"Deep Sewers","4-6","Sewers","",826,1537],[36,"Ratdom","5","Ratdom","",826,1537],[37,"Manor Main Floor","4-6","Urban","Arodas",1074,1426],[38,"Manor 1st Floor","4-6","Urban","",1074,1426],[39,"Manor Attic","4-6","Urban","",1074,1426],[40,"Manor Cellar","4-6","Underground","Arodas",1074,1426],[41,"Owranbu Drylands","10-11","Dry Desert","Tharnoth",1315,1504],[42,"The Cult Tunnel","7-9","Underground","Arodas",751,1424],[43,"The Cult Hideout","7-9","Underground","Arodas",751,1424],[44,"Farmer’s House","4","Urban","",925,1672],[45,"Baron’s Lair","9","Underground","",1074,1426],[46,"Bear Den","10","Bear Den","",638,1161],[47,"Den Of Devourer","10","Den Of Devourer","",638,1161],[48,"Elundi Garden","10-11","Deep Forest","Ruahnia",580,1175],[49,"Elundi Garden","11-12","Deep Forest","Ruahnia",624,1130],[50,"Deep Forest","12-13","Deep Forest","Ruahnia",675,1109],[51,"Deep Forest","13-14","Deep Forest","Ruahnia",717,1076],[52,"Deep Forest","14-15","Deep Forest","Ruahnia",754,1065],[53,"Deep Forest","14-15","Deep Forest","Ruahnia",790,1052],[54,"Elm’s Rest","15","Deep Forest","",617,1070],[55,"Way to Morwen","14-15","Deep Forest","",778,998],[56,"Abandoned Mine","41-42","Underground","",724,960],[57,"Abandoned Mine","41-42","Underground","",667,937],[58,"Abandoned Mine","41-42","Underground","",618,935],[59,"Abandoned Mine","41-42","Underground","",565,949],[61,"Sandstorm Pass","11-12","Dry Desert","Tharnoth",1343,1440],[62,"Sun-Scorched Plateau","11-12","Dry Desert","Tharnoth",1322,1396],[63,"Sandspire Summit","13-14","Dry Desert","",1375,1364],[64,"Droughtlands","13-14","Dry Desert","",1397,1312],[65,"Mesa Mine Area","11-12","Dry Desert","Tharnoth",1396,1445],[66,"Rock Valley","11-12","Dry Desert","Tharnoth",1446,1462],[67,"Mirage Mountains","13-14","Dry Desert","Tharnoth",1499,1485],[68,"Yurk’s Yard","30","Shrubland","",2527,1147],[69,"Yurk’s Lodge","30","Underground","",2527,1147],[72,"Shifting Sands","13-14","Dry Desert","Tharnoth",1559,1488],[73,"Radiant Heat Flats","13-14","Dry Desert","Tharnoth",1602,1455],[74,"Sunken Sands","14-15","Dry Desert","Tharnoth",1655,1454],[75,"The Shifting Tides","14-15","Dry Desert","Tharnoth",1698,1421],[76,"Sirocco Springs","14-15","Dry Desert","",1683,1366],[77,"Guardian Queen Hive","39","Guardian Queen Hive","",1169,843],[78,"Guardian Queen Hive","39","Guardian Queen Hive","",1169,843],[83,"Khamsin Cliffs","14-15","Dry Desert","",1716,1329],[84,"Golden Sandscape","16-17","Dry Desert","",1717,1275],[85,"Oasis","16-17","Oasis","",1753,1234],[87,"Oasis","16-17","Oasis","",1780,1172],[90,"Whispering Sands","14-15","Dry Desert","",1607,1185],[91,"Drouver","15","Savanna","",1577,1124],[92,"Savanna","14-15","Savanna","",1516,1111],[93,"Savanna","14-15","Savanna","",1453,1107],[94,"Scorpion`s Nest","14-15","Dry Desert","",1385,1133],[95,"Dry Mirage","16-17","Dry Desert","",1335,1108],[96,"Dune Sea","13-14","Dry Desert","",1349,1181],[97,"Ancient Ruins","13-14","Dry Desert","",1353,1252],[98,"Burning Sands","13-14","Dry Desert","",1433,1258],[99,"Burnt Sienna Wastes","14-15","Dry Desert","",1493,1265],[100,"Dust Outskirts","14-15","Dry Desert","",1549,1221],[106,"Savanna","16-17","Savanna","",1726,1102],[107,"Savanna","15-16","Savanna","",1656,1096],[110,"Corduin","24-25","Ruins","",2009,1077],[111,"Spider Den","15","Spider Den","",1387,1728],[112,"Vileton Entrance","14-15","Mountain","Arodas",1181,1838],[113,"Vileton","15","Mountain","Arodas",1263,1835],[114,"Marsh","15-16","Marsh","",1467,1785],[115,"Marsh","17-18","Marsh","",1513,1756],[116,"Marsh","19-20","Marsh","",1552,1718],[117,"Swamp","24-25","Swamp","",1469,1825],[118,"Swamp","26-28","Swamp","",1458,1862],[119,"Swamp","24-25","Swamp","",1409,1843],[120,"Swamp","21-23","Swamp","Arodas",1361,1858],[121,"Marsh","19-20","Marsh","",1506,1894],[122,"Marsh","19-20","Marsh","",1530,1854],[123,"Swamp","29-30","Swamp","",1447,1907],[124,"Swamp","26-28","Swamp","",1430,1949],[125,"Swamp","24-25","Swamp","",1429,1995],[126,"Marsh","19-20","Marsh","",1479,2073],[127,"Marsh","19-20","Marsh","",1523,1955],[128,"Marsh","19-20","Marsh","",1491,2005],[129,"Marsh","21-23","Marsh","",1441,2040],[130,"Secret Cave Tunnel","7-10","Underground","",1006,1683],[131,"The Squid Lair","25","Underground","",1043,1665],[133,"Magic Plains","19-20","Magic Plains","",1511,2119],[134,"Sanjuo","19","Magic Plains","",1533,2204],[135,"Chamber of Oracles","10","Underground","Arodas",848,1328],[136,"The Bilge","19","Marine","",1107,1883],[137,"Marsh","17-18","Marsh","",1547,1804],[138,"Abandoned Mine","43-44","Underground","",581,900],[139,"Ghrorak’s Prison","49","Underground","",581,852],[141,"Abandoned Mine","41-42","Underground","",500,945],[142,"Abandoned Mine","41-42","Underground","",444,938],[143,"Nythrendal","40","Mountain","",353,926],[144,"Abandoned Mine","","Underground","",748,925],[145,"Abandoned Mine","","Underground","",783,908],[146,"Abandoned Mine","","Underground","",772,867],[147,"Abandoned Mine","","Underground","",749,830],[148,"Abandoned Mine","","Underground","",730,783],[167,"Mountain","","Mountain","",1272,655],[168,"Tundra","","Savanna","",1322,686],[169,"Bungavik","20","Savanna","",1433,705],[170,"Dying Forest","15-16","Dying Forest","",1445,1678],[171,"Dying Forest","16-17","Dying Forest","",1483,1642],[172,"Dying Forest","18-19","Dying Forest","",1539,1633],[179,"Deep Forest","14-15","Deep Forest","Ruahnia",835,1041],[180,"Caeltys’ Causeway","31-33","Dark Forest","Ruahnia",875,1011],[181,"Caeltys’ Causeway","31-33","Dark Forest","",913,972],[182,"Caeltys’ Causeway","31-33","Dark Forest","",982,957],[183,"Caeltys","30","Enchanted Forest","",1059,929],[184,"Caeltys’ Yarden","31-33","Dark Forest","",1131,943],[185,"Caeltys’ Yarden","34-37","Dark Forest","",1173,923],[186,"Caeltys’ Yarden","38-39","Dark Forest","",1165,883],[187,"Caeltys’ Yarden","38-39","Dark Forest","",1169,843],[188,"Caeltys’ Yarden","34-37","Dark Forest","",1131,845],[189,"Caeltys’ Yarden","30-33","Dark Forest","",1099,866],[190,"Savanna","16-17","Savanna","",1576,1039],[191,"Savanna","16-17","Savanna","",1583,993],[192,"Savanna","17-18","Savanna","",1534,968],[193,"Savanna","17-18","Savanna","",1487,933],[194,"Savanna","18-19","Savanna","",1460,887],[195,"Savanna","19-20","Savanna","",1463,836],[196,"Savanna","19-20","Savanna","",1443,774],[197,"Desert","16-17","Savanna","",1778,1067],[198,"Desert","17-18","Savanna","",1809,1025],[199,"Desert","19-20","Savanna","",1820,981],[200,"Haunted Forest","21-22","Haunted Forest","",1860,951],[201,"Saurville","20","Haunted Forest","",1873,866],[202,"Haunted Forest","21-22","Haunted Forest","",1886,994],[203,"Desert of Whispers","22-23","Haunted Forest","",1940,1042],[204,"Pumpkin King`s Lodge","29","Pumpkin Lodge","",1552,1718],[209,"Savanna","19-20","Savanna","",1724,852],[210,"Crimson Dust","21-22","Dry Desert","",1781,857],[211,"Taiga","40-41","Taiga","",1165,1343],[212,"Taiga","41-42","Taiga","",1141,1306],[213,"Taiga","43-44","Taiga","",1144,1257],[214,"Taiga","45-46","Taiga","",1157,1217],[215,"Taiga","47-48","Taiga","",1187,1188],[216,"Taiga","48-49","Taiga","",1195,1145],[217,"Taiga","48-49","Taiga","",1107,1177],[218,"Desert of Lost Hope","14-15","Dry Desert","",1746,1452],[219,"Sandstorm Ridge","14-15","Dry Desert","",1787,1477],[220,"Burning Moon Sands","16-17","Dry Desert","",1840,1504],[221,"Deserted Cavern","16-17","Underground","",1882,1533],[222,"The Living Desert","16-17","Dry Desert","",1931,1490],[224,"Desert of Illusions","18-19","Dry Desert","",1987,1466],[225,"Devil’s Gulch","18-19","Dry Desert","",2057,1426],[226,"Temple Entrance","18-19","Dry Desert","",1969,1360],[227,"Shrubland","21-22","Shrubland","",2248,1304],[228,"Shrubland","21-22","Shrubland","",2301,1245],[229,"Ururg","20","Shrubland","",2410,1256],[230,"Red Desert","50-52","Red Desert","",2187,1626],[231,"Old Graveyard","22-23","Haunted Forest","",1948,957],[232,"Mausoleum Stairway","23-25","Underground","",1980,915],[233,"Mausoleum Chamber","23-25","Underground","",1980,915],[234,"Medusa’s Hallway","18-19","Underground","",1303,1096],[235,"Medusa’s Chamber","20","Underground","",1303,1096],[239,"Orc Domain Entrance","19-20","Dry Desert","",2161,1348],[240,"Shrubland","19-20","Shrubland","",2217,1336],[241,"Desert of the Damned","19-20","Dry Desert","",2115,1381],[243,"Sands of Echoes","18-19","Dry Desert","",2010,1532],[244,"Red Desert","18-19","Red Desert","",2039,1587],[245,"Red Desert","18-19","Red Desert","",2115,1613],[246,"Red Desert","19-20","Red Desert","",2114,1680],[247,"Underground","19-20","Underground","",2121,1736],[248,"Red Desert","20-21","Red Desert","",2114,1790],[249,"Red Desert","21-22","Red Desert","",2140,1845],[250,"Cactus Canyon","22-23","Dry Desert","",2132,1894],[251,"Unison Obelisk","23-24","Dry Desert","",2090,1925],[252,"Haunted Forest","21-22","Haunted Forest","",1931,797],[253,"Haunted Forest","23-24","Haunted Forest","",1998,801],[254,"Haunted Forest","25-26","Haunted Forest","",2061,801],[255,"Toxic River","27-28","Haunted Forest","",2044,855],[256,"Haunted Forest","27-28","Haunted Forest","",2081,890],[257,"Necropolis","29-30","Underground","",2138,844],[260,"Stirge Lair","29","Stirge Lair","",1530,1854],[262,"Sands of the Forgotten","21-22","Dry Desert","",1712,799],[263,"Mirage’s Eye","23-24","Dry Desert","",1682,758],[264,"Sandstorm Plains","25-26","Dry Desert","",1668,706],[265,"Taiga","25-26","Taiga","",1663,653],[266,"Taiga","27-28","Taiga","",1680,600],[267,"Taiga","27-28","Taiga","",1715,554],[268,"Taiga","29-30","Taiga","",1736,496],[269,"Orc’s Bone Road","40-41","Shrubland","",2438,1353],[270,"Orc’s Bone Road","41-42","Shrubland","",2448,1403],[271,"Orc’s Bone Road","43-44","Shrubland","",2449,1454],[272,"Shrubland","45-46","Shrubland","",2495,1501],[273,"Shrubland","47-48","Shrubland","",2540,1536],[274,"Shrubland","49-50","Shrubland","",2602,1541],[275,"Shrubland","21-23","Shrubland","",2461,1185],[276,"Shrubland","24-26","Shrubland","",2487,1127],[277,"Shrubland","31-33","Shrubland","",2506,1072],[278,"Shrubland","34-35","Shrubland","",2562,1028],[279,"Ancient Worm Tunnel","34-35","Underground","",2625,995],[280,"Shrubland","36-37","Shrubland","",2685,963],[281,"Trescan","30","Shrubland","",2752,890],[282,"Taiga","31-32","Taiga","",1711,462],[283,"Taiga","31-32","Taiga","",1676,420],[284,"Stogow","30","Tundra","",1656,342],[285,"Taiga","33-34","Taiga","",1722,306],[286,"Taiga","34-35","Taiga","",1752,266],[287,"Yeti’s Cave","35","Frost Cave","",1789,230],[288,"Itham’s Lakeshore","31-33","Coastal","",1927,1715],[289,"Itham’s Crator","34-35","Coastal","",1977,1767],[290,"Itham’s Old Bay","34-35","Coastal","",2009,1829],[291,"Itham’s Anchorage","36-37","Coastal","",1975,1895],[292,"Itham’s Heart","38-40","Itham’s Heart","",1774,1931],[293,"Rainforest","31-32","Rainforest","",3122,1529],[294,"Rainforest","31-32","Rainforest","",3163,1554],[295,"Rainforest","33-34","Rainforest","",3210,1580],[296,"Rainforest","33-34","Rainforest","",3217,1643],[297,"Rainforest","35-36","Rainforest","",3169,1644],[298,"Rainforest","35-36","Rainforest","",3109,1651],[299,"Rainforest","","Rainforest","",3261,1598],[300,"Rainforest","","Rainforest","",3318,1613],[301,"Rainforest","31-33","Rainforest","",3262,1687],[302,"Coveted Blossom","31-33","Rainforest","",3316,1712],[303,"Rainforest","","Rainforest","",3370,1648],[304,"Rainforest","37-38","Rainforest","",3161,1700],[305,"Rainforest","","Rainforest","",3412,1695],[306,"Rainforest","39-40","Rainforest","",3173,1767],[307,"Rainforest","41-42","Rainforest","",3130,1820],[308,"Haunted Forest","23-24","Haunted Forest","",1932,734],[309,"Haunted Forest","25-26","Haunted Forest","",1985,701],[310,"Haunted Forest","27-28","Haunted Forest","",2056,691],[311,"Haunted Forest","29-30","Underground","",2056,691],[313,"Haunted Forest","","Haunted Forest","",2243,724],[314,"Haunted Forest","","Haunted Forest","",2178,737],[315,"Haunted Forest","","Haunted Forest","",2123,777],[316,"Rainforest","43-45","Rainforest","",3123,1877],[317,"Galkathos","45","Rainforest","",3180,1890],[318,"Temple Hall","18-19","Temple","",2009,1333],[319,"Valdor’s Throneroom","23-25","Temple","",2009,1333],[320,"Glacierbane’s Hollow","49","Frost Cave","",1141,1306],[321,"Goliathor’s Temple","40","Rainforest","",3316,1712],[322,"Goliathor’s Throne Room","40","Ape Temple","",3316,1712],[323,"Trescan’s Dock","34-35","Coastal","",2605,900],[324,"Dark Boreal","40-41","Dark Boreal","",2703,799],[325,"Dark Boreal","41-42","Dark Boreal","",2720,723],[326,"Dark Boreal","43-44","Dark Boreal","",2735,654],[327,"Dark Boreal","45-46","Dark Boreal","",2727,594],[328,"The Ghost Shore","47-49","Ghost Shore","",2641,564],[329,"Dark Boreal","47-48","Dark Boreal","",2813,556],[330,"Dark Boreal","49-50","Dark Boreal","",2894,581],[331,"Dark Boreal","50-51","Dark Boreal","",2990,545],[332,"Grimble’s Camp","45","Dark Boreal","",2688,658],[333,"Magic Plains","40-42","Magic Plains","",1666,2299],[334,"Magic Plains","42-44","Magic Plains","",1753,2280],[335,"Magic Plains","44-46","Magic Plains","",1838,2266],[336,"Red Desert","54-56","Red Desert","",2118,1550],[337,"Red Desert","57-59","Red Desert","",2171,1510],[338,"Trial of Embers","59","Vulcanic Underground","",2213,1482],[339,"Tunnel of Embers","59","Vulcanic Underground","",2213,1482],[340,"Hall of Embers","59","Vulcanic Underground","",2213,1482],[341,"The Ember Forge","59","Vulcanic Underground","",2213,1482],[342,"Dark Boreal","40-41","Dark Boreal","",2833,994],[343,"Dark Boreal","41-42","Dark Boreal","",2870,1028],[344,"Dark Boreal","43-44","Dark Boreal","",2911,1054],[345,"Dark Boreal","45-46","Dark Boreal","",2945,1088],[346,"Dark Boreal","47-48","Dark Boreal","",2975,1122],[347,"Dark Boreal","48-49","Dark Boreal","",3028,1114],[348,"Laen Dorei","50","Dark Boreal","",3153,1085],[349,"Dark Boreal","50-51","Dark Boreal","",3158,1186],[350,"Dark Boreal","51-52","Dark Boreal","",3200,1240],[351,"Wardens’ Bridge","52-53","Coastal","",3260,1247],[352,"Wardens’ Bridge","53-54","Coastal","",3337,1246],[353,"Wardens’ Bridge","54-55","Coastal","",3415,1247],[354,"Mountain","55-56","Mountain","",3460,1271],[355,"Mountain","57-58","Mountain","",3480,1325],[356,"Mountain","59","Mountain","",3526,1361],[357,"Red Desert Cave","53-55","Vulcanic Underground","",2284,1622],[358,"Red Desert Cave","55","Vulcanic Underground","",2284,1622],[359,"House of Zehrak","59","Urban","",3526,1361],[360,"Dominion Spire","50","Urban","",2680,1547],[361,"Dominion Spire 2nd Floor","50","Urban","",2680,1547],[362,"Dominion Spire Roof","50","Urban","",2680,1547],[363,"Moldrir Depths","51-52","Underground","",3066,477],[364,"The Living Cavern","55","Underground","",3022,418],[900,"Abyssal Tower Entrance","1","Urban","",651,1998],[901,"Abyssal Tower","1","Grassland","",651,1998],[902,"Abyssal Tower","10","Magic Plains","",651,1998],[903,"Abyssal Tower","20","Dry Desert","",651,1998],[904,"Abyssal Tower","30","Deep Forest","",651,1998],[905,"Abyssal Tower","40","Haunted Forest","",651,1998],[906,"Abyssal Tower","50","Taiga","",651,1998],[907,"Abyssal Tower","60","Urban","",651,1998],[908,"Abyssal Tower","70","Urban","",651,1998],[909,"Abyssal Tower","80","Urban","",651,1998],[910,"Abyssal Tower","90","Urban","",651,1998],[911,"Abyssal Tower","100","Urban","",651,1998],[998,"Fall of Rebirth","60","Enchanted Forest","",887,1797],[1000,"Fountain of Rebirth","1","Enchanted Forest","Arodas",887,1797],[1001,"Winter Wonderland Lobby","100","Taiga","",541,1868],[1002,"Winter Wonderland","1-9","Taiga","",541,1868],[1003,"Winter Wonderland","10-19","Taiga","",541,1868],[1004,"Winter Wonderland","20-29","Taiga","",541,1868],[1005,"Winter Wonderland","30-39","Taiga","",541,1868],[1006,"Winter Wonderland","40-49","Taiga","",541,1868],[1007,"Winter Wonderland","50-59","Taiga","",541,1868],[1027,"Loveland Lobby","100","Loveland","",541,1868],[1028,"Loveland","1-9","Loveland","",541,1868],[1029,"Loveland","10-19","Loveland","",541,1868],[1030,"Loveland","20-29","Loveland","",541,1868],[1031,"Loveland","30-39","Loveland","",541,1868],[1032,"Loveland","40-49","Loveland","",541,1868],[1033,"Loveland","50-59","Loveland","",541,1868],[1040,"Patrick’s Land Lobby","100","Grassland","",541,1868],[1041,"Patrick’s Land","1-9","Grassland","",541,1868],[1042,"Patrick’s Land","10-19","Grassland","",541,1868],[1043,"Patrick’s Land","20-29","Grassland","",541,1868],[1044,"Patrick’s Land","30-39","Grassland","",541,1868],[1045,"Patrick’s Land","40-49","Grassland","",541,1868],[1046,"Patrick’s Land","50-59","Grassland","",541,1868],[1066,"Bunnyland Lobby","100","Spring Fields","",541,1868],[1067,"Bunnyland","1-9","Spring Fields","",541,1868],[1068,"Bunnyland","10-19","Spring Fields","",541,1868],[1069,"Bunnyland","20-29","Spring Fields","",541,1868],[1070,"Bunnyland","30-39","Spring Fields","",541,1868],[1071,"Bunnyland","40-49","Spring Fields","",541,1868],[1072,"Bunnyland","50-59","Spring Fields","",541,1868],[1144,"Das Festhalle Lobby","100","Mountain","",541,1868],[1145,"Das Festhalle","1-9","Mountain","",541,1868],[1146,"Das Festhalle","10-19","Mountain","",541,1868],[1147,"Das Festhalle","20-29","Mountain","",541,1868],[1148,"Das Festhalle","30-39","Mountain","",541,1868],[1149,"Das Festhalle","40-49","Mountain","",541,1868],[1150,"Das Festhalle","50-59","Mountain","",541,1868],[1157,"Sleepy Hollow Lobby","100","Hollow Forest","",541,1868],[1158,"Sleepy Hollow","1-9","Hollow Forest","",541,1868],[1159,"Sleepy Hollow","10-19","Hollow Forest","",541,1868],[1160,"Sleepy Hollow","20-29","Hollow Forest","",541,1868],[1161,"Sleepy Hollow","30-39","Hollow Forest","",541,1868],[1162,"Sleepy Hollow","40-49","Hollow Forest","",541,1868],[1163,"Sleepy Hollow","50-59","Hollow Forest","",541,1868],[1183,"The Sacred Wilds Lobby","100","Wyvern Forest","",541,1868],[1184,"The Sacred Wilds","1-9","Wyvern Forest","",541,1868],[1185,"The Sacred Wilds","10-19","Wyvern Forest","",541,1868],[1186,"The Sacred Wilds","20-29","Wyvern Forest","",541,1868],[1187,"The Sacred Wilds","30-39","Wyvern Forest","",541,1868],[1188,"The Sacred Wilds","40-49","Wyvern Forest","",541,1868],[1189,"The Sacred Wilds","50-59","Wyvern Forest","",541,1868],[2001,"Overgrown Land","1","Temperate Forest","",503,1787],[2002,"Encampment","10","Temperate Forest","",503,1787],[2003,"Fenced Encampment","20","Temperate Forest","",503,1787],[2004,"Village","30","Temperate Forest","",503,1787],[2005,"Tudor Village","40","Temperate Forest","",503,1787],[2006,"Motte-and-Bailey","50","Temperate Forest","",503,1787],[2007,"Stone Keep","60","Temperate Forest","",503,1787],[2100,"Ashspire Battlegrounds","1-60","Temperate Forest","",503,1787]];
  function navUnlockWorldMap() {
    if (!cfg.worldMapUnlock) return;
    const box = document.getElementById('world_map_container');
    if (!box) return;
    let shown = true;
    try { shown = getComputedStyle(box).display !== 'none'; } catch (e) { /* ignore */ }
    if (!shown) return;
    const svg = document.getElementById('world_map');
    if (!svg) return;
    /* 找到游戏放地图点的那个 <g>（有 map_id 的节点的父级）；找不到就退到 svg 下第一个 <g>，再退到 svg 本身 */
    let anchor = null;
    const gs = svg.querySelectorAll('g');
    for (let i = 0; i < gs.length; i++) {
      if (gs[i].parentNode === svg && gs[i].querySelector('g[map_id]')) { anchor = gs[i]; break; }
    }
    if (!anchor) { for (let i = 0; i < gs.length; i++) { if (gs[i].parentNode === svg) { anchor = gs[i]; break; } } }
    if (!anchor) anchor = svg;
    const have = {};
    const cur = svg.querySelectorAll('g[map_id]');
    for (let i = 0; i < cur.length; i++) have[cur[i].getAttribute('map_id')] = 1;
    let added = 0;
    for (let i = 0; i < WM_UNLOCK_MAPS.length; i++) {
      const m = WM_UNLOCK_MAPS[i];
      const id = String(m[0]);
      if (have[id]) continue;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('map_id', id);
      g.setAttribute('title', '');
      g.setAttribute('content',
        '\n<h1 class=left>' + m[1] + '</h1><br/>\n<h2 class=left>\nLevel: <span class=transp75>' + m[2] +
        '</span><br/>\nBiome: <span class=transp75>' + m[3] + '</span><br/>' +
        (m[4] ? '\nContinent: <span class=transp75>' + m[4] + '</span>' : '') +
        '<hr/>\n</h2>\n<i>Click for more information</i>\n' +
        '<div class=\'divblock_dark tooltip-costlabel smaller\'>🗺️ Map #' + id + '</div>\n');
      g.setAttribute('hover_title', '');
      g.setAttribute('class', 'circle-animated tooltip2');
      g.setAttribute('id', 'map_' + id);
      g.setAttribute('transform', 'translate(' + (m[5] - 8) + ',' + (m[6] - 8) + ')');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', 'map_name');
      g.setAttribute('tabindex', '0');
      g.setAttribute('data-nr-unlocked', '1');
      g.innerHTML = '<rect height=40 width=40 rx=70 ry=40 transform="translate(-6 -6)"></rect>' +
                    '<circle class=circle1 fill="#fff" cx="13.5" cy="13.5" r="9.8"></circle>' +
                    '<circle class=circle2 fill="#99714e" cx="13.5" cy="13.5" r="4.2"></circle>';
      g.addEventListener('pointerup', function () {
        if (window.did_move) return;
        try { playSound('btn_click'); } catch (e) { /* ignore */ }
        try { createDialog('Map Details', '', 'ajax', '/modal/map_info?id=' + id, false, false, false, 'Map Details'); } catch (e) { /* ignore */ }
      });
      anchor.appendChild(g);
      added++;
    }
    /* 去迷雾：遮罩矩形一去掉，整幅地图就都亮了 */
    const fog = svg.querySelector('rect.world-map-fog');
    if (fog) { try { fog.parentNode.removeChild(fog); } catch (e) { /* ignore */ } }
    /* 新加的节点要让游戏重新初始化一次 tooltip，鼠标移上去才有效 */
    if (added) { try { if (typeof window.createTooltip === 'function') window.createTooltip(); } catch (e) { /* ignore */ } }
  }

  function navDecorateWorldMap() {
    const box = document.getElementById('world_map_container');
    if (!box) return;
    let shown = true;
    try { shown = getComputedStyle(box).display !== 'none'; } catch (e) { /* ignore */ }
    if (!shown) return;
    const gs = box.querySelectorAll('#world_map g[map_id]');
    for (let i = 0; i < gs.length; i++) {
      /* ★ 单张图出错不能连累后面的图：以前这里一抛异常，整轮装饰就断了，
         表现成「世界地图上后面那些图的怪/资源点全没了」。 */
      try {
        const g = gs[i];
        const id = g.getAttribute('map_id');
        if (!id) continue;
        let base = g.getAttribute(WM_BASE_ATTR);
        if (base == null) { base = g.getAttribute('content') || ''; g.setAttribute(WM_BASE_ATTR, base); }
        const next = base + navWmPoiBlock(id);
        if (g.getAttribute('content') !== next) g.setAttribute('content', next);
      } catch (e) { /* 跳过这张图，继续下一张 */ }
    }
  }

  /* ★★ 2026-10-17 中文（及其它非英文）界面：游戏的 frame id = 'frame_' + 标题.replace(/[^a-zA-Z]+/g,'') 。
     标题被本地化后（例：Map Details → 「地图详细资讯」），id 直接变成 `frame_`（空）——
     于是 getElementById('frame_MapDetails') 永远拿不到，导航按钮就注入不了。
     这里改成「先按 id，再按内容特征（地图缩略图 / data-map-info-id）反查最内层那个 frame」。 */
  function navMapDetailsFrame() {
    const byId = document.getElementById('frame_MapDetails');
    if (byId) return byId;
    const all = Array.prototype.slice.call(document.querySelectorAll('[id^="frame_"]'));
    const hits = all.filter(function (el) {
      if (el.id === 'frame_container') return false;
      /* ★ v2.6.104：走私路线面板也有 world_map_ 缩略图，但不是 Map Details → 不注入导航按钮 */
      if (el.id === 'frame_SmugglersRoute') return false;
      return !!el.querySelector('.frame-content .avatar[style*="world_map_"]')
          || !!el.querySelector('.frame-content [data-map-info-id]');
    });
    for (let i = 0; i < hits.length; i++) {
      const inner = hits[i].querySelectorAll('[id^="frame_"]');
      let nested = false;
      for (let j = 0; j < inner.length; j++) if (hits.indexOf(inner[j]) >= 0) { nested = true; break; }
      if (!nested) return hits[i];
    }
    return hits[0] || null;
  }

  /* ---- Move 按钮注入到 Map Details ---- */
  let navInjectLogged = '';   /* ★ 诊断去重：同一状态只往面板日志写一次，避免刷屏 */
  function navInjectMoveButton() {
    const f = navMapDetailsFrame();
    if (!f) { navInjectLogged = ''; return; }        /* 窗口关了 → 重置诊断 */
    const done = function (msg) {
      if (navInjectLogged === msg) return;
      navInjectLogged = msg;
      try { logEvent('导航按钮 · ' + msg); } catch (e) { /* ignore */ }
    };
    /* ① 地图 id 解析：优先缩略图文件名（world_map_<id>_x_y.jpg）；
       ★ 2026-10 新前端兜底：内容块带 data-map-info-id="<id>"，未探索/无缩略图时也能拿到。 */
    const thumb = f.querySelector('.avatar');
    const bg = thumb ? (thumb.getAttribute('style') || '') : '';
    const m = /world_map_(\d+)_/.exec(bg);
    let mapId = m ? +m[1] : 0;
    if (!mapId) {
      const blk = f.querySelector('[data-map-info-id]');
      if (blk) mapId = (+blk.getAttribute('data-map-info-id')) || 0;
    }
    if (!mapId) { done('未识别到地图 id（缩略图与内容块都没有），跳过'); return; }
    /* ★ v2.6.18：锚点必须是「传送 / How to Travel」那个动作按钮本身（btn-epic / btn-unique / btn-primary），
       并把「导航」插在它**后面、同一个 .align_left 里** —— 这样两个按钮才会在同一行。
       旧版只认 a.btn-epic：Noble 的 Free Teleport 是 a.btn-unique → 匹配不到 → 退回块级 .align_left
       → 导航永远另起一行（用户反馈）。 */
    const actBtn = findMapDetailsTeleport(f)
                 || f.querySelector('.align_left a.btn-unique, .align_left a.btn-primary, .align_left a.btn-epic')
                 || f.querySelector('a.btn-unique, a.btn-primary, a.btn-epic');
    const anchor = actBtn || f.querySelector('.frame-content .align_left') || f.querySelector('.frame-content');
    if (!anchor || !anchor.parentNode) { done('地图 ' + mapId + '：内容区尚未渲染，等待重试'); return; }
    if (f.querySelector('#nav_move_btn')) { done('地图 ' + mapId + '：按钮已就位（v2.6.18，frame#' + f.id + '）'); return; }
    const btn = document.createElement('a');
    btn.id = 'nav_move_btn';
    /* ★ 和游戏自带的 Teleport 按钮同款：btn-epic + 43×43 的 res-icon 图标（div[class*="res-icon-"].small_icon） */
    btn.className = 'btn btn-epic';
    btn.style.cssText = 'margin-left:8px;';
    btn.innerHTML = '<div style="background-image:url(/images/icons/world_map.gif);" class="align_middle res-icon-nav small_icon"></div> 导航';
    /* ★ v2.6.18：宽度按「同一行剩余空间」算 = .align_left 宽 - 动作按钮宽 - 间距，
       保证和传送按钮挤在一行。旧版用 3.5/12（整块 610px 的 3.5/12 = 178px），比整行 323px 还富余不出来 → 换行。 */
    try {
      const al = f.querySelector('.align_left') || anchor.parentNode;
      const rowW = al ? al.getBoundingClientRect().width : 0;
      const actW = actBtn ? actBtn.getBoundingClientRect().width : 0;
      if (rowW > 0) {
        let w = (actW > 0) ? Math.floor(rowW - actW - 16) : Math.floor(rowW * 0.42);
        w = Math.max(88, Math.min(w, Math.floor(rowW)));
        btn.style.width = w + 'px';
      }
    } catch (e) { /* ignore */ }
    btn.style.minWidth = '0';
    btn.style.whiteSpace = 'nowrap';
    btn.style.overflow = 'hidden';
    btn.style.textOverflow = 'ellipsis';
    btn.style.boxSizing = 'border-box';
    btn.style.textAlign = 'center';
    const reach = navRoute(character.current_map, mapId);
    btn.title = reach
      ? ('走过去：' + [character.current_map].concat(reach).map(navMapName).join(' → '))
      : '该区域尚未探索，暂无路线（玩到那边会自动补全）';
    if (!reach) btn.style.opacity = '0.55';
    btn.onclick = function () {
      const box = navMapDetailsFrame();
      if (box) { try { window.closeFrame(box); } catch (e) { box.style.display = 'none'; } }
      navTravelTo(mapId);
    };
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    done('地图 ' + mapId + '（' + navMapName(mapId) + '）：已注入' + (reach ? '，有路线' : '，暂无路线'));
  }
  try {
    new MutationObserver(function () { navInjectMoveButton(); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* ignore */ }
  /* ★ 2026-10 新前端：Map Details 是 ajax 后注入内容的，MutationObserver 往往在缩略图/按钮就绪前就触发一次，
     之后不再触发 → 导航按钮注入不了。这里加一个廉价轮询兜底（不开窗时 getElementById 返回 null，几乎零开销）。 */
  rhythmTimer(function () { try { navInjectMoveButton(); } catch (e) { /* ignore */ } }, 1200);
  rhythmTimer(function () { navLearn(); poiLearnNow(); }, 2500);
  /* ★ 世界地图开着时，把「资源点 / 怪物」刷进地名 tooltip（关了就是一次 getComputedStyle，几乎零开销） */
  rhythmTimer(function () { try { navUnlockWorldMap(); } catch (e) { /* ignore */ } try { navDecorateWorldMap(); } catch (e) { /* ignore */ } }, 1200);
  /* ★ v2.6.82：进游戏后拉一次「采集点 / 敌人」实时数据（缓存 24h；失败回退内置快照）。
     不能在 /login、/choose_char 上拉（那时还没进世界，接口拿不到内容）→ 等 inGame() 再拉。 */
  (function () {
    let wmTried = false;
    rhythmTimer(function () {
      if (wmTried || !inGame()) return;
      wmTried = true;
      try { wmLoadLivePoi(); } catch (e) { /* ignore */ }
    }, 2000);
  })();
  rhythmTimer(function () { if (MapDB.isDirty()) MapDB.save(); }, 3000);
  /* ★ v2.6.124：遇敌逃跑看门狗（勾上即生效，与是否开始挂机无关） */
  rhythmTimer(function () { try { fleeWatchTick(); } catch (e) { /* ignore */ } }, 700);
  window.addEventListener('beforeunload', function () { if (MapDB.isDirty()) MapDB.save(); });

  /* 自动切图触发（带节流） */
  function autoMapSwitchMaybe() {
    if (!cfg.autoMapSwitch || !running || !inGame()) return;
    if (st.mapSwitch.active || navBusy) return;
    if (now() - st.mapSwitch.lastAt < 4000) return;
    if (!st.mapSwitch.idleSince) { st.mapSwitch.idleSince = now(); return; }
    if (now() - st.mapSwitch.idleSince < cfg.mapSwitchIdleSec * 1000) return;
    st.mapSwitch.idleSince = 0;
    st.mapSwitch.active = true;
    const seq = ++navAutoSeq;   // ★ 本次切图的会话号
    navRoamStep(seq).then(function () { st.mapSwitch.active = false; }, function () { st.mapSwitch.active = false; });
  }

  /* ======================= 20. 采集遇怪逃跑（融合自 norroth-assistant） =======================
   * 只采集模式（勾了「遇怪逃跑」）下，一进战斗就点游戏自带的「逃跑」按钮，不打断采集节奏。
   * 找不到逃跑按钮 / 不在战斗 → 返回 false，退回原来的「交给游戏自动战斗」。 */
  /* ★ 让游戏「逃跑」：优先点技能栏里的 Run 按钮（像真人点击）；
     技能栏还没渲染 / 被 lock / 找不到按钮 → 直接调游戏全局 fight('Run')
     （= 按 Run 快捷键，游戏 gamepage 的键盘绑定就是这么做的）。返回 'click' | 'api' | null。 */
  function gameRunAway() {
    try {
      const bar = document.getElementById('window_skillbar');
      if (bar) {
        const run = Array.prototype.slice.call(bar.querySelectorAll('a, button')).find(function (b) {
          const h = b.getAttribute('onclick') || '';
          return /fight\(\s*(['"`])Run\1\s*\)/i.test(h)
            && !b.hasAttribute('disabled') && b.getAttribute('aria-disabled') !== 'true';
        });
        if (run) { humanClick(run); return 'click'; }   /* ★ v2.6.19：走 humanClick（带随机间隔） */
      }
    } catch (e) { /* ignore */ }
    try { if (typeof window.fight === 'function') { window.fight('Run'); return 'api'; } } catch (e) { /* ignore */ }
    return null;
  }
  let _fleeAt = 0;
  function tryGatherFlee() {
    if (now() - _fleeAt < 1500) return true;   // 刚点过：等它生效，别连点
    const how = gameRunAway();
    if (!how) return false;
    _fleeAt = now();
    logEvent('遇敌逃跑', { key: 'flee:' + character.current_map });
    setStatus('遇敌逃跑中…');
    return true;
  }

  /* ★ v2.6.124：「遇敌逃跑」改成「勾上即生效」的独立看门狗 —— **不需要开始挂机**。
     只在「战斗 / 爬塔」任务**运行中**自动屏蔽（那时候要打，不能逃）。
     多角色副角色页有自己的策略（altPageCombatPolicy），这里让路，避免重复点。 */
  const FLEE_MASK_TASKS = ['battle', 'tower'];
  function fleeWatchTick() {
    if (!cfg.gatherFlee) return;
    if (!inGame()) return;
    if (running && cfg.autoOverlord && ovlInBattle()) return;
    if (running && !st.paused && FLEE_MASK_TASKS.indexOf(String(cfg.task || 'battle')) >= 0) return;   /* 战斗 / 爬塔 → 屏蔽 */
    if (st.altTrip) return;
    if (!hasFrame('frame_Combat')) return;
    tryGatherFlee();
  }
  /* ★ 多角色：副角色页「只采集、不打架」策略。
     副角色是来挂 idle 采集的，路上遇怪不该还手（会掉血 / 死亡 / 浪费时间）。
     行程期间先「逃跑」，能逃再把游戏自动战斗（#auto_combat）关掉。 */
  let _altFleeAt = 0;
  function altPageCombatPolicy() {
    if (!st.altTrip) return false;
    if (!hasFrame('frame_Combat')) return false;
    /* ★ 先确保「能逃」再关自动战斗：万一技能栏和 fight() 都不可用，
       关掉自动战斗只会让副角色站着挨打 —— 那种情况就维持原样（交给游戏自动战斗）。 */
    let how = null;
    if (now() - _altFleeAt > 1500) {
      how = gameRunAway();
      if (how) { _altFleeAt = now(); logEvent('副角色遇敌逃跑', { key: 'alt-flee:' + character.current_map }); setStatus('多角色：副角色页遇怪逃跑中…'); }
    }
    if (how) {
      try {
        const c = document.getElementById('auto_combat');
        if (c && c.checked) {
          c.checked = false;
          c.dispatchEvent(new Event('change', { bubbles: true }));
          logEvent('多角色：副角色页已关闭自动战斗');
        }
      } catch (e) { /* ignore */ }
    }
    return true;
  }

  /* ======================= 21. 高亮自己位置（融合自 norroth-assistant） =======================
   * 给 #players_container 里自己的精灵加一圈描边。纯 CSS，不碰可见性、不改 DOM，脚本逻辑不受影响。 */
  let _hlId = null, _hlOn = null;
  function applyHighlightSelf() {
    try {
      let style = document.getElementById('nr-hl-style');
      if (!style) { style = document.createElement('style'); style.id = 'nr-hl-style'; document.head.appendChild(style); }
      const on = !!cfg.highlightSelf;
      const id = (character && character.id) || null;
      if (!on) { if (_hlOn !== false) { style.textContent = ''; _hlOn = false; _hlId = null; } return; }
      if (!id) return;
      if (id === _hlId && _hlOn === true) return;
      _hlId = id; _hlOn = true;
      /* ★ 光圈放大 50%：改用 150% 大小的伪元素（inset:-25%）画整圈（描边 + 光晕），
         与精灵实际尺寸无关，比原来贴精灵的 outline 大一圈。 */
      style.textContent = '#players_container #player_' + id + '::after{content:"";position:absolute;inset:-25%;border-radius:50%;border:2px solid #ffd76e;box-shadow:0 0 0 2px rgba(0,0,0,.55),0 0 12px rgba(255,215,110,.75);pointer-events:none;z-index:6}';
    } catch (e) { /* ignore */ }
  }

  /* ======================= 22. 诊断日志导出（融合自 norroth-assistant） =======================
   * 把当前状态 + 最近 300 条操作日志导出成 txt（自动抹掉网址与凭据），方便排查 / 反馈。 */
  // 只记录候选属性是否存在及可见性，不记录装备属性原文或页面 HTML。
  function itemSpecialistDiag() {
    try {
      const frame = document.getElementById('frame_ItemSpecialist');
      if (!frame) return null;
      const visible = function (el) {
        const css = getComputedStyle(el), r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id || '', classes: String(el.className || ''),
          display: css.display, visibility: css.visibility, opacity: css.opacity,
          filter: css.filter, animation: css.animationName, width: Math.round(r.width), height: Math.round(r.height) };
      };
      return { columns: $$q('td[data-name="reroll_stats"]', frame).slice(0, 10).map(function (el) {
        const ancestors = []; let p = el;
        for (let i = 0; p && i < 6; i++, p = p.parentElement) ancestors.push(visible(p));
        return { textLength: (el.textContent || '').trim().length, childCount: el.children.length,
          children: Array.from(el.children).slice(0, 12).map(visible), ancestors: ancestors };
      }), skin: cfg.skin, scale: cfg.winScale };
    } catch (e) { return { error: '读取属性显示状态失败' }; }
  }

  function exportErrorLog() {
    try {
      const clean = function (s) {
        return String(s == null ? '' : s)
          .replace(/\b(?:https?:\/\/|\/includes\/|\/modal\/)[^\s]+/gi, '[地址已省略]')
          .replace(/\b(?:[a-z_]*token|cookie|authorization|password|session(?:id)?)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '[凭据已隐藏]')
          .slice(0, 2000);
      };
      const safe = function (fn, d) { try { const v = fn(); return (v === undefined) ? (d === undefined ? null : d) : v; } catch (e) { return (d === undefined ? null : d); } };
      const c = (typeof character === 'object' && character) || {};

      /* ---- 运行态 ---- */
      const frames = safe(function () { return Array.from(document.querySelectorAll('[id^=frame_]')).map(function (el) { return el.id; }); }, []);
      const walkQ = safe(function () { return (window.walkQueue && window.walkQueue[c.id]) ? window.walkQueue[c.id].length : -1; }, -1);
      const state = {
        version: SCRIPT_VER, skin: cfg.skin, task: cfg.task, mode: cfg.runMode, targetMode: cfg.targetMode, paused: !!st.paused,
        phase: st.phase, status: clean(st.statusText || ''),
        inGame: safe(inGame, false), running: !!running,
        charId: c.id, charName: clean(c.name || ''), charClass: clean(c.class || ''),
        map: c.current_map, mapName: safe(function () { return currentMapName(); }, ''),
        x: c.x, y: c.y, level: c.level, hp: c.current_health, mp: c.current_mana, exp: c.current_exp,
        kills: st.kills, gathers: st.gathers, deaths: st.deaths,
        targetDiag: safe(targetDiag, null),
        gatherFlee: !!cfg.gatherFlee, highlightSelf: !!cfg.highlightSelf,
        itemSpecialist: itemSpecialistDiag(),
        overlord: safe(function () { const o = st.ovl; return { on: !!o.on, phase: o.phase, nextEpoch: o.nextEpoch,
          joinedEpoch: o.joinedEpoch, finishedEpoch: o.finishedEpoch, homeMap: o.homeMap,
          countdownAgeMs: o.countdownAt ? now() - o.countdownAt : null }; }, null),
        frames: frames, walkQueueLen: walkQ, walkTo: clean(c.walk_to || ''),
        move: safe(function () { return st.move ? { tx: st.move.tx, ty: st.move.ty, kind: st.move.kind, label: clean(st.move.label || ''), retries: st.move.retries, atAgoMs: st.move.at ? (now() - st.move.at) : null } : null; }, null),
        trip: { manual: !!st.tripManual, town: st.tripTown || '', home: st.tripHome || '', origin: st.tripOrigin || '' },
        service: { repair: !!st.repair.active, repairCdS: Math.max(0, Math.round((st.repair.cooldownUntil - now()) / 1000)), repairFails: st.repair.failCount,
                   bank: !!st.bank.active, bankCdS: Math.max(0, Math.round((st.bank.cooldownUntil - now()) / 1000)),
                   sell: !!st.sell.active, sellCdS: Math.max(0, Math.round((st.sell.cooldownUntil - now()) / 1000)),
                   bagFree: st.sell.free, bagCap: st.sell.cap },
        nudging: !!st.nudging, returning: !!st.returning, healing: !!st.healing,
        watch: { exp: st.watch.exp, kills: st.watch.kills, heals: st.watch.heals },
        frozen: { pos: st.frozen.pos, hits: st.frozen.hits },
        event: { on: !!st.event.on, phase: st.event.phase, busy: !!st.event.busy,
                 busyHeldMs: st.event.busyAt ? (now() - st.event.busyAt) : null,
                 lastCheckAgoMs: st.event.lastCheckAt ? (now() - st.event.lastCheckAt) : null,
                 checkFails: st.event.checkFails || 0, lastHas: st.event.lastHas,
                 combatSkipAgoMs: st.event.combatSkipAt ? (now() - st.event.combatSkipAt) : null,
                 homeMap: st.event.homeMap, homePoint: clean(st.event.homePoint || ''), pointName: clean(st.event.pointName || '') },
        lastActionAgoMs: st.lastAction ? (now() - st.lastAction) : null,
        idleActAt: st.idleActAt || 0
      };

      /* ---- 配置（只导出标量，跳过对象/数组） ---- */
      const cfgDump = {};
      Object.keys(cfg).forEach(function (k) {
        const v = cfg[k];
        if (v === null || typeof v === 'number' || typeof v === 'boolean') cfgDump[k] = v;
        else if (typeof v === 'string') cfgDump[k] = clean(v).slice(0, 200);
      });
      const humanFlags = { delayOn: safe(humanDelayOn, false), rhythmOn: safe(humanRhythmOn, false), jitterOn: safe(humanJitterOn, false) };

      /* ---- 多角色 ---- */
      const mc = {
        multiChar: !!cfg.multiChar,
        chars: (cfg.mcChars || []).map(function (a) {
          return { id: a.id, name: clean(a.name || ''), role: a.role, enabled: !!a.enabled,
            gatherMap: a.gatherMap, nodeX: a.nodeX, nodeY: a.nodeY, res: clean(a.res || ''),
            profession: a.profession, serviceTown: a.serviceTown, repairOn: !!a.repairOn, depositOn: !!a.depositOn };
        }),
        rot: safe(function () {
          if (!rot) return null;
          const idle = {};
          Object.keys(rot.idle || {}).forEach(function (k) {
            const r = rot.idle[k] || {};
            idle[k] = { epoch: r.epoch || 0, readyInS: r.readyAt ? Math.max(0, Math.round((r.readyAt - now()) / 1000)) : 0,
              est: r.est || 0, fail: !!r.fail, failMsg: clean(r.failMsg || ''), label: clean(r.label || ''), res: clean(r.res || ''), loc: clean(r.loc || '') };
          });
          return { on: !!rot.on, phase: rot.phase, step: rot.step, tripAlt: rot.tripAlt, switching: rot.switching || null,
            rotWaitS: rot.rotWaitUntil ? Math.max(0, Math.round((rot.rotWaitUntil - now()) / 1000)) : 0,
            firstStart: !!rot.firstStart, idle: idle };
        }, null),
        queueCache: safe(function () { return (_mcQueueCache || []).map(function (s) { return { name: clean(s.name || ''), label: clean(s.label || ''), epoch: s.epoch, res: clean(s.res || ''), loc: clean(s.loc || '') }; }); }, [])
      };

      /* ---- 导航 / 地图库 ---- */
      const nav = {
        navBusy: safe(function () { return !!navBusy; }, null),
        mapdb: safe(function () { return { maps: MapDB.count(), edges: MapDB.edgeCount(), mapsWithGt: MapDB.list().filter(function (r) { return r.gt && r.gt.length; }).length }; }, null),
        curMapGatherTiles: safe(function () { return (MapDB.gatherTiles(c.current_map) || []).map(function (t) { return t[0] + '-' + t[1] + ' ' + t[2]; }); }, [])
      };

      const logs = (st.log || []).slice(-300).map(function (e) {
        return '[' + clean(e.n > 1 && e.firstT ? e.firstT + '–' + e.t : e.t) + '] ' + logEntryText(e, clean);
      });
      const text = ['Norroth 小伴侣 · 诊断日志', '版本：' + SCRIPT_VER, '导出时间：' + new Date().toISOString(),
        '（仅含助手记录与白名单状态；不含账号凭据 / 聊天 / 网址）', '',
        '== 运行态 ==', JSON.stringify(state, null, 2), '',
        '== 配置（标量） ==', JSON.stringify(cfgDump, null, 2), '',
        '== 真人化开关 ==', JSON.stringify(humanFlags, null, 2), '',
        '== 多角色 ==', JSON.stringify(mc, null, 2), '',
        '== 导航 / 地图库 ==', JSON.stringify(nav, null, 2), '',
        '近期操作日志（最多 300 条）：'].concat(logs).join('\n');
      const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'norroth-log-' + new Date().toISOString().replace(/[:.]/g, '-') + '.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
      setStatus('已导出诊断日志');
    } catch (e) { setStatus('导出失败：' + (e && e.message ? e.message : String(e))); }
  }

  /* ============================================================================
   * 图鉴导出：读取游戏内 Inspect（/modal/inspect_enemy）里本账号的记录，导出 JSON
   *   数据只读，不改动游戏。解锁层级：
   *     0 次   = 名称 / 类型 / 群系 / 背景故事
   *     ≥1 次  = 等级范围 / 阵营 / 特殊能力 / 生命·防御·抗性 / 拾荒掉落 / 掉落
   *     ≥10 次 = 技能
   *     ≥20 次 = 34 项数值属性
   *   提速：先向 /modal/bestiary 要 id 清单（1 个请求，193 条），只抓这些；
   *         并发 6（HTTP/1.1 每域名连接上限，再高无收益），实测约 20 秒。
   * ========================================================================== */
  const BEST_CONC = 6, BEST_RANGE_MAX = 270;
  let _bestBusy = false, _bestCancel = false;

  /* 取要抓的 id 清单：优先用图鉴界面（准确、少 1/3 请求），失败退回数值区间 */
  async function bestiaryIds() {
    try {
      const r = await fetch('/modal/bestiary', { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (r.ok) {
        const t = await r.text();
        const ids = []; const re = /id=codex_(\d+)/g; let m;
        while ((m = re.exec(t))) ids.push(+m[1]);
        if (ids.length > 50) return { ids: ids, src: 'codex' };
      }
    } catch (e) { /* ignore */ }
    const ids = []; for (let i = 1; i <= BEST_RANGE_MAX; i++) ids.push(i);
    return { ids: ids, src: 'range' };
  }

  function parseInspectEnemy(t) {
    const g = function (re) { const m = t.match(re); return m ? m[1] : ''; };
    const name = g(/<div class=divblock_dark>\s*<b>([^<]+)<\/b>/);
    if (!name) return null;
    const o = {
      id: 0, name: name,
      type: g(/align_left black">[^<]*<\/h2>\s*([^<]*)<br>/),
      biome: g(/<span class=smaller>([^<]*)<\/span>/),
      lore: g(/<span class=scroll>([\s\S]*?)<\/span>/),
      recorded: !/Unknown Creature/.test(t),
      levelRange: '', alignment: '', specials: '', health: '', defense: '', resistance: '',
      scavenging: [], drops: [], skills: [], stats: {}, killCount: 0
    };
    if (o.recorded) {
      o.levelRange = g(/Level:<\/b><\/div><div class=col-xs-6>([^<]*)</);
      o.alignment = g(/Alignment:<\/b><\/div><div class=col-xs-6>([^<]*)</);
      o.specials = g(/Specials:<\/b><\/div><div class=col-xs-6>([^<]*)</);
      o.health = g(/Health:<\/b><\/div><div class=col-xs-5><span class="label [^"]*">([^<]*)</);
      o.defense = g(/Defense:<\/b><\/div><div class=col-xs-5><span class="label [^"]*">([^<]*)</);
      o.resistance = g(/Resistance:<\/b><\/div><div class=col-xs-5><span class="label [^"]*">([^<]*)</);
    }
    const grab = function (label) {
      const i = t.indexOf(label); if (i < 0) return [];
      const seg = t.slice(i, i + 4000);
      const end = seg.indexOf('</div><div class="divblock_dark fade-in">');
      const body = end > 0 ? seg.slice(0, end) : seg;
      const items = [];
      const re = /hover_title="([^"]*)"[^>]*res="([^"]*)"[^>]*><\/div><span>([^<]*)<\/span>/g;
      let m; while ((m = re.exec(body))) items.push({ name: m[1], res: m[2], pct: m[3] });
      return items;
    };
    o.scavenging = grab('🔪 Scavenging:');
    o.drops = grab('📦 Drops:');
    o.killCount = +(((t.match(/Current Kill Count:\s*(\d+)/) || [])[1]) || 0);
    if (/id=tab_skills[\s\S]*?skill-id=/.test(t)) {
      const seg = t.slice(t.indexOf('id=tab_skills'));
      const re = /title='([^']+)' skill-id=(\d+) skill-level=(\d+)/g; let m;
      while ((m = re.exec(seg))) o.skills.push({ name: m[1], id: +m[2], level: +m[3] });
    }
    if (/id=tab_stats[\s\S]*?stat-value=/.test(t)) {
      const a = t.indexOf('id=tab_stats'), b = t.indexOf('id=tab_skills');
      const seg = t.slice(a, b > a ? b : a + 20000);
      const re = /name='([^']+)'[^>]*><\/div>\s*([^<]*?)<\/div><div class="col-xs-2"><span class=divblock_dark stat-value=(\d+)/g; let m;
      while ((m = re.exec(seg))) o.stats[m[2].trim()] = +m[3];
    }
    return o;
  }

  /* 并发 worker 池：BEST_CONC 个 worker 抢 id，无人工间隔（实测 0 个 403） */
  async function bestiaryScan(onProgress) {
    const src = await bestiaryIds();
    const ids = src.ids, total = ids.length;
    const out = [];
    let idx = 0, done = 0;
    const worker = async function () {
      while (true) {
        if (_bestCancel) return;
        const id = ids[idx++];
        if (id === undefined) return;
        let text = null, tries = 0;
        while (tries < 4) {
          tries++;
          try {
            const r = await fetch('/modal/inspect_enemy?id=' + id, { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (r.status === 403) { await sleep(1500 * tries); continue; }
            if (!r.ok) break;
            text = await r.text(); break;
          } catch (e) { await sleep(800); }
        }
        if (text && text.length > 1000 && !/Unable to load/.test(text)) {
          const m = parseInspectEnemy(text);
          if (m) { m.id = id; out.push(m); }
        }
        done++;
        if (onProgress && (done % 10 === 0 || done === total)) onProgress(done, out.length, total);
      }
    };
    await Promise.all(Array.from({ length: BEST_CONC }, worker));
    out.sort(function (a, b) { return a.id - b.id; });
    return { list: out, src: src.src, total: total };
  }

  /* ======================= 图鉴同步（GitHub 公共图鉴） =======================
     设计：仓库里只维护「一份」权威图鉴文档（src/data/bestiary-live.json）。
     每个人只上传自己账号的原始记录到收件箱 data/bestiary-contrib/char-<id>.json，
     由 GitHub Actions 自动合并进那份文档，然后清空收件箱。
     · 有令牌：脚本直接 PUT 到 GitHub（一键、真正实时）。
     · 没令牌：下载 JSON + 打开 GitHub 上传页，手动拖进去（无需令牌）。
     令牌只存本机 localStorage，不进配置、不随导出泄漏。 */

  function ghUserToken() { try { return localStorage.getItem(GH_TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function ghCommunityToken() { return GH_COMMUNITY_TOKEN; }
  async function loadCommunityToken() {
    if (_ghTokLoaded) return GH_COMMUNITY_TOKEN;
    _ghTokLoaded = true;
    try {
      if (!GH_TOKEN_URL) GH_TOKEN_URL = UPD_BASE + 'norroth-gh-token.txt';
      const r = await fetch(GH_TOKEN_URL, { cache: 'no-store' });
      if (r.ok) GH_COMMUNITY_TOKEN = (await r.text()).trim();
    } catch (e) { /* ignore */ }
    return GH_COMMUNITY_TOKEN;
  }
  /* ★ v2.6.94：只用社区令牌。旧版本面板上的「GitHub 令牌」输入框会把用户填的令牌存进
     localStorage，并优先于社区令牌 —— 那把令牌往往没有 nor-database 的写权限，
     于是报 403 Resource not accessible by personal access token。这里直接废掉这条优先级。 */
  function clearLegacyToken() { try { localStorage.removeItem(GH_TOKEN_KEY); } catch (e) { /* ignore */ } }
  async function ghToken() { return await loadCommunityToken(); }
  function setGhToken(v) { try { if (v) localStorage.setItem(GH_TOKEN_KEY, v); else localStorage.removeItem(GH_TOKEN_KEY); } catch (e) { /* ignore */ } }
  clearLegacyToken();   // ★ v2.6.94：清掉旧版遗留的自填令牌，避免它盖过社区令牌

  function b64utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }

  async function ghApi(method, path, body, token) {
    const headers = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (body) headers['Content-Type'] = 'application/json';
    const r = await fetch('https://api.github.com' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text();
    let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { /* ignore */ }
    if (!r.ok) { const err = new Error((j && j.message) ? j.message : ('HTTP ' + r.status)); err.status = r.status; throw err; }
    return j;
  }

  /* ★ v2.6.99：上传单个文件到数据仓库，自动处理 409「sha 不匹配」。
     GitHub contents API 是「先 GET 拿 sha，再 PUT 带 sha」；当两个客户端（多开标签页 / 多角色同时跑）
     几乎同时上传同一个文件时，后到的那个会拿到 409 "<path> does not match <sha>"。
     这里遇到 409 就重新取 sha 再传（最多 3 次，带退避）。 */
  async function ghPutFile(fpath, message, text, token, tries) {
    tries = tries || 3;
    let lastErr = null;
    for (let i = 0; i < tries; i++) {
      let sha = null;
      try {
        const cur = await ghApi('GET', '/repos/' + GH_REPO + '/contents/' + fpath + '?ref=' + GH_BRANCH, null, token);
        if (cur && cur.sha) sha = cur.sha;
      } catch (e) { if (e.status !== 404) throw e; }
      const body = { message: message, content: b64utf8(text), branch: GH_BRANCH };
      if (sha) body.sha = sha;
      try {
        return await ghApi('PUT', '/repos/' + GH_REPO + '/contents/' + fpath, body, token);
      } catch (e) {
        lastErr = e;
        if (e.status === 409 && i < tries - 1) { await sleep(500 + i * 800); continue; }
        throw e;
      }
    }
    throw lastErr || new Error('上传失败');
  }

  function bestiaryPayload(list, src) {
    const c = (typeof character === 'object' && character) || {};
    const rec = list.filter(function (m) { return m.recorded; }).length;
    return {
      meta: {
        char: c.name || ('#' + (c.id || '?')), charId: c.id || 0, level: c.level || '?',
        time: new Date().toISOString(), count: list.length, recorded: rec,
        idSource: src, scriptVersion: SCRIPT_VER, source: 'game Inspect /modal/inspect_enemy',
        unlock: { recorded: 1, skills: 10, stats: 20 }
      },
      monsters: list
    };
  }

  async function syncBestiary() {
    if (_bestBusy) return;
    const panel = els.panel;
    const stEl = panel && panel.querySelector('#nr-bestsyncstate');
    const syncBtn = panel && panel.querySelector('#nr-bestsync');
    const cancelBtn = panel && panel.querySelector('#nr-bestcancel');
    const say = s => { if (stEl) stEl.textContent = s; };
    _bestBusy = true; _bestCancel = false;
    if (cancelBtn) cancelBtn.style.display = '';
    if (syncBtn) { syncBtn.disabled = true; syncBtn.textContent = '同步中…'; }
    const t0 = Date.now();
    let token = '';
    try {
      const res = await bestiaryScan(function (n, found, total) {
        say('扫描中… ' + n + '/' + total + '，已找到 ' + found + ' 种');
      });
      if (_bestCancel) { say('已取消，未上传'); setStatus('图鉴同步已取消'); return; }
      const list = res.list;
      if (!list.length) { say('没取到数据（未登录或接口被限流）'); setStatus('图鉴同步：没取到数据'); return; }
      const payload = bestiaryPayload(list, res.src);
      const fname = 'char-' + (payload.meta.charId || 'unknown') + '.json';
      const fpath = GH_CONTRIB_DIR + '/' + fname;
      const text = JSON.stringify(payload, null, 1);
      token = await ghToken();
      if (_bestCancel) { say('已取消，未上传'); setStatus('图鉴同步已取消'); return; }
      if (!token) { say('未配置社区令牌，已跳过上传'); setStatus('图鉴同步：未配置令牌'); return; }
      {
        say('上传中… ' + fname);
        await ghPutFile(fpath, '图鉴贡献：' + payload.meta.char + '（' + payload.meta.recorded + '/' + payload.meta.count + '）', text, token);
        /* 尽力通知 norr-wiki 立刻合并；失败就等它的 5 分钟定时兜底 */
        let notified = false;
        try {
          await ghApi('POST', '/repos/' + GH_WIKI_REPO + '/actions/workflows/' + GH_WIKI_MERGE_WF + '/dispatches', { ref: GH_WIKI_BRANCH }, token);
          notified = true;
        } catch (e) { /* ignore */ }
        const secs = Math.round((Date.now() - t0) / 1000);
        say('已同步 ' + fname + '（已记录 ' + payload.meta.recorded + '/' + payload.meta.count + '）' + (notified ? '，服务器已收到' : ''));
        setStatus('图鉴已同步：' + payload.meta.char + '（' + payload.meta.recorded + '/' + payload.meta.count + '，' + secs + 's）');
        logEvent('图鉴同步上传 ' + fname + ' / 已记录 ' + payload.meta.recorded + ' / ' + secs + 's');
      }
    } catch (e) {
      let msg = (e && e.message) ? e.message : String(e);
      if (e && e.status === 404) msg += '（数据仓库 ' + GH_REPO + ' 不存在，或令牌无权访问）';
      else if (e && (e.status === 401 || e.status === 403)) msg += '（令牌无效或权限不足：需要该仓库的 Contents: Read and write）';
      say('同步失败：' + msg);
      setStatus('图鉴同步失败(v' + SCRIPT_VER + ')：' + msg);
      logEvent('图鉴同步失败 v' + SCRIPT_VER + ' / token=' + (token ? token.slice(0, 16) + '…' : '(空)') + ' / ' + msg);
    } finally {
      _bestBusy = false;
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (syncBtn) { syncBtn.disabled = false; syncBtn.textContent = '图鉴同步'; }
    }
  }

  /* ======================= 地图数据同步（公共地图库） =======================
     ① 上传：把本地 MapDB 里每张图的记录（自带 at = 该图数据最后更新时间）推到 nor-database/maps-contrib/
     ② 拉取：从 Pages 取 norroth-maps.json，按「每张图取 at 最新」合并进本地
     ③ 通知：触发 norr-wiki 立刻合并（失败就等 5 分钟定时兜底）
     全程静默：不需要令牌、不打开任何网页。 */
  let _mapSyncBusy = false;
  async function syncMaps() {
    if (_mapSyncBusy) return;
    const panel = els.panel;
    const stEl = panel && panel.querySelector('#nr-mapsyncstate');
    const btn = panel && panel.querySelector('#nr-mapsync');
    const say = s => { if (stEl) stEl.textContent = s; };
    _mapSyncBusy = true;
    if (btn) { btn.disabled = true; btn.textContent = '同步中…'; }
    const t0 = Date.now();
    let token = '';
    try {
      const c = (typeof character === 'object' && character) || {};
      const mapsObj = MapDB.exportSync();
      const n = Object.keys(mapsObj).length;
      const payload = { meta: { char: c.name || ('#' + (c.id || '?')), charId: c.id || 0, level: c.level || '?',
        time: new Date().toISOString(), count: n, scriptVersion: SCRIPT_VER, source: 'MapDB' }, maps: mapsObj };
      const fname = 'maps-' + (c.id || 'unknown') + '.json';
      const fpath = 'maps-contrib/' + fname;
      token = await ghToken();
      if (!token) { say('未配置社区令牌，已跳过'); setStatus('地图同步：未配置令牌'); return; }
      say('上传中… ' + fname + '（' + n + ' 张图）');
      await ghPutFile(fpath, '地图数据：' + payload.meta.char + '（' + n + ' 张图）', JSON.stringify(payload), token);
      say('已上传，正在拉取公共地图数据…');
      let merged = 0;
      try {
        const r = await fetch(UPD_BASE + 'norroth-maps.json', { cache: 'no-store' });
        if (r.ok) { const j = await r.json(); merged = MapDB.applyRemote(j); }
      } catch (e) { /* ignore */ }
      let notified = false;
      try {
        await ghApi('POST', '/repos/' + GH_WIKI_REPO + '/actions/workflows/' + GH_WIKI_MERGE_WF + '/dispatches', { ref: GH_WIKI_BRANCH }, token);
        notified = true;
      } catch (e) { /* ignore */ }
      const secs = Math.round((Date.now() - t0) / 1000);
      say('已同步 ' + n + ' 张图' + (merged ? '，本地更新了 ' + merged + ' 张' : '') + '（' + secs + 's）');
      setStatus('地图已同步：上传 ' + n + ' 张' + (merged ? '，合并 ' + merged + ' 张' : '') + '，' + secs + 's');
      logEvent('地图同步：上传 ' + n + ' 张 / 合并 ' + merged + ' 张 / ' + secs + 's' + (notified ? '' : '（未通知到服务器，等定时兜底）'));
    } catch (e) {
      let msg = (e && e.message) ? e.message : String(e);
      if (e && e.status === 404) msg += '（数据仓库 ' + GH_REPO + ' 不存在，或令牌无权访问）';
      else if (e && (e.status === 401 || e.status === 403)) msg += '（令牌无效或权限不足）';
      say('同步失败：' + msg);
      setStatus('地图同步失败(v' + SCRIPT_VER + ')：' + msg);
      logEvent('地图同步失败 v' + SCRIPT_VER + ' / ' + msg);
    } finally {
      _mapSyncBusy = false;
      if (btn) { btn.disabled = false; btn.textContent = '地图同步'; }
    }
  }

  window.__norrothFarm = {
    event: { tick: eventTick, reset: eventReset, activitiesHasJoin: eventActivitiesHasJoin, enterGate: eventEnterGate, pickPoint: eventPickPoint, typeOf: eventTypeOf, res: function () { return st.event; }, mapId: EVENT_MAP_ID, combatMaps: EVENT_COMBAT_MAPS, combatTargetId: eventCombatTargetId, combatGate: eventCombatGate, combatActive: eventCombatActive, levelRange: eventLevelRange, dumpTiles: eventDumpTiles, backPortal: tryBackPortal },
    overlord: { tick: ovlTick, join: ovlJoin, hudBtn: ovlHudJoinBtn, inBattle: ovlInBattle, countdown: ovlReadCountdown, res: function () { return st.ovl; } },
    mc: { serviceTownNow: activeServiceTown, toggle: mcToggle, togglePause: mcTogglePause, syncBtns: syncMcBtns, queue: mcQueue, profLevels: mcProfLevels, profLevelsCached: mcProfLevelsCached, idleInfo: mcIdleInfo, startIdle: mcStartIdle, switch: mcSwitch, readChars: mcReadChars, setOn: mcSetOn, startAll: mcStartAll, stopAll: mcStopAll, validateAll: mcValidateAll, canGather: mcCanGather, render: mcRender, tick: mcTick, fillCurrent: mcFillCurrent, runTrip: mcRunTrip, beginTrip: mcBeginTrip, runRepairAndDeposit: runRepairAndDeposit, nearestGatherTile: nearestGatherTile, idleRaw: function () { return _mcGatherRaw; }, loadRot: mcLoadRot, saveRot: mcSaveRot, rot: function () { return rot; }, due: mcDue, chars: function () { return cfg.mcChars; }, queueCache: function () { return _mcQueueCache; }, claimIdleRewards: claimIdleRewards, closeIdleDialog: closeIdleResultDialog, refreshStatus: mcRefreshStatus, applyQueue: mcApplyQueue },
    start: () => beginRun('battle'), stop: stop, cfg: cfg, st: st, step: step,
    startTower: () => beginRun('tower'), stepTower: stepTower, isTowerMap: isTowerMap, towerTiles: towerTiles, towerNextGate: towerNextGate, towerGateCandidates: towerGateCandidates, towerAdjacentTile: towerAdjacentTile, towerRoomDoor: towerRoomDoor, inDungeonOrTower: inDungeonOrTower, openTower: openTower, nearestTowerTown: nearestTowerTown,
    bestiary: { scan: bestiaryScan, ids: bestiaryIds, sync: syncBestiary, token: ghCommunityToken, loadToken: loadCommunityToken, clearLegacyToken: clearLegacyToken, cancel: function(){ _bestCancel = true; } },
    scanEnemies: scanEnemies, attackableEnemies: attackableEnemies, pickTarget: pickTarget,
    rankWeight: rankWeight, nameWeight: nameWeight, detectRank: detectRank, whyText: whyText,
    targetKey: targetKey, nameAllowed: nameAllowed,   /* ★ v2.6.74：便于验证索敌模式 */
    scanBag: scanBag, readBag: readBag, isDamaged: isDamaged, findSmith: findSmith,
    applySkin: applySkin, setSkin: setSkin, skinOn: skinOn,
    readEquipDur: readEquipDur, parseEquipDur: parseEquipDur, durWorst: durWorst, durText: durText, repairNeeded: repairNeeded, gatherDurNow: gatherDurNow, lastGatherDur: lastGatherDur, renderDurInfo: renderDurInfo,
    getMapDict: getMapDict, startRestock: startRestock, repairSellNow: repairSellNow,
    nrPost: nrPost, apiRepairRows: apiRepairRows, stashDeposit: stashDeposit, stashWithdraw: stashWithdraw, stashCount: stashCount, clickEquipSell: clickEquipSell, sellEquips: sellEquips, findBank: findBank, doBankDeposit: doBankDeposit, runDeposit: runDeposit, ensureBankFrame: ensureBankFrame, bankFreeSlots: bankFreeSlots, readBagEquipItems: readBagEquipItems, depositBagEquips: depositBagEquips, serviceTowns: serviceTowns, waygateReachable: waygateReachable, navRoute: navRoute, rideSmugglers: rideSmugglers, findSmugglersTile: findSmugglersTile, smugglersDestId: smugglersDestId, renderTownSelect: renderTownSelect, verifyPath: verifyPath, resolveRepairRoute: resolveRepairRoute,
     refreshCurMap: refreshCurMap, detectGatherPoints: detectGatherPoints, liveMapSnapshot: liveMapSnapshot, poiLearnNow: poiLearnNow, MapDB: MapDB, syncMaps: syncMaps,
    gatheringSpots: gatheringSpots, findGatheringSpot: findGatheringSpot, stepGather: stepGather, effectiveGatherPoint: effectiveGatherPoint,
    reachableSet: reachableSet, isReachable: isReachable, unreachableEnemies: unreachableEnemies,
    takeAllLoot: takeAllLoot, readPetInfo: readPetInfo, readPetFood: readPetFood, checkAndFeedPet: checkAndFeedPet,
    togglePetFeed: togglePetFeed, feedPetNowManual: feedPetNowManual, petTick: petTick,
    placePanel: placePanel, syncUI: syncUI, renderRankList: renderRankList,
    gatherInterruptTarget: gatherInterruptTarget, combatTarget: combatTarget, makeRetarget: makeRetarget, retargetCombat: retargetCombat, retargetGather: retargetGather, targetDiag: targetDiag, targetDiagText: targetDiagText, closeGatheringWindows: closeGatheringWindows, syncServerPos: syncServerPos, settleServerPos: settleServerPos, settleAtSpot: settleAtSpot, checkMapLoad: checkMapLoad, mapLoadStuck: mapLoadStuck, softReloadMap: softReloadMap, softRefreshEntities: softRefreshEntities, scheduleArriveAction: scheduleArriveAction, tileActionAt: tileActionAt, arriveActionFired: arriveActionFired, renderedMapId: renderedMapId, recenterCamera: recenterCamera, scheduleRenderCheck: scheduleRenderCheck, checkMapRender: checkMapRender, checkEntityFresh: checkEntityFresh,
    installSpeedPatch: installSpeedPatch, applySpeedK: applySpeedK, applyWinScale: applyWinScale, isNoAccelEl: isNoAccelEl,
    speedAllowed: speedAllowed, inCombatNow: inCombatNow,
    stepAuto: stepAuto, checkStuck: checkStuck, updatePerf: updatePerf, perfText: perfText, logEvent: logEvent,
    attackableFrom: attackableFrom, normalizeCfg: normalizeCfg,
    humanDelayOn: humanDelayOn, humanDelayMs: humanDelayMs, humanPause: humanPause, humanDefer: humanDefer, humanClick: humanClick, humanDialog: humanDialog, safeWalkTo: safeWalkTo,
    rhythm: rhythm, rhythmTimer: rhythmTimer, jitterVal: jitterVal, humanMicroMs: humanMicroMs, humanRotWaitMs: humanRotWaitMs, mistakeTile: mistakeTile, idleActTick: idleActTick,
    walkTileCore: walkTileCore,
    handleDefeat: handleDefeat, resetDefeat: resetDefeat,
    refreshQuestTargets: refreshQuestTargets, loadEnemyNames: loadEnemyNames,
    nearestResource: nearestResource, checkFrozen: checkFrozen,
    sweepStrayFrames: sweepStrayFrames, registerUserFrames: registerUserFrames,
    tryGatherFlee: tryGatherFlee, gameRunAway: gameRunAway, altPageCombatPolicy: altPageCombatPolicy, applyHighlightSelf: applyHighlightSelf, exportErrorLog: exportErrorLog,
    supply: supply, verifyPotion: verifyPotion, togglePotion: togglePotion, startPotionLoop: startPotionLoop, stopPotionLoop: stopPotionLoop, healInfo: healInfo, ensureTTDB: ensureTTDB, potionKey: potionKey, 
    questTargets: () => _questCache.list,
    recordVisit: recordVisit, visitedTowns: visitedTowns,  
    renderDet: renderDet, readCoins: readCoins, readCoinsHud: readCoinsHud, parseCoinText: parseCoinText, installCoinsHook: installCoinsHook, coinRatePerMin: coinRatePerMin, minutesToLevel: minutesToLevel,
    perfSlope: perfSlope, perfSpanMin: perfSpanMin, 
    updateStats: updateStats, isNormalMap: isNormalMap, navRoamStep: navRoamStep,
    applyBagDiff: applyBagDiff, parseInvItems: parseInvItems, initBagSnap: initBagSnap,
    pause: pause, resume: resume, toggleRun: toggleRun, runElapsedMs: runElapsedMs, pollBagGain: pollBagGain,
    startRoundTrip: function () { const seq = ++navAutoSeq; st.mapSwitch.active = true; return navRoamStep(seq); },
    returnToFarm: returnToFarm, navToMap: navToMap, navGoTo: navToMap, navWalkTile: navWalkTile, navDist: navDist, escapeTarget: escapeTarget, navTeleportNear: navTeleportNear, navSetPending: navSetPending, navClearPending: navClearPending, navPendingTick: navPendingTick, navPendingDest: navPendingDest, nearestWaygateMap: nearestWaygateMap, waygateMaps: waygateMaps, isWildAnchor: isWildAnchor, isTownMap: isTownMap, suppliesEmpty: suppliesEmpty,  navWaygateOut: navWaygateOut, navWorldTeleport: navWorldTeleport, worldTeleportTarget: worldTeleportTarget, findMapDetailsTeleport: findMapDetailsTeleport, navWalkToAnyExit: navWalkToAnyExit, townName: townName,
    navImportRecorder: navImportRecorder,
    mapDB: MapDB,
    nav: { graph: MapDB, route: navRoute, travelTo: navTravelTo, hop: navHop, learn: navLearn,
           poiLearnNow: poiLearnNow, poiLearn: () => MapDB.exportRecorder(), exportPoiLearn: exportPoiLearn,
           mapName: navMapName, roundTrip: navRoamStep, injectMoveButton: navInjectMoveButton,
           isBusy: () => navBusy }
  };

  /* ★ 启动时就把「世界地图字典」拉下来：它是按 id 的权威名字来源，
     拿到后立刻纠正已记录的名字（旧数据里可能存了错的图名）并刷新城镇下拉。 */
  getMapDict().then(function () {
    try { renderTownSelect(); } catch (e) { /* ignore */ }
    try { refreshCurMap(); } catch (e) { /* ignore */ }
  }).catch(function () { /* ignore */ });

  /* ★ 启动后刷新城镇下拉（地图数据已在第 11 节由内置种子 MAPDB_SEED 补全，无需记录器） */
  setTimeout(function () {
    try {
      renderTownSelect();
    } catch (e) { /* ignore */ }
  }, 500);
})();
