import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { transaction } from "../../db";
interface ImportCandidateInput {
  word?: unknown;
  reading?: unknown;
  translation?: unknown;
}
export async function createImportBatch(
  filename: string,
  candidates: ImportCandidateInput[],
) {
  if (!candidates.length) throw new Error("CSV 中没有可导入数据");
  return transaction(async (connection) => {
    const [batch] = await connection.execute<ResultSetHeader>(
      "INSERT INTO import_batches(name,original_filename,status) VALUES(?,?,'reviewing')",
      ["CSV 导入", filename],
    );
    for (const item of candidates) {
      const word = String(item.word || "").trim(),
        translation = String(item.translation || "").trim(),
        reading = String(item.reading || "").trim() || null;
      if (!word || !translation) continue;
      const [duplicates] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM vocabularies WHERE word=? AND COALESCE(reading,'')=COALESCE(?,'') AND deleted_at IS NULL LIMIT 1",
        [word, reading],
      );
      const duplicateId = duplicates[0]?.id || null;
      await connection.execute(
        "INSERT INTO import_candidates(batch_id,word,reading,translation,status,duplicate_vocabulary_id) VALUES(?,?,?,?,?,?)",
        [
          batch.insertId,
          word,
          reading,
          translation,
          duplicateId ? "not_needed" : "pending",
          duplicateId,
        ],
      );
    }
    return { batchId: batch.insertId };
  });
}
export async function reviewImport(id: number, decision: string) {
  return transaction(async (connection) => {
    const [records] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM import_candidates WHERE id=? FOR UPDATE",
      [id],
    );
    const candidate = records[0];
    if (!candidate || candidate.status !== "pending")
      throw new Error("审核项不存在或已经处理");
    if (decision === "approve") {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO vocabularies(word,reading,translation) VALUES(?,?,?)",
        [candidate.word, candidate.reading, candidate.translation],
      );
      await connection.execute(
        "UPDATE import_candidates SET status='approved',approved_vocabulary_id=?,reviewed_at=NOW(3) WHERE id=?",
        [result.insertId, id],
      );
    } else
      await connection.execute(
        "UPDATE import_candidates SET status=?,reviewed_at=NOW(3) WHERE id=?",
        [decision === "reject" ? "rejected" : "not_needed", id],
      );
    return { id };
  });
}
