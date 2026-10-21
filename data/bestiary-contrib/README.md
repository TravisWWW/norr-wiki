# 图鉴收件箱（data/bestiary-contrib/）

这里是「小伴侣」上传图鉴记录的**收件箱**。每个账号一份文件：`char-<角色ID>.json`。

- 上传方式：小伴侣面板 → 高级 → 「图鉴同步」→ 同步到公共图鉴（需要 GitHub 令牌）。
- 合并：GitHub Actions（`.github/workflows/bestiary-merge.yml`）在收到新文件后自动运行
  `node tools/merge-bestiary-contrib.mjs`，把内容并入**唯一一份**权威图鉴文档
  `src/data/bestiary-live.json`，然后**清空本目录**。
- 所以本目录平时是空的；仓库里长期只保留一份图鉴文档（`src/data/bestiary-live.json`），
  贡献者信息记录在该文档的 `meta.contributors` 里。

本地手动合并：

```bash
node tools/merge-bestiary-contrib.mjs          # 合并 + 写入 + 清空收件箱
node tools/merge-bestiary-contrib.mjs --keep   # 合并 + 写入，保留收件箱
node tools/merge-bestiary-contrib.mjs --check  # 只校验，不写不删
```
