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

const WORD_CORRECTIONS = new Map([
  ["过ち", "過ち"], ["过失", "過失"], ["发达", "発達"], ["对する", "対する"],
  ["发作", "発作"], ["类似", "類似"], ["ぶだぶだ", "ぶかぶか"],
]);

const BJT_MEANING_CORRECTIONS = new Map(Object.entries({
  "経過": "经过；进展", "迫る": "逼近；迫近", "厨房": "厨房", "器具": "器具；用具", "講師": "讲师",
  "追加": "追加；补充", "単独": "单独", "何分初めてのことなので、よろしくお願いします。": "毕竟是第一次，还请多多关照。",
  "外がなにやら騒がしい。": "外面不知为何很吵。", "新生活ではなにかとお金がかかる。": "开始新生活，各方面都要花钱。",
  "なにとぞご了承ください。": "敬请谅解。", "製品が良くないということではないが、今回は予算的に難しいので購入を見送りたい。": "并不是产品不好，只是这次预算上有困难，因此想暂缓购买。",
  "ご配慮ありがとうございます。": "感谢您的关照。", "解体": "拆解；解体", "調整": "调整", "搬入": "搬入；运入",
  "少しお時間をいただいてもよろしいでしょうか。": "可以占用您一点时间吗？", "どうぞ存分に。": "请尽情享用；请不要客气。",
  "商談": "商务洽谈", "返事": "答复；回信", "保留": "保留；暂缓", "完璧な部長でも、時折ミスすることがある。": "即使是完美的部长，偶尔也会犯错。",
  "いかにも、おっしゃるとおりです。": "确实如您所说。", "プロジェクトを最後まで見届ける。": "将项目跟进到最后。",
  "今回は見送らせていただきます。": "这次请允许我们暂缓处理。", "更なる解析が必要ではある。": "确实需要进一步分析。",
  "大企業が業界に参入する予定です。": "大型企业计划进入该行业。", "この度はお力添えを賜りありがとうございます。": "感谢您此次给予帮助。",
  "お口添えをいただきましてありがとうございます。": "感谢您从中美言。", "お取り込み中申し訳ありません。": "百忙之中打扰您，非常抱歉。",
  "折り返し電話をしてくれるように彼に頼んでおいた。": "我已经拜托他回电话。", "取り急ぎご返事申し上げます。": "先匆忙回复您。",
  "お気持ちだけいただけます。": "您的心意我领了。", "お気持ちだけで十分です。": "有您的心意就足够了。",
  "お初にお目にかかります。": "初次见面。", "~と申します。": "我叫……。", "この計画には無理がある。": "这个计划不太现实。",
  "被害": "损失；受害", "最小限": "最低限度", "今しばらくご猶予をいただけないか。": "能否请您再宽限一段时间？",
  "低下": "下降；降低", "扱い": "处理；待遇", "収益": "收益", "今期": "本期", "期末": "期末", "経費": "经费；费用",
  "役員会": "董事会；管理层会议", "新規投資額": "新增投资额", "成果": "成果", "施策": "措施；政策",
  "近視は一般に不可逆的な病態です。": "近视通常是一种不可逆的病理状态。", "私でよろしければ、対応いたします。": "如果由我来处理可以的话，我来负责。",
  "ご挨拶だけでもさせていただこうと思いまして。": "我想至少过来问候一下。", "~ていただけると助かります。": "如果您能……，那就帮大忙了。",
  "切りが良いところで声かけてください。": "请在方便告一段落时叫我。", "肯定": "肯定", "上期": "上半期", "下期": "下半期",
  "前期": "上期；前一期", "来期": "下一期", "実績": "实际业绩；成果", "昇格": "晋升；升级", "先発": "先发；首发",
  "後発": "后发；后续", "前列": "前排", "後列": "后排", "後方": "后方", "前方": "前方", "製造継続": "继续生产",
  "方針": "方针", "採算": "收益核算；盈亏", "販売": "销售", "動向": "动向；趋势", "短期": "短期", "中期": "中期",
  "中長期": "中长期", "現状": "现状", "水準": "水平；标准", "現状水準を維持する": "维持现有水平", "急激": "急剧",
  "上昇": "上升", "購買力": "购买力", "見積もりと開きがある": "与报价存在差距", "目算が狂う": "盘算落空；计划出错",
  "金利": "利息；利率", "外貨": "外币；外汇",
  "出資": "出资；投资", "上場企業": "上市企业", "リターン": "回报；收益", "配当": "分红；股息", "投資リスク": "投资风险",
  "伝言を承ります。": "我来记录您的留言。", "伝言をお預かりいたします。": "我来替您转达留言。", "ご伝言をお伺いいたします。": "请告诉我您的留言。",
  "大変申し訳ありませんが、明日までお時間をいただけないでしょうか。": "非常抱歉，能否请您宽限到明天？",
  "提出が一日遅れてもよろしいでしょうか。": "可以晚一天提交吗？", "提出が明日になってもよろしいでしょうか。": "可以明天提交吗？",
  "期日を伸ばしていただけないでしょうか。": "能否请您延长期限？", "お力を貸していただけませんか。": "能请您助我一臂之力吗？",
  "ご協力いただけませんか。": "能请您协助吗？", "お知恵をお借りできませんか。": "能请您提供一些建议吗？",
  "どうぞ、ごゆっくり。": "请慢慢享用；请别着急。", "どうぞごゆっくりお召し上がりください。": "请慢慢享用。",
  "存分に召し上がってください。": "请尽情享用。", "存分に楽しんでください。": "请尽情享受。",
  "私からの説明は以上です。": "我的说明到此结束。", "私からはこんなところです。": "我这边大致就是这些。",
  "概要はこのようなところです。": "概要大致如上。", "私の一存では決めかねますので...。": "仅凭我个人无法决定……。",
  "私だけでは判断いたしかねますので、上司と相談のうえ、改めてご連絡いたします。": "我个人无法判断，将与上司商量后再联系您。",
  "どうぞお気をつけていらしてください。": "请路上小心。", "どうぞお気をつけてお越しください。": "请一路小心前来。",
  "ご来店を心待ちにしています。": "期待您的光临。", "新商品の発売を心待ちにしています。": "期待新商品上市。",
  "ご来店を心よりお待ちしております。": "衷心期待您的光临。", "すそ野": "山麓；事物涉及的范围",
}).map(([word, meaning]) => [key(word), meaning]));

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
    .replace(/\s*[：:、]\s*$/u, "")
    .trim();
  const equals = /^(.+?)\s*=\s*(.+)$/u.exec(cleaned);
  if (equals) {
    cleaned = equals[1].trim();
    meaning = equals[2].trim();
  }
  cleaned = cleaned.replace(/[。．]\s*$/u, "").trim();
  if (!cleaned || !hasJapaneseText(cleaned) || hasSimplifiedChineseMarker(cleaned)) return null;
  const parsed = splitFinalReading(cleaned);
  cleaned = WORD_CORRECTIONS.get(parsed.word) ?? parsed.word;
  if (!cleaned || !hasJapaneseText(cleaned) || hasSimplifiedChineseMarker(cleaned)) return null;
  const englishSource = /^(.*?)[（(]([A-Za-z][A-Za-z -]*)[）)]$/u.exec(cleaned);
  if (englishSource) {
    cleaned = englishSource[1].trim();
    meaning = `${englishSource[2].trim()}；${meaning || ""}`.replace(/；$/u, "");
  }
  return {
    word: cleaned,
    reading: parsed.reading || null,
    meaning: normalize(meaning),
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
    if (commaParts.length > 1 && readableCount >= 1) {
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
        word: WORD_CORRECTIONS.get(parsed.word) ?? parsed.word,
        reading: parsed.reading || null,
        meaning: normalize(meaning),
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
    const id = `${candidate.category ?? ""}\u0000${key(candidate.word)}`;
    if (!id) continue;
    const existing = map.get(id);
    if (!existing) {
      map.set(id, { ...candidate, occurrences: [{ source: candidate.source, line: candidate.line, raw: candidate.raw }] });
      continue;
    }
    existing.occurrences.push({ source: candidate.source, line: candidate.line, raw: candidate.raw });
    if (!existing.reading && candidate.reading) existing.reading = candidate.reading;
    if (candidate.meaning && existing.meaning && !existing.meaning.includes(candidate.meaning)) {
      existing.meaning = `${existing.meaning}；${candidate.meaning}`;
    } else if (candidate.meaning && !existing.meaning) {
      existing.meaning = candidate.meaning;
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
    const originalWord = normalize(wordValue);
    const word = WORD_CORRECTIONS.get(originalWord) ?? originalWord;
    const reading = word === "ぶかぶか" && normalize(readingValue) === "ぶだぶだ"
      ? "ぶかぶか"
      : normalize(readingValue) || word;
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

function finalizeDatasets(bjtLoaded, n1Loaded) {
  const n1Meanings = new Map(
    n1Loaded.candidates
      .filter((item) => item.meaning)
      .map((item) => [key(item.word), cleanMarkup(item.meaning)]),
  );
  bjtLoaded.candidates = bjtLoaded.candidates.flatMap((item) => {
    if (item.word === "立ち位置(たちいち)・位置付け") {
      return [
        { ...item, word: "立ち位置", reading: "たちいち", meaning: "一个人在群体或社会关系中的定位" },
        { ...item, word: "位置付け", reading: "いちづけ", meaning: "定位；地位；位置的确定" },
      ];
    }
    let word = key(item.word);
    let reading = item.reading;
    let embeddedMeaning = "";
    if (word === "上場企業(じょうじょう~)") {
      word = "上場企業";
      reading = "じょうじょうきぎょう";
    }
    const embeddedEquals = /^(.+?)\s*=\s*(.+)$/u.exec(word);
    const embeddedWithReading = /^(.+?)[（(]([ぁ-ゖァ-ヺー～〜・\s]+)[）)]\s*[：:]\s*(.+)$/u.exec(word);
    const embeddedPlain = /^(.+?)\s*[：:]\s*(.+)$/u.exec(word);
    if (embeddedEquals) {
      word = key(embeddedEquals[1]);
      embeddedMeaning = embeddedEquals[2];
    } else if (embeddedWithReading) {
      word = key(embeddedWithReading[1]);
      reading = normalize(embeddedWithReading[2]).replace(/\s+/gu, "");
      embeddedMeaning = embeddedWithReading[3];
    } else if (embeddedPlain) {
      word = key(embeddedPlain[1]);
      embeddedMeaning = embeddedPlain[2];
    }
    const correctedMeaning = BJT_MEANING_CORRECTIONS.get(key(word))
      || n1Meanings.get(key(word))
      || normalize(embeddedMeaning)
      || cleanMarkup(item.meaning);
    const isPhrase = /[。！？!?]/u.test(word)
      || word.length > 10
      || /[をにがはへとの]\S/u.test(word);
    return [{
      ...item,
      word,
      reading: isPhrase ? null : reading,
      meaning: normalize(correctedMeaning),
    }];
  });
  bjtLoaded.candidates = deduplicate(bjtLoaded.candidates);
  const invalid = [...bjtLoaded.candidates, ...n1Loaded.candidates].filter(
    (item) => !item.word
      || !item.meaning
      || /来源原文|来源行|<[^>]+>|\*\*/u.test(item.word + item.meaning)
      || /[=:：]\s*(?:汇款|本金|利率|跟报价|盘算)/u.test(item.word),
  );
  if (invalid.length) {
    throw new Error(`Clean-data validation failed:\n${JSON.stringify(invalid.slice(0, 30), null, 2)}`);
  }
  return { bjtLoaded, n1Loaded };
}

async function rebuildVocabulary(bjtLoaded, n1Loaded) {
  const db = await getDb();
  const categoryOrder = new Map();
  const vocabularyIds = new Map();
  const inserted = [];
  const linked = [];
  let transactionStarted = false;
  try {
    await db.query(`
      ALTER TABLE vocabulary
        MODIFY reading VARCHAR(255) NULL COMMENT '假名读音；固定搭配或完整句子可为空',
        MODIFY word VARCHAR(255) NOT NULL COMMENT '日语词汇、固定搭配或完整句子',
        MODIFY meaning TEXT NOT NULL COMMENT '中文释义',
        MODIFY part_of_speech VARCHAR(50) NOT NULL DEFAULT '' COMMENT '词性或条目类型',
        MODIFY familiarity VARCHAR(40) NOT NULL DEFAULT '' COMMENT '原始资料中的熟悉度或来源标记'
    `);
    const [linkColumns] = await db.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='vocabulary_category_links'`,
    );
    const existingColumns = new Set(linkColumns.map((row) => row.COLUMN_NAME));
    if (!existingColumns.has("sort_order")) {
      await db.query("ALTER TABLE vocabulary_category_links ADD sort_order INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '词汇在该类别内的来源顺序' AFTER category_id");
    }
    if (!existingColumns.has("source_file")) {
      await db.query("ALTER TABLE vocabulary_category_links ADD source_file VARCHAR(255) NULL COMMENT '词汇来源文件名' AFTER sort_order");
    }
    if (!existingColumns.has("source_line")) {
      await db.query("ALTER TABLE vocabulary_category_links ADD source_line INT UNSIGNED NULL COMMENT '词汇在来源文件中的行号' AFTER source_file");
    }
    await db.query("ALTER TABLE vocabulary_category_links MODIFY vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '关联 vocabulary.id', MODIFY category_id BIGINT UNSIGNED NOT NULL COMMENT '关联 categories.id', MODIFY sort_order INT UNSIGNED NOT NULL COMMENT '词汇在该类别内的来源顺序', MODIFY source_file VARCHAR(255) NULL COMMENT '词汇来源文件名', MODIFY source_line INT UNSIGNED NULL COMMENT '词汇在来源文件中的行号'");

    const [categoryRows] = await db.query(
      "SELECT id,name FROM categories WHERE name IN ('BJT','BJT-外来语','N1')",
    );
    const categoryIds = new Map(categoryRows.map((row) => [row.name, Number(row.id)]));
    for (const name of ["BJT", "BJT-外来语", "N1"]) {
      if (!categoryIds.has(name)) throw new Error(`Required category is missing: ${name}`);
    }

    const ordered = [...bjtLoaded.candidates, ...n1Loaded.candidates];
    for (const candidate of ordered) {
      const wordKey = key(candidate.word);
      let vocabularyId = vocabularyIds.get(wordKey);
      if (!vocabularyId) {
        vocabularyId = inserted.length + 1;
        vocabularyIds.set(wordKey, vocabularyId);
        inserted.push({
          id: vocabularyId,
          word: candidate.word,
          reading: candidate.reading || null,
          meaning: candidate.meaning,
          partOfSpeech: candidate.partOfSpeech
            || (/[。！？!?]/u.test(candidate.word) ? "句子" : candidate.reading ? "词汇" : "固定搭配"),
          familiarity: candidate.familiarity || `来源:${candidate.source}`,
        });
      }
      const sortOrder = (categoryOrder.get(candidate.category) ?? 0) + 1;
      categoryOrder.set(candidate.category, sortOrder);
      linked.push({
        vocabularyId,
        categoryId: categoryIds.get(candidate.category),
        sortOrder,
        sourceFile: candidate.source,
        sourceLine: candidate.line,
      });
    }

    await db.beginTransaction();
    transactionStarted = true;
    await db.query("DELETE FROM vocabulary_favorites");
    await db.query("DELETE FROM favorite_groups");
    await db.query("DELETE FROM learning_progress");
    await db.query("DELETE FROM vocabulary_category_links");
    await db.query("DELETE FROM vocabulary");

    const writeBatchSize = 30;
    for (let index = 0; index < inserted.length; index += writeBatchSize) {
      const batch = inserted.slice(index, index + writeBatchSize);
      await db.query(
        `INSERT INTO vocabulary
          (id,word,reading,meaning,part_of_speech,familiarity) VALUES ?`,
        [batch.map((item) => [
          item.id, item.word, item.reading, item.meaning, item.partOfSpeech, item.familiarity,
        ])],
      );
    }
    for (let index = 0; index < linked.length; index += writeBatchSize) {
      const batch = linked.slice(index, index + writeBatchSize);
      await db.query(
        `INSERT INTO vocabulary_category_links
          (vocabulary_id,category_id,sort_order,source_file,source_line) VALUES ?`,
        [batch.map((item) => [
          item.vocabularyId, item.categoryId, item.sortOrder, item.sourceFile, item.sourceLine,
        ])],
      );
    }
    await db.commit();
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
  return {
    insertedVocabulary: inserted.length,
    categoryLinks: linked.length,
    categoryCounts: Object.fromEntries(categoryOrder),
    cleared: ["vocabulary_favorites", "favorite_groups", "learning_progress"],
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

if (mode === "preview-rebuild" || mode === "rebuild") {
  const finalized = finalizeDatasets(await loadBjtCandidates(), await loadN1Candidates());
  const preview = {
    bjtRawCounts: finalized.bjtLoaded.rawCounts,
    n1RawCounts: finalized.n1Loaded.rawCounts,
    uniqueBjtLinks: finalized.bjtLoaded.candidates.filter((item) => item.category === "BJT").length,
    uniqueLoanwordLinks: finalized.bjtLoaded.candidates.filter((item) => item.category === "BJT-外来语").length,
    uniqueN1Links: finalized.n1Loaded.candidates.length,
    nullReadings: [...finalized.bjtLoaded.candidates, ...finalized.n1Loaded.candidates]
      .filter((item) => !item.reading).length,
  };
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(
    path.join(reportDir, "rebuild-preview.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      ...preview,
      bjtCandidates: finalized.bjtLoaded.candidates,
      n1Candidates: finalized.n1Loaded.candidates,
    }, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(preview, null, 2));
  if (mode === "rebuild") {
    const result = await rebuildVocabulary(finalized.bjtLoaded, finalized.n1Loaded);
    await fs.writeFile(
      path.join(reportDir, "rebuild-result.json"),
      JSON.stringify({ rebuiltAt: new Date().toISOString(), ...result }, null, 2),
      "utf8",
    );
    console.log(JSON.stringify(result, null, 2));
  }
} else if (mode === "audit-bjt" || mode === "import-bjt") {
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
