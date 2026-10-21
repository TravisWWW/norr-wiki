# Norroth Wiki

Norroth Online **非官方中文 Wiki**，基于 [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) 构建，
部署到 GitHub Pages：<https://traviswww.github.io/norr-wiki/>

## 内容

- 十个主题栏目：首页提供按目标阅读的攻略入口，每个栏目有总览或已有总览页；侧栏将新手与版本、攻略与工具和参考分别组织。
- 每篇文章仅有一个主要侧栏归属；全站数据库为独立查询入口，来源与编辑说明归入「资料与维护」。技能表集中到职业页，远征规则集中到航海页。
- 新手路线、FAQ、日常安排、装备养成，以及按实际页面生成的「全站目录与内容覆盖」。
- 怪物图鉴：1.0 正式服游戏内 Inspect 实测 **199 种**（类型 / 群系 / 等级 / 防护 / 拾荒 / 掉落 / 背景故事），并保留官方 1.0 Wiki 132 种的原始清单对照。
- 资料数据库：1852 个独立条目（物品与材料 1354、地图 323、怪物 141、Boss 15、专业任务 6、制作专业 13），由结构化数据生成并关联材料、配方、地点与任务。
- 2026-10-14 登录 EA 的资料采集：88 篇帮助、141 个 Inspect、323 张地图信息、112 条采集地点；七张游戏界面截图。采集范围与核验限制见站内对应说明。
- 工具：技能天赋模拟器（`public/talent/index.html`，通过 `/tools/talent/` 内嵌）

> 站点定位：收录游戏机制、职业技能、地图、物品、任务和玩家攻略。现有数值资料主要依据 **Early Access（EA）版本**
> （`legacy.norroth.com`）整理；正式版（1.0 / Steam）新增内容按官方公告与实际游戏数据持续核验。
>
> 资料状态：**EA 版已验证** ｜ **1.0 官方已公布** ｜ **1.0 上线后待验证**（每个页面标题下方也会显示自身状态）。

## 开发

```bash
npm install
npm run dev        # http://localhost:4321/norr-wiki/
npm run build      # 输出到 dist/
npm run check:site # 构建后检查内部链接、锚点、资源、导航和内容路由
npm run preview    # 预览构建产物
```

## 结构

```
src/
  content/docs/        # 正文（按栏目分目录）
  assets/logo.svg
  styles/custom.css
public/
  talent/index.html    # 技能天赋模拟器（单文件，内嵌图标）
.github/workflows/deploy.yml   # push main → 构建 → 发布 Pages
astro.config.mjs       # site / base / Starlight 配置
src/navigation.mjs    # 首页、栏目总览与侧栏共用的栏目定义
src/lib/database.mjs  # 数据条目与关系，动态路由在 src/pages/database/
src/data/live-*.json  # 可公开的游戏事实与来源，不含凭据或个人界面
docs/WIKI_AUDIT.md     # 结构与内容评估、调整依据和后续内容优先级
```

## 部署

推送到 `main` 后由 GitHub Actions 自动构建并发布到 Pages。
仓库需在 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 内容来源与维护

正文依据游戏内帮助文档、EA 版实测与社区资料整理。数据口径为 `legacy.norroth.com`（EA 版），可能随版本变化；
正式版上线后需按实际游戏内容重新核验。收录与标注规则见站内「内容规范」。
