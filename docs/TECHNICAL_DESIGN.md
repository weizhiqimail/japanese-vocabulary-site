# 前后端与数据库详细技术设计

## 1. 文档目的

本文描述「日本語言葉勉強」当前源码的实现方式，重点说明：

- 浏览器端页面、状态和交互怎样组织；
- 页面如何调用后端 API；
- API 如何创建 MySQL 连接并执行 SQL；
- 词汇、分类、学习进度、收藏和文章之间如何关联；
- 一次学习、测试、收藏或维护操作的数据流；
- 身份隔离、事务、异常处理和部署链路；
- 当前实现的边界以及后续扩展时应遵守的设计原则。

本文是“当前实现说明”，不是抽象的目标架构。代码发生结构性变化时，应同步更新本文。

## 2. 技术栈与运行边界

| 层次 | 技术 | 作用 |
|---|---|---|
| 页面框架 | Next.js 16 | App Router、动态路由和 Route Handler |
| UI | React 19 + TypeScript | 页面状态、交互、渲染和类型约束 |
| 构建适配 | vinext + Vite | 将 Next/React 应用构建为 Cloudflare Workers 可运行产物 |
| 后端接口 | Next Route Handler | 提供同源 `/api/*` JSON API |
| 数据访问 | `mysql2/promise` | 使用 Promise API 执行参数化 SQL 和事务 |
| 数据库 | MySQL 8 | 保存所有长期业务数据 |
| 内容渲染 | React Markdown + remark-gfm | 渲染文章、项目文档、表格和标题 |
| 托管 | OpenAI Sites | 保存版本、注入环境变量并部署生产站点 |

项目不是传统的“独立前端仓库 + 独立后端服务”结构。页面和 API 位于同一个 Next.js 工程中，但边界仍然清晰：

```mermaid
flowchart LR
  B["浏览器 / React 客户端"] -->|"同源 fetch JSON"| R["Next Route Handlers"]
  R -->|"mysql2 参数化 SQL"| D[("在线 MySQL")]
  H["OpenAI Sites / Cloudflare Workers"] --> B
  H --> R
  E["DATABASE_URL 环境变量"] --> R
```

浏览器不能直接连接数据库，也不会接触 `DATABASE_URL`。只有服务端 Route Handler 导入 `app/lib/db.ts`。

## 3. 源码分层

### 3.1 目录职责

```text
app/
├─ page.tsx                         首页入口
├─ [view]/page.tsx                  一级模块动态路由
├─ [view]/[subview]/page.tsx        二级模块动态路由
├─ KotobaApp.tsx                    主要客户端状态、业务交互和页面渲染
├─ globals.css                      全局、动画及响应式样式
├─ components/Notifications.tsx    公共通知队列
├─ lib/db.ts                        MySQL 连接和用户标识
└─ api/
   ├─ vocabulary/                   词汇查询和新增
   ├─ vocabulary/[id]/              词汇修改和删除
   ├─ categories/                   类别查询和新增
   ├─ categories/[id]/              类别修改、启用和停用
   ├─ progress/                     学习进度读写
   ├─ favorite-groups/              收藏组读写
   ├─ favorites/                    收藏关系读写
   └─ articles/                     文章查询
```

### 3.2 当前分层特点

- `KotobaApp.tsx` 是一个较集中的客户端容器，负责页面选择、请求、状态和视图。
- Route Handler 是服务端边界，负责输入清洗、权限范围、SQL 和响应状态码。
- `app/lib/db.ts` 只处理连接创建和用户键解析，没有建立 Repository 或 ORM 层。
- 数据模型由实际 MySQL 表管理；`db/schema.ts` 当前不是业务表结构来源。
- 文章内容存放在数据库中，以 Markdown 形式进入前端渲染。

## 4. 前端设计

### 4.1 路由模型

一级模块：

| 路径 | 模块 |
|---|---|
| `/` | 首页 |
| `/learn` | 学习 |
| `/quiz` | 测试 |
| `/review` | 复习入口 |
| `/words` | 词库 |
| `/articles` | 文章 |
| `/management` | 管理入口 |

