// 每篇编辑页面仅有一个主要导航归属；正文允许相关链接。
export const sections = [
  {
    "label": "入门与版本",
    "items": [
      {
        "label": "栏目总览",
        "slug": "getting-started"
      },
      {
        "label": "新手入门",
        "items": [
          {
            "label": "游戏介绍与第一步",
            "slug": "getting-started/intro"
          },
          {
            "label": "常见问题",
            "slug": "getting-started/faq"
          }
        ]
      },
      {
        "label": "版本与更新",
        "collapsed": true,
        "items": [
          {
            "label": "1.0 发布与开服",
            "slug": "release/v1-overview"
          },
          {
            "label": "1.0 机制变更",
            "slug": "release/v1-changes"
          },
          {
            "label": "1.0 官方 Wiki 详细变更记录",
            "slug": "release/v1-official-wiki-changes"
          },
          {
            "label": "1.0 职业技能变化详解",
            "slug": "release/v1-class-skill-changes"
          },
          {
            "label": "1.0 职业平衡",
            "slug": "release/v1-class-balance"
          },
          {
            "label": "1.0 内容清单",
            "slug": "release/v1-content"
          },
          {
            "label": "版本与更新历史",
            "slug": "release/ea-history"
          }
        ]
      }
    ],
    "id": "start",
    "landing": "getting-started",
    "description": "从创建角色到首次战斗；分开阅读入门教程与版本公告。",
    "collapsed": true
  },
  {
    "label": "职业与角色",
    "items": [
      {
        "label": "职业总览",
        "slug": "classes"
      },
      {
        "label": "Archmage 法师",
        "slug": "classes/archmage"
      },
      {
        "label": "Berserker 狂战士",
        "slug": "classes/berserker"
      },
      {
        "label": "Druid 德鲁伊",
        "slug": "classes/druid"
      },
      {
        "label": "Ranger 游侠",
        "slug": "classes/ranger"
      },
      {
        "label": "Rogue 盗贼",
        "slug": "classes/rogue"
      },
      {
        "label": "Zealot 狂热者",
        "slug": "classes/zealot"
      },
      {
        "label": "角色与账号",
        "slug": "systems/characters"
      }
    ],
    "id": "classes",
    "landing": "classes",
    "description": "比较六大职业、技能树与账号规则，再决定角色分工。",
    "collapsed": true
  },
  {
    "label": "战斗与成长",
    "items": [
      {
        "label": "栏目总览",
        "slug": "combat"
      },
      {
        "label": "战斗机制",
        "slug": "combat/mechanics"
      },
      {
        "label": "技能系统",
        "slug": "combat/skills"
      },
      {
        "label": "技能天赋模拟器（EA）",
        "slug": "tools/talent"
      },
      {
        "label": "角色属性",
        "slug": "combat/attributes"
      },
      {
        "label": "经验与成长",
        "slug": "combat/experience"
      },
      {
        "label": "重生与进阶成长",
        "slug": "combat/rebirth"
      },
      {
        "label": "洗点",
        "slug": "combat/respec"
      },
      {
        "label": "属性公式与数值计算",
        "slug": "combat/formulas"
      },
      {
        "label": "训练场",
        "slug": "combat/training-grounds"
      }
    ],
    "id": "combat",
    "landing": "combat",
    "description": "理解伤害、属性、技能与经验，再安排洗点和进阶成长。",
    "collapsed": true
  },
  {
    "label": "装备与物品",
    "items": [
      {
        "label": "栏目总览",
        "slug": "equipment"
      },
      {
        "label": "装备图鉴",
        "slug": "equipment/catalog"
      },
      {
        "label": "鉴定与装备",
        "slug": "equipment/identify"
      },
      {
        "label": "宝石与镶嵌",
        "slug": "equipment/jewels"
      },
      {
        "label": "物品与容器",
        "slug": "equipment/items"
      },
      {
        "label": "物品专家：精炼/镶嵌/重铸",
        "slug": "equipment/item-specialist"
      }
    ],
    "id": "equipment",
    "landing": "equipment",
    "description": "从鉴定与装备选择，到精炼、开孔、镶嵌和重铸。",
    "collapsed": true
  },
  {
    "label": "生活技能",
    "items": [
      {
        "label": "生活技能总览",
        "slug": "professions/overview"
      },
      {
        "label": "采集",
        "slug": "professions/gathering"
      },
      {
        "label": "官方采集地点",
        "slug": "professions/gathering-locations"
      },
      {
        "label": "制作",
        "slug": "professions/crafting"
      },
      {
        "label": "大师制作 Masterworking",
        "slug": "professions/masterworking"
      },
      {
        "label": "制作配方图鉴",
        "slug": "professions/crafting-catalog"
      }
    ],
    "id": "professions",
    "landing": "professions/overview",
    "description": "查询采集规则、制作专业、材料用途与配方。",
    "collapsed": true
  },
  {
    "label": "世界与探索",
    "items": [
      {
        "label": "栏目总览",
        "slug": "world"
      },
      {
        "label": "地图、移动与传送",
        "slug": "world/movement"
      },
      {
        "label": "地图清单",
        "slug": "world/maps"
      },
      {
        "label": "怪物图鉴",
        "slug": "world/bestiary"
      },
      {
        "label": "NPC 与设施查询",
        "slug": "world/facilities"
      },
      {
        "label": "船只与航海",
        "slug": "systems/sailing"
      }
    ],
    "id": "world",
    "landing": "world",
    "description": "按地图、怪物、城镇设施查地点，理解移动与航海。",
    "collapsed": true
  },
  {
    "label": "任务与挑战",
    "items": [
      {
        "label": "栏目总览",
        "slug": "quests"
      },
      {
        "label": "任务",
        "items": [
          {
            "label": "任务板与日志",
            "slug": "quests/boards"
          },
          {
            "label": "主线任务链",
            "slug": "quests/main-story"
          },
          {
            "label": "日常任务 Dailies",
            "slug": "quests/dailies"
          },
          {
            "label": "专业任务详情",
            "slug": "quests/profession-quests"
          }
        ]
      },
      {
        "label": "挑战",
        "items": [
          {
            "label": "副本与 Boss",
            "slug": "quests/dungeons"
          },
          {
            "label": "深渊塔",
            "slug": "quests/abyssal-tower"
          },
          {
            "label": "世界 Boss 与虚空裂隙",
            "slug": "quests/world-boss"
          },
          {
            "label": "竞技场（PvP）",
            "slug": "quests/arena"
          }
        ]
      },
      {
        "label": "活动",
        "items": [
          {
            "label": "世界事件日历",
            "slug": "quests/world-events"
          },
          {
            "label": "活动入口",
            "slug": "quests/events"
          }
        ]
      },
      {
        "label": "图鉴与收藏",
        "items": [
          {
            "label": "图鉴 Codex",
            "slug": "quests/codices"
          },
          {
            "label": "神器 Artifacts",
            "slug": "quests/artifacts"
          },
          {
            "label": "礼物与 Party Popper",
            "slug": "quests/party-popper"
          }
        ]
      }
    ],
    "id": "quests",
    "landing": "quests",
    "description": "区分主线、日常、挑战与活动，按需求查找入口和条件。",
    "collapsed": true
  },
  {
    "label": "养成与社交",
    "items": [
      {
        "label": "栏目总览",
        "slug": "systems"
      },
      {
        "label": "宠物系统",
        "slug": "systems/pets"
      },
      {
        "label": "住房系统",
        "slug": "systems/housing"
      },
      {
        "label": "公会系统",
        "slug": "systems/guilds"
      },
      {
        "label": "社交机制",
        "slug": "systems/social"
      },
      {
        "label": "成就",
        "slug": "systems/achievements"
      },
      {
        "label": "邮件",
        "slug": "systems/mail"
      }
    ],
    "id": "systems",
    "landing": "systems",
    "description": "宠物、住房、公会、社交、成就与邮件的规则入口。",
    "collapsed": true
  },
  {
    "label": "经济与交易",
    "items": [
      {
        "label": "栏目总览",
        "slug": "economy"
      },
      {
        "label": "经济与货币",
        "slug": "systems/economy"
      },
      {
        "label": "商人与价格",
        "slug": "equipment/vendors"
      },
      {
        "label": "代币商店",
        "slug": "systems/token-shops"
      },
      {
        "label": "订阅与付费服务",
        "slug": "systems/subscription"
      },
      {
        "label": "活动商人",
        "slug": "economy/event-merchant"
      },
      {
        "label": "异界看护者",
        "slug": "economy/eldritch-caretaker"
      },
      {
        "label": "暗影代理人",
        "slug": "economy/shadow-broker"
      }
    ],
    "id": "economy",
    "landing": "economy",
    "description": "区分货币用途、商人、交易站、代币兑换与付费服务。",
    "collapsed": true
  },
  {
    "label": "玩家攻略",
    "items": [
      {
        "label": "攻略总览",
        "slug": "guides"
      },
      {
        "label": "新手练级与探索路线",
        "slug": "guides/leveling"
      },
      {
        "label": "日常安排与资源预算",
        "slug": "guides/daily-routine"
      },
      {
        "label": "装备养成与更换决策",
        "slug": "guides/equipment-progression"
      },
      {
        "label": "职业自给自足矩阵",
        "slug": "guides/crafting-matrix"
      },
      {
        "label": "公会职业分配方案",
        "slug": "guides/guild-roles"
      },
      {
        "label": "狂热者配装攻略",
        "slug": "guides/zealot-build"
      }
    ],
    "id": "guides",
    "landing": "guides",
    "description": "练级、日常安排、装备养成与职业分工的行动建议。",
    "collapsed": true
  }
,
  {
    "label": "账号与支持",
    "items": [
      { "label": "栏目总览", "slug": "support" },
      {
        "label": "账号",
        "items": [
          { "label": "账号设置", "slug": "support/account/settings" },
          { "label": "登录与密码", "slug": "support/account/login-password" },
          { "label": "邮箱验证", "slug": "support/account/email-verification" },
          { "label": "账号安全（2FA）", "slug": "support/account/security" },
          { "label": "角色恢复", "slug": "support/account/character-recovery" },
          { "label": "封禁与暂停", "slug": "support/account/bans-suspensions" }
        ]
      },
      {
        "label": "技术支持",
        "items": [
          { "label": "无法加载", "slug": "support/technical/game-not-loading" },
          { "label": "浏览器兼容", "slug": "support/technical/browser-compatibility" },
          { "label": "断线与掉线", "slug": "support/technical/connection-disconnects" },
          { "label": "卡顿与性能", "slug": "support/technical/performance-lag" },
          { "label": "报错", "slug": "support/technical/errors" },
          { "label": "缓存与 Cookie", "slug": "support/technical/cache-cookies" },
          { "label": "移动端", "slug": "support/technical/mobile" },
          { "label": "Steam", "slug": "support/technical/steam" },
          { "label": "桌面客户端", "slug": "support/technical/desktop" },
          { "label": "Bug 报告", "slug": "support/technical/bugs" },
          { "label": "服务器状态", "slug": "support/technical/server-status" }
        ]
      },
      {
        "label": "支付",
        "items": [
          { "label": "支付方式", "slug": "support/payments/methods" },
          { "label": "支付失败", "slug": "support/payments/failed" },
          { "label": "未到账", "slug": "support/payments/not-received" },
          { "label": "待处理支付", "slug": "support/payments/pending" },
          { "label": "退款", "slug": "support/payments/refunds" },
          { "label": "错误扣费", "slug": "support/payments/incorrect-charges" }
        ]
      },
      {
        "label": "规则与条款",
        "items": [
          { "label": "聊天准则", "slug": "support/guidelines/chat" },
          { "label": "通用规则", "slug": "support/guidelines/general-rules" },
          { "label": "服务条款", "slug": "support/guidelines/terms-of-service" },
          { "label": "Cookie 政策", "slug": "support/guidelines/cookie-policy" },
          { "label": "隐私政策", "slug": "support/guidelines/privacy-policy" }
        ]
      },
      {
        "label": "关于",
        "items": [
          { "label": "管理团队与职位", "slug": "support/about/staff" },
          { "label": "Norroth 的起源", "slug": "support/about/story" },
          { "label": "推荐好友", "slug": "support/about/referrals" }
        ]
      }
    ],
    "id": "support",
    "landing": "support",
    "description": "账号安全、技术支持、支付与规则条款，以及游戏背景与团队信息。",
    "collapsed": true
  }
];

export const referenceItems = [
  {
    "label": "全站目录与内容覆盖",
    "slug": "reference/coverage"
  },
  {
    "label": "游戏帮助文档",
    "slug": "reference/help-index"
  },
  {
    "label": "资料来源与证据等级",
    "slug": "reference/sources"
  },
  {
    "label": "参与编辑",
    "slug": "reference/content-spec"
  },
  {
    "label": "本次资料采集与截图",
    "slug": "reference/research-2026-10-14"
  },
  {
    "label": "官方 1.0 Wiki 抓取与对照",
    "slug": "reference/official-wiki-2026-10-15"
  },
];

export function flattenItems(items) {
  return items.flatMap((item) => item.items ? flattenItems(item.items) : [item]);
}

export const sidebar = [{label: "资料数据库", slug: "reference/database"}, ...sections.map(({ label, collapsed, items }) => ({ label, collapsed, items })), {label:"资料与维护", collapsed:true, items:referenceItems}];
