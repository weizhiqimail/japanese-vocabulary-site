import { NextResponse } from "next/server";
import { getDb, getUserKey } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "BJT";
  const status = url.searchParams.get("status");
  const db = await getDb();
  const clauses = ["p.user_key = ?", "v.category = ?"];
  const params: unknown[] = [getUserKey(request), category];
  if (status === "mastered" || status === "error") {
    clauses.push("p.status = ?");
    params.push(status);
  }
  const [rows] = await db.query(
    `SELECT v.id, v.category, v.word, v.reading, v.meaning,
            v.part_of_speech AS partOfSpeech, v.familiarity, p.status
     FROM learning_progress p
     JOIN vocabulary v ON v.id = p.vocabulary_id
     WHERE ${clauses.join(" AND ")}
     ORDER BY p.updated_at DESC`,
    params,
  );
  await db.end();
  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const body = await request.json();
  const results = Array.isArray(body.results) ? body.results : [];
  if (!results.length) return NextResponse.json({ ok: true });
  const db = await getDb();
  const userKey = getUserKey(request);
  const values = results.flatMap((result: {
    vocabularyId: number;
    status: "mastered" | "error";
    correct: number;
    wrong: number;
  }) => [userKey, result.vocabularyId, result.status, result.correct, result.wrong]);
  const placeholders = results.map(() => "(?,?,?,?,?)").join(",");
  await db.execute(
    `INSERT INTO learning_progress
      (user_key, vocabulary_id, status, correct_count, wrong_count)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      correct_count = correct_count + VALUES(correct_count),
      wrong_count = wrong_count + VALUES(wrong_count)`,
    values,
  );
  await db.end();
  return NextResponse.json({ ok: true });
}
