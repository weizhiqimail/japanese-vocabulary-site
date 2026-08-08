import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db, rows, transaction } from "../../db";
import {
  COLLECTIONS_RESOURCE,
  GRAMMARS_RESOURCE,
  IMPORTS_RESOURCE,
  KNOWLEDGE_RESOURCES,
  PARTS_OF_SPEECH_RESOURCE,
  SENTENCES_RESOURCE,
  VOCABULARIES_RESOURCE,
} from "../../config/resources";

export const ALLOWED_PAGE_SIZES = [10, 20, 30, 40, 50, 100];
const RESOURCE_TABLES = {
  collections: "collections",
  vocabularies: "vocabularies",
  grammars: "grammars",
  sentences: "sentences",
  tags: "tags",
  "parts-of-speech": "parts_of_speech",
  imports: "import_candidates",
} as const;
export type Resource = keyof typeof RESOURCE_TABLES;
export function isResource(value: string): value is Resource {
  return value in RESOURCE_TABLES;
}
export function page(url: URL, defaultPageSize = 10) {
  const pageNum = Math.max(1, Number(url.searchParams.get("pageNum")) || 1);
  const requested = Number(url.searchParams.get("pageSize")) || defaultPageSize;
  const pageSize = ALLOWED_PAGE_SIZES.includes(requested)
    ? requested
    : defaultPageSize;
  return { pageNum, pageSize, offset: (pageNum - 1) * pageSize };
}

const RESOURCE_SEARCH_FIELDS: Record<Resource, string[]> = {
  collections: ["c.name", "c.description", "c.source"],
  vocabularies: ["v.word", "v.reading", "v.translation", "s.japanese"],
  grammars: ["g.pattern", "g.reading", "g.meaning"],
  sentences: ["s.japanese", "s.reading", "s.translation"],
  tags: ["t.name"],
  "parts-of-speech": ["p.name", "p.code"],
  imports: ["i.word", "i.reading", "i.translation"],
};
const RESOURCE_ALIASES: Record<Resource, string> = {
  collections: "c",
  vocabularies: "v",
  grammars: "g",
  sentences: "s",
  tags: "t",
  "parts-of-speech": "p",
  imports: "i",
};
const RESOURCE_FROM: Record<Resource, string> = {
  collections: "collections c",
  vocabularies:
    "vocabularies v LEFT JOIN vocabulary_sentences vs ON vs.vocabulary_id=v.id LEFT JOIN sentences s ON s.id=vs.sentence_id AND s.deleted_at IS NULL LEFT JOIN vocabulary_parts_of_speech vpos ON vpos.vocabulary_id=v.id LEFT JOIN parts_of_speech vp ON vp.id=vpos.part_of_speech_id LEFT JOIN vocabulary_tags vt ON vt.vocabulary_id=v.id LEFT JOIN tags tg ON tg.id=vt.tag_id AND tg.deleted_at IS NULL",
  grammars: "grammars g",
  sentences: "sentences s",
  tags: "tags t",
  "parts-of-speech": "parts_of_speech p",
  imports: "import_candidates i",
};
const RESOURCE_SELECTS: Record<Resource, string> = {
  collections:
    "c.*,COUNT(DISTINCT cv.vocabulary_id) member_count,COUNT(DISTINCT CASE WHEN v.learned_at IS NOT NULL THEN v.id END) learned_count",
  vocabularies:
    "v.*,GROUP_CONCAT(DISTINCT vp.name ORDER BY vp.sort_order SEPARATOR '、') part_of_speech_names,GROUP_CONCAT(DISTINCT tg.name ORDER BY tg.id SEPARATOR '、') tag_names",
  grammars: "g.*",
  sentences: "s.*",
  tags: "t.*",
  "parts-of-speech": "p.*",
  imports: "i.*",
};

