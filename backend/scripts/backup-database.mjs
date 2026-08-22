import { mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDatabaseEnvironment, mysqlArguments } from './database-env.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = await loadDatabaseEnvironment(root);
const db = mysqlArguments(env);
if (!db.host || !db.user || !db.database) throw new Error('数据库备份配置不完整');
const directory = path.join(root, 'backups');
await mkdir(directory, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = path.join(directory, `${db.database}-${stamp}.sql`);
const args = [
  `--host=${db.host}`,
  `--port=${db.port}`,
  `--user=${db.user}`,
  '--single-transaction',
  '--routines',
  '--triggers',
  '--set-gtid-purged=OFF',
  db.database,
];
const child = spawn(env.MYSQLDUMP_PATH || 'mysqldump', args, {
  env: { ...process.env, MYSQL_PWD: db.password || '' },
  shell: false,
  stdio: ['ignore', 'pipe', 'inherit'],
});
child.stdout.pipe(createWriteStream(destination, { flags: 'wx' }));
const code = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('exit', resolve);
});
if (code !== 0) throw new Error(`mysqldump 退出码 ${code}`);
console.log(`数据库备份已生成：${destination}`);
