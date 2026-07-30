import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const categoryIds = [...new Set((body.categoryIds || []).map(Number).filter((value: number) => Number.isInteger(value) && value > 0))];
  const word = String(body.word || "").trim();
  const reading = String(body.reading || "").trim();
  const meaning = String(body.meaning || "").trim();
  if (!categoryIds.length || !word || !meaning) {
    return NextResponse.json({ error: "至少选择一个类别，并填写单词和翻译" }, { status: 400 });
  }
  const db = await getDb();
  await db.beginTransaction();
  try {
    const [categoryRows] = await db.query(
      `SELECT id FROM categories
       WHERE id IN (${categoryIds.map(() => "?").join(",")})
         AND enabled = 1 AND (scope = 'vocabulary' OR scope = 'both')`,
      categoryIds,
    );
    if ((categoryRows as unknown[]).length !== categoryIds.length) throw new Error("包含无效的词汇类别");
    await db.execute(
      `UPDATE vocabulary SET word = ?, reading = ?, meaning = ?,
       part_of_speech = ?, familiarity = ? WHERE id = ?`,
      [word, reading || null, meaning, String(body.partOfSpeech || "").trim(), String(body.familiarity || "").trim(), id],
    );
    const [existingLinks] = await db.query(
      "SELECT category_id AS categoryId, sort_order AS sortOrder, source_file AS sourceFile, source_line AS sourceLine FROM vocabulary_category_links WHERE vocabulary_id = ?",
      [id],
    );
    const existingByCategory = new Map(
      (existingLinks as Array<{ categoryId: number; sortOrder: number; sourceFile: string | null; sourceLine: number | null }>)
        .map((link) => [Number(link.categoryId), link]),
    );
    await db.execute("DELETE FROM vocabulary_category_links WHERE vocabulary_id = ?", [id]);
    for (const category of categoryRows as Array<{ id: number }>) {
      const existing = existingByCategory.get(Number(category.id));
      let sortOrder = existing?.sortOrder;
      if (sortOrder === undefined) {
        const [orderRows] = await db.query(
          "SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM vocabulary_category_links WHERE category_id = ?",
          [category.id],
        );
        sortOrder = Number((orderRows as Array<{ nextOrder: number }>)[0].nextOrder);
      }
      await db.execute(
        `INSERT INTO vocabulary_category_links
          (vocabulary_id, category_id, sort_order, source_file, source_line)
         VALUES (?, ?, ?, ?, ?)`,
        [id, category.id, sortOrder, existing?.sourceFile ?? null, existing?.sourceLine ?? null],
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
