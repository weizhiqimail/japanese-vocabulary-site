import type { NextRequest } from "next/server";
import { listResource } from "@/app/server/api/resourceController";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
import { createImportBatch } from "@/app/server/services/imports/importService";
export const GET = (request: NextRequest) => listResource(request, "imports");
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return apiSuccess(
      await createImportBatch(
        String(body.filename || ""),
        Array.isArray(body.candidates) ? body.candidates : [],
      ),
    );
  } catch (error) {
    return apiFailure(error);
  }
}
