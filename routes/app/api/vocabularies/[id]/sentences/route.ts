import type { NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
import { createRelatedSentence } from "@/app/server/services/sentences/createRelatedSentence";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return apiSuccess(
      await createRelatedSentence(
        "vocabulary_sentences",
        "vocabulary_id",
        Number((await params).id),
        await request.json(),
      ),
    );
  } catch (error) {
    return apiFailure(error);
  }
}
