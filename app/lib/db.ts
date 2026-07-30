import mysql from "mysql2/promise";

export function getDb() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured");
  const url = new URL(value);
  return mysql.createConnection({
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    enableKeepAlive: true,
    disableEval: true,
  });
}

export function getUserKey(_request: Request) {
  return process.env.SITE_OWNER_KEY?.trim() || "site-owner";
}
