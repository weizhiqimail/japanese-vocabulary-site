import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "BJT").trim();
  const search = (url.searchParams.get("search") || "").trim();
  const all = url.searchParams.get("all") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = all ? 5000 : Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
  const offset = all ? 0 : (page - 1) * pageSize;
  const like = `%${search}%`;
  const searchSql = search ? "AND (v.word LIKE ? OR v.reading LIKE ? OR v.meaning LIKE ?)" : "";
  const params = search ? [category, like, like, like] : [category];
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning,
              v.part_of_speech AS partOfSpeech, v.familiarity,
              GROUP_CONCAT(DISTINCT c_all.name ORDER BY c_all.sort_order SEPARATOR '|||') AS categoryList
       FROM vocabulary v
       JOIN vocabulary_category_links vcl_filter ON vcl_filter.vocabulary_id = v.id
       JOIN categories c_filter ON c_filter.id = vcl_filter.category_id AND c_filter.name = ?
       JOIN vocabulary_category_links vcl_all ON vcl_all.vocabulary_id = v.id
       JOIN categories c_all ON c_all.id = vcl_all.category_id
       WHERE 1 = 1 ${searchSql}
       GROUP BY v.id, v.word, v.reading, v.meaning, v.part_of_speech, v.familiarity
       ORDER BY v.id LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );
    const [countRows] = await db.query(
      `SELECT COUNT(DISTINCT v.id) AS total
       FROM vocabulary v
       JOIN vocabulary_category_links vcl ON vcl.vocabulary_id = v.id
       JOIN categories c ON c.id = vcl.category_id AND c.name = ?
       WHERE 1 = 1 ${searchSql}`,
      params,
    );
    const items = (rows as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      categories: String(row.categoryList || "").split("|||").filter(Boolean),
      categoryList: undefined,
    }));
    return NextResponse.json({
      items,
      total: Number((countRows as Array<{ total: number }>)[0]?.total ?? 0),
      page,
      pageSize,
    });
  } finally {
    await db.end();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const categoryNames = [...new Set((body.categories || []).map((value: unknown) => String(value).trim()).filter(Boolean))];
  const word = String(body.word || "").trim();
  const reading = String(body.reading || "").trim();
  const meaning = String(body.meaning || "").trim();
  if (!categoryNames.length || !word || !reading || !meaning) {
    return NextResponse.json({ error: "至少选择一个类别，并填写单词、假名和翻译" }, { status: 400 });
  }
  const db = await getDb();
  await db.beginTransaction();
  try {
    const [categoryRows] = await db.query(
      `SELECT id, name FROM categories
       WHERE name IN (${categoryNames.map(() => "?").join(",")})
         AND enabled = 1 AND (scope = 'vocabulary' OR scope = 'both')`,
      categoryNames,
    );
    if ((categoryRows as unknown[]).length !== categoryNames.length) {
      throw new Error("包含无效的词汇类别");
    }
    const [result] = await db.execute(
      `INSERT INTO vocabulary
       (category, word, reading, meaning, part_of_speech, familiarity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [categoryNames[0], word, reading, meaning, String(body.partOfSpeech || "").trim(), String(body.familiarity || "").trim()],
    );
    const vocabularyId = Number((result as { insertId: number }).insertId);
    for (const category of categoryRows as Array<{ id: number }>) {
      await db.execute(
        "INSERT INTO vocabulary_category_links (vocabulary_id, category_id) VALUES (?, ?)",
        [vocabularyId, category.id],
      );
    }
    await db.commit();
    return NextResponse.json({ id: vocabularyId }, { status: 201 });
  } catch (error) {
    await db.rollback();
    const message = error instanceof Error && error.message.includes("Duplicate")
      ? "相同单词和假名已经存在"
      : error instanceof Error ? error.message : "新增失败";
    return NextResponse.json({ error: message }, { status: 409 });
  } finally {
    await db.end();
  }
}
