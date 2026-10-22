# 地图收件箱（data/maps-contrib/）

地图数据的**唯一权威文档**是 `public/norroth-maps.json`（wiki 世界地图 / 导航读的就是它）。

数据来源有两条：

1. **主渠道**：数据仓库 `TravisWWW/nor-database` 的 `maps-contrib/maps-<角色ID>.json`
   （「小伴侣」用内置社区令牌静默上传）。`bestiary-merge.yml` 会拉取它们。
2. **本地手动投递**：直接往本目录放 `maps-<id>.json`（调试 / 补数据用）。

合并由 GitHub Actions（`.github/workflows/bestiary-merge.yml`）自动完成：
收到通知（或每 5 分钟兜底）→ 拉取数据仓库 → 跑 `node tools/merge-maps-contrib.mjs`
→ 并入 `public/norroth-maps.json` → **清空本目录** → 重新构建发布。

## 合并规则（用户定的）

- 按**地图 id** 分组，取 `at`（该图数据最后更新时间）**最大**的那一份；
- **整条替换** —— 名字 / 类型 / 采集点 / 怪物 / 出口格(`ex`) / 门(`edges`) 全部跟着走；
- **门也可以删**：以最新的那份为准（脚本自我纠错，本地存的门连着到图都没看到就删掉）；
- 除门之外，`smugglers_route`（走私路线）、`secret_passage`（秘密通路）等出口格同样记录。

所以本目录平时是空的；仓库里长期只保留一份公共地图数据。贡献者名册记录在该文档的
`meta.contributors` 里（角色 / 等级 / 时间 / 已记录数）。

本地手动合并：

```bash
node tools/merge-maps-contrib.mjs          # 合并 + 写入 + 清空收件箱
node tools/merge-maps-contrib.mjs --keep   # 合并 + 写入，保留收件箱
node tools/merge-maps-contrib.mjs --check  # 只校验，不写不删
```
