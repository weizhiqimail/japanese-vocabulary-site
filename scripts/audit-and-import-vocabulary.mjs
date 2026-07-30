// Audits source coverage before importing and verifies the database after every import.
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const mode = process.argv[2] ?? "audit-bjt";
const root = process.cwd();
const sourceDir = path.join(root, "files", "vocabulary");
const reportDir = path.join(root, "work", "vocabulary-import-audit");
const hasJapanese = (value) => /[ぁ-ゖァ-ヺー]/u.test(value);
const hasJapaneseText = (value) => /[\p{Script=Han}ぁ-ゖァ-ヺー]/u.test(value);
const hasSimplifiedChineseMarker = (value) => /[这边为说经语时类还让从对个将门发关无过产应总实]/u.test(value);
const normalize = (value) => String(value ?? "")
  .normalize("NFKC")
  .replace(/\s+/gu, " ")
  .trim();
const key = (value) => normalize(value)
  .replace(/[「」『』【】]/gu, "")
  .replace(/[。．.!！?？]+$/gu, "")
  .trim();

function cleanMarkup(value) {
  return String(value)
    .replace(/<[^>]+>/gu, "")
    .replace(/\*\*/gu, "")
    .replace(/^[+\-*]\s+/u, "")
    .replace(/^\d+[.)、]\s*/u, "")
    .replace(/-\s+/gu, "")
    .replace(/\u00a0/gu, " ")
    .trim();
}

function splitFinalReading(value) {
  const text = normalize(value);
  if (!text.endsWith("）") && !text.endsWith(")")) return { word: text, reading: "" };
  const close = text.length - 1;
  let depth = 0;
  for (let index = close; index >= 0; index -= 1) {
    const char = text[index];
    if (char === "）" || char === ")") depth += 1;
    if (char === "（" || char === "(") {
      depth -= 1;
      if (depth === 0) {
        const possible = text.slice(index + 1, close).trim();
        if (/^[ぁ-ゖァ-ヺー～〜・\s]+$/u.test(possible)) {
          return { word: text.slice(0, index).trim(), reading: possible.replace(/\s+/gu, "") };
        }
        return { word: text, reading: "" };
      }
    }
  }
  return { word: text, reading: "" };
}

function candidateFrom(text, meaning, metadata) {
  let cleaned = cleanMarkup(text)
    .replace(/^[：:]\s*/u, "")
    .replace(/\s*[：:]\s*$/u, "")
    .trim();
  if (!cleaned || !hasJapaneseText(cleaned) || hasSimplifiedChineseMarker(cleaned)) return null;
  const parsed = splitFinalReading(cleaned);
  cleaned = parsed.word;
  if (!cleaned || !hasJapaneseText(cleaned) || hasSimplifiedChineseMarker(cleaned)) return null;
  const englishSource = /^(.*?)[（(]([A-Za-z][A-Za-z -]*)[）)]$/u.exec(cleaned);
  if (englishSource) {
    cleaned = englishSource[1].trim();
    meaning = `${englishSource[2].trim()}；${meaning || ""}`.replace(/；$/u, "");
  }
  return {
    word: cleaned,
    reading: parsed.reading || cleaned,
    meaning: normalize(meaning) || `来源原文：${normalize(metadata.raw)}`,
    source: metadata.source,
    line: metadata.line,
    raw: normalize(metadata.raw),
  };
}

function japaneseSegments(value) {
  const text = cleanMarkup(value);
  const sentenceParts = text.split(/(?<=[。！？!?])\s*/u);
  const result = [];
  for (const sentence of sentenceParts) {
    const trimmed = sentence.trim();
    if (!hasJapanese(trimmed) || hasSimplifiedChineseMarker(trimmed)) continue;
    const commaParts = trimmed.split(/[、；;]/u).map((item) => item.trim()).filter(Boolean);
    const readableCount = commaParts.filter((item) => /[（(][ぁ-ゖァ-ヺー～〜・\s]+[）)]$/u.test(item)).length;
    if (commaParts.length > 1 && (readableCount >= 2 || (commaParts.length >= 3 && trimmed.length < 100))) {
      result.push(...commaParts.filter(hasJapanese));
    } else {
      result.push(trimmed);
    }
  }
  return result;
}

