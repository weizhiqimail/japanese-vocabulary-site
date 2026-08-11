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
- `http/`：Axios 实例和统一响应处理。
- `layouts/`：PC/手机共用的响应式应用壳。
- `pages/`：登录、首页、资源列表、详情、学习、复习与设置页面。
- `routes/`：页面路由和登录拦截。

列表的 `pageNum`、`pageSize` 和 `q` 与 URL 同步。桌面端使用表格，手机端使用流式卡片；通知桌面位于右上角、手机位于顶部并在 2 秒后消失。
