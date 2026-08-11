import axios from "axios";
import type { ApiResponse } from "@/types/api.types";
export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login")
      window.location.assign(
        `/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    return Promise.reject(error);
  },
);
export async function request<T>(config: Parameters<typeof http.request>[0]) {
  const response = await http.request<ApiResponse<T>>(config);
  return response.data.data;
}
