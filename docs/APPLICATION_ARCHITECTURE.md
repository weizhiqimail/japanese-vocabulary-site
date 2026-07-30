# 前后端技术架构

> 本文说明应用如何实现产品需求，包括前端、路由、API、数据库访问方式、身份、构建和部署。具体表字段、索引和建表 SQL 统一参见《数据库结构》。

## 1. 系统边界

项目采用同仓全栈结构：Next.js 提供页面和同源 API，API 通过 `mysql2/promise` 访问在线 MySQL，生产环境运行在 OpenAI Sites 的 Cloudflare Workers 基础设施中。

```mermaid
flowchart LR
  U["浏览器"] -->|"React 页面"| N["Next.js / vinext"]
  N -->|"同源 JSON API"| A["Route Handlers"]
  A -->|"参数化 SQL"| D[("MySQL")]
  S["OpenAI Sites"] --> N
  E["DATABASE_URL"] --> A
```

浏览器不会直连数据库，也不能读取 `DATABASE_URL`。

## 2. 技术栈

| 层次 | 技术 | 职责 |
|---|---|---|
| 页面 | Next.js 16、React 19、TypeScript | 路由、状态、交互和渲染 |
| 构建 | vinext、Vite | 生成 Cloudflare Workers 可运行产物 |
| API | Next Route Handler | 参数校验、业务规则和 JSON 响应 |
| 数据访问 | `mysql2/promise` | 连接 MySQL、参数化查询和事务 |
| 内容 | React Markdown、remark-gfm | 渲染文章、目录、表格和代码块 |
| 托管 | OpenAI Sites | 环境变量、版本保存和生产部署 |

## 3. 源码结构

```text
app/
├─ page.tsx
├─ [view]/page.tsx
├─ [view]/[subview]/page.tsx
├─ KotobaApp.tsx
├─ globals.css
├─ components/Notifications.tsx
├─ lib/db.ts
└─ api/
   ├─ vocabulary/
   ├─ categories/
   ├─ progress/
   ├─ favorite-groups/
   ├─ favorites/
   └─ articles/
```

- `KotobaApp.tsx`：主要客户端容器，管理页面状态、数据加载和交互。
- 动态路由文件：校验合法一级、二级路径并渲染应用。
- `app/api`：服务端 API 边界。
- `app/lib/db.ts`：数据库连接创建和用户键解析。
- `globals.css`：全站视觉、动画和响应式规则。

## 4. 前端设计

### 4.1 路由

动态路由使用允许列表拒绝未知模块。客户端通过 `usePathname()` 解析当前页面，使用 `router.push()` 切换 URL。复习和管理子模块具有独立路径，因此支持刷新、前进后退和直接访问。

### 4.2 状态分区

| 分区 | 典型状态 |
|---|---|
| 导航 | 当前一级页面和复习页签 |
| 分类 | 可选类别、各页面所选类别 |
| 学习 | 分类词汇、掌握词汇、错题、当前随机组 |
| 测试 | 题目、当前题、选择结果、错误词汇 |
| 词库 | 页码、每页数量、关键词、列表、Loading |
| 收藏 | 收藏组、默认组、收藏列表 |
| 文章 | 普通知识文章、选中文章 |
| UI | 编辑对话框、字段显示、默记状态、通知、动画 |

分类属于各页面自己的筛选条件，不使用全局分类状态控制所有页面。

### 4.3 数据加载

客户端通过同源 `apiFetch()` 包装器调用 API。包装器为每个并发 HTTP 请求维护引用计数，并统一显示全局 Loading；互不依赖的请求使用 `Promise.all()` 并行加载。例如进入学习页时，同时读取当前分类全部词汇、已掌握词汇和错题，再在客户端排除已学习 ID。

新增词汇、类别和收藏组分别使用同步 `ref` 提交锁与禁用按钮。提交锁在请求发出前设置、在 `finally` 中释放，避免 React 重渲染前的连续点击产生重复 POST。

词库采用服务端分页：

