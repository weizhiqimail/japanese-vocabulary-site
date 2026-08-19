import axios from "axios";
import type { ApiResponse } from "@/types/api.types";

// 开发环境由 Vite 代理 /api，生产环境则由同一个 Nest 服务直接处理。
export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/account/login"
    ) {
      window.location.assign(
        `/account/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    }

    return Promise.reject(error);
  },
);

/** 解包后端统一响应结构，让页面直接获得业务数据。 */
export async function request<T>(config: Parameters<typeof http.request>[0]) {
  const response = await http.request<ApiResponse<T>>(config);

  return response.data.data;
}
