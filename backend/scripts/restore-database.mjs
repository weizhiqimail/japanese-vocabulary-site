import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDatabaseEnvironment, mysqlArguments } from './database-env.mjs';

if (process.argv[2] !== 'CONFIRM_RESTORE' || !process.argv[3]) {
  throw new Error('用法：npm run db:restore -- CONFIRM_RESTORE <备份文件>');
}
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backupRoot = path.resolve(root, 'backups');
const source = path.isAbsolute(process.argv[3])
  ? path.resolve(process.argv[3])
  : path.resolve(root, process.argv[3]);
if (!source.startsWith(`${backupRoot}${path.sep}`)) {
  throw new Error('仅允许恢复 backend/backups 目录内的备份');
}
await access(source);
const env = await loadDatabaseEnvironment(root);
const db = mysqlArguments(env);
if (!db.host || !db.user || !db.database) throw new Error('数据库恢复配置不完整');
const child = spawn(
  env.MYSQL_PATH || 'mysql',
  [`--host=${db.host}`, `--port=${db.port}`, `--user=${db.user}`, db.database],
  {
    env: { ...process.env, MYSQL_PWD: db.password || '' },
    shell: false,
    stdio: ['pipe', 'inherit', 'inherit'],
  },
);
createReadStream(source).pipe(child.stdin);
const code = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('exit', resolve);
});
if (code !== 0) throw new Error(`mysql 退出码 ${code}`);
console.log(`数据库恢复完成：${source}`);
