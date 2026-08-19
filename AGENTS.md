# AGENTS.md

## 项目定位

「日本語言葉勉強」是单用户个人日语知识库与学习系统。产品基线为 `docs/01-产品需求文档.md`。

## 长期规则

1. 正式结构为 `frontend/`、`backend/`、`docs/` 三个平级目录。
2. 本地数据库使用 `backend/.env.local`，生产使用 `.env.production`；禁止提交任何 `.env`、密码或令牌。
3. 数据访问优先使用 TypeORM Repository/QueryBuilder，动态表名和字段名必须来自服务端白名单。
4. 数据库 `synchronize` 必须保持关闭；变更同步维护两个 schema 文件和数据库/架构文档。
5. 正式业务对象使用逻辑删除，关系只使用数据库 ID。
6. 页面与 API 使用 `pageNum`、`pageSize`、`q`，允许每页 10、20、30、50、100。
7. 桌面列表使用表格，手机切换为卡片，不使用横向滚动表格。
8. UI 使用 Chakra UI 和浅蓝主题；通知 2 秒消失，桌面右上、手机顶部。
9. 开发时 Vite 代理 `/api` 到 NestJS；生产时前端产物复制到 `backend/web`，由 NestJS 单服务提供。
10. 数据库全量同步是显式高风险操作，不得加入构建、启动或自动部署流程。
11. 未经明确要求，不提交、推送或部署。
12. 修改后至少运行前后端 build 和根目录 build。
