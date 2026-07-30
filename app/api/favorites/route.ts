import { NextResponse } from "next/server";
import { getDb, getUserKey } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = Number(url.searchParams.get("categoryId"));
  const groupId = Number(url.searchParams.get("groupId") || 0);
  if (!Number.isInteger(categoryId) || categoryId < 0 || !Number.isInteger(groupId) || groupId < 0) {
    return NextResponse.json({ error: "无效类别 ID" }, { status: 400 });
  }
  const db = await getDb();
  try {
    const clauses = ["f.user_key = ?"];
    const params: unknown[] = [getUserKey(request)];
    if (categoryId > 0) {
      clauses.push("vcl.category_id = ?");
      params.push(categoryId);
    }
    if (groupId > 0) {
      clauses.push("f.group_id = ?");
      params.push(groupId);
    }
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning,
              v.part_of_speech AS partOfSpeech, v.familiarity,
              f.group_id AS groupId, f.created_at AS favoritedAt
       FROM vocabulary_favorites f
       JOIN vocabulary v ON v.id = f.vocabulary_id
       JOIN vocabulary_category_links vcl ON vcl.vocabulary_id = v.id
       WHERE ${clauses.join(" AND ")}
       GROUP BY v.id, v.word, v.reading, v.meaning, v.part_of_speech,
                v.familiarity, f.group_id, f.created_at
       ORDER BY f.created_at DESC`,
      params,
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
  const requestedGroupId = Number(body.groupId || 0);
  if (!Number.isInteger(vocabularyId) || vocabularyId <= 0) {
    return NextResponse.json({ error: "无效词汇 ID" }, { status: 400 });
  }
  const db = await getDb();
  try {
    let groupId = requestedGroupId;
    if (groupId <= 0) {
      const [groups] = await db.query(
        `SELECT id FROM favorite_groups
         WHERE user_key = ? AND is_default = 1 ORDER BY id LIMIT 1`,
        [getUserKey(request)],
      );
      groupId = Number((groups as Array<{ id: number }>)[0]?.id || 0);
    }
    if (groupId <= 0) {
      const [result] = await db.execute(
        `INSERT INTO favorite_groups (user_key, name, note, is_default)
         VALUES (?, '系统默认组', '未指定收藏组时使用', 1)`,
        [getUserKey(request)],
      );
      groupId = Number((result as { insertId: number }).insertId);
    }
    if (favorite) {
      await db.execute(
        `INSERT IGNORE INTO vocabulary_favorites (user_key, group_id, vocabulary_id)
         SELECT ?, id, ? FROM favorite_groups WHERE id = ? AND user_key = ?`,
        [getUserKey(request), vocabularyId, groupId, getUserKey(request)],
      );
    } else {
      await db.execute(
        `DELETE FROM vocabulary_favorites
         WHERE user_key = ? AND group_id = ? AND vocabulary_id = ?`,
        [getUserKey(request), groupId, vocabularyId],
      );
    }
    return NextResponse.json({ ok: true, favorite, groupId });
  } finally {
    await db.end();
  }
}
