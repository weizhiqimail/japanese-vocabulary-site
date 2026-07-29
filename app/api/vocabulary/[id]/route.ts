import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const categories = [...new Set((body.categories || []).map((value: unknown) => String(value).trim()).filter(Boolean))];
  const word = String(body.word || "").trim();
  const reading = String(body.reading || "").trim();
  const meaning = String(body.meaning || "").trim();
  if (!categories.length || !word || !reading || !meaning) {
    return NextResponse.json({ error: "至少选择一个类别，并填写单词、假名和翻译" }, { status: 400 });
  }
  const db = await getDb();
  await db.beginTransaction();
  try {
    const [categoryRows] = await db.query(
      `SELECT id FROM categories
       WHERE name IN (${categories.map(() => "?").join(",")})
         AND enabled = 1 AND (scope = 'vocabulary' OR scope = 'both')`,
      categories,
    );
    if ((categoryRows as unknown[]).length !== categories.length) throw new Error("包含无效的词汇类别");
    await db.execute(
      `UPDATE vocabulary SET category = ?, word = ?, reading = ?, meaning = ?,
       part_of_speech = ?, familiarity = ? WHERE id = ?`,
      [categories[0], word, reading, meaning, String(body.partOfSpeech || "").trim(), String(body.familiarity || "").trim(), id],
    );
    await db.execute("DELETE FROM vocabulary_category_links WHERE vocabulary_id = ?", [id]);
    for (const category of categoryRows as Array<{ id: number }>) {
      await db.execute(
        "INSERT INTO vocabulary_category_links (vocabulary_id, category_id) VALUES (?, ?)",
        [id, category.id],
      );
    }
    await db.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await db.rollback();
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 409 });
  } finally {
    await db.end();
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = await getDb();
  try {
    await db.execute("DELETE FROM vocabulary WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } finally {
    await db.end();
  }
}
