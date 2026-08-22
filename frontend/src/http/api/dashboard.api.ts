import { request } from "@/http/request";

export interface DashboardStatistics {
  collections: number;
  grammars: number;
  sentences: number;
  vocabularies: number;
}

export function getDashboardStatistics() {
  return request<DashboardStatistics>({ url: "/dashboard" });
}
