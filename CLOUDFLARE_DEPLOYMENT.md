# Cloudflare Workers 部署说明

本文说明「日本語言葉勉強」部署到 Cloudflare Workers 的架构、配置、首次发布、后续更新、Secret 管理、域名配置、回滚和故障排查。

## 1. 部署架构

生产请求链路如下：

```text
浏览器
  -> Cloudflare 边缘网络
  -> Cloudflare Worker
  -> Vinext App Router / React Server Components
  -> routes/app/api HTTP 路由适配层
  -> app/server 服务与仓储
  -> MySQL（DATABASE_URL）
```

静态资源链路如下：

```text
浏览器
  -> Cloudflare Assets binding
  -> dist/client 中的 JavaScript、CSS、字体和构建清单
```

项目使用的服务：

- **Cloudflare Workers**：运行 Vinext 生成的服务端应用、页面渲染和 REST API。
- **Cloudflare Workers Assets**：分发 `dist/client` 静态资源。
- **Cloudflare Images binding**：为 Vinext 图片优化入口提供转换能力。当前项目图片较少，但自动生成的 Worker 入口已保留该能力。
- **外部 MySQL**：保存词汇、集合、语法、句子、关系、学习记录和设置。Cloudflare 不保存这些业务数据。
- **Cloudflare Worker Secret**：加密保存 `DATABASE_URL`，不会写入 Git、`wrangler.jsonc` 或客户端包。
- **Vinext**：将 Next.js App Router / React Server Components 编译为 Vite 和 Cloudflare Workers 可运行产物。
- **Wrangler**：登录 Cloudflare、上传静态资源、发布 Worker、管理 Secret 和回滚版本。

## 2. 关键文件

### `vite.config.ts`

主要插件：

```ts
vinext({ appDir: "routes" });
cloudflare({
  viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
});
```

`appDir: "routes"` 表示 Vinext 从 `routes/app` 读取路由表。页面实现仍在 `app/pages`，后端实现仍在 `app/server`。

Cloudflare 插件负责创建 Workers 构建环境，并把 RSC、SSR 和客户端产物组合成 Worker 包。

### `wrangler.jsonc`

包含：

- Worker 名称：`japanese-vocabulary-site`
- Worker 入口：`worker/index.ts`
- Node.js 兼容标记：`nodejs_compat`
- 静态资源目录：`dist/client`
- `ASSETS` 与 `IMAGES` binding

不要把 `DATABASE_URL` 或其他密码写入该文件。

### `worker/index.ts`

这是 Cloudflare Worker 入口：

1. `/_vinext/image` 请求交给图片优化处理器。
2. 其他请求交给 Vinext App Router handler。
3. `env` 与执行上下文传递给 Vinext。

### `app/server/db/client.ts`

数据库连接采用按仓储调用初始化。Worker 模块加载时不会立即连接数据库；只有 API 或服务实际执行 SQL 时才读取 `DATABASE_URL` 并创建单一 MySQL Connection。查询完成后会关闭连接；事务在单次事务回调内持有连接，并在提交或回滚后关闭。

这样既能通过 Cloudflare 的 Worker 启动校验，也不会在不同 Worker 请求之间复用 MySQL I/O 对象。Cloudflare Workers 禁止跨请求访问上一次请求创建的 Socket 或 Stream。

## 3. 首次部署

### 3.1 安装依赖

```powershell
npm install
```

### 3.2 登录 Cloudflare

```powershell
npx wrangler login
```

浏览器会打开 Cloudflare OAuth 页面。完成授权后检查：

```powershell
npx wrangler whoami
```

### 3.3 注册 workers.dev 子域

第一次使用 Workers 的 Cloudflare 账户必须注册一个账户级 `workers.dev` 子域：

1. 打开 Cloudflare Dashboard 的 Workers onboarding 页面。
2. 选择一个账户级子域，例如 `your-account-name.workers.dev`。
3. 此名称属于整个 Cloudflare 账户，并非只属于本项目。

注册链接：

```text
https://dash.cloudflare.com/<ACCOUNT_ID>/workers/onboarding
```

如果不使用 `workers.dev`，也可以在 `wrangler.jsonc` 配置已有 Cloudflare 域名的 route。

### 3.4 配置数据库 Secret

推荐交互式写入：

```powershell
npx wrangler secret put DATABASE_URL --name japanese-vocabulary-site
```

然后粘贴完整 MySQL 连接字符串。Secret 会加密保存在 Cloudflare，不会显示在配置文件中。

检查 Secret 名称：

```powershell
npx wrangler secret list --name japanese-vocabulary-site
```

该命令只显示 Secret 名称，不显示值。

### 3.5 验证并部署

```powershell
npx prettier app routes worker vite.config.ts wrangler.jsonc --write
npm run typecheck
npm run build
npx vinext deploy
```

成功后 Wrangler 会输出类似地址：

```text
https://japanese-vocabulary-site.<account-subdomain>.workers.dev
```

## 4. 后续发布

代码修改完成后执行：

```powershell
npm run typecheck
npm run build
npx vinext deploy
```

不需要每次重新写入 `DATABASE_URL`。Worker Secret 会一直保留，除非主动删除、修改 Worker 名称或切换 Cloudflare 账户。

