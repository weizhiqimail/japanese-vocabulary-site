import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const backendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const valueOf = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const sourcePath =
  valueOf('--file') ||
  args.find((argument) => argument.toLowerCase().endsWith('.json'));
if (!sourcePath) throw new Error('必须通过 --file 指定三语题库 JSON');
const providerCode = valueOf('--group', 'AWS').toUpperCase();
const subgroupCode = valueOf('--subgroup', 'CLF').toUpperCase();
const bankCode = valueOf('--bank', 'CLF-C02').toUpperCase();
const dryRun = args.includes('--dry-run');

const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter(
        (line) =>
          line && !line.trimStart().startsWith('#') && line.includes('='),
      )
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
const envPath = path.join(
  backendRoot,
  `.env.${process.env.NODE_ENV || 'local'}`,
);
const env = { ...parseEnv(await readFile(envPath, 'utf8')), ...process.env };
const databaseConfig = (source) => {
  if (!source.DATABASE_URL)
    return {
      host: source.DB_HOST,
      port: Number(source.DB_PORT),
      user: source.DB_USER,
      password: source.DB_PASSWORD,
      database: source.DB_NAME,
    };
  const url = new URL(source.DATABASE_URL);
  const sslMode =
    url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode');
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    ...(sslMode && sslMode.toLowerCase() !== 'disabled' ? { ssl: {} } : {}),
  };
};

const raw = await readFile(path.resolve(sourcePath));
const payload = JSON.parse(raw.toString('utf8'));
const languages = ['en', 'zh', 'ja'];
const localized = (value) => {
  if (typeof value === 'string')
    return value.trim() ? { en: value.trim() } : {};
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    languages
      .filter(
        (language) =>
          typeof value[language] === 'string' && value[language].trim(),
      )
      .map((language) => [language, value[language].trim()]),
  );
};
const errors = [];
if (!Array.isArray(payload.questions)) errors.push('questions 必须为数组');
if (payload.total_questions !== payload.questions?.length)
  errors.push('total_questions 与实际题数不一致');
