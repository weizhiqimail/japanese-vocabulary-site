# 应用架构

## 技术栈

- Vinext / React / TypeScript
- Bootstrap、Bootstrap Icons、SCSS
- Axios HTTP 客户端
- MySQL（`mysql2` 连接池）

## 目录边界

- `app/pages/`：页面模块；真实 `app/**/page.tsx` 只负责路由参数和页面映射。
- `app/components/`：独立 UI 组件；组件目录通过 `index.tsx` 暴露，并在 `types/` 保存 Props。
- `app/layout/`：应用壳、导航和公共布局。
- `app/http/`：Axios `request`、统一响应类型和按资源划分的前端接口。
- `app/config/`：路由、资源、枚举、分页选项和 UI 配置。
- `app/assets/styles/`：Bootstrap 入口和全局基础样式；组件专属样式与组件同目录。
- `app/server/api/`：统一成功/失败响应和控制器。
- `app/server/db/`：数据库连接池和事务。
- `app/server/repositories/`：SQL 和数据映射。
- `app/server/services/`：导入、关联创建等业务规则。

## 路由与 API

所有页面使用真实目录路由，不再使用页面内路径判断或万能 History 路由。资源 REST API 使用独立 URL，例如：

- `/api/vocabularies`、`/api/vocabularies/[id]`
- `/api/grammars`、`/api/grammars/[id]`
- `/api/sentences`、`/api/sentences/[id]`
- `/api/collections`、`/api/tags`、`/api/parts-of-speech`
- `/api/settings`、`/api/imports`、`/api/test-answers`
- `/api/vocabularies/[id]/grammars`、`/api/vocabularies/[id]/sentences`

接口统一返回 `{ success, data, message }`。查询参数统一使用 `pageNum`、`pageSize`、`q`；删除采用逻辑删除。前端不直接使用 `fetch`，全部请求经 `app/http/request.ts` 的 Axios 实例发出。

## 数据与交互

词汇写入同时维护词性、标签和集合关系；语法与句子写入维护标签。详情内造句在事务中创建句子及知识关系。列表默认分页由设置表中的 `pagination_defaults` 按模块读取，未配置时为 20。

所有新增和编辑使用 85% 可视区域的 Bootstrap 模态框；删除使用小型确认模态框。桌面详情为左右布局，手机端依次显示基本信息、分类、关联和维护信息。
