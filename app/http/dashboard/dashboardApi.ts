import { request } from "../request";

export interface DashboardStats {
  vocabularies: number;
  collections: number;
  learned: number;
  errors: number;
}

const DASHBOARD_ENDPOINT = "/api/dashboard";
export function getDashboardStats() {
  return request<DashboardStats>({ method: "GET", url: DASHBOARD_ENDPOINT });
}
