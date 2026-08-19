# 日本語言葉勉強

个人日语知识库与学习系统。项目沿用原仓库 Git 历史，技术架构改为 Vite React SPA + NestJS API，同仓库开发、单服务生产部署。

## 目录

- `frontend/`：React、TypeScript、Vite、Chakra UI。
- `backend/`：NestJS、TypeORM、MySQL、Swagger、登录认证和静态资源服务。
- `docs/`：产品、数据库、架构、部署与数据同步说明。
- `logs/`：运行时文件日志，按启动序号命名且不提交 Git。

## 本地开发

1. 确认 `backend/.env.local` 中的本地数据库连接。
2. 执行 `npm run install:all`。
3. 执行 `npm run db:migrate`，数据库不可用时可暂时跳过。
4. 执行 `npm run dev`。

前端访问 `http://localhost:5173`，Vite 将 `/api` 代理到 `http://localhost:3000`。Swagger 位于 `http://localhost:3000/api/docs`。

初始管理员通过环境变量创建。开发环境默认用户名和密码均为 `admin`，仅用于本地测试。

## 构建与运行

```bash
npm run build
npm run start
```

构建会先生成前端产物，再复制到 `backend/web`，最后构建 NestJS。生产环境只运行一个后端服务；`/api/*` 由 NestJS 处理，其他路径由 React SPA 处理。

服务启动后会在控制台和根目录 `logs/jvs-YYYY-MM-DD-NNN.log` 中记录页面 URL 与 Swagger URL。日志分为 HTTP、DB、BUSINESS、EXCEPTION、STARTUP 和 SYSTEM，详细约定见 `docs/05-开发部署与运维.md`。

## 数据库同步

本地全量覆盖线上数据库属于破坏性操作，不会随构建或部署自动执行。详见 `docs/05-开发部署与运维.md`。