export async function list(resource: Resource, url: URL) {
  const settingRows = await rows<RowDataPacket[]>(
    "SELECT setting_value FROM settings WHERE setting_key='pagination_defaults' LIMIT 1",
  );
  const settingValue = settingRows[0]?.setting_value;
  const paginationDefaults =
    typeof settingValue === "string"
      ? JSON.parse(settingValue)
      : settingValue || {};
  const defaultPageSize = Number(paginationDefaults[resource]) || 20;
  const p = page(url, defaultPageSize),
    q = (url.searchParams.get("q") || "").trim(),
    alias = RESOURCE_ALIASES[resource];
  let joins = RESOURCE_FROM[resource];
  if (resource === COLLECTIONS_RESOURCE)
    joins +=
      " LEFT JOIN collection_vocabularies cv ON cv.collection_id=c.id LEFT JOIN vocabularies v ON v.id=cv.vocabulary_id AND v.deleted_at IS NULL";
  const deletable =
    resource !== PARTS_OF_SPEECH_RESOURCE && resource !== IMPORTS_RESOURCE;
  const conditions = [deletable ? `${alias}.deleted_at IS NULL` : "1=1"];
  const params: unknown[] = [];
  if (q) {
    conditions.push(
      `(${RESOURCE_SEARCH_FIELDS[resource].map((field) => `${field} LIKE ?`).join(" OR ")})`,
    );
    RESOURCE_SEARCH_FIELDS[resource].forEach(() => params.push(`%${q}%`));
  }
  if (resource === COLLECTIONS_RESOURCE && url.searchParams.get("type")) {
    conditions.push("c.type=?");
    params.push(url.searchParams.get("type"));
  }
  if (resource === VOCABULARIES_RESOURCE && url.searchParams.get("tagId")) {
    conditions.push(
      "EXISTS (SELECT 1 FROM vocabulary_tags filter_vt WHERE filter_vt.vocabulary_id=v.id AND filter_vt.tag_id=?)",
    );
    params.push(Number(url.searchParams.get("tagId")));
  }
  const where = conditions.join(" AND ");
  const group =
    resource === COLLECTIONS_RESOURCE || resource === VOCABULARIES_RESOURCE
      ? ` GROUP BY ${alias}.id`
      : "";
  const order =
    resource === PARTS_OF_SPEECH_RESOURCE
      ? `${alias}.sort_order ASC,${alias}.id ASC`
      : resource === IMPORTS_RESOURCE
        ? `${alias}.created_at DESC,${alias}.id DESC`
        : `${alias}.updated_at DESC,${alias}.id DESC`;
  const count = await rows<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT ${alias}.id) total FROM ${joins} WHERE ${where}`,
    params,
  );
  const data = await rows<RowDataPacket[]>(
    `SELECT ${RESOURCE_SELECTS[resource]} FROM ${joins} WHERE ${where}${group} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, p.pageSize, p.offset],
  );
  return {
    data,
    pagination: {
      pageNum: p.pageNum,
      pageSize: p.pageSize,
      total: Number(count[0]?.total || 0),
    },
  };
}

export async function detail(resource: Resource, id: number) {
  const table = RESOURCE_TABLES[resource];
  const base = await rows<RowDataPacket[]>(
    `SELECT * FROM ${table} WHERE id=?${resource === PARTS_OF_SPEECH_RESOURCE || resource === IMPORTS_RESOURCE ? "" : " AND deleted_at IS NULL"}`,
    [id],
  );
  if (!base[0]) return null;
  if (resource === VOCABULARIES_RESOURCE) {
    const [
      pos,
      tags,
      collections,
      grammars,
      sentences,
      relations,
      events,
      tests,
    ] = await Promise.all([
      rows<RowDataPacket[]>(
        "SELECT p.* FROM parts_of_speech p JOIN vocabulary_parts_of_speech x ON x.part_of_speech_id=p.id WHERE x.vocabulary_id=? ORDER BY p.sort_order",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT t.* FROM tags t JOIN vocabulary_tags x ON x.tag_id=t.id WHERE x.vocabulary_id=? AND t.deleted_at IS NULL ORDER BY t.name",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT c.* FROM collections c JOIN collection_vocabularies cv ON cv.collection_id=c.id WHERE cv.vocabulary_id=? AND c.deleted_at IS NULL ORDER BY c.name",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT g.* FROM grammars g JOIN vocabulary_grammars x ON x.grammar_id=g.id WHERE x.vocabulary_id=? AND g.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT s.* FROM sentences s JOIN vocabulary_sentences x ON x.sentence_id=s.id WHERE x.vocabulary_id=? AND s.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT r.*,v.word,v.reading FROM vocabulary_relations r JOIN vocabularies v ON v.id=r.target_vocabulary_id WHERE r.source_vocabulary_id=? AND r.deleted_at IS NULL AND v.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT * FROM study_events WHERE entity_type='vocabulary' AND entity_id=? AND deleted_at IS NULL ORDER BY occurred_at DESC LIMIT 100",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT a.*,s.started_at FROM test_answers a JOIN test_sessions s ON s.id=a.session_id WHERE a.entity_type='vocabulary' AND a.entity_id=? ORDER BY a.answered_at DESC LIMIT 100",
        [id],
      ),
    ]);
    return {
      ...base[0],
      pos,
      tags,
      collections,
      grammars,
      sentences,
      relations,
      events,
      tests,
    };
  }
  if (resource === GRAMMARS_RESOURCE) {
    const [sentences, vocabularies, events, tests, tags] = await Promise.all([
      rows<RowDataPacket[]>(
        "SELECT s.* FROM sentences s JOIN grammar_sentences x ON x.sentence_id=s.id WHERE x.grammar_id=? AND s.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT v.* FROM vocabularies v JOIN vocabulary_grammars x ON x.vocabulary_id=v.id WHERE x.grammar_id=? AND v.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT * FROM study_events WHERE entity_type='grammar' AND entity_id=? AND deleted_at IS NULL ORDER BY occurred_at DESC",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT a.*,s.started_at FROM test_answers a JOIN test_sessions s ON s.id=a.session_id WHERE a.entity_type='grammar' AND a.entity_id=? ORDER BY a.answered_at DESC",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT t.* FROM tags t JOIN grammar_tags gt ON gt.tag_id=t.id WHERE gt.grammar_id=? AND t.deleted_at IS NULL",
        [id],
      ),
    ]);
    return { ...base[0], sentences, vocabularies, events, tests, tags };
  }
  if (resource === SENTENCES_RESOURCE) {
    const [grammars, vocabularies, tags] = await Promise.all([
      rows<RowDataPacket[]>(
        "SELECT g.* FROM grammars g JOIN grammar_sentences x ON x.grammar_id=g.id WHERE x.sentence_id=? AND g.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT v.* FROM vocabularies v JOIN vocabulary_sentences x ON x.vocabulary_id=v.id WHERE x.sentence_id=? AND v.deleted_at IS NULL",
        [id],
      ),
      rows<RowDataPacket[]>(
        "SELECT t.* FROM tags t JOIN sentence_tags st ON st.tag_id=t.id WHERE st.sentence_id=? AND t.deleted_at IS NULL",
        [id],
      ),
    ]);
    return { ...base[0], grammars, vocabularies, tags };
  }
  return base[0];
}

