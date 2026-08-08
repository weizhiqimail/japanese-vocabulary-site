import type { NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
import { reviewImport } from "@/app/server/services/imports/importService";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    return apiSuccess(
      await reviewImport(Number((await params).id), String(body.decision)),
    );
  } catch (error) {
    return apiFailure(error);
  }
}
