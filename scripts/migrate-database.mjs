import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL) throw new Error("缺少 DATABASE_URL");
const sql = await readFile(
  new URL("../db/schema.sql", import.meta.url),
  "utf8",
);
const db = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  multipleStatements: true,
});
try {
  await db.query(sql);
  const removableColumns = [
    ["vocabulary_sentences", "matched_text"],
    ["grammar_sentences", "matched_text"],
    ["sentences", "source"],
    ["grammars", "connection"],
    ["grammars", "usage_notes"],
  ];
  for (const [tableName, columnName] of removableColumns) {
    const [columns] = await db.execute(
      "SELECT COUNT(*) AS total FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?",
      [tableName, columnName],
    );
    if (Number(columns[0].total))
      await db.query(
        `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``,
      );
  }
  console.log("数据库结构迁移完成；未删除任何业务记录。");
} finally {
  await db.end();
}