function parseSummaryLine(raw, line) {
  const cleaned = cleanMarkup(raw);
  if (!cleaned || !hasJapanese(cleaned)) return [];
  const metadata = { source: "BJTSummary.md", line, raw };
  const quoted = [...cleaned.matchAll(/[「『“"]([^」』”"]*[ぁ-ゖァ-ヺー][^」』”"]*)[」』”"]/gu)]
    .map((match) => candidateFrom(match[1], cleaned, metadata))
    .filter(Boolean);
  for (const match of cleaned.matchAll(/[「『“"]([^」』”"]+)[」』”"][（(]([ぁ-ゖァ-ヺー～〜・\s]+)[）)]/gu)) {
    const item = candidateFrom(`${match[1]}(${match[2]})`, cleaned, metadata);
    if (item) quoted.push(item);
  }
  const chineseExplanation = /^(.+?[ぁ-ゖァ-ヺー].*?)\s+是(?:固定|用于|表示|指)/u.exec(cleaned);
  if (chineseExplanation) {
    const item = candidateFrom(chineseExplanation[1], cleaned, metadata);
    if (item) quoted.push(item);
  }
  if (quoted.length && /[「『“"]/.test(cleaned)) return quoted;
  const colonIndex = cleaned.search(/[：:]/u);
  const candidates = [...quoted];
  if (colonIndex >= 0) {
    const left = cleaned.slice(0, colonIndex).trim();
    const right = cleaned.slice(colonIndex + 1).trim();
    if (hasJapanese(left)) {
      for (const segment of japaneseSegments(left)) {
        const item = candidateFrom(segment, right, metadata);
        if (item) candidates.push(item);
      }
      // Some summary lines contain additional Japanese vocabulary or sentences after the first colon.
      for (const segment of japaneseSegments(right)) {
        const item = candidateFrom(segment, cleaned, metadata);
        if (item) candidates.push(item);
      }
    } else {
      for (const segment of japaneseSegments(right)) {
        const item = candidateFrom(segment, left, metadata);
        if (item) candidates.push(item);
      }
    }
  } else {
    for (const segment of japaneseSegments(cleaned)) {
      const item = candidateFrom(segment, "", metadata);
      if (item) candidates.push(item);
    }
  }
  return candidates;
}

function parseTabbedDictionary(text, source, category, extractReading = true) {
  const candidates = [];
  const lines = text.split(/\r?\n/u);
  lines.forEach((raw, lineIndex) => {
    raw.split("\t").forEach((cell) => {
      const cleaned = cleanMarkup(cell);
      if (!cleaned) return;
      const colon = cleaned.search(/[：:]/u);
      const head = colon >= 0 ? cleaned.slice(0, colon) : cleaned;
      const meaning = colon >= 0 ? cleaned.slice(colon + 1) : "";
      const metadata = { source, line: lineIndex + 1, raw: cell };
      const parsed = extractReading ? splitFinalReading(head) : { word: normalize(head), reading: "" };
      const item = {
        word: parsed.word,
        reading: parsed.reading || parsed.word,
        meaning: normalize(meaning) || `来源原文：${normalize(cell)}`,
        source,
        line: lineIndex + 1,
        raw: normalize(cell),
        category,
      };
      if (item.word) candidates.push(item);
    });
  });
  return candidates;
}

function deduplicate(candidates) {
  const map = new Map();
  for (const candidate of candidates) {
    const id = key(candidate.word);
    if (!id) continue;
    const existing = map.get(id);
    if (!existing) {
      map.set(id, { ...candidate, occurrences: [{ source: candidate.source, line: candidate.line, raw: candidate.raw }] });
      continue;
    }
    existing.occurrences.push({ source: candidate.source, line: candidate.line, raw: candidate.raw });
    if (existing.reading === existing.word && candidate.reading !== candidate.word) existing.reading = candidate.reading;
    if (candidate.meaning && !existing.meaning.includes(candidate.meaning)) {
      existing.meaning = `${existing.meaning}；${candidate.meaning}`;
    }
    if (candidate.category === "BJT-外来语") existing.category = "BJT-外来语";
  }
  return [...map.values()];
}

async function loadBjtCandidates() {
  const [summary, bjt, loanwords] = await Promise.all([
    fs.readFile(path.join(sourceDir, "BJTSummary.md"), "utf8"),
    fs.readFile(path.join(sourceDir, "BJT-词汇.txt"), "utf8"),
    fs.readFile(path.join(sourceDir, "BJT-外来语.txt"), "utf8"),
  ]);
  const summaryCandidates = [];
  const uncovered = [];
  summary.split(/\r?\n/u).forEach((raw, index) => {
    const parsed = parseSummaryLine(raw, index + 1).map((item) => ({ ...item, category: "BJT" }));
    if (cleanMarkup(raw) && hasJapanese(cleanMarkup(raw)) && parsed.length === 0) {
      uncovered.push({ line: index + 1, raw });
    }
    summaryCandidates.push(...parsed);
  });
  const direct = parseTabbedDictionary(bjt, "BJT-词汇.txt", "BJT");
  const external = parseTabbedDictionary(loanwords, "BJT-外来语.txt", "BJT-外来语", false);
  return {
    candidates: deduplicate([...summaryCandidates, ...direct, ...external]),
    rawCounts: {
      summaryLinesWithJapanese: summary.split(/\r?\n/u).filter((line) => cleanMarkup(line) && hasJapanese(cleanMarkup(line))).length,
      summaryCandidates: summaryCandidates.length,
      bjtDictionaryCandidates: direct.length,
      loanwordCandidates: external.length,
    },
    uncovered,
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/u, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/u, ""));
    rows.push(row);
  }
  return rows;
}

async function loadN1Candidates() {
  const text = (await fs.readFile(path.join(sourceDir, "N1-词汇.csv"), "utf8")).replace(/^\uFEFF/u, "");
  const rows = parseCsv(text);
  const header = rows[0].map(normalize);
  const expected = ["序号", "日语词汇", "假名", "词性", "陌生程度", "翻译"];
  if (!expected.every((name, index) => header[index] === name)) {
    throw new Error(`Unexpected N1 CSV header: ${JSON.stringify(header)}`);
  }
  const candidates = [];
  const uncovered = [];
  let nonEmptyRows = 0;
  let skippedTemplateRows = 0;
  rows.slice(1).forEach((row, index) => {
    if (!row.some((cell) => normalize(cell))) return;
    nonEmptyRows += 1;
    const sourceLine = index + 2;
    const [sequence, wordValue, readingValue, partOfSpeech, familiarity, meaningValue, ...extra] = row;
    const word = normalize(wordValue);
    const reading = normalize(readingValue) || word;
    const primaryMeaning = normalize(meaningValue);
    const extraMeaning = extra.map(normalize).filter(Boolean).join("；");
    if (!word) {
      const meaningfulWithoutDefaultFamiliarity = [
        sequence,
        readingValue,
        partOfSpeech,
        meaningValue,
        ...extra,
      ].some((cell) => normalize(cell));
      if (!meaningfulWithoutDefaultFamiliarity && normalize(familiarity) === "9") {
        skippedTemplateRows += 1;
      } else {
        uncovered.push({ line: sourceLine, raw: row });
      }
      return;
    }
    candidates.push({
      word,
      reading,
      meaning: [primaryMeaning, extraMeaning].filter(Boolean).join("；补充：") || `来源行：${sourceLine}`,
      partOfSpeech: normalize(partOfSpeech),
      familiarity: normalize(familiarity),
      sequence: normalize(sequence),
      source: "N1-词汇.csv",
      line: sourceLine,
      raw: row.map(normalize).join(" | "),
      category: "N1",
    });
  });
  return {
    candidates: deduplicate(candidates),
    rawCounts: {
      csvRows: rows.length,
      nonEmptyDataRows: nonEmptyRows,
      parsedCandidates: candidates.length,
      skippedTemplateRows,
      columns: Math.max(...rows.map((row) => row.length)),
    },
    uncovered,
  };
}

async function getDb() {
  const url = new URL(process.env.DATABASE_URL);
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

async function compareWithDb(candidates) {
  const db = await getDb();
  try {
    const [rows] = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning,
              GROUP_CONCAT(c.name ORDER BY c.id SEPARATOR '|||') categories
       FROM vocabulary v
       LEFT JOIN vocabulary_category_links l ON l.vocabulary_id=v.id
       LEFT JOIN categories c ON c.id=l.category_id
       GROUP BY v.id,v.word,v.reading,v.meaning`,
    );
    const byWord = new Map();
    for (const row of rows) {
      const wordKey = key(row.word);
      if (!byWord.has(wordKey)) byWord.set(wordKey, []);
      byWord.get(wordKey).push({
        ...row,
        categories: String(row.categories ?? "").split("|||").filter(Boolean),
      });
    }
    const missing = [];
    const existing = [];
    const needsCategory = [];
    for (const candidate of candidates) {
      const matches = byWord.get(key(candidate.word)) ?? [];
      if (!matches.length) {
        missing.push(candidate);
        continue;
      }
      existing.push({ candidate, matches });
      const target = candidate.category;
      if (!matches.some((match) => match.categories.includes(target))) {
        needsCategory.push({ candidate, matches });
      }
    }
    return { missing, existing, needsCategory, databaseCount: rows.length };
  } finally {
    await db.end();
  }
}

async function writeAudit(name, loaded, comparison) {
  await fs.mkdir(reportDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    mode: name,
    rawCounts: loaded.rawCounts,
    uncovered: loaded.uncovered,
    uniqueCandidates: loaded.candidates.length,
    databaseCount: comparison.databaseCount,
    existingCount: comparison.existing.length,
    missingCount: comparison.missing.length,
    needsCategoryCount: comparison.needsCategory.length,
    candidates: loaded.candidates,
    missing: comparison.missing,
    needsCategory: comparison.needsCategory,
  };
  await fs.writeFile(path.join(reportDir, `${name}.json`), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    report: path.join(reportDir, `${name}.json`),
    rawCounts: report.rawCounts,
    uncoveredCount: report.uncovered.length,
    uniqueCandidates: report.uniqueCandidates,
    databaseCount: report.databaseCount,
    existingCount: report.existingCount,
    missingCount: report.missingCount,
    needsCategoryCount: report.needsCategoryCount,
  }, null, 2));
  console.log("MISSING_SAMPLE");
  console.log(JSON.stringify(comparison.missing.slice(0, 30), null, 2));
}

async function importBjt(loaded, comparison) {
  const db = await getDb();
  const inserted = [];
  let linkedExisting = 0;
  await db.beginTransaction();
  try {
    const [categoryRows] = await db.query(
      "SELECT id,name FROM categories WHERE name IN ('BJT','BJT-外来语') AND enabled=1",
    );
    const categoryIds = new Map(categoryRows.map((row) => [row.name, Number(row.id)]));
    if (!categoryIds.get("BJT") || !categoryIds.get("BJT-外来语")) {
      throw new Error("Required BJT categories are missing or disabled");
    }
    for (const candidate of comparison.missing) {
      const entryType = /[。！？!?]/u.test(candidate.word)
        ? "句子"
        : candidate.word.length > 8 || /[をにがはへとの]/u.test(candidate.word)
          ? "固定搭配"
          : "词汇";
      const [result] = await db.execute(
        `INSERT INTO vocabulary
          (word,reading,meaning,part_of_speech,familiarity)
         VALUES (?,?,?,?,?)`,
        [
          candidate.word,
          candidate.reading,
          candidate.meaning,
          entryType,
          `来源:${candidate.source}`.slice(0, 40),
        ],
      );
      const vocabularyId = Number(result.insertId);
      await db.execute(
        "INSERT INTO vocabulary_category_links (vocabulary_id,category_id) VALUES (?,?)",
        [vocabularyId, categoryIds.get(candidate.category)],
      );
      inserted.push({
        id: vocabularyId,
        word: candidate.word,
        category: candidate.category,
        source: candidate.source,
        line: candidate.line,
      });
    }
    for (const item of comparison.needsCategory) {
      const exactReading = item.matches.find(
        (match) => normalize(match.reading) === normalize(item.candidate.reading),
      );
      const target = exactReading ?? item.matches[0];
      const [result] = await db.execute(
        "INSERT IGNORE INTO vocabulary_category_links (vocabulary_id,category_id) VALUES (?,?)",
        [target.id, categoryIds.get(item.candidate.category)],
      );
      linkedExisting += Number(result.affectedRows);
    }
    if (inserted.length !== comparison.missing.length) {
      throw new Error(`Expected ${comparison.missing.length} inserts, created ${inserted.length}`);
    }
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(
    path.join(reportDir, "bjt-imported.json"),
    JSON.stringify({ importedAt: new Date().toISOString(), inserted, linkedExisting }, null, 2),
    "utf8",
  );
  return { inserted: inserted.length, linkedExisting };
}

async function importN1(loaded, comparison) {
  const db = await getDb();
  const inserted = [];
  let linkedExisting = 0;
  await db.beginTransaction();
  try {
    const [categoryRows] = await db.query(
      "SELECT id FROM categories WHERE name='N1' AND enabled=1 LIMIT 1",
    );
    const categoryId = Number(categoryRows[0]?.id);
    if (!categoryId) throw new Error("N1 category is missing or disabled");
    for (const candidate of comparison.missing) {
      const [result] = await db.execute(
        `INSERT INTO vocabulary
          (word,reading,meaning,part_of_speech,familiarity)
         VALUES (?,?,?,?,?)`,
        [
          candidate.word,
          candidate.reading,
          candidate.meaning,
          candidate.partOfSpeech || "",
          candidate.familiarity || "",
        ],
      );
      const vocabularyId = Number(result.insertId);
      await db.execute(
        "INSERT INTO vocabulary_category_links (vocabulary_id,category_id) VALUES (?,?)",
        [vocabularyId, categoryId],
      );
      inserted.push({
        id: vocabularyId,
        word: candidate.word,
        source: candidate.source,
        line: candidate.line,
        sequence: candidate.sequence,
      });
    }
    for (const item of comparison.needsCategory) {
      const exactReading = item.matches.find(
        (match) => normalize(match.reading) === normalize(item.candidate.reading),
      );
      const target = exactReading ?? item.matches[0];
      const [result] = await db.execute(
        "INSERT IGNORE INTO vocabulary_category_links (vocabulary_id,category_id) VALUES (?,?)",
        [target.id, categoryId],
      );
      linkedExisting += Number(result.affectedRows);
    }
    if (inserted.length !== comparison.missing.length) {
      throw new Error(`Expected ${comparison.missing.length} inserts, created ${inserted.length}`);
    }
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(
    path.join(reportDir, "n1-imported.json"),
    JSON.stringify({ importedAt: new Date().toISOString(), inserted, linkedExisting }, null, 2),
    "utf8",
  );
  return { inserted: inserted.length, linkedExisting };
}

if (mode === "audit-bjt" || mode === "import-bjt") {
  const loaded = await loadBjtCandidates();
  if (loaded.uncovered.length) {
    console.error(JSON.stringify(loaded.uncovered, null, 2));
    throw new Error(`Parser left ${loaded.uncovered.length} Japanese source lines uncovered`);
  }
  const comparison = await compareWithDb(loaded.candidates);
  await writeAudit("bjt-audit", loaded, comparison);
  if (mode === "import-bjt") {
    const result = await importBjt(loaded, comparison);
    const verification = await compareWithDb(loaded.candidates);
    await writeAudit("bjt-after-import", loaded, verification);
    if (verification.missing.length || verification.needsCategory.length) {
      throw new Error(
        `BJT verification failed: ${verification.missing.length} missing, ${verification.needsCategory.length} missing categories`,
      );
    }
    console.log("IMPORT_RESULT");
    console.log(JSON.stringify({
      ...result,
      verifiedCandidates: loaded.candidates.length,
      missingAfterImport: verification.missing.length,
      needsCategoryAfterImport: verification.needsCategory.length,
    }, null, 2));
  }
} else if (mode === "audit-n1" || mode === "import-n1") {
  const loaded = await loadN1Candidates();
  if (loaded.uncovered.length) {
    console.error(JSON.stringify(loaded.uncovered, null, 2));
    throw new Error(`N1 parser left ${loaded.uncovered.length} non-empty source rows uncovered`);
  }
  const comparison = await compareWithDb(loaded.candidates);
  await writeAudit("n1-audit", loaded, comparison);
  if (mode === "import-n1") {
    const result = await importN1(loaded, comparison);
    const verification = await compareWithDb(loaded.candidates);
    await writeAudit("n1-after-import", loaded, verification);
    if (verification.missing.length || verification.needsCategory.length) {
      throw new Error(
        `N1 verification failed: ${verification.missing.length} missing, ${verification.needsCategory.length} missing categories`,
      );
    }
    console.log("IMPORT_RESULT");
    console.log(JSON.stringify({
      ...result,
      verifiedCandidates: loaded.candidates.length,
      missingAfterImport: verification.missing.length,
      needsCategoryAfterImport: verification.needsCategory.length,
    }, null, 2));
  }
} else {
  throw new Error(`Unsupported mode: ${mode}`);
}
