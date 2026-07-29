import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

const categories = ["BJT", "N1", "BJT-外来语"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "BJT";
  const search = (url.searchParams.get("search") || "").trim();
  const all = url.searchParams.get("all") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = all
    ? 5000
    : Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
  const offset = all ? 0 : (page - 1) * pageSize;
  if (!categories.includes(category)) {
    return NextResponse.json({ error: "无效分类" }, { status: 400 });
  }

  const db = await getDb();
  const like = `%${search}%`;
  const where = search
    ? "category = ? AND (word LIKE ? OR reading LIKE ? OR meaning LIKE ?)"
    : "category = ?";
  const params = search ? [category, like, like, like] : [category];
  const [rows] = await db.query(
    `SELECT id, category, word, reading, meaning,
            part_of_speech AS partOfSpeech, familiarity
     FROM vocabulary WHERE ${where}
     ORDER BY id LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM vocabulary WHERE ${where}`,
    params,
  );
  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);
  await db.end();
  return NextResponse.json({ items: rows, total, page, pageSize });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { category, word, reading, meaning, partOfSpeech = "", familiarity = "" } = body;
  if (!categories.includes(category) || !word?.trim() || !reading?.trim() || !meaning?.trim()) {
    return NextResponse.json({ error: "分类、单词、假名和翻译为必填项" }, { status: 400 });
  }
  const db = await getDb();
  try {
    const [result] = await db.execute(
      `INSERT INTO vocabulary
       (category, word, reading, meaning, part_of_speech, familiarity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category, word.trim(), reading.trim(), meaning.trim(), partOfSpeech.trim(), familiarity.trim()],
    );
    return NextResponse.json({ id: Number((result as { insertId: number }).insertId) }, { status: 201 });
  } catch (error) {
    console.error("Vocabulary create failed", error);
    const message = error instanceof Error && error.message.includes("Duplicate")
      ? "这个分类中已经存在相同单词"
      : "新增失败";
    return NextResponse.json({ error: message }, { status: 409 });
  } finally {
    await db.end();
  }
}
