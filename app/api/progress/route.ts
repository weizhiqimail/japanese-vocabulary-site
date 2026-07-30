import { NextResponse } from "next/server";
import { getDb, getUserKey } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = Number(url.searchParams.get("categoryId"));
  const status = url.searchParams.get("status");
  const db = await getDb();
  if (!Number.isInteger(categoryId) || categoryId < 0) {
    return NextResponse.json({ error: "无效类别 ID" }, { status: 400 });
  }
  const clauses = ["p.user_key = ?"];
  const params: unknown[] = [getUserKey(request)];
  if (categoryId > 0) {
    clauses.push("c.id = ?");
    params.push(categoryId);
  }
  if (status === "mastered" || status === "error") {
    clauses.push("p.status = ?");
    params.push(status);
  }
  const [rows] = await db.query(
    `SELECT v.id, v.word, v.reading, v.meaning,
            v.part_of_speech AS partOfSpeech, v.familiarity, p.status
     FROM learning_progress p
     JOIN vocabulary v ON v.id = p.vocabulary_id
     JOIN vocabulary_category_links vcl ON vcl.vocabulary_id = v.id
     JOIN categories c ON c.id = vcl.category_id
     WHERE ${clauses.join(" AND ")}
     GROUP BY v.id, v.word, v.reading, v.meaning, v.part_of_speech, v.familiarity, p.status, p.updated_at
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
