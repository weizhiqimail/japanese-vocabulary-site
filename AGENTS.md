# AGENTS.md

本文件是此仓库中 Codex 和其他开发代理的长期协作规范，适用于整个仓库。

## 项目目标

维护「日本語言葉勉強」日语学习网站。GitHub 仓库是源代码的正式版本来源，OpenAI Sites 是生产托管平台，在线 MySQL 是业务数据来源。

## 必须遵守

1. 所有关联关系使用数据库 ID，不用分类名称等字符串常量代替外键或关联表。
2. 词汇和文章都支持多个类别；类别不能物理删除，只能停用。
3. 每次需求变化都同步更新：
   - 对应源码和测试；
   - 本仓库的 README 或 `docs/`；
   - 管理页面中的“项目文档”文章。
4. 每次数据库结构变化都同步更新：
   - 所有表与字段的 MySQL `COMMENT`；
   - `docs/DATABASE.md`；
   - 管理页面项目文档中的 SQL、表用途和表关系。
5. 数据库操作统一读取 `DATABASE_URL`。禁止提交 `.env`、密码、令牌或把密钥写入代码、文档和 Git 历史。
6. 保留 `.openai/hosting.json` 及其中现有 `project_id`，它绑定当前 Sites 项目。
7. 页面必须同时检查桌面端和手机端。复习、管理等二级模块必须具有独立 URL。
8. 完成改动后先执行构建或相应测试，再提交并推送到 GitHub。
9. 只有用户明确“确认发布”后，才把已验证版本部署到生产 Sites。GitHub 推送不等同于生产发布。
10. 不覆盖或回退用户未授权的现有改动；不使用 `git reset --hard` 或强制推送。

## 开发工作流

1. 先查看 `git status`、相关源码和现有文档。
2. 实现最小且完整的变更。
3. 更新技术文档及数据库内项目文档。
4. 在 Windows PowerShell 中验证：

   ```powershell
   $env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
   npx vinext build
   ```

5. 检查差异，创建语义明确的 Git 提交并推送 `origin/main`。
6. 收到发布确认后，使用 `.openai/hosting.json` 中的既有 Sites 项目保存版本并部署。

## 关键实现约定

- 主界面在 `app/KotobaApp.tsx`，公共通知组件在 `app/components/Notifications.tsx`。
- API 位于 `app/api`；数据库公共代码位于 `app/lib/db.ts`。
- 用户身份优先读取 `oai-authenticated-user-email` 或 `x-forwarded-email`；仅在本地或缺失时使用明确的回退值。
- 学习题目、选项和学习顺序必须随机；已学会的词汇不能再次进入普通学习组。
- 收藏操作默认进入用户设置的默认收藏组，并在通知中显示收藏组名称。
- 页面隐藏项与默记模式的行为应在学习页和词库页保持一致。

