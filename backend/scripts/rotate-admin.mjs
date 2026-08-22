import { hash } from 'bcryptjs';
import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadDatabaseEnvironment,
  mysqlArguments,
} from './database-env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = await loadDatabaseEnvironment(root);
const oldUsername = env.OLD_ADMIN_USERNAME;
const newUsername = env.NEW_ADMIN_USERNAME;
const newPassword = env.NEW_ADMIN_PASSWORD;

if (env.CONFIRM_ROTATE_ADMIN !== 'ROTATE_ADMIN') {
  throw new Error('必须设置 CONFIRM_ROTATE_ADMIN=ROTATE_ADMIN');
}
if (!oldUsername || !newUsername || !newPassword) {
  throw new Error(
    '必须设置 OLD_ADMIN_USERNAME、NEW_ADMIN_USERNAME 和 NEW_ADMIN_PASSWORD',
  );
}
if (newPassword.length < 16) {
  throw new Error('新管理员密码不得少于 16 个字符');
}

const connection = await mysql.createConnection(
  env.DATABASE_URL
    ? env.DATABASE_URL
    : {
        ...mysqlArguments(env),
        ssl: env.DB_SSL === 'true' ? {} : undefined,
      },
);

try {
  await connection.beginTransaction();
  const [oldUsers] = await connection.query(
    'SELECT id FROM app_users WHERE username=? FOR UPDATE',
    [oldUsername],
  );
  if (oldUsers.length !== 1) {
    throw new Error(`旧管理员账号数量异常：${oldUsers.length}`);
  }
  const [conflicts] = await connection.query(
    'SELECT id FROM app_users WHERE username=? AND id<>? FOR UPDATE',
    [newUsername, oldUsers[0].id],
  );
  if (conflicts.length > 0) {
    throw new Error('新管理员用户名已经存在');
  }

  const passwordHash = await hash(newPassword, 12);
  await connection.query(
    'UPDATE app_users SET username=?,password=?,enabled=1 WHERE id=?',
    [newUsername, passwordHash, oldUsers[0].id],
  );
  const [sessions] = await connection.query(
    'UPDATE auth_sessions SET revoked_at=NOW(3) WHERE user_id=? AND revoked_at IS NULL',
    [oldUsers[0].id],
  );
  await connection.commit();
  console.log(`管理员凭据已轮换，撤销会话 ${sessions.affectedRows} 个。`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
