import type { NextRequest } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { transaction } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vocabularyId = Number(body.vocabularyId);
    if (!body.correct)
      await transaction(async (connection) => {
        const [defaults] = await connection.query<RowDataPacket[]>(
          "SELECT id FROM collections WHERE type='error' AND is_default=1 AND deleted_at IS NULL LIMIT 1",
        );
        const collectionId = Number(defaults[0]?.id || 0);
        if (collectionId)
          await connection.execute(
            "INSERT INTO collection_vocabularies(collection_id,vocabulary_id,first_error_at,last_error_at,error_count) VALUES(?,?,NOW(3),NOW(3),1) ON DUPLICATE KEY UPDATE last_error_at=NOW(3),error_count=error_count+1",
            [collectionId, vocabularyId],
          );
      });
    return apiSuccess({ vocabularyId });
  } catch (error) {
    return apiFailure(error);
  }
}
