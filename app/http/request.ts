import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiErrorResponse, ApiResponse } from "./types";

const HTTP_CLIENT = axios.create({
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

HTTP_CLIENT.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) =>
    Promise.reject(
      new Error(error.response?.data.message || error.message || "请求失败"),
    ),
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await HTTP_CLIENT.request<ApiResponse<T>>(config);
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
}
