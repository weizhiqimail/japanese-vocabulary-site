import { request } from "@/http/request";
import type { User } from "@/types/api.types";

export function getCurrentUser() {
  return request<User>({ url: "/auth/me" });
}

export function login(username: string, password: string) {
  return request<User>({
    method: "POST",
    url: "/auth/login",
    data: { username, password },
  });
}

export function logout() {
  return request<{ ok: boolean }>({ method: "POST", url: "/auth/logout" });
}
