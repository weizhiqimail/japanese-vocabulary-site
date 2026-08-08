# 日本語言葉勉強

单用户日语知识库与学习系统，用于维护词汇、语法、句子、词汇集合以及学习复习记录。产品需求以 `docs/PRD-V2.md` 为准。

## 技术栈

- Vinext / Next.js App Router、React、TypeScript
- Bootstrap、Bootstrap Icons、SCSS
- Axios（浏览器 HTTP 客户端）
- MySQL、`mysql2`
- Prettier、TypeScript 类型检查

## 目录结构

```text
app/
  pages/                     # 页面组合与页面级样式
  components/                # 可复用组件；组件目录由 index.tsx 对外暴露
  http/                      # Axios request 与按业务划分的接口函数
  server/
    api/                     # 统一响应与请求处理
    db/                      # 数据库连接
    services/                # 服务与业务规则
    repositories/            # SQL 与数据库数据映射
  config/                    # 路由、枚举和模块配置
  layout/                    # 应用外壳
  assets/styles/             # 全局样式入口和基础样式
  types/                     # 跨模块领域类型
routes/app/                  # Vinext 路由表；仅映射 app/pages 与 app/server
  api/                       # HTTP URL 入口适配
  collections/, ...          # 页面 URL 入口适配
db/schema.sql                # 完整 MySQL 正式结构
scripts/migrate-database.mjs # 幂等结构迁移
docs/                        # PRD、数据库及应用架构说明
files/                       # 受保护的只读原始资料
```

`app` 只保存按职责划分的业务源码。Vinext 通过 `vite.config.ts` 的 `appDir: "routes"` 扫描 `routes/app`；其中页面入口只导出 `app/pages` 页面，HTTP 入口只调用 `app/server`，不承载页面实现、业务规则或 SQL。

## 前后端调用关系

```text
app/pages
  -> app/components
  -> app/http/<business>（具名 Axios 接口函数）
  -> routes/app/api/<resource>（解析 HTTP 请求的路由表适配层）
  -> app/server/services
  -> app/server/repositories
  -> MySQL（DATABASE_URL）
```

接口统一返回：

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

前端业务代码不拼接接口 URL，不直接使用 `fetch`；每项请求由 `app/http` 中的具名函数封装。服务层负责业务规则，仓储层负责 SQL 和数据映射。

## 页面路由

- `/`：首页
- `/collections`、`/collections/:id/study`、`/collections/:id/test`：集合、学习与测试
- `/vocabularies`、`/vocabularies/:id`：词库与词汇详情
- `/grammars`、`/grammars/:id`：语法与详情
- `/sentences`、`/sentences/:id`：句子与详情
- `/review/*`：复习页面
- `/manage/*`：导入、标签、词性与设置

## 本地运行

```powershell
npm install
npm run db:migrate
npm run dev
```

应用统一读取 `DATABASE_URL`。不要提交 `.env`、密码或令牌。

## 质量检查

```powershell
npx prettier app db docs scripts README.md --write
npm run typecheck
npm run build
git diff --check
```

数据库结构变化时同步维护 `db/schema.sql`、`docs/DATABASE_SCHEMA.md` 和 `docs/APPLICATION_ARCHITECTURE.md`。`files/` 禁止修改、移动或删除。
