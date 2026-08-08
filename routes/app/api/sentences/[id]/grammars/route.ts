import type { NextRequest } from "next/server";
import { db } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sentenceId = Number((await params).id);
    const { grammarId } = await request.json();
    await db.execute(
      "INSERT IGNORE INTO grammar_sentences(grammar_id,sentence_id) VALUES(?,?)",
      [Number(grammarId), sentenceId],
    );
    return apiSuccess({ sentenceId, grammarId });
  } catch (error) {
    return apiFailure(error);
  }
}
