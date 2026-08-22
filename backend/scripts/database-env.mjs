import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function loadDatabaseEnvironment(root) {
  const envPath = path.join(root, `.env.${process.env.NODE_ENV || 'local'}`);
  const fileEnv = await readFile(envPath, 'utf8')
    .then((text) =>
      Object.fromEntries(
        text
          .split(/\r?\n/)
          .filter((line) => line && !line.trimStart().startsWith('#') && line.includes('='))
          .map((line) => {
            const index = line.indexOf('=');
            return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
          }),
      ),
    )
    .catch((error) => {
      if (error?.code === 'ENOENT') return {};
      throw error;
    });
  return { ...fileEnv, ...process.env };
}

export function mysqlArguments(env) {
  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || '3306',
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    };
  }
  return {
    host: env.DB_HOST,
    port: env.DB_PORT || '3306',
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  };
}
