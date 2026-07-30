import mysql from "mysql2/promise";

const url = new URL(process.env.DATABASE_URL);
const db = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
});

try {
  const [vocabulary] = await db.query(
    "SELECT COUNT(*) total, SUM(reading IS NULL) nullReadings FROM vocabulary",
  );
  const [categories] = await db.query(
    `SELECT c.name, COUNT(*) total, MIN(l.sort_order) minOrder,
            MAX(l.sort_order) maxOrder, COUNT(DISTINCT l.sort_order) distinctOrders
     FROM vocabulary_category_links l
     JOIN categories c ON c.id=l.category_id
     WHERE c.name IN ('BJT','BJT-外来语','N1')
     GROUP BY c.id,c.name ORDER BY c.id`,
  );
  const [cleared] = await db.query(
    `SELECT (SELECT COUNT(*) FROM learning_progress) progress,
            (SELECT COUNT(*) FROM vocabulary_favorites) favorites,
            (SELECT COUNT(*) FROM favorite_groups) favoriteGroups`,
  );
  const [bad] = await db.query(
    `SELECT id,word,meaning FROM vocabulary
     WHERE CONCAT(word,' ',meaning) REGEXP '来源原文|来源行|<[^>]+>|[*][*]'
     LIMIT 10`,
  );
  const [examples] = await db.query(
    `SELECT word,reading,meaning FROM vocabulary
     WHERE word IN ('存分に召し上がってください','為替','購買力','立ち位置','位置付け',
                    '見積もりと開きがある','目算が狂う')
     ORDER BY id`,
  );
  console.log(JSON.stringify({
    vocabulary: vocabulary[0],
    categories,
    cleared: cleared[0],
    bad,
    examples,
  }, null, 2));
} finally {
  await db.end();
}
