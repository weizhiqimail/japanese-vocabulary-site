import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const backendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envText = await readFile(
  path.join(backendRoot, `.env.${process.env.NODE_ENV || 'local'}`),
  'utf8',
);
const env = {
  ...Object.fromEntries(
    envText
      .split(/\r?\n/)
      .filter(
        (line) =>
          line && !line.trimStart().startsWith('#') && line.includes('='),
      )
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  ),
  ...process.env,
};
const connection = env.DATABASE_URL
  ? await mysql.createConnection(env.DATABASE_URL)
  : await mysql.createConnection({
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });
try {
  const [rows] = await connection.query(`
    SELECT
      b.id,
      b.code,
      b.question_count AS declaredQuestions,
      pg.code AS provider,
      sg.code AS subgroup,
      COUNT(DISTINCT q.id) AS questions,
      (SELECT COUNT(*) FROM questions sq WHERE sq.bank_id=b.id AND sq.enabled=1 AND sq.question_type='single_choice') AS singleChoice,
      (SELECT COUNT(*) FROM questions mq WHERE mq.bank_id=b.id AND mq.enabled=1 AND mq.question_type='multiple_choice') AS multipleChoice,
      (SELECT COUNT(*) FROM questions lq WHERE lq.bank_id=b.id AND JSON_UNQUOTE(JSON_EXTRACT(lq.question_texts,'$.en')) <> '') AS questionsWithEnglish,
      (SELECT COUNT(*) FROM questions lq WHERE lq.bank_id=b.id AND JSON_UNQUOTE(JSON_EXTRACT(lq.question_texts,'$.zh')) <> '') AS questionsWithChinese,
      (SELECT COUNT(*) FROM questions lq WHERE lq.bank_id=b.id AND JSON_UNQUOTE(JSON_EXTRACT(lq.question_texts,'$.ja')) <> '') AS questionsWithJapanese,
      COUNT(o.id) AS options,
      SUM(o.is_correct) AS correctOptions,
      (SELECT COUNT(*) FROM question_import_batches ib WHERE ib.bank_id=b.id AND ib.status='completed') AS completedImports
    FROM question_banks b
    JOIN question_groups sg ON sg.id=b.group_id
    JOIN question_groups pg ON pg.id=sg.parent_id
    JOIN questions q ON q.bank_id=b.id AND q.enabled=1
    JOIN question_options o ON o.question_id=q.id
    WHERE b.code='clf-c02'
    GROUP BY b.id,b.code,b.question_count,pg.code,sg.code
  `);
  if (!rows[0]) throw new Error('未找到 CLF-C02 题库');
  console.log(JSON.stringify(rows[0], null, 2));
} finally {
  await connection.end();
}
