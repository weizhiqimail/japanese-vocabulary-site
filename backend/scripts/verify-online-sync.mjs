import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const parse = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
const normalize = (source) => {
  if (!source.DATABASE_URL) return source;
  const url = new URL(source.DATABASE_URL);
  return {
    DB_HOST: url.hostname,
    DB_PORT: url.port || '3306',
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
    DB_NAME: decodeURIComponent(url.pathname.replace(/^\//, '')),
    DB_SSL_MODE:
      url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode') || '',
  };
};
const connect = (config) =>
  mysql.createConnection({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    ...(config.DB_SSL_MODE && config.DB_SSL_MODE.toLowerCase() !== 'disabled'
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
const localConfig = normalize(parse(await readFile(path.join(root, '.env.local'), 'utf8')));
const onlineConfig = normalize(
  parse(await readFile(path.join(root, '.env.production'), 'utf8')),
);
const local = await connect(localConfig);
const online = await connect(onlineConfig);
try {
  const tableNames = async (connection) => {
    const [rows] = await connection.query(
      "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME",
    );
    return rows.map((row) => row.name);
  };
  const localTables = await tableNames(local);
  const onlineTables = await tableNames(online);
  if (JSON.stringify(localTables) !== JSON.stringify(onlineTables)) {
    throw new Error('本地与线上表清单不一致');
  }
  const differences = [];
  let totalRows = 0;
  for (const table of localTables) {
    const escaped = `\`${table.replaceAll('`', '``')}\``;
    const [[localCount]] = await local.query(`SELECT COUNT(*) AS total FROM ${escaped}`);
    const [[onlineCount]] = await online.query(`SELECT COUNT(*) AS total FROM ${escaped}`);
    const localTotal = Number(localCount.total);
    const onlineTotal = Number(onlineCount.total);
    totalRows += localTotal;
    if (localTotal !== onlineTotal) {
      differences.push({ table, local: localTotal, online: onlineTotal });
    }
  }
  if (differences.length) {
    throw new Error(`逐表行数不一致：${JSON.stringify(differences)}`);
  }
  console.log(`同步校验通过：${localTables.length} 个数据表，合计 ${totalRows} 行。`);
} finally {
  await Promise.all([local.end(), online.end()]);
}
