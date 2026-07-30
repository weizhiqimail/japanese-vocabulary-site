import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  const params: string[] = [];
  let where = "";
  if (scope === "vocabulary" || scope === "article") {
    where = "WHERE scope = ? OR scope = 'both'";
    params.push(scope);
  }
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT id, name, scope, purpose, sort_order AS sortOrder, enabled
       FROM categories ${where}
       ORDER BY sort_order, id`,
      params,
    );
    return NextResponse.json({ items: rows });
  } finally {
    await db.end();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const scope = body.scope;
  const purpose = body.purpose;
  const sortOrder = Math.max(0, Number(body.sortOrder) || 0);
  if (!name || !["vocabulary", "article", "both"].includes(scope) || !["study", "topic", "development"].includes(purpose)) {
    return NextResponse.json({ error: "请完整填写类别信息" }, { status: 400 });
  }
  const db = await getDb();
  try {
    const [result] = await db.execute(
      `INSERT INTO categories (name, scope, purpose, sort_order, enabled)
       VALUES (?, ?, ?, ?, 1)`,
      [name, scope, purpose, sortOrder],
    );
    return NextResponse.json({ id: Number((result as { insertId: number }).insertId) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Duplicate")
      ? "类别名称已经存在"
      : "新增类别失败";
    return NextResponse.json({ error: message }, { status: 409 });
  } finally {
    await db.end();
  }
}
