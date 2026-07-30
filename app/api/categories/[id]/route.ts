import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const scope = body.scope;
  const purpose = body.purpose;
  const sortOrder = Math.max(0, Number(body.sortOrder) || 0);
  const enabled = body.enabled ? 1 : 0;
  if (!name || !["vocabulary", "article", "both"].includes(scope) || !["study", "topic", "development"].includes(purpose)) {
    return NextResponse.json({ error: "请完整填写类别信息" }, { status: 400 });
  }
  const db = await getDb();
  try {
    await db.execute(
      `UPDATE categories
       SET name = ?, scope = ?, purpose = ?, sort_order = ?, enabled = ?
       WHERE id = ?`,
      [name, scope, purpose, sortOrder, enabled, id],
    );
    return NextResponse.json({ ok: true });
  } finally {
    await db.end();
  }
}
