import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = Number(url.searchParams.get("categoryId"));
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "无效类别 ID" }, { status: 400 });
  }
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.title, a.content, a.sort_order AS sortOrder,
              GROUP_CONCAT(c_all.name ORDER BY c_all.sort_order SEPARATOR '|||') AS categoryList
       FROM articles a
       JOIN article_category_links acl_filter ON acl_filter.article_id = a.id
       JOIN categories c_filter ON c_filter.id = acl_filter.category_id AND c_filter.id = ?
       JOIN article_category_links acl_all ON acl_all.article_id = a.id
       JOIN categories c_all ON c_all.id = acl_all.category_id
       GROUP BY a.id, a.title, a.content, a.sort_order
       ORDER BY a.sort_order, a.id`,
      [categoryId],
    );
    const items = (rows as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      categories: String(row.categoryList || "").split("|||").filter(Boolean),
      categoryList: undefined,
    }));
    return NextResponse.json({ items, categoryId });
  } finally {
    await db.end();
  }
}
