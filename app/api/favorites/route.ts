import { NextResponse } from "next/server";
import { getDb, getUserKey } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = Number(url.searchParams.get("categoryId"));
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "无效类别 ID" }, { status: 400 });
  }
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning,
              v.part_of_speech AS partOfSpeech, v.familiarity,
              f.created_at AS favoritedAt
       FROM vocabulary_favorites f
       JOIN vocabulary v ON v.id = f.vocabulary_id
       JOIN vocabulary_category_links vcl ON vcl.vocabulary_id = v.id
       WHERE f.user_key = ? AND vcl.category_id = ?
       ORDER BY f.created_at DESC`,
      [getUserKey(request), categoryId],
    );
    return NextResponse.json({ items: rows });
  } finally {
    await db.end();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const vocabularyId = Number(body.vocabularyId);
  const favorite = Boolean(body.favorite);
  if (!Number.isInteger(vocabularyId) || vocabularyId <= 0) {
    return NextResponse.json({ error: "无效词汇 ID" }, { status: 400 });
  }
  const db = await getDb();
  try {
    if (favorite) {
      await db.execute(
        `INSERT IGNORE INTO vocabulary_favorites (user_key, vocabulary_id)
         VALUES (?, ?)`,
        [getUserKey(request), vocabularyId],
      );
    } else {
      await db.execute(
        `DELETE FROM vocabulary_favorites
         WHERE user_key = ? AND vocabulary_id = ?`,
        [getUserKey(request), vocabularyId],
      );
    }
    return NextResponse.json({ ok: true, favorite });
  } finally {
    await db.end();
  }
}
