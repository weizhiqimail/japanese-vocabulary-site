import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "BJT").trim();
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.title, a.content, a.sort_order AS sortOrder,
              GROUP_CONCAT(ac_all.category ORDER BY ac_all.category SEPARATOR '|||') AS categoryList
       FROM articles a
       JOIN article_categories ac_filter
         ON ac_filter.article_id = a.id AND ac_filter.category = ?
       JOIN article_categories ac_all ON ac_all.article_id = a.id
       GROUP BY a.id, a.title, a.content, a.sort_order
       ORDER BY a.sort_order, a.id`,
      [category],
    );
    const items = (rows as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      categories: String(row.categoryList || "").split("|||").filter(Boolean),
      categoryList: undefined,
    }));
    return NextResponse.json({ items, category });
  } finally {
    await db.end();
  }
}
