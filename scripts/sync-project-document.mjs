import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const content = await fs.readFile("docs/PRODUCT_REQUIREMENTS.md", "utf8");
const url = new URL(process.env.DATABASE_URL);
const db = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
});

try {
  const [rows] = await db.query(
    `SELECT a.id,a.title
     FROM articles a
     JOIN article_category_links l ON l.article_id=a.id
     JOIN categories c ON c.id=l.category_id
     WHERE c.purpose='development'
     ORDER BY a.id LIMIT 1`,
  );
  const article = rows[0];
  if (!article) throw new Error("No development project document article found");
  await db.execute(
    "UPDATE articles SET title=?,content=? WHERE id=?",
    ["项目需求文档", content, article.id],
  );
  console.log(JSON.stringify({ articleId: Number(article.id), title: "项目需求文档", bytes: content.length }));
} finally {
  await db.end();
}
