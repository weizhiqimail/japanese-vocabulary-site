import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(root, `.env.${process.env.NODE_ENV || 'local'}`);
const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter(
        (line) =>
          line && !line.trimStart().startsWith('#') && line.includes('='),
      )
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
const env = { ...parseEnv(await readFile(envPath, 'utf8')), ...process.env };
function databaseConfig(source) {
  if (!source.DATABASE_URL)
    return {
      host: source.DB_HOST,
      port: Number(source.DB_PORT),
      user: source.DB_USER,
      password: source.DB_PASSWORD,
      database: source.DB_NAME,
    };
  const url = new URL(source.DATABASE_URL);
  const sslMode =
    url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode');
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    ...(sslMode && sslMode.toLowerCase() !== 'disabled' ? { ssl: {} } : {}),
  };
}
const database = databaseConfig(env);
const connection = await mysql.createConnection({
  ...database,
  multipleStatements: true,
  connectTimeout: Number(env.DB_CONNECT_TIMEOUT_MS || 5000),
});
async function ensureColumn(table, column, definition) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS total FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?',
    [table, column],
  );
  if (Number(rows[0]?.total || 0) === 0)
    await connection.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`,
    );
}
async function prepareLegacySchema() {
  const columns = [
    [
      'parts_of_speech',
      'enabled',
      "TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用'",
    ],
    [
      'parts_of_speech',
      'created_at',
      "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间'",
    ],
    [
      'parts_of_speech',
      'updated_at',
      "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'",
    ],
    ['tags', 'color', "CHAR(7) NOT NULL DEFAULT '#FDE68A' COMMENT '固定浅色背景色'"],
    ['tags', 'enabled', "TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用'"],
    ['tags', 'deleted_at', "DATETIME(3) NULL COMMENT '逻辑删除时间'"],
    [
      'collections',
      'is_default',
      "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '默认集合'",
    ],
    ['collections', 'deleted_at', "DATETIME(3) NULL COMMENT '逻辑删除时间'"],
    ['grammars', 'pattern', "VARCHAR(255) NULL COMMENT '语法形式'"],
    ['grammars', 'notes', "TEXT NULL COMMENT '备注'"],
    ['grammars', 'deleted_at', "DATETIME(3) NULL COMMENT '逻辑删除时间'"],
    ['sentences', 'japanese', "TEXT NULL COMMENT '日语句子'"],
    ['sentences', 'notes', "TEXT NULL COMMENT '备注'"],
    ['sentences', 'deleted_at', "DATETIME(3) NULL COMMENT '逻辑删除时间'"],
    ['study_events', 'entity_type', "VARCHAR(20) NULL COMMENT '对象类型'"],
    ['study_events', 'entity_id', "BIGINT UNSIGNED NULL COMMENT '对象ID'"],
    ['study_events', 'session_key', "VARCHAR(64) NULL COMMENT '会话'"],
    ['study_events', 'occurred_at', "DATETIME(3) NULL COMMENT '发生时间'"],
    ['study_events', 'deleted_at', "DATETIME(3) NULL COMMENT '撤销时间'"],
  ];
  for (const [table, column, definition] of columns)
    await ensureColumn(table, column, definition);
  await connection.query(
    'ALTER TABLE study_events MODIFY COLUMN vocabulary_id INT NULL',
  );
}
try {
  const [legacyTables] = await connection.query(
    "SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='vocabulary'",
  );
  if (Number(legacyTables[0]?.total || 0) > 0) {
    await prepareLegacySchema();
    await connection.query(
      await readFile(path.join(root, 'database', 'compatibility.sql'), 'utf8'),
    );
  }
  await connection.query(
    await readFile(path.join(root, 'database', 'schema.sql'), 'utf8'),
  );
  await connection.query(
    'INSERT INTO app_users(username,password,display_name,enabled) VALUES(?,?,?,1) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name)',
    [
      env.INITIAL_ADMIN_USERNAME || 'admin',
      env.INITIAL_ADMIN_PASSWORD || 'admin',
      env.INITIAL_ADMIN_DISPLAY_NAME || '管理员',
    ],
  );
  console.log(`数据库 ${database.database} 迁移完成，现有业务数据未删除。`);
} finally {
  await connection.end();
}
