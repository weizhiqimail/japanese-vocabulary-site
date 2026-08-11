# 应用架构

## 总体结构

```text
开发环境
浏览器 → Vite React :5173 ──/api 代理──> NestJS :3000 → 本地 MySQL :3307

生产环境
浏览器 → NestJS 单服务
          ├─ /api/* → Controller / Service / TypeORM → 在线 MySQL
          └─ 其他路径 → backend/web React SPA
```

前后端独立开发与构建，生产环境同域部署，不需要生产 CORS。History 页面路由由静态资源服务回退到 `index.html`；`/api` 不进入页面回退。

## 后端边界

- Controller：HTTP 参数、Swagger 描述和状态边界。
- Service：业务规则、事务和跨实体协作。
- Entity：数据库映射，每个实体都有独立配置并由统一索引导出。
- SharedDatabaseModule：统一注册 TypeORM 和全部实体 Repository。
- Guard：除登录接口外，所有 API 必须具有有效会话 Cookie。
- Filter/Interceptor/Pipe：统一错误、响应和输入校验。

普通数据访问使用 TypeORM Repository 与 QueryBuilder；动态表名和字段名只来自服务端白名单。复杂数据库特性如必须使用 SQL，应限制在 Repository/Service 内并绑定参数。

## 前端边界

- React Router 负责页面路由和登录前置拦截。
- AuthContext 只保存当前用户，不读取 HttpOnly 会话 Cookie。
- Axios 统一调用相对 `/api`，遇到 401 返回登录页。
- ResourcePage 通过服务端白名单资源配置复用列表、搜索、分页和维护交互。
- Chakra UI 主题统一使用浅蓝品牌色，PC 和手机采用不同的信息密度。
