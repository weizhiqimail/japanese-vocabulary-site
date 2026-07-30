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

## 文档

- [系统架构](docs/ARCHITECTURE.md)
- [数据库设计](docs/DATABASE.md)
- [开发与协作](docs/DEVELOPMENT.md)
- [部署说明](docs/DEPLOYMENT.md)

## 线上地址

[日本語言葉勉強](https://kotoba-bjt-notebook.daziiiiiiiiiiii.chatgpt.site)
