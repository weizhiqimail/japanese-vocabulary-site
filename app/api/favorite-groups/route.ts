import { NextResponse } from "next/server";
import { getDb, getUserKey } from "@/app/lib/db";

async function ensureDefaultGroup(db: Awaited<ReturnType<typeof getDb>>, userKey: string) {
  await db.execute(
    `INSERT INTO favorite_groups (user_key, name, note, is_default)
     SELECT ?, '系统默认组', '未指定收藏组时使用', 1
     WHERE NOT EXISTS (SELECT 1 FROM favorite_groups WHERE user_key = ?)`,
    [userKey, userKey],
  );
}

export async function GET(request: Request) {
  const db = await getDb();
  const userKey = getUserKey(request);
  try {
    await ensureDefaultGroup(db, userKey);
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.note, g.is_default AS isDefault,
              COUNT(f.vocabulary_id) AS itemCount
       FROM favorite_groups g
       LEFT JOIN vocabulary_favorites f
         ON f.group_id = g.id AND f.user_key = g.user_key
       WHERE g.user_key = ?
       GROUP BY g.id, g.name, g.note, g.is_default, g.created_at
       ORDER BY g.is_default DESC, g.created_at, g.id`,
      [userKey],
    );
    return NextResponse.json({ items: rows });
  } finally {
    await db.end();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const note = String(body.note || "").trim();
  const isDefault = Boolean(body.isDefault);
  if (!name) return NextResponse.json({ error: "请填写收藏组名称" }, { status: 400 });
  const db = await getDb();
  const userKey = getUserKey(request);
  await db.beginTransaction();
  try {
    await ensureDefaultGroup(db, userKey);
    if (isDefault) {
      await db.execute("UPDATE favorite_groups SET is_default = 0 WHERE user_key = ?", [userKey]);
    }
    const [result] = await db.execute(
      `INSERT INTO favorite_groups (user_key, name, note, is_default)
       VALUES (?, ?, ?, ?)`,
      [userKey, name, note, isDefault ? 1 : 0],
    );
    await db.commit();
    return NextResponse.json({ id: Number((result as { insertId: number }).insertId) }, { status: 201 });
  } catch (error) {
    await db.rollback();
    const duplicate = error instanceof Error && error.message.includes("Duplicate");
    return NextResponse.json({ error: duplicate ? "收藏组名称已经存在" : "创建收藏组失败" }, { status: 409 });
  } finally {
    await db.end();
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id = Number(body.id);
  const name = String(body.name || "").trim();
  const note = String(body.note || "").trim();
  const isDefault = Boolean(body.isDefault);
  if (!Number.isInteger(id) || id <= 0 || !name) {
    return NextResponse.json({ error: "收藏组信息无效" }, { status: 400 });
  }
  const db = await getDb();
  const userKey = getUserKey(request);
  await db.beginTransaction();
  try {
    const [existingRows] = await db.query(
      "SELECT is_default AS isDefault FROM favorite_groups WHERE id = ? AND user_key = ?",
      [id, userKey],
    );
    const effectiveDefault = isDefault || Boolean((existingRows as Array<{ isDefault: number }>)[0]?.isDefault);
    if (effectiveDefault) {
      await db.execute("UPDATE favorite_groups SET is_default = 0 WHERE user_key = ?", [userKey]);
    }
    await db.execute(
      `UPDATE favorite_groups SET name = ?, note = ?, is_default = ?
       WHERE id = ? AND user_key = ?`,
      [name, note, effectiveDefault ? 1 : 0, id, userKey],
    );
    await db.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await db.rollback();
    const duplicate = error instanceof Error && error.message.includes("Duplicate");
    return NextResponse.json({ error: duplicate ? "收藏组名称已经存在" : "更新收藏组失败" }, { status: 409 });
  } finally {
    await db.end();
  }
}
