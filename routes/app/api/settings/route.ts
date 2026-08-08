import type { NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
import {
  getSettings,
  saveSetting,
} from "@/app/server/repositories/settings/settingsRepository";
export async function GET() {
  try {
    return apiSuccess(await getSettings());
  } catch (error) {
    return apiFailure(error);
  }
}
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return apiSuccess(await saveSetting(String(body.key), body.value));
  } catch (error) {
    return apiFailure(error);
  }
}
