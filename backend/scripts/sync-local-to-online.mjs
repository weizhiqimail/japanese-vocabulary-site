import { mkdir } from 'node:fs/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const confirmationArguments = process.argv.slice(2);
if (
  confirmationArguments.length !== 1 ||
  confirmationArguments[0] !== 'OVERWRITE_ONLINE'
) {
  console.error(
    '拒绝执行：该操作会用本地数据库全量覆盖线上数据库。请单独传入确认词 OVERWRITE_ONLINE',
  );
  process.exit(2);
}
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const parse = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter(
        (line) =>
          line && !line.trimStart().startsWith('#') && line.includes('='),
      )
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
const local = parse(await readFile(path.join(root, '.env.local'), 'utf8'));
const production = parse(
  await readFile(path.join(root, '.env.production'), 'utf8'),
);
const normalize = (source) => {
  if (!source.DATABASE_URL) return source;
  const url = new URL(source.DATABASE_URL);
  const sslMode =
    url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode');
  return {
    DB_HOST: url.hostname,
    DB_PORT: url.port || '3306',
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
    DB_NAME: decodeURIComponent(url.pathname.replace(/^\//, '')),
    DB_SSL_MODE: sslMode || '',
  };
};
const localDatabase = normalize(local);
const productionDatabase = normalize(production);
if (['127.0.0.1', 'localhost'].includes(productionDatabase.DB_HOST))
  throw new Error('线上数据库地址不能是本机地址');
const backupDir = path.join(root, 'backups');
await mkdir(backupDir, { recursive: true });
const stamp = new Date().toISOString().replaceAll(':', '-');
const onlineBackup = path.join(backupDir, `online-before-sync-${stamp}.sql`);
const localDump = path.join(backupDir, `local-full-${stamp}.sql`);
const args = (env) => [
  '--host',
  env.DB_HOST,
  '--port',
  env.DB_PORT,
  '--user',
  env.DB_USER,
  ...(env.DB_SSL_MODE && env.DB_SSL_MODE.toLowerCase() !== 'disabled'
    ? [`--ssl-mode=${env.DB_SSL_MODE.toUpperCase()}`]
    : []),
  '--single-transaction',
  '--routines',
  '--triggers',
  '--add-drop-table',
  '--default-character-set=utf8mb4',
  env.DB_NAME,
];
const dump = (env, output) =>
  new Promise((resolve, reject) => {
    const child = spawn('mysqldump', args(env), {
      env: { ...process.env, MYSQL_PWD: env.DB_PASSWORD },
    });
    child.stdout.pipe(createWriteStream(output));
    child.stderr.pipe(process.stderr);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`mysqldump 失败：${code}`)),
    );
  });
const restore = (env, input) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'mysql',
      [
        '--host',
        env.DB_HOST,
        '--port',
        env.DB_PORT,
        '--user',
        env.DB_USER,
        '--default-character-set=utf8mb4',
        env.DB_NAME,
      ],
      { env: { ...process.env, MYSQL_PWD: env.DB_PASSWORD } },
    );
    createReadStream(input).pipe(child.stdin);
    child.stderr.pipe(process.stderr);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`mysql 恢复失败：${code}`)),
    );
  });
await dump(productionDatabase, onlineBackup);
await dump(localDatabase, localDump);
await restore(productionDatabase, localDump);
console.log(`线上数据库覆盖完成。覆盖前备份：${onlineBackup}`);
