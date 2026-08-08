import type { NextRequest } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { rows } from "@/app/server/db";
import { apiFailure, apiSuccess } from "@/app/server/api/response";
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    const data = await rows<RowDataPacket[]>(
      "SELECT v.* FROM vocabularies v JOIN collection_vocabularies cv ON cv.vocabulary_id=v.id WHERE cv.collection_id=? AND v.deleted_at IS NULL ORDER BY cv.sort_order,v.id",
      [id],
    );
    return apiSuccess(data);
  } catch (error) {
    return apiFailure(error);
  }
}
