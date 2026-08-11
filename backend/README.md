# Backend

NestJS API 服务，使用 TypeORM QueryBuilder/Repository 访问 MySQL，默认监听 `3000` 端口并统一使用 `/api` 前缀。

## 命令

```bash
npm run start:dev:local
npm run build
npm run start:prod
npm run db:migrate
```

环境分离：

- 本地：`.env.local`
- 生产：`.env.production`
- 示例：`.env.example`

`.env*` 默认不进入 Git。生产环境兼容旧项目的 `DATABASE_URL`，本地环境使用拆分的 `DB_HOST`、`DB_PORT` 等变量；生产启动不会回退加载 `.env.local`。

## 模块

- `src/entities`：每个实体独立目录，包含 `*.entity.ts` 与 `*.config.ts`，由 `index.ts` 统一导出。
- `src/shared-modules`：共享数据库模块。
- `src/modules`：认证、资源、首页、学习、设置和导入业务模块。
- `src/common`、`filters`、`helpers`、`interceptors`、`middlewares`、`pipes`、`types`：基础设施。
- `database/schema.sql`：幂等数据库基线。
- `web/`：生产构建后的前端静态资源，不提交 Git。

Swagger：`/api/docs`。

## 登录说明

按当前测试需求，`app_users.password` 暂时保存明文密码。会话令牌本身不落库，只保存 SHA-256；Cookie 使用 `HttpOnly`、`SameSite=Lax`，生产环境增加 `Secure`。

在任何正式或多人环境使用前，必须把密码改为 Argon2id 或 bcrypt 哈希，并增加登录限流、密码修改和会话管理。
