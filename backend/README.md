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
- `src/shared-modules`：共享数据库模块和统一文件日志模块。
- `src/modules/knowledge-resources`：知识资源聚合模块；词汇、集合、语法、句子、标签、词性均为独立子模块，各自具有 Controller、Service、DTO 和配置。
- `src/modules`：认证、首页、学习、设置、导入及知识资源业务模块。
- `src/common`、`filters`、`helpers`、`interceptors`、`middlewares`、`pipes`、`types`：基础设施。
- `database/schema.sql`：幂等数据库基线。
- `web/`：生产构建后的前端静态资源，不提交 Git。

Swagger：`/api/docs`。

## 接口约定

- 查询一律使用 GET，增删改一律使用 POST。
- 不使用 PUT、DELETE，也不在 URL 中使用 `/:id` 路径参数。
- 详情通过查询参数传数据库 ID，例如 `/api/vocabularies?wordId=1`。
- 保存、逻辑删除和关系操作使用 `/save`、`/delete`、`/relations/save`、`/relations/delete`。

## 日志

服务日志写入仓库根目录 `logs/`，文件名为 `jvs-YYYY-MM-DD-NNN.log`。HTTP 生命周期、最终 SQL 与绑定参数、业务判断、异常和启动信息使用不同类别前缀；写文件走异步缓冲流，不在请求链路中同步写盘。密码、令牌、Cookie 与 Authorization 元数据会被脱敏。

服务启动日志包含本地访问 URL、Swagger URL 和当前日志文件路径。完整说明见 `../docs/05-开发部署与运维.md`。

## 全接口回归

`scripts/test-all-apis.mjs` 会从 Swagger 读取全部操作，并实际测试新增、编辑、关系、学习、设置、导入和逻辑删除。脚本会产生大量测试写操作，只允许对连接独立测试数据库的服务运行：

```powershell
$env:TEST_API_BASE_URL = 'http://localhost:3115'
$env:TEST_API_ISOLATED = '1'
npm run test:api
```

禁止对本地业务库或线上数据库设置 `TEST_API_ISOLATED=1`。

## 登录说明

按当前测试需求，`app_users.password` 保存明文密码并直接比对，不使用密码哈希。会话令牌本身不落库，只保存 SHA-256；这不是密码加密，仅用于避免数据库泄露后 Cookie 被直接复用。Cookie 使用 `HttpOnly`、`SameSite=Lax`，生产环境增加 `Secure`。

在任何正式或多人环境使用前，必须把密码改为 Argon2id 或 bcrypt 哈希，并增加登录限流、密码修改和会话管理。
