# AGENTS.md

## 项目定位

「日本語言葉勉強」是单用户个人日语知识库与学习系统。产品需求唯一基线为 `docs/PRD-V2.md`；页面与代码中不使用 V1、V2 等版本命名。

## 长期规则

1. 所有代码、脚本和文档只放在本仓库内；`files/` 是受保护的原始资料目录，不修改、移动或删除。
2. 数据库统一读取 `DATABASE_URL`。禁止提交 `.env`、密码或令牌。
3. 数据库采用 `db/schema.sql` 定义的正式表名，不增加版本前缀，不读取、迁移或兼容历史业务表。
4. 正式对象采用逻辑删除；外键关系只使用数据库 ID。
5. 词性、集合类型、关系类型等固定值由统一枚举或常量维护，禁止散落魔法字符串。
6. 所有列表查询的 `pageNum`、`pageSize`、`q` 与 URL、页面和接口同步；允许的每页数量为 10、20、30、50、100。
7. 桌面端列表可使用表格或横向行，手机端必须切换为流式卡片，不使用横向滚动表格。
8. UI 使用 Bootstrap、Bootstrap Icons 与 SCSS；主题色通过全局变量配置，默认浅蓝色。
9. 收藏通知桌面端位于右上角，手机端顶部居中，2 秒消失且可堆叠；单次操作只产生一条通知。
10. 每次数据库变更同步维护字段注释、`docs/DATABASE_SCHEMA.md` 和 `docs/APPLICATION_ARCHITECTURE.md`。
11. 未经用户明确要求，不提交 commit、不推送、不部署。
12. 修改后至少运行 `npm run typecheck` 与 `npm run build`；数据库结构变更按需执行 `npm run db:migrate`。

## 目录

- `app/`：页面、组件、API 与数据库访问。
- `db/schema.sql`：完整 MySQL 结构和基础枚举数据。
- `scripts/migrate-database.mjs`：幂等初始化正式数据表。
- `docs/PRD-V2.md`：产品需求基线（保留既定文件名）。
- `docs/DATABASE_SCHEMA.md`：数据库说明。
- `docs/APPLICATION_ARCHITECTURE.md`：应用架构说明。
- `files/`：只读原始资料。

## 本地开发

```cmd
cd /d D:\program\japanese-vocabulary-site
npm install
npm run db:migrate
npm run dev
```

访问 `http://localhost:3000/`。History 子路由由应用的可选捕获路由承接，直接刷新详情页或二级页面不会返回 404。
