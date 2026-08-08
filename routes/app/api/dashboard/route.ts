import type { RowDataPacket } from "mysql2/promise";
import { rows } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function GET() {
  try {
    const data = await rows<RowDataPacket[]>(
      "SELECT (SELECT COUNT(*) FROM vocabularies WHERE deleted_at IS NULL) vocabularies,(SELECT COUNT(*) FROM collections WHERE deleted_at IS NULL) collections,(SELECT COUNT(*) FROM vocabularies WHERE learned_at IS NOT NULL AND deleted_at IS NULL) learned,(SELECT COUNT(*) FROM vocabularies WHERE error_count>0 AND deleted_at IS NULL) errors",
    );
    return apiSuccess(data[0]);
  } catch (error) {
    return apiFailure(error);
  }
}