二级模块：

| 路径 | 模块 |
|---|---|
| `/review/errors` | 错题本 |
| `/review/mastered` | 背诵本 |
| `/review/favorites` | 收藏 |
| `/management/categories` | 类别 |
| `/management/documents` | 项目文档 |

动态页面先用允许列表验证参数，无效路径调用 `notFound()`。进入合法路由后统一渲染 `KotobaApp`。客户端使用 `usePathname()` 解析当前模块，并使用 `router.push()` 切换 URL，因此：

- 刷新页面仍能回到当前模块；
- 浏览器前进、后退能够工作；
- 二级模块可直接收藏和分享 URL；
- 切换模块及分页时可以执行平滑滚动。

### 4.2 状态划分

主要状态按业务分为：

| 状态组 | 典型状态 | 说明 |
|---|---|---|
| 导航 | `view`、复习页签、管理页签 | 与当前路径相互映射 |
| 分类 | `categoryOptions`、`categoryId` | 每个模块内部选择类别，不作为全局筛选 |
| 学习 | `words`、`mastered`、`errors`、`currentGroup` | 计算尚未学习的随机词组 |
| 显示 | `visibility`、`memoryMode`、`memoryToggles` | 控制字段统一隐藏及单词级默记 |
| 测试 | `questions`、`questionIndex`、`selected`、`wrongIds` | 保存当前测试会话 |
| 词库 | `page`、`pageSize`、`search`、`listItems`、`listLoading` | 服务端分页、查询及 Loading |
| 收藏 | `favoriteGroups`、`favorites`、选中收藏组 | 默认收藏组和复习收藏页 |
| 内容 | `articles`、`developmentArticles`、选中文章 | 普通文章与项目文档 |
| UI | 对话框、编辑表单、通知队列、动画状态 | 通用交互反馈 |

这些状态主要是页面会话状态。词汇、收藏和学习结果最终以 API 返回或数据库保存的数据为准。

### 4.3 数据加载

React Effect 根据分类、页码、收藏组和页面模块加载数据。可并行的数据使用 `Promise.all()`：

```mermaid
sequenceDiagram
  participant UI as KotobaApp
  participant V as /api/vocabulary
  participant P as /api/progress
  UI->>V: GET categoryId + all=true
  par 同时读取
    UI->>P: GET status=mastered
    UI->>P: GET status=error
  end
  V-->>UI: 分类全部词汇
  P-->>UI: 已掌握词汇
  P-->>UI: 错题词汇
  UI->>UI: 排除已学习 ID，随机抽取当前组
```

词库使用服务端分页。客户端会：

1. 对查询词前后执行 `trim()`；
2. 使用 `encodeURIComponent()` 写入 URL；
3. 在请求期间设置 `listLoading`；
4. 根据 API 返回的 `total` 和 `pageSize` 计算总页数；
5. 翻页后通过 `window.scrollTo({ behavior: "smooth" })` 回到顶部。

### 4.4 学习随机算法

`shuffle()` 使用 Fisher–Yates 洗牌：

1. 复制输入数组，不修改原数组；
2. 从末尾开始生成一个不大于当前位置的随机下标；
3. 交换两个位置；
4. 返回随机排列。

当前学习组由以下集合产生：

```text
候选词汇 = 当前分类全部词汇 - 已掌握词汇 - 错题词汇
当前学习组 = shuffle(候选词汇).slice(0, 每组数量)
```

因此普通学习不会再次抽到已经完成过测试并写入学习进度的词汇。

### 4.5 测试题生成

每个学习词汇分别生成三种题型：

| 模式 | 题目主要内容 | 答案字段 |
|---|---|---|
| `reading` | 根据单词选择假名 | `reading` |
| `word` | 根据提示选择日语单词 | `word` |
| `meaning` | 根据单词选择翻译 | `meaning` |

题目池和选项均被打乱。每题包含一个正确答案和最多三个干扰项，干扰项：

- 来自当前分类词汇池；
- 排除当前词汇本身；
- 对目标字段去重；
- 最终与正确答案再次一起洗牌。

