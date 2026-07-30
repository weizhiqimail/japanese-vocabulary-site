# Japanese Vocabulary Site

「日本語言葉勉強」は、日语词汇学习、测试、复习、收藏和内容管理网站。项目使用在线 MySQL 保存词汇、分类、学习进度、收藏组和文章数据，并针对桌面端与手机端提供响应式界面。

## 主要功能

- 按分类学习词汇，支持每组 10、20、30、50 个词汇（默认 30）
- 日语、假名、翻译三种方向的四选一测试，题目与选项随机
- 已学习词汇自动排除；错题本、背诵本和收藏集中在复习页面
- 默记模式：默认隐藏假名与翻译，单项点击显示或隐藏
- 词库分页、模糊查询、分类筛选、增删改查和多标签
- 多收藏组、默认收藏组、收藏提示通知
- 文章与项目文档展示；类别配置只允许新增、修改和查询
- 页面及二级页面采用真实路由，分页后平滑回到页面顶部

## 技术栈

- Next.js 16、React 19、TypeScript
- vinext、Vite、Cloudflare Workers / OpenAI Sites
- MySQL 8、`mysql2`
- React Markdown、GFM

## 本地启动

要求 Node.js 22.13 或更高版本。

```powershell
npm install
Copy-Item .env.example .env
# 编辑 .env，填写 DATABASE_URL
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

Windows 下构建：

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext build
```

`DATABASE_URL` 的格式：

```text
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

不要提交 `.env`、数据库密码、访问令牌或其他密钥。

## 目录

- `app/KotobaApp.tsx`：主要客户端界面与交互
- `app/globals.css`：全站与响应式样式
- `app/[view]`、`app/[view]/[subview]`：一级、二级页面路由
- `app/api`：MySQL 数据 API
- `app/lib/db.ts`：数据库连接与公共数据访问
- `.openai/hosting.json`：OpenAI Sites 项目标识，不要删除或重新生成
- `docs/`：架构、数据库、开发和部署说明
- `files/vocabulary/`：项目使用的原始词汇来源文件
- `files/article/`：与在线数据库逐篇对应的文章 Markdown 文件

## 词汇来源文件

来源文件统一保存在 [`files/vocabulary`](files/vocabulary/)：

- [BJT 词汇](files/vocabulary/BJT-词汇.txt)
- [BJT 外来语](files/vocabulary/BJT-外来语.txt)
- [BJT 汇总](files/vocabulary/BJTSummary.md)
- [N1 词汇 CSV](files/vocabulary/N1-词汇.csv)：由原始 `N1-词汇.xlsx` 直接转换，保留 3,208 行、7 列内容
- [历史文章汇总原文](files/vocabulary/文章.txt)

文章文件及数据库对应关系参见 [`files/article/README.md`](files/article/README.md)。在线 MySQL 是网站运行时数据源；仓库文件用于追溯原始数据、重新导入和核对。

### 来源核对与导入

导入工具会把单词、固定搭配、短语和完整句子全部作为学习条目。执行写入前先审计，写入后再次反向核验：

```powershell
npm run vocabulary:audit:bjt
npm run vocabulary:import:bjt
npm run vocabulary:audit:n1
npm run vocabulary:import:n1
```

审计报告写入被 Git 忽略的 `work/vocabulary-import-audit/`。导入顺序固定为 BJT 后 N1，所有数据库操作读取本地 `.env` 中的 `DATABASE_URL`。

2026-07-30 全量核对结果：

| 来源 | 有效来源行/候选 | 唯一学习条目 | 本次新增 | 最终遗漏 |
|---|---:|---:|---:|---:|
| BJT 汇总、BJT 补充、BJT 外来语 | 804 个含日语汇总行 + 277 个词典项 | 1,134 | 523 | 0 |
| N1 | 3,007 个有效数据行 | 2,118 | 5 | 0 |

N1 原表另有 200 个只预填“陌生程度=9”的空白模板行，不包含日语、假名或翻译，不作为词汇。

## 文档

项目文档精简为三个互不重复的核心文件：

- [项目需求文档](docs/PRODUCT_REQUIREMENTS.md)：产品目标、业务规则、页面需求和验收标准
- [前后端技术架构](docs/APPLICATION_ARCHITECTURE.md)：前端、路由、API、数据库访问方式、开发和部署
- [数据库结构](docs/DATABASE_SCHEMA.md)：数据表、字段、索引、约束、SQL 和表关系

## 线上地址

[日本語言葉勉強](https://kotoba-bjt-notebook.daziiiiiiiiiiii.chatgpt.site)