1. 关键词先执行 `trim()`；
2. 使用 `encodeURIComponent()` 写入 URL；
3. 请求期间展示 Loading；
4. API 返回列表、总数、页码和每页数量；
5. 页码跳转表单同时支持回车提交和按钮提交，并在客户端限制到有效页范围；
6. 查询按类别关联表中的来源顺序排序，不依赖词汇主键。
5. 翻页后平滑滚动到顶部。

### 4.4 学习和测试

学习分组使用 Fisher–Yates 洗牌：

```text
候选词汇 = 当前分类词汇 - 背诵本词汇 - 错题本词汇
当前组 = shuffle(候选词汇).slice(0, 组大小)
```

有读音的词汇生成假名、日语和翻译三种方向的题目；读音为空的固定搭配或句子只生成日语和翻译题。每题从分类词汇池生成一个正确答案和三个非空、去重干扰项，题目、词汇和选项均再次随机。

测试结束后按词汇聚合：

- 三种检测全部正确 → `mastered`；
- 任意检测错误 → `error`；
- 正确、错误次数作为增量提交。

### 4.5 默记与字段显示

普通模式用三个布尔状态统一控制日语、假名、翻译。默记模式用 `{vocabularyId}:{field}` 键保存每张卡片的单独切换状态，默认显示日语、隐藏假名和翻译。学习页与词库页各自维护状态，互不干扰。

### 4.6 通知与动画

公共 Notification 组件使用递增 ID 管理消息队列。消息追加而非覆盖，约一秒后自动移除，多条消息自动补位。页面、切题、分页和通知使用轻量动画，并尊重系统减少动画设置。

### 4.7 全局选词查询

`SelectionLookup` 在根布局中挂载，但只响应带 `data-vocabulary-lookup="true"` 的学习卡片、复习卡片和词库行。组件同时监听选区变化、鼠标/触控结束和键盘选取，通过浏览器 Selection API 与 Range 边界计算浮层位置。严格匹配单个 Unicode Han 字符时提供漢字ペディア与 Weblio，否则只提供 Weblio。查询词使用 `encodeURIComponent()` 编码，目标页以 `noopener,noreferrer` 在新窗口打开。第三方服务图标下载后统一保存在 `public/icons/lookup/`，运行时不依赖外部图片地址。

## 5. API 设计

### 5.1 API 列表

| API | 方法 | 职责 |
|---|---|---|
| `/api/categories` | GET、POST | 类别查询和新增 |
| `/api/categories/:id` | PUT | 类别修改、启用或停用 |
| `/api/vocabulary` | GET、POST | 词汇分页/全量查询和新增 |
| `/api/vocabulary/:id` | PUT、DELETE | 词汇修改和删除 |
| `/api/progress` | GET、POST | 学习状态查询和批量写入 |
| `/api/favorite-groups` | GET、POST、PUT | 收藏组查询、新增和修改 |
| `/api/favorites` | GET、POST | 收藏查询、收藏和取消 |
| `/api/articles` | GET | 按类别查询文章 |

### 5.2 通用处理

```mermaid
flowchart TD
  R["接收 Request"] --> V["读取并校验 query/body"]
  V -->|无效| B["400 JSON"]
  V -->|有效| C["创建数据库连接"]
  C --> Q["执行参数化 SQL或事务"]
  Q -->|成功| O["200/201 JSON"]
  Q -->|业务冲突| X["回滚并返回 409"]
  O --> F["关闭连接"]
  X --> F
```

- 字符串先清除前后空格。
- 数字必须验证为有效正整数或约定的 0。
- 枚举值通过服务端白名单校验。
- 用户值使用 SQL 占位符，不直接拼入查询。
- 主体和多标签关联的联合写入使用事务。

### 5.3 关键业务

词汇查询通过类别 ID 筛选，并返回词汇的全部标签；新增和修改先验证全部类别是否存在、启用且适用于词汇。

学习进度通过批量 upsert 保存，同一用户和词汇只保留一条当前状态，正确和错误次数累计。

收藏优先使用请求指定的收藏组；未指定时使用默认组；默认组不存在时自动创建。所有收藏查询和写入都限定当前用户。

