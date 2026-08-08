import { request } from "../request";

const IMPORT_ENDPOINT = "/api/imports";

export function createImport(filename: string, candidates: unknown[]) {
  return request<void>({
    method: "POST",
    url: IMPORT_ENDPOINT,
    data: { filename, candidates },
  });
}

export function reviewImport(id: number, decision: string) {
  return request<void>({
    method: "POST",
    url: `${IMPORT_ENDPOINT}/${id}/review`,
    data: { decision },
  });
}
