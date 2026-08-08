import mysql, { type PoolConnection, type RowDataPacket } from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL 未配置");
export const db = mysql.createPool({
  uri: url,
  connectionLimit: 6,
  enableKeepAlive: true,
  charset: "utf8mb4",
});
export async function rows<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
) {
  const [result] = await db.query<T>(sql, params);
  return result;
}
export async function transaction<T>(
  work: (connection: PoolConnection) => Promise<T>,
) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