文章按类别 ID 查询，正文使用 Markdown。产品需求文档仅保存在仓库 `docs/PRODUCT_REQUIREMENTS.md`，不再作为站内文章同步。

## 6. 数据库访问

`getDb()` 从服务端环境变量读取：

```text
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

它使用标准 `URL` 解析主机、端口、账号、密码和数据库名，再调用 `mysql.createConnection()`。当前模式是每次 API 请求创建连接，并在 `finally` 中执行 `db.end()`。

需要同时修改多份数据的操作使用：

```text
beginTransaction → 执行业务 SQL → commit
异常 → rollback
最终 → end
```

具体数据表、字段、索引和外键不在本文重复，统一参见《数据库结构》。

### 6.1 词汇来源导入

`scripts/audit-and-import-vocabulary.mjs` 提供 BJT 和 N1 的可重复导入流程：

1. 按来源格式解析，同时记录文件、行号和原文。
2. 单词、固定搭配、短语和句子统一生成候选。
3. 使用规范化词面与数据库比较，区分已存在、缺失和缺标签。
4. 重建模式清洗明显的字形、读音、词条边界、HTML 和来源说明污染。
5. 类别关联保存来源文件、来源行和类别内顺序；共享词汇只保存一份主体数据。
6. 小型测试数据库每批最多写入 30 条，全部批次置于一个事务中。
7. 提交后执行计数、连续顺序、脏数据和代表性条目核验。

审计报告保存在 `work/vocabulary-import-audit/`，不提交 Git。BJT 外来语保留括号可选后缀；N1 保留词性、陌生程度、翻译和补充说明。

## 7. 身份与数据隔离

用户键按以下顺序获取：

1. `oai-authenticated-user-email`；
2. `x-forwarded-email`；
3. 受控环境回退值 `site-owner`。

当前站点是单用户个人词汇站。学习进度、收藏组和收藏统一使用服务端 `SITE_OWNER_KEY`，未配置时为 `site-owner`，避免公开访问和登录访问因请求头不同而产生两个数据空间。词汇、类别和文章是共享内容。若未来开放多用户访问，需要加入正式认证和角色权限，再迁移为按账户隔离。

## 8. 响应式设计

- 桌面词库使用完整表格；手机端转为两行词汇布局并隐藏标签和管理列。
- 复习、管理在桌面端左导航右内容，手机端上导航下内容。
- 学习卡片桌面三列、复习卡片桌面双列，手机端统一单列。
- Loading、按钮状态和文字提示不能只依赖动画表达。
- 弹窗使用视口高度上限和内部纵向滚动；手机端标题吸顶，长表单的提交按钮始终可以滚动到达。

## 9. 开发与协作

### 9.1 本地运行

```powershell
npm install
Copy-Item .env.example .env
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

构建验证：

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext build
npm test
```

### 9.2 变更流程

1. 检查 Git 状态和相关实现。
2. 修改功能及对应文档。
3. 构建或测试。
4. 检查差异。
5. 提交并推送 `origin/main`。
6. 只有用户明确确认后才发布生产。

禁止提交 `.env`、数据库密码、令牌或其他密钥；禁止未经确认重写共享 Git 历史。

## 10. 部署

GitHub `main` 是源代码正式版本。`.openai/hosting.json` 保存既有 Sites 项目 ID，不能删除或重新创建。

```mermaid
flowchart LR
  L["本地验证"] --> G["推送 GitHub main"]
  G --> C{"用户确认发布"}
  C -->|否| K["保留源码版本"]
  C -->|是| V["保存 Sites 版本"]
  V --> P["生产部署"]
  P --> H["检查状态和关键页面"]
```

本地 `.env` 不随 Git 克隆；生产连接串由 Sites 环境变量提供。

## 11. 演进方向

1. 将集中式 `KotobaApp.tsx` 拆分为模块组件和 hooks。
2. 提取统一 API Client，集中处理 JSON、错误和取消请求。
3. 建立统一输入校验和错误响应结构。
4. 在规模增长后评估 Repository 层和数据库连接池。
5. 加入正式认证、管理角色、API 集成测试和移动端端到端测试。