用户选中答案后本题锁定，避免重复点击。切换下一题前先设置离场状态并等待约 180ms，配合 CSS 完成淡出，再更新题号完成淡入。

完成全部题目后，前端按词汇聚合三种题型结果：

- 三种检测全部正确：写入 `mastered`；
- 任意一种错误：写入 `error`；
- 同时提交本轮正确、错误次数的增量。

### 4.6 字段隐藏与默记模式

普通模式使用三个布尔值统一控制日语、假名和翻译是否展示。

默记模式使用 `Set<string>` 保存单词与字段组合：

```text
{vocabularyId}:{field}
```

例如 `125:reading` 表示编号 125 的假名字段被单独切换。默记模式默认：

- 日语显示；
- 假名隐藏；
- 翻译隐藏。

三个字段都可以点击切换。退出或重新进入默记模式时清空切换集合，避免上一次会话影响新的显示状态。学习页和词库页拥有各自独立的默记状态。

### 4.7 通知组件

收藏、取消收藏和部分操作通过公共 `Notifications` 组件反馈：

- 新消息追加到数组而不是覆盖旧消息；
- 每条消息使用递增 ID；
- 默认约 1 秒后移除；
- 多条消息纵向排列；
- 上一条消失后，后续消息自动补位；
- 收藏提示包含实际收藏组名称。

## 5. 后端 API 设计

### 5.1 通用请求流程

每个 Route Handler 基本遵循以下流程：

```mermaid
flowchart TD
  A["接收 Request"] --> B["读取 query / JSON body"]
  B --> C["trim、Number、白名单和范围校验"]
  C -->|无效| D["返回 400 JSON"]
  C -->|有效| E["getDb 创建 MySQL 连接"]
  E --> F["执行参数化 SQL / 事务"]
  F -->|成功| G["返回 JSON 与适当状态码"]
  F -->|业务冲突| H["回滚并返回 409"]
  G --> I["finally: db.end"]
  H --> I
```

响应主要使用：

- `200`：查询或修改成功；
- `201`：新增成功；
- `400`：请求参数无效；
- `409`：重复数据、无效关联或事务冲突。

### 5.2 词汇 API

#### 查询

`GET /api/vocabulary` 接收：

| 参数 | 说明 |
|---|---|
| `categoryId` | 必填，正整数类别 ID |
| `search` | 可选，对日语、假名、翻译进行模糊查询 |
| `page` | 页码，最小 1 |
| `pageSize` | 每页数量，服务端限制为 1～100 |
| `all=true` | 学习页使用，最多读取 5000 条 |

查询先通过 `vocabulary_category_links` 限定目标类别，再连接一次关联表取得这个词汇的全部类别。`GROUP_CONCAT` 将类别名称和 ID 聚合，API 再转换为：

```ts
{
  categories: string[];
  categoryIds: number[];
}
```

列表查询和总数查询使用相同的分类与搜索条件，保证分页总数一致。模糊查询参数使用 `%关键词%`，通过占位符传递，不拼接用户原始值。

#### 新增和修改

词汇新增与修改都要求：

- 至少一个类别 ID；
- 日语、假名和翻译非空；
- 类别存在、启用，并且作用域是 `vocabulary` 或 `both`。

操作使用事务。新增流程为：

1. 验证全部类别 ID；
2. 插入 `vocabulary`；
3. 获取 `insertId`；
4. 逐条插入 `vocabulary_category_links`；
5. 提交事务。

修改流程为：

1. 验证全部新类别 ID；
2. 更新词汇主体；
3. 删除旧类别关联；
4. 写入新类别关联；
5. 提交事务。

任何一步失败都会回滚，不会留下“词汇更新了但标签只更新一半”的状态。

#### 删除

`DELETE /api/vocabulary/:id` 删除词汇主体。数据库必须通过外键级联或既定约束处理关联记录。执行结构变更时，需要复核这些级联规则，避免产生孤立关联。

### 5.3 类别 API

类别包含两个不同概念：

