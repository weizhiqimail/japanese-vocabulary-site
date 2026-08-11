# 构建与部署

## Node.js 单服务

```bash
npm ci
npm run install:all
npm run build
npm run start
```

生产环境在 `backend/.env.production` 或平台 Secret 中配置数据库，不提交该文件。旧项目的 `DATABASE_URL` 可直接沿用；生产模式不会读取本地 `.env.local`。部署产物至少需要：

- `backend/dist`
- `backend/web`
- `backend/node_modules`
- `backend/package.json`

首次发布或数据库结构变化时，应在人工确认生产配置后单独执行生产迁移；该步骤不会绑定到普通构建或启动命令：

```powershell
$env:NODE_ENV = "production"
npm run db:migrate --prefix backend
```

NestJS 同时提供 `/api/*` 和前端静态资源。反向代理需要把所有路径转发到 NestJS，不能只转发 `/api`，否则 React History 路由刷新会返回 404。

## Cloudflare

当前 NestJS + TypeORM + MySQL 架构的标准发布目标是长驻 Node.js 服务。Cloudflare 可以用于 DNS、CDN、WAF、Access 或 Tunnel。如果未来要求直接运行在 Workers，需要单独验证 NestJS、TypeORM、mysql2 和所有中间件的 Workers 兼容性，并优先考虑拆出 Workers 原生 API 适配层；不能把当前 Node 构建未经验证直接当作 Worker 部署。
