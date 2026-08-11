# Frontend

使用 React、TypeScript、Vite、React Router 和 Chakra UI 的单页应用。

## 命令

```bash
npm run dev
npm run typecheck
npm run build
```

开发服务器默认监听 `5173`，并把 `/api` 代理到本地 NestJS `3000` 端口。生产构建输出为 `dist/`，根目录构建脚本会将其复制到 `backend/web/`。

## 结构

- `components/`：共享组件。
- `config/`：主题、资源和导航配置。
- `contexts/`：登录状态。
- `http/api/`：每个后端接口的单一封装方法；页面不得直接组装 URL 和 method。
- `layout/`：PC/手机共用的响应式应用壳，导航使用 Chakra Breadcrumb。
- `pages/`：每条路由一个独立目录、`index.tsx` 和页面级组件。
- `components/`：跨页面复用的编辑弹窗、关联弹窗、多选筛选、Loading 和词汇显示规则。
- `routes/`：页面路由和登录拦截。

列表的 `pageNum`、`pageSize` 和 `q` 与 URL 同步。桌面端使用表格，手机端使用流式卡片；通知桌面位于右上角、手机位于顶部并在 2 秒后消失。

顶部主导航固定为：首页、集合、词库、语法、句子、复习、管理。Logo 和标题位于左侧，登录用户与退出按钮位于最右侧；管理页内部显示标签、词性和设置子导航。

主题由 `src/config/theme.ts` 的 Chakra 调色板和 `src/styles/theme.less` 的 Less 变量共同维护，当前为橙黄色。所有表单使用左标签、右控件的 inline 布局。