- `scope`：适用于词汇、文章或两者；
- `purpose`：学习分类、普通主题或开发文档。

查询可以按词汇或文章作用域过滤，同时包含 `both`。新增和修改使用固定白名单校验 `scope` 与 `purpose`。

业务不提供类别 DELETE API。界面只修改 `enabled`，从而保留历史关系和稳定 ID。

### 5.4 学习进度 API

`learning_progress` 以用户和词汇为业务唯一维度。查询可以：

- `categoryId=0` 查看全部分类；
- 传正整数查看指定分类；
- 使用 `status=mastered` 或 `status=error` 筛选。

写入采用批量：

```sql
INSERT ... VALUES (...), (...)
ON DUPLICATE KEY UPDATE
```

重复记录不会新增第二行，而是：

- 使用本次结果更新状态；
- 将 `correct_count` 累加；
- 将 `wrong_count` 累加。

这使背诵本和错题本表示“当前状态”，计数表示“累计表现”。

### 5.5 收藏组与收藏 API

收藏组按 `user_key` 隔离。读取收藏组时，后端会检查当前用户是否已有收藏组；如果没有，就创建“默认收藏组”。

设置新默认组使用事务：

1. 把当前用户全部收藏组的 `is_default` 设为 0；
2. 把目标组设为 1；
3. 提交。

收藏词汇时：

1. 优先使用请求里的 `groupId`；
2. 未指定时查询用户默认组；
3. 仍不存在时自动创建默认组；
4. `INSERT IGNORE` 写入收藏关系；
5. SQL 同时验证收藏组属于当前用户。

取消收藏必须同时匹配 `user_key`、`group_id` 和 `vocabulary_id`，避免影响其他用户或其他收藏组中的同一词汇。

### 5.6 文章 API

文章和类别也是多对多关系。查询时：

1. 通过一组关联限定所选类别；
2. 通过另一组关联读取文章全部标签；
3. 按 `sort_order` 和 ID 排序；
4. 将 `GROUP_CONCAT` 转成分类数组。

项目文档不是写死在前端的常量，而是 `articles` 中带开发用途类别的文章。前端使用 Markdown 与 GFM 渲染标题、列表、表格、代码块等内容，并从一级到三级标题生成目录锚点。

## 6. 数据库连接设计

### 6.1 连接串

本地 `.env` 和生产环境变量使用：

