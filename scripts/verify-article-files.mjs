import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const root = path.resolve(import.meta.dirname, "..");
const articleDir = path.join(root, "files", "article");
const readme = await readFile(path.join(articleDir, "README.md"), "utf8");
const fileByArticleId = new Map();

for (const line of readme.split(/\r?\n/)) {
  const match = line.match(/^\|\s*(\d+)\s*\|\s*\[[^\]]+\]\(\.\/([^)]+)\)/);
  if (match) fileByArticleId.set(Number(match[1]), decodeURIComponent(match[2]));
}

const url = new URL(process.env.DATABASE_URL);
const db = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  enableKeepAlive: true,
  disableEval: true,
});

try {
  const [articles] = await db.query("SELECT id, title, content FROM articles ORDER BY sort_order, id");
  const failures = [];

  for (const article of articles) {
    const fileName = fileByArticleId.get(Number(article.id));
    if (!fileName) {
      failures.push(`文章 ${article.id}「${article.title}」未登记文件`);
      continue;
    }
    try {
      const fileContent = await readFile(path.join(articleDir, fileName), "utf8");
      if (fileContent !== article.content) failures.push(`文章 ${article.id}「${article.title}」正文不一致`);
    } catch {
      failures.push(`文章 ${article.id}「${article.title}」文件不存在：${fileName}`);
    }
  }

  for (const id of fileByArticleId.keys()) {
    if (!articles.some((article) => Number(article.id) === id)) failures.push(`清单中的文章 ID ${id} 不存在于数据库`);
  }

  const markdownFiles = (await readdir(articleDir)).filter((name) => name.endsWith(".md") && name !== "README.md");
  const listedFiles = new Set(fileByArticleId.values());
  for (const fileName of markdownFiles) {
    if (!listedFiles.has(fileName)) failures.push(`目录中存在未登记文章文件：${fileName}`);
  }

  if (failures.length) throw new Error(failures.join("\n"));
  console.log(`文章一致性核验通过：数据库 ${articles.length} 篇，Markdown ${markdownFiles.length} 篇。`);
} finally {
  await db.end();
}
