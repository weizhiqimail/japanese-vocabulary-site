import { registerAs } from '@nestjs/config';
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL?.trim() || undefined,
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3307),
  database: process.env.DB_NAME || 'daziwordsapp',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  poolSize: Number(process.env.DB_POOL_SIZE || 10),
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
}));
