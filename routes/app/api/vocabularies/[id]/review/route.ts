import type { NextRequest } from "next/server";
import { db } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    await db.execute(
      "UPDATE vocabularies SET review_count=review_count+1,last_reviewed_at=NOW(3) WHERE id=? AND deleted_at IS NULL",
      [id],
    );
    await db.execute(
      "INSERT INTO study_events(entity_type,entity_id,event_type) VALUES('vocabulary',?,'review')",
      [id],
    );
    return apiSuccess({ id });
  } catch (error) {
    return apiFailure(error);
  }
}
