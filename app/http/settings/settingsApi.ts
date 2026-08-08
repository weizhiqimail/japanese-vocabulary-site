import { request } from "../request";

const SETTINGS_ENDPOINT = "/api/settings";

export function getSettings<T>() {
  return request<T>({ method: "GET", url: SETTINGS_ENDPOINT });
}

export function updateSetting(key: string, value: unknown) {
  return request<void>({
    method: "PUT",
    url: SETTINGS_ENDPOINT,
    data: { key, value },
  });
}
