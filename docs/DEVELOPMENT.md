# 开发与协作

## 环境

- Node.js 22.13+
- npm
- 可访问的 MySQL 8 实例

克隆后执行：

```powershell
npm install
Copy-Item .env.example .env
```

在 `.env` 中设置 `DATABASE_URL`。随后运行：

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

## 质量检查

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext build
npm test
```

由于当前 `package.json` 中脚本采用 Unix 环境变量写法，Windows PowerShell 推荐直接使用上面的 `npx vinext` 命令。

## Git 工作流

- 默认分支：`main`
- 修改前检查 `git status`
- 一个提交表达一个明确变更
- 构建通过后提交并推送到 `origin/main`
- 禁止提交 `.env`、数据库导出中的密钥和个人访问令牌
- 禁止未经确认强制推送或重写共享历史

## 文档同步

需求变化时同步 README、相关 `docs/` 和数据库中的项目文档。数据库变化还必须同步字段说明、SQL 结构、表用途和表关系。

