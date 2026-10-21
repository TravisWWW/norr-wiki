# 图鉴收件箱（data/bestiary-contrib/）

图鉴数据的**唯一权威文档**是 `src/data/bestiary-live.json`（wiki 怪物图鉴页读的就是它）。

数据来源有两条：

1. **主渠道**：图鉴专用数据仓库 `TravisWWW/norr-bestiary` 的 `contrib/char-<角色ID>.json`
   （「小伴侣」用内置社区令牌自动上传）。`bestiary-merge.yml` 会拉取它们。
2. **本地手动投递**：直接往本目录放 `char-<id>.json`（调试 / 补数据用）。

合并由 GitHub Actions（`.github/workflows/bestiary-merge.yml`）自动完成：
收到通知（或每 5 分钟兜底）→ 拉取数据仓库 → 跑 `node tools/merge-bestiary-contrib.mjs`
→ 并入 `src/data/bestiary-live.json` → **清空本目录** → 重新构建发布。

所以本目录平时是空的；仓库里长期只保留一份图鉴文档。贡献者名册记录在该文档的
`meta.contributors` 里（角色 / 等级 / 时间 / 已记录数）。

本地手动合并：

```bash
node tools/merge-bestiary-contrib.mjs          # 合并 + 写入 + 清空收件箱
node tools/merge-bestiary-contrib.mjs --keep   # 合并 + 写入，保留收件箱
node tools/merge-bestiary-contrib.mjs --check  # 只校验，不写不删
```
