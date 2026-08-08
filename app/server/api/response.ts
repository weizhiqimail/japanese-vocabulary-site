import { NextResponse } from "next/server";
import type { ApiResponse } from "../../http/types";

export function apiSuccess<T>(data: T, message = "操作成功") {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, message });
}

export function apiFailure(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "操作失败";
  return NextResponse.json({ success: false, data: null, message }, { status });
}
