import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  // 路由表与业务源码分离：routes/app 只保留 Vinext App Router 入口，
  // 页面、组件、HTTP 客户端和后端实现全部位于 app 下的职责目录。
  plugins: [vinext({ appDir: "routes" })],
  ssr: {
    external: ["mysql2"],
  },
});
