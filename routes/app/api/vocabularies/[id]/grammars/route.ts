import type { NextRequest } from "next/server";
import { db } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const vocabularyId = Number((await params).id);
    const { grammarId } = await request.json();
    await db.execute(
      "INSERT IGNORE INTO vocabulary_grammars(vocabulary_id,grammar_id) VALUES(?,?)",
      [vocabularyId, Number(grammarId)],
    );
    return apiSuccess({ vocabularyId, grammarId });
  } catch (error) {
    return apiFailure(error);
  }
}
