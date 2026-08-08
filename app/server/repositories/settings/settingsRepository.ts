import type { RowDataPacket } from "mysql2/promise";
import { db, rows } from "../../db";

export async function getSettings() {
  const records = await rows<RowDataPacket[]>(
    "SELECT setting_key,setting_value FROM settings",
  );
  return Object.fromEntries(
    records.map((record) => [
      record.setting_key,
      typeof record.setting_value === "string"
        ? JSON.parse(record.setting_value)
        : record.setting_value,
    ]),
  );
}

export async function saveSetting(key: string, value: unknown) {
  await db.execute(
    "INSERT INTO settings(setting_key,setting_value) VALUES(?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
    [key, JSON.stringify(value)],
  );
  return getSettings();
}
