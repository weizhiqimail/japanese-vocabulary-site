# 应用架构

## 总体结构

```text
开发环境
浏览器 → Vite React :5173 ──/api 代理──> NestJS :3000 → 本地 MySQL :3307

生产环境
浏览器 → NestJS 单服务
          ├─ /api/* → Controller / Service / TypeORM → 在线 MySQL
          └─ 其他路径 → backend/web React SPA

NestJS 请求 → HTTP 日志 → Guard / Pipe → Controller → 业务日志 → TypeORM SQL 日志
                                                └──────────────→ Exception Filter
```

前后端独立开发与构建，生产环境同域部署，不需要生产 CORS。History 页面路由由静态资源服务回退到 `index.html`；`/api` 不进入页面回退。

## 后端边界

- Controller：HTTP 参数、Swagger 描述和状态边界；GET 负责查询、POST 负责增删改，不使用 REST 路径参数。
- Service：业务规则、事务和跨实体协作。
- Entity：数据库映射，每个实体都有独立配置并由统一索引导出。
- KnowledgeResourcesModule：聚合独立的 Vocabularies、Collections、Grammars、Sentences、Tags 和 PartsOfSpeech 子模块；共享层只提供通用 CRUD、分页和关系表能力。
- SharedDatabaseModule：统一注册 TypeORM、全部实体 Repository 和 TypeORM SQL Logger。
- LoggingModule：统一控制台与异步文件日志，按 HTTP、DB、BUSINESS、EXCEPTION、STARTUP、SYSTEM 分类。
- Guard：除登录接口外，所有 API 必须具有有效会话 Cookie。
- Filter/Interceptor/Pipe：统一错误、响应和输入校验。

普通数据访问使用 TypeORM Repository 与 QueryBuilder；动态表名和字段名只来自服务端白名单。复杂数据库特性如必须使用 SQL，应限制在 Repository/Service 内并绑定参数。

所有映射实体和字段都使用 TypeORM `comment` 描述用途，开启 schema 生成或迁移时可将说明写入 MySQL。项目仍以 `database/schema.sql` 为数据库结构基线，不在应用启动时自动同步结构。

## 前端边界

- React Router 负责页面路由和登录前置拦截。
- AuthContext 只保存当前用户，不读取 HttpOnly 会话 Cookie。
- Axios 统一调用相对 `/api`，遇到 401 返回登录页。
- 顶部横向导航作为桌面端主入口，顺序为首页、集合、词库、语法、句子、复习、管理；管理模块具有独立二级导航。
- 每条路由由 `pages/<page>/index.tsx` 暴露一个独立页面级组件；词汇、语法、句子三个详情页相互独立。
- 页面只能调用 `http/api` 中的接口方法，不直接定义 URL、method 或 Axios 请求。
- Chakra UI 和 Less 变量统一维护橙黄色主题；桌面列表使用表格，移动端切换为只展示信息的卡片。
- 通用知识编辑器负责新增/编辑词汇、语法、句子，多选筛选和关系字段；关联管理在独立弹窗中完成。
