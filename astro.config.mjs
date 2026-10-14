// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sidebar } from './src/navigation.mjs';

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
			sidebar,
		}),
	],
});