import type { ResultSetHeader } from "mysql2/promise";
import { transaction } from "../../db";
interface SentenceInput {
  japanese?: unknown;
  reading?: unknown;
  translation?: unknown;
  notes?: unknown;
  tagIds?: unknown;
}
export async function createRelatedSentence(
  ownerTable: "vocabulary_sentences" | "grammar_sentences",
  ownerColumn: "vocabulary_id" | "grammar_id",
  ownerId: number,
  input: SentenceInput,
) {
  const japanese = String(input.japanese || "").trim();
  const translation = String(input.translation || "").trim();
  if (!japanese || !translation) throw new Error("句子和翻译不能为空");
  return transaction(async (connection) => {
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO sentences(japanese,reading,translation,notes) VALUES(?,?,?,?)",
      [
        japanese,
        String(input.reading || "").trim() || null,
        translation,
        String(input.notes || "").trim() || null,
      ],
    );
    await connection.execute(
      `INSERT INTO ${ownerTable}(${ownerColumn},sentence_id) VALUES(?,?)`,
      [ownerId, result.insertId],
    );
    const tagIds = Array.isArray(input.tagIds)
      ? input.tagIds.map(Number).filter(Number.isInteger)
      : [];
    for (const tagId of tagIds)
      await connection.execute(
        "INSERT IGNORE INTO sentence_tags(sentence_id,tag_id) VALUES(?,?)",
        [result.insertId, tagId],
      );
    return { id: result.insertId };
  });
}