部署不会自动执行数据库迁移，也不会清理数据库数据。数据库结构变化应先审查 `db/schema.sql` 和迁移脚本，再明确决定是否执行：

```powershell
npm run db:migrate
```

## 5. 修改数据库连接

数据库地址、账号或密码变化时重新写入 Secret：

```powershell
npx wrangler secret put DATABASE_URL --name japanese-vocabulary-site
```

随后重新部署或重新触发一次 Worker 版本发布。

删除 Secret：

```powershell
npx wrangler secret delete DATABASE_URL --name japanese-vocabulary-site
```

删除后所有访问数据库的页面和 API 都会失败，因此不要在没有替代连接时执行。

## 6. 自定义域名

有两种公开访问方式。

### workers.dev

适合快速发布和测试。注册地址由 Cloudflare 自动提供：

```text
https://japanese-vocabulary-site.<account-subdomain>.workers.dev
```

### 自定义域名

域名必须已接入同一个 Cloudflare 账户。可以在 Dashboard 的 Worker 设置中添加 Custom Domain，也可以在 `wrangler.jsonc` 中配置 route。

示意配置：

```jsonc
{
  "routes": [
    {
      "pattern": "japanese.example.com/*",
      "zone_name": "example.com",
    },
  ],
}
```

调整后重新执行：

```powershell
npx vinext deploy
```

不要在未确认 DNS 区域和现有生产流量时随意修改 route。

## 7. 数据库网络注意事项

MySQL 必须允许 Cloudflare Worker 通过公网或受支持的网络服务连接，并应满足：

- 使用 TLS 加密数据库连接。
- 数据库防火墙允许 Cloudflare 出站连接。
- 账号权限限制为本应用需要的数据库和操作。
- 不使用 MySQL root 账号。
- 控制连接池规模，避免边缘实例大量并发连接。

当前没有在 Worker 实例中维护全局连接池，因为 Pool 可能在不同 Worker 请求之间保留 Socket、Stream 或定时器，违反 Cloudflare 请求隔离限制。若生产环境连接频率或延迟过高，建议改用 Cloudflare Hyperdrive。Hyperdrive 可以在 Cloudflare 基础设施层安全复用数据库连接、减少跨区域连接延迟，但需要单独创建 binding 并调整数据库客户端连接方式。

数据库客户端同时启用了 `mysql2` 的 `disableEval` 和 `jsonStrings`。Cloudflare Workers 禁止运行时通过字符串生成代码；前者强制使用静态行解析器，后者让 JSON 字段先以字符串返回、再由仓储层显式解析。删除这些配置会导致部分 API 返回 `Code generation from strings disallowed for this context`。

## 8. 查看部署与日志

查看部署历史：

```powershell
npx wrangler deployments list --name japanese-vocabulary-site
```

查看版本：

```powershell
npx wrangler versions list --name japanese-vocabulary-site
```

实时日志：

```powershell
npx wrangler tail japanese-vocabulary-site
```

建议重点检查：

- Worker 启动异常
- `DATABASE_URL 未配置`
- MySQL 连接超时或 TLS 错误
- API 500 响应
- 静态资源 404

## 9. 回滚

先查看可用部署：

```powershell
npx wrangler deployments list --name japanese-vocabulary-site
```

然后使用 Cloudflare Dashboard 选择历史版本回滚，或根据 Wrangler 当前版本支持的参数执行：

```powershell
npx wrangler rollback --name japanese-vocabulary-site
```

回滚 Worker 代码不会回滚 MySQL 数据库。涉及数据库结构变化时，必须单独评估结构兼容性。

## 10. 常见故障

### `Missing @cloudflare/vite-plugin`

确认已经安装：

```powershell
npm install --save-dev @cloudflare/vite-plugin
```

并确认 `vite.config.ts` 同时包含 `vinext()` 和 `cloudflare()`。

### `DATABASE_URL 未配置`

检查 Secret：

```powershell
npx wrangler secret list --name japanese-vocabulary-site
```

如果不存在，重新执行 `wrangler secret put`。

### 无 workers.dev 地址

说明账户尚未注册 workers.dev 子域，或者 `workers_dev` 被关闭。进入 Cloudflare Workers onboarding 注册账户子域，或配置自定义域名 route。

### 页面能打开但 API 失败

通常是数据库网络或 Secret 问题。执行：

```powershell
npx wrangler tail japanese-vocabulary-site
```

然后访问对应 `/api/...` 地址观察实时日志。

### 静态资源 404

确认 `wrangler.jsonc` 的 assets directory 为 `dist/client`，重新运行完整的 `vinext deploy`，不要只上传 Worker 脚本。

## 11. 安全规则

- 不提交 `.env`。
- 不把 `DATABASE_URL` 写入 Markdown、源码、`wrangler.jsonc` 或 Git。
- 不在终端日志中打印完整数据库连接字符串。
- 定期轮换数据库密码并重新更新 Worker Secret。
- Cloudflare OAuth 授权只授予需要维护部署的账号。
- 发布前始终运行类型检查和生产构建。
- 发布动作不会授权清理、删除或迁移数据库数据。

## 12. 当前项目标识

```text
Worker name: japanese-vocabulary-site
Router source: routes/app
Application source: app
Static assets: dist/client
Worker entry: worker/index.ts
Database secret: DATABASE_URL
```