```text
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

禁止把真实连接串写入源码、Markdown、Git 远程 URL 或提交历史。

### 6.2 连接创建

`getDb()` 的实际处理：

1. 读取 `process.env.DATABASE_URL`；
2. 缺失时立即抛出 `DATABASE_URL is not configured`；
3. 使用标准 `URL` 解析主机、端口、账号、密码和数据库名；
4. 对用户名和密码执行 `decodeURIComponent()`；
5. 调用 `mysql.createConnection()`；
6. 开启 TCP keep-alive；
7. 返回 Promise 连接对象。

当前采用“一次 API 请求创建一个连接”的方式，不使用全局连接池。每个调用方应在 `finally` 中执行 `db.end()`。

这种方案的优点是生命周期直观，适合当前规模；缺点是高并发下会增加连接建立成本。以后改为连接池时必须考虑：

- Worker 实例复用与冷启动；
- 数据库最大连接数；
- 空闲连接回收；
- 请求结束后归还连接而不是关闭整个池；
- 事务必须固定在同一条池连接上。

### 6.3 SQL 安全

用户值统一通过 `?` 占位符传入。少量动态 SQL 只用于：

- 已验证类别 ID 数量对应的占位符列表；
- 后端控制的搜索条件片段；
- 后端控制的 `WHERE` 条件组合。

用户输入不应直接拼入 SQL。任何新排序字段、表名或列名需求都必须用服务端白名单映射，不能直接接收前端字符串。

### 6.4 事务边界

需要同时更新主体和关联表的操作使用事务：

- 新增词汇和标签；
- 修改词汇和标签；
- 新建或修改默认收藏组。

事务标准结构：

```ts
const db = await getDb();
await db.beginTransaction();
try {
  // 多条相互依赖的 SQL
  await db.commit();
} catch (error) {
  await db.rollback();
  // 返回业务错误
} finally {
  await db.end();
}
```

单条查询或单条写入通常不额外开启事务。

## 7. 数据模型和模块关系

### 7.1 实体关系

```mermaid
erDiagram
  VOCABULARY ||--o{ VOCABULARY_CATEGORY_LINKS : "具有标签"
  CATEGORIES ||--o{ VOCABULARY_CATEGORY_LINKS : "标记词汇"
  VOCABULARY ||--o{ LEARNING_PROGRESS : "产生学习进度"
  FAVORITE_GROUPS ||--o{ VOCABULARY_FAVORITES : "包含"
  VOCABULARY ||--o{ VOCABULARY_FAVORITES : "被收藏"
  ARTICLES ||--o{ ARTICLE_CATEGORY_LINKS : "具有标签"
  CATEGORIES ||--o{ ARTICLE_CATEGORY_LINKS : "标记文章"
```

### 7.2 ID 关系原则

- 分类筛选传递 `categoryId`，不传 `BJT`、`N1` 等名称作为业务键；
- 收藏关系传递 `groupId`；
- 学习进度和收藏都传递 `vocabularyId`；
- 文章查询按开发类别或文章类别的 ID；
- 名称只用于展示，可以修改，不影响现有关系。

### 7.3 模块之间的数据依赖

| 模块 | 读取 | 写入 | 影响 |
|---|---|---|---|
| 学习 | 词汇、类别、学习进度、默认收藏组 | 收藏 | 为测试准备未学习词组 |
| 测试 | 当前学习组、本地题目状态 | 学习进度 | 决定背诵本和错题本 |
| 词库 | 词汇、类别、收藏 | 词汇、词汇标签、收藏 | 改动立即成为学习数据源 |
| 复习·错题 | 学习进度、词汇、类别 | 收藏 | 展示状态为 `error` 的词汇 |
| 复习·背诵 | 学习进度、词汇、类别 | 收藏 | 展示状态为 `mastered` 的词汇 |
| 复习·收藏 | 收藏组、收藏、词汇、类别 | 收藏组、收藏 | 按组和分类查看 |
| 文章 | 文章、文章标签 | 当前无前端写接口 | 展示知识内容 |
| 管理·类别 | 类别 | 类别 | 控制其他模块可选标签 |
| 管理·项目文档 | 开发类文章 | 当前无前端写接口 | 展示 PRD、SQL 和技术说明 |

## 8. 关键业务数据流

### 8.1 从词库到学习结果

```mermaid
sequenceDiagram
  actor A as 用户
  participant W as 词库页面
  participant API as Vocabulary API
  participant DB as MySQL
  participant L as 学习页面
  participant Q as 测试页面
  participant P as Progress API

  A->>W: 新增词汇并选择多个类别
  W->>API: POST vocabulary + categoryIds
  API->>DB: 事务写词汇和关联
  DB-->>API: commit
  API-->>W: 201 + vocabularyId
  A->>L: 选择类别
  L->>API: GET 分类词汇
  L->>P: GET mastered/error
  L->>L: 排除已学习并随机分组
  A->>Q: 开始测试
  Q->>Q: 三种方向、四选一、随机顺序
  Q->>P: POST 聚合结果
  P->>DB: upsert progress
  DB-->>P: 成功
```

### 8.2 收藏

```mermaid
sequenceDiagram
  actor A as 用户
  participant UI as 任意词汇卡片
  participant F as Favorites API
  participant G as Favorite Groups
  participant DB as MySQL

  A->>UI: 点击收藏
  UI->>F: POST vocabularyId, favorite=true, groupId=0
  F->>DB: 查询当前用户默认组
  alt 默认组不存在
    F->>DB: 创建默认收藏组
  end
  F->>DB: INSERT IGNORE 收藏关系
  F-->>UI: groupId
  UI->>G: 刷新收藏组/收藏列表
  UI-->>A: 浅绿色通知，显示收藏组名称
```

## 9. 用户身份与数据隔离

`getUserKey()` 的优先级：

1. `oai-authenticated-user-email`；
2. `x-forwarded-email`；
3. 回退为 `site-owner`。

用户键用于隔离：

- `learning_progress`；
- `favorite_groups`；
- `vocabulary_favorites`。

词汇、类别和文章目前是共享内容，不按用户隔离。

需要注意：请求头必须由可信的托管代理注入。若未来允许绕过托管平台直接访问服务，应在服务端增加正式登录验证，不能信任任意客户端自行设置的邮箱头。`site-owner` 仅适合当前单用户或受控环境，不适合开放式多用户产品。

## 10. 错误处理与一致性

### 10.1 当前策略

- 输入不合法在连接数据库前尽早返回；
- 数据库连接用 `finally` 关闭；
- 多表写入使用事务；
- 重复键等业务冲突映射为可读中文提示；
- 前端使用 Loading、按钮反馈、确认对话框和通知提示用户；
- 删除词汇前使用浏览器确认。

### 10.2 扩展时应补强

- 建立统一 API 错误响应类型，例如 `{ code, message, details? }`；
- 对所有 `fetch` 检查 `response.ok`，避免把失败响应当成功数据；
- 增加服务端结构化日志，但不得记录密码和完整连接串；
- 对写接口增加身份认证和权限角色；
- 对搜索增加防抖或显式提交，减少高频请求；
- 为批量导入、事务回滚、用户隔离和分页边界增加自动测试；
- 监控 MySQL 连接数、慢查询和接口错误率。

## 11. 响应式与可访问性

桌面端词库采用表格表达完整列；手机端隐藏标签与操作等次要列，并将日语与假名放在第一行、翻译放在第二行。复习和管理模块在桌面端采用左侧导航、右侧内容，手机端变为上方导航、下方内容。

交互控件应保持：

- 可点击元素使用 `button`、`input`、`select` 等语义标签；
- Loading 状态有文字或视觉提示；
- 动画不作为唯一状态信号；
- 隐藏字段仍保留明确的“点击显示”占位；
- 页面字体统一采用无衬线字体；
- 新增功能同时验证窄屏和宽屏布局。

## 12. 构建、GitHub 与部署

### 12.1 本地

```powershell
npm install
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

构建：

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext build
```

### 12.2 GitHub

GitHub `main` 是源代码正式版本。每次功能完成后：

1. 更新源码和文档；
2. 执行构建或测试；
3. 检查 `git diff`；
4. 创建语义明确的提交；
5. 推送 `origin/main`。

### 12.3 Sites

`.openai/hosting.json` 中的 `project_id` 连接既有 Sites 项目。部署不是 GitHub push 的自动副作用，流程为：

```mermaid
flowchart LR
  C["本地已验证提交"] --> G["GitHub main"]
  G --> U{"用户确认发布？"}
  U -->|否| S["只保留源码版本"]
  U -->|是| V["保存 Sites 版本"]
  V --> P["部署生产"]
  P --> K["检查状态与关键页面"]
```

数据库连接由 Sites 环境变量提供。源码归档、GitHub 仓库和输出日志都不应包含真实密码。

## 13. 当前架构的演进建议

当功能继续增长时，建议按以下顺序演进：

1. 将 `KotobaApp.tsx` 拆为按模块组织的组件和 hooks；
2. 提取统一的 `apiClient`，集中处理 JSON、错误、Loading 和取消请求；
3. 为 API 提取输入 schema 与统一错误类型；
4. 在数据访问层建立明确的 Repository，减少 SQL 分散；
5. 为数据库结构建立正式迁移文件，并把实际 MySQL 结构作为唯一可信来源；
6. 根据并发量评估连接池或数据库代理；
7. 引入正式认证、角色和管理权限；
8. 增加单元测试、API 集成测试和关键移动端端到端测试。

演进时仍需保持：关系使用 ID、词汇与文章支持多标签、类别不物理删除、所有数据库字段带说明、需求与数据库文档随代码同步。
