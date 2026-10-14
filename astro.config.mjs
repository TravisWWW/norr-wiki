// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://traviswww.github.io',
	base: '/norr-wiki',
	// 将 CSS 内联进 HTML：避免 GitHub Pages 缓存旧 HTML 时引用已被删除的旧 CSS 哈希（导致页面掉样式）
	build: { inlineStylesheets: 'always' },
	integrations: [
		starlight({
			title: 'Norroth Wiki',
			description: 'Norroth Online 非官方中文 Wiki：收录游戏机制、职业与技能、生活技能、地图、物品、任务与玩家攻略。现有数值资料主要依据 Early Access 版本整理，正式版新增内容按官方公告与实际游戏数据持续核验。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			logo: { src: './src/assets/logo.svg', replacesTitle: false },
			social: [],
			editLink: { baseUrl: 'https://github.com/TravisWWW/norr-wiki/edit/main/' },
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			components: {
				PageTitle: './src/components/PageTitle.astro',
			},
			head: [
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#14151a' } },
				{ tag: 'script', content: "document.documentElement.dataset.theme='dark';" },
			],
			sidebar: [
				{
					label: '入门与版本',
					items: [
						{ label: '新手指南', slug: 'getting-started/intro' },
						{ label: '1.0 发布与开服', slug: 'release/v1-overview' },
						{ label: '1.0 机制变更', slug: 'release/v1-changes' },
						{ label: '1.0 职业平衡', slug: 'release/v1-class-balance' },
						{ label: '1.0 内容清单', slug: 'release/v1-content' },
						{ label: '版本与更新历史', slug: 'release/ea-history' },
					],
				},
				{
					label: '职业与角色',
					items: [
						{ label: '职业总览', slug: 'classes' },
						{ label: 'Archmage 法师', slug: 'classes/archmage' },
						{ label: 'Berserker 狂战士', slug: 'classes/berserker' },
						{ label: 'Druid 德鲁伊', slug: 'classes/druid' },
						{ label: 'Ranger 游侠', slug: 'classes/ranger' },
						{ label: 'Rogue 盗贼', slug: 'classes/rogue' },
						{ label: 'Zealot 狂热者', slug: 'classes/zealot' },
						{ label: '角色与账号', slug: 'systems/characters' },
					],
				},
				{
					label: '战斗与成长',
					items: [
						{ label: '战斗机制', slug: 'combat/mechanics' },
						{ label: '技能系统', slug: 'combat/skills' },
						{ label: '角色属性', slug: 'combat/attributes' },
						{ label: '经验与成长', slug: 'combat/experience' },
						{ label: '重生与进阶成长', slug: 'combat/rebirth' },
						{ label: '洗点', slug: 'combat/respec' },
						{ label: '属性公式与数值计算', slug: 'combat/formulas' },
					],
				},
				{
					label: '装备与物品',
					items: [
						{ label: '装备图鉴', slug: 'equipment/catalog' },
						{ label: '鉴定与装备', slug: 'equipment/identify' },
						{ label: '宝石与镶嵌', slug: 'equipment/jewels' },
						{ label: '物品与容器', slug: 'equipment/items' },
						{ label: '物品专家：精炼/镶嵌/重铸', slug: 'equipment/item-specialist' },
					],
				},
				{
					label: '生活技能',
					items: [
						{ label: '生活技能总览', slug: 'professions/overview' },
						{ label: '采集', slug: 'professions/gathering' },
						{ label: '制作', slug: 'professions/crafting' },
						{ label: '大师制作 Masterworking', slug: 'professions/masterworking' },
						{ label: '制作配方图鉴', slug: 'professions/crafting-catalog' },
					],
				},
				{
					label: '世界与探索',
					items: [
						{ label: '地图、移动与传送', slug: 'world/movement' },
						{ label: '地图清单', slug: 'world/maps' },
						{ label: '怪物图鉴', slug: 'world/bestiary' },
						{ label: 'NPC 与设施查询', slug: 'world/facilities' },
						{ label: '船只与航海', slug: 'systems/sailing' },
					],
				},
				{
					label: '任务与挑战',
					items: [
						{ label: '任务', items: [
						{ label: '任务板与日志', slug: 'quests/boards' },
						{ label: '主线任务链', slug: 'quests/main-story' },
						{ label: '日常任务 Dailies', slug: 'quests/dailies' },
						] },
						{ label: '挑战', items: [
						{ label: '副本与 Boss', slug: 'quests/dungeons' },
						{ label: '深渊塔', slug: 'quests/abyssal-tower' },
						{ label: '世界 Boss 与虚空裂隙', slug: 'quests/world-boss' },
						{ label: '竞技场（PvP）', slug: 'quests/arena' },
						] },
						{ label: '活动', items: [
						{ label: '世界事件日历', slug: 'quests/world-events' },
						{ label: '活动与远征', slug: 'quests/events' },
						] },
					],
				},
				{
					label: '养成与社交',
					items: [
						{ label: '宠物系统', slug: 'systems/pets' },
						{ label: '住房系统', slug: 'systems/housing' },
						{ label: '公会系统', slug: 'systems/guilds' },
						{ label: '社交机制', slug: 'systems/social' },
						{ label: '成就', slug: 'systems/achievements' },
						{ label: '邮件', slug: 'systems/mail' },
					],
				},
				{
					label: '经济与交易',
					items: [
						{ label: '经济与货币', slug: 'systems/economy' },
						{ label: '商人与价格', slug: 'equipment/vendors' },
						{ label: '代币商店', slug: 'systems/token-shops' },
						{ label: '订阅与付费服务', slug: 'systems/subscription' },
					],
				},
				{
					label: '攻略、工具与参考',
					items: [
						{ label: '职业自给自足矩阵', slug: 'guides/crafting-matrix' },
						{ label: '公会职业分配方案', slug: 'guides/guild-roles' },
						{ label: '狂热者配装攻略', slug: 'guides/zealot-build' },
						{ label: '技能天赋模拟器（旧版）', slug: 'tools/talent' },
						{ label: '游戏帮助文档', slug: 'reference/help-index' },
						{ label: '资料来源与证据等级', slug: 'reference/sources' },
						{ label: '参与编辑', slug: 'reference/content-spec' },
					],
				},
				],
		}),
	],
});