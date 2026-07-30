# AGENTS.md

本文件是此仓库中 Codex 和其他开发代理的长期协作规范，适用于整个仓库。

## 项目目标

维护「日本語言葉勉強」日语学习网站。GitHub 仓库是源代码的正式版本来源，OpenAI Sites 是生产托管平台，在线 MySQL 是业务数据来源。

## 必须遵守

1. 所有关联关系使用数据库 ID，不用分类名称等字符串常量代替外键或关联表。
2. 词汇和文章都支持多个类别；类别不能物理删除，只能停用。
3. 每次需求变化都同步更新：
   - 对应源码和测试；
   - `docs/PRODUCT_REQUIREMENTS.md`。
4. 每次数据库结构变化都同步更新：
   - 所有表与字段的 MySQL `COMMENT`；
   - `docs/DATABASE_SCHEMA.md`；
   - 受影响的 `docs/APPLICATION_ARCHITECTURE.md`，但不要在架构文档重复完整表结构。
5. 数据库操作统一读取 `DATABASE_URL`。禁止提交 `.env`、密码、令牌或把密钥写入代码、文档和 Git 历史。
6. 保留 `.openai/hosting.json` 及其中现有 `project_id`，它绑定当前 Sites 项目。
7. 页面必须同时检查桌面端和手机端。复习、管理等二级模块必须具有独立 URL。
8. 完成改动后先执行构建或相应测试，再提交并推送到 GitHub。
9. 只有用户明确“确认发布”后，才把已验证版本部署到生产 Sites。GitHub 推送不等同于生产发布。
10. 不覆盖或回退用户未授权的现有改动；不使用 `git reset --hard` 或强制推送。
11. 每次任务完成前检查并更新 `AGENTS.md`：新增的长期规则、目录、数据来源或工作流必须写入；交付时明确说明本次是否更新及更新内容。
12. 原始词汇与文章来源统一保存在 `files/vocabulary/`。新增或替换来源文件时，同步更新 README 和项目需求文档中的链接。
13. 词汇导入不得只识别单个单词：固定搭配、短语和完整句子都必须进入候选。使用 `scripts/audit-and-import-vocabulary.mjs` 先审计、后事务导入、再反向核验。
14. 来源导入顺序为 BJT 后 N1；只有审计结果 `missingCount=0` 且 `needsCategoryCount=0` 才能报告完成。
15. 不得把 BJT 外来语括号统一当作假名；`アポ（イント）` 等表示可选后缀，必须保留完整词面。N1 必须保留第七列补充说明。
16. 在线 MySQL 是 1 GB 内存的测试实例；批量重建每批最多写入 30 条，禁止一次提交数百或数千行参数。
17. 词汇类别关联必须保存 `sort_order`、`source_file`、`source_line`；查询按类别内来源顺序返回。固定搭配或句子没有可靠读音时 `reading` 使用 `NULL`，测试跳过假名题。
18. `vocabulary.reading` 在数据库和编辑表单中均为可选；来源信息只存放在 `vocabulary_category_links`，不得新增 `familiarity` 或把来源说明写回词汇主体。
19. 所有浏览器端 HTTP 请求必须通过统一请求包装器显示 Loading；新增操作必须使用同步提交锁与禁用按钮防止重复 POST。手机端弹窗必须限制视口高度并允许内部纵向滚动。
20. 手机端词库行采用两层卡片：首层左侧词汇与可选假名、右侧顶部对齐收藏按钮；次层翻译与标签。长句允许左侧换行，编辑和删除按钮不显示。
21. 每次准备 Sites 新版本时递增 `vite.config.ts` 中的 `appVersion`，使其与预期 Sites 版本一致；构建时间由 Vite 按 `Asia/Tokyo` 自动注入，顶部品牌旁必须显示版本与构建时间。

## 开发工作流

1. 先查看 `git status`、相关源码和现有文档。
2. 实现最小且完整的变更。
3. 按职责更新 PRD、技术架构或数据库结构文档；产品需求只维护仓库中的 PRD，不再同步为站内文章。
4. 在 Windows PowerShell 中验证：

   ```powershell
   $env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
   npx vinext build
   ```

5. 检查差异，创建语义明确的 Git 提交并推送 `origin/main`。
6. 收到发布确认后，使用 `.openai/hosting.json` 中的既有 Sites 项目保存版本并部署。
7. 最终交付中报告构建、GitHub、文档同步和 `AGENTS.md` 更新状态。

## 关键实现约定

- 主界面在 `app/KotobaApp.tsx`，公共通知组件在 `app/components/Notifications.tsx`。
- 右上角 GitHub 入口组件在 `app/components/GitHubCorner.tsx`；站内静态图标统一保存在 `public/icons/`，运行时不直接引用第三方图标 URL。
- 选词查询组件在 `app/components/SelectionLookup.tsx`；只允许带 `data-vocabulary-lookup="true"` 的学习、复习和词库词汇区域触发。第三方查询服务图标统一下载到 `public/icons/lookup/`，禁止运行时直接引用远程图标。
- API 位于 `app/api`；数据库公共代码位于 `app/lib/db.ts`。
- 当前站点是单用户个人词汇站，学习和收藏统一使用 `SITE_OWNER_KEY`；未配置时固定为 `site-owner`，不得再按请求头邮箱拆分成多个用户空间。
- 学习题目、选项和学习顺序必须随机；已学会的词汇不能再次进入普通学习组。
- 收藏操作默认进入用户设置的默认收藏组，并在通知中显示收藏组名称。
- 页面隐藏项与默记模式的行为应在学习页和词库页保持一致。
- 项目原始数据来源目录为 `files/vocabulary/`；网站运行时数据仍以在线 MySQL 为准。
- 词汇导入命令为 `npm run vocabulary:audit:bjt`、`vocabulary:import:bjt`、`vocabulary:audit:n1`、`vocabulary:import:n1`；完整重建先运行 `npm run vocabulary:preview:rebuild`，确认后运行 `npm run vocabulary:rebuild`，最后执行 `node --env-file=.env scripts/verify-vocabulary-rebuild.mjs`。审计输出位于 `work/vocabulary-import-audit/`。
