import mysql, {
  type Connection,
  type Pool,
  type RowDataPacket,
} from "mysql2/promise";

async function createConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL 未配置");
  return mysql.createConnection({
    uri: databaseUrl,
    enableKeepAlive: true,
    charset: "utf8mb4",
    // Cloudflare Workers 禁止通过 new Function 动态生成解析器。
    // mysql2 的静态解析器可在 Workers 运行时安全执行。
    disableEval: true,
    // 由仓储层显式 JSON.parse，避免 mysql2 的 JSON 数据包解析路径在
    // Workers V8 隔离环境中触发受限的代码生成行为。
    jsonStrings: true,
  });
}

export const db = new Proxy({} as Pool, {
  get(_target, property) {
    if (property !== "query" && property !== "execute") {
      throw new Error(`不支持的数据库池操作：${String(property)}`);
    }
    return async (...args: unknown[]) => {
      const connection = await createConnection();
      try {
        const method = Reflect.get(connection, property, connection) as (
          ...values: unknown[]
        ) => Promise<unknown>;
        return await method.apply(connection, args);
      } finally {
        await connection.end();
      }
    };
  },
});
export async function rows<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
) {
  const connection = await createConnection();
  try {
    const [result] = await connection.query<T>(sql, params);
    return result;
  } finally {
    await connection.end();
  }
}
export async function transaction<T>(
  work: (connection: Connection) => Promise<T>,
) {
  const connection: Connection = await createConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