const RESOURCE_WRITABLE_FIELDS: Record<Resource, string[]> = {
  collections: ["name", "type", "source", "description", "is_default"],
  vocabularies: ["word", "reading", "translation", "notes"],
  grammars: ["pattern", "reading", "meaning", "notes"],
  sentences: ["japanese", "reading", "translation", "notes"],
  tags: ["name", "enabled"],
  "parts-of-speech": ["name", "sort_order", "enabled"],
  imports: ["word", "reading", "translation", "status"],
};
const TAG_RELATION_CONFIG = {
  vocabularies: { table: "vocabulary_tags", ownerColumn: "vocabulary_id" },
  grammars: { table: "grammar_tags", ownerColumn: "grammar_id" },
  sentences: { table: "sentence_tags", ownerColumn: "sentence_id" },
} as const;
export async function save(resource: Resource, body: Record<string, unknown>) {
  const table = RESOURCE_TABLES[resource],
    id = Number(body.id) || 0,
    fields = RESOURCE_WRITABLE_FIELDS[resource].filter(
      (field) => body[field] !== undefined,
    );
  if (!fields.length) throw new Error("没有可保存字段");
  const values = fields.map(
    (field) => body[field] as string | number | boolean | null,
  );
  if (id) {
    const sql: string = `UPDATE ${table} SET ${fields.map((field) => `${field}=?`).join(",")} WHERE id=?`;
    await db.execute(sql, [...values, id]);
    await syncMetadata(resource, id, body);
    return detail(resource, id);
  }
  const sql: string = `INSERT INTO ${table}(${fields.join(",")}) VALUES(${fields.map(() => "?").join(",")})`;
  const [result] = await db.execute<ResultSetHeader>(sql, values);
  await syncMetadata(resource, result.insertId, body);
  return detail(resource, result.insertId);
}
async function syncMetadata(
  resource: Resource,
  id: number,
  body: Record<string, unknown>,
) {
  await transaction(async (connection) => {
    if (resource === VOCABULARIES_RESOURCE && Array.isArray(body.posIds)) {
      await connection.execute(
        "DELETE FROM vocabulary_parts_of_speech WHERE vocabulary_id=?",
        [id],
      );
      for (const value of body.posIds)
        await connection.execute(
          "INSERT INTO vocabulary_parts_of_speech(vocabulary_id,part_of_speech_id) VALUES(?,?)",
          [id, value],
        );
    }
    if (
      resource === VOCABULARIES_RESOURCE &&
      Array.isArray(body.collectionIds)
    ) {
      await connection.execute(
        "DELETE FROM collection_vocabularies WHERE vocabulary_id=?",
        [id],
      );
      for (const value of body.collectionIds)
        await connection.execute(
          "INSERT INTO collection_vocabularies(collection_id,vocabulary_id) VALUES(?,?)",
          [value, id],
        );
    }
    if (
      KNOWLEDGE_RESOURCES.some((value) => value === resource) &&
      Array.isArray(body.tagIds)
    ) {
      const relation =
        TAG_RELATION_CONFIG[resource as keyof typeof TAG_RELATION_CONFIG];
      await connection.execute(
        `DELETE FROM ${relation.table} WHERE ${relation.ownerColumn}=?`,
        [id],
      );
      for (const value of body.tagIds)
        await connection.execute(
          `INSERT INTO ${relation.table}(${relation.ownerColumn},tag_id) VALUES(?,?)`,
          [id, value],
        );
    }
  });
}
export async function remove(resource: Resource, id: number) {
  if (resource === PARTS_OF_SPEECH_RESOURCE || resource === IMPORTS_RESOURCE)
    throw new Error("该资源不能删除");
  await db.execute(
    `UPDATE ${RESOURCE_TABLES[resource]} SET deleted_at=NOW(3) WHERE id=?`,
    [id],
  );
}