const ids = new Set();
let singleCount = 0;
let multipleCount = 0;
for (const [index, question] of (payload.questions || []).entries()) {
  const location = `questions[${index}]`;
  if (!Number.isInteger(question.id) || question.id < 1 || ids.has(question.id))
    errors.push(`${location}.id 非法或重复`);
  ids.add(question.id);
  if (!Object.keys(localized(question.question)).length)
    errors.push(`${location}.question 至少需要一种语言`);
  if (!Array.isArray(question.option_order) || question.option_order.length < 2)
    errors.push(`${location}.option_order 非法`);
  const answer = String(question.answer_review?.reviewed_answer || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const answerKeys = [...new Set(answer.split(''))];
  if (
    !answerKeys.length ||
    answerKeys.some((key) => !question.option_order?.includes(key))
  )
    errors.push(`${location}.answer_review.reviewed_answer 非法`);
  for (const key of question.option_order || [])
    if (!Object.keys(localized(question.options?.[key])).length)
      errors.push(`${location}.options.${key} 至少需要一种语言`);
  if (answerKeys.length === 1) singleCount += 1;
  else multipleCount += 1;
}
if (errors.length)
  throw new Error(
    `题库校验失败（${errors.length} 项）：\n${errors.slice(0, 30).join('\n')}`,
  );
const summary = {
  total: payload.questions.length,
  singleChoice: singleCount,
  multipleChoice: multipleCount,
  communityConflicts: payload.questions.filter(
    (q) => q.answer_review?.community_conflict,
  ).length,
};
if (dryRun) {
  console.log(
    JSON.stringify(
      { valid: true, providerCode, subgroupCode, bankCode, ...summary },
      null,
      2,
    ),
  );
  process.exit(0);
}

const connection = await mysql.createConnection({
  ...databaseConfig(env),
  multipleStatements: true,
  connectTimeout: Number(env.DB_CONNECT_TIMEOUT_MS || 5000),
});
const json = (value) => JSON.stringify(value ?? null);
const hash = (value) =>
  createHash('sha256')
    .update(
      typeof value === 'string' || Buffer.isBuffer(value)
        ? value
        : JSON.stringify(value),
    )
    .digest('hex');
try {
  await connection.beginTransaction();
  const ensureGroup = async (parentId, code, name, level) => {
    const [rows] = await connection.execute(
      'SELECT id FROM question_groups WHERE parent_id <=> ? AND code=? AND deleted_at IS NULL LIMIT 1',
      [parentId, code],
    );
    if (rows[0]) return rows[0].id;
    const [result] = await connection.execute(
      'INSERT INTO question_groups(parent_id,code,name,group_level,sort_order) VALUES(?,?,?,?,?)',
      [parentId, code, name, level, level === 'provider' ? 10 : 20],
    );
    return result.insertId;
  };
  const providerId = await ensureGroup(
    null,
    providerCode,
    providerCode,
    'provider',
  );
  const subgroupId = await ensureGroup(
    providerId,
    subgroupCode,
    subgroupCode,
    'certification',
  );
  await connection.execute(
    `INSERT INTO question_banks(group_id,code,name,description,source,content_version,supported_languages,default_language,question_count,enabled)
    VALUES(?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE group_id=VALUES(group_id),name=VALUES(name),description=VALUES(description),source=VALUES(source),content_version=VALUES(content_version),supported_languages=VALUES(supported_languages),question_count=VALUES(question_count),enabled=1,deleted_at=NULL`,
    [
      subgroupId,
      bankCode.toLowerCase(),
      payload.exam,
      'AWS CLF-C02 中英日三语固定题库',
      path.basename(sourcePath),
      String(payload.generated_at || 'source'),
      json(payload.languages || languages),
      'zh',
      payload.questions.length,
    ],
  );
  const [banks] = await connection.execute(
    'SELECT id FROM question_banks WHERE code=? LIMIT 1',
    [bankCode.toLowerCase()],
  );
  const bankId = banks[0].id;
  for (const question of payload.questions) {
    const answerKeys = [
      ...new Set(
        String(question.answer_review.reviewed_answer)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .split(''),
      ),
    ].sort();
    const questionType =
      answerKeys.length === 1 ? 'single_choice' : 'multiple_choice';
    const questionTexts = localized(question.question);
    const rationaleTexts = localized(question.answer_review.rationale);
    const sourceExplanationTexts = localized(question.source_explanation);
    const normalizedOptions = Object.fromEntries(
      question.option_order.map((key) => [
        key,
        localized(question.options[key]),
      ]),
    );
    const contentHash = hash({
      question: questionTexts,
      options: normalizedOptions,
      optionOrder: question.option_order,
      answerKeys,
      rationale: rationaleTexts,
      sourceExplanation: sourceExplanationTexts,
    });
    await connection.execute(
      `INSERT INTO questions(bank_id,external_key,sort_order,topic_code,question_type,question_texts,rationale_texts,source_explanation_texts,source_answer,answer_confidence,community_conflict,rationale_note,content_hash,enabled)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE sort_order=VALUES(sort_order),topic_code=VALUES(topic_code),question_type=VALUES(question_type),question_texts=VALUES(question_texts),rationale_texts=VALUES(rationale_texts),source_explanation_texts=VALUES(source_explanation_texts),source_answer=VALUES(source_answer),answer_confidence=VALUES(answer_confidence),community_conflict=VALUES(community_conflict),rationale_note=VALUES(rationale_note),content_hash=VALUES(content_hash),enabled=1,deleted_at=NULL`,
      [
        bankId,
        String(question.id),
        question.id,
        String(question.topic ?? ''),
        questionType,
        json(questionTexts),
        json(rationaleTexts),
        json(sourceExplanationTexts),
        question.answer_review.source_answer || null,
        question.answer_review.confidence || null,
        question.answer_review.community_conflict ? 1 : 0,
        question.answer_review.rationale_note || null,
        contentHash,
      ],
    );
    const [questions] = await connection.execute(
      'SELECT id FROM questions WHERE bank_id=? AND external_key=? LIMIT 1',
      [bankId, String(question.id)],
    );
    const questionId = questions[0].id;
    for (const [optionIndex, optionKey] of question.option_order.entries())
      await connection.execute(
        `INSERT INTO question_options(question_id,option_key,content_texts,is_correct,sort_order) VALUES(?,?,?,?,?)
      ON DUPLICATE KEY UPDATE content_texts=VALUES(content_texts),is_correct=VALUES(is_correct),sort_order=VALUES(sort_order)`,
        [
          questionId,
          optionKey,
          json(normalizedOptions[optionKey]),
          answerKeys.includes(optionKey) ? 1 : 0,
          optionIndex + 1,
        ],
      );
  }
  const externalKeys = [...ids].map(String);
  await connection.execute(
    `UPDATE questions SET enabled=0 WHERE bank_id=? AND external_key NOT IN (${externalKeys.map(() => '?').join(',')})`,
    [bankId, ...externalKeys],
  );
  await connection.execute(
    "INSERT INTO question_import_batches(bank_id,content_version,original_filename,file_hash,question_count,status,summary_json,completed_at) VALUES(?,?,?,?,?,'completed',?,CURRENT_TIMESTAMP(3))",
    [
      bankId,
      String(payload.generated_at || 'source'),
      path.basename(sourcePath),
      hash(raw),
      payload.questions.length,
      json(summary),
    ],
  );
  await connection.commit();
  console.log(
    JSON.stringify(
      {
        imported: true,
        bankId,
        providerCode,
        subgroupCode,
        bankCode,
        ...summary,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
