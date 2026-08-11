import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const localEnv = Object.fromEntries(
  (await readFile(path.join(backendRoot, '.env.local'), 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line && !line.trimStart().startsWith('#'))
    .filter((line) => line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');

      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const baseUrl = process.env.TEST_API_BASE_URL || 'http://localhost:3115';
const username = process.env.TEST_API_USERNAME || localEnv.INITIAL_ADMIN_USERNAME;
const password = process.env.TEST_API_PASSWORD || localEnv.INITIAL_ADMIN_PASSWORD;
const runId = Date.now().toString(36);
const covered = new Set();
const results = [];
let cookie = '';

if (process.env.TEST_API_ISOLATED !== '1') {
  throw new Error(
    'Refusing mutation tests without TEST_API_ISOLATED=1; use an isolated database.',
  );
}

function endpointKey(method, requestPath) {
  return `${method.toUpperCase()} ${new URL(requestPath, baseUrl).pathname}`;
}

async function request(method, requestPath, body, options = {}) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (cookie && options.auth !== false) {
    headers.Cookie = cookie;
  }

  const response = await fetch(new URL(requestPath, baseUrl), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (options.captureCookie) {
    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      cookie = setCookie.split(';', 1)[0];
    }
  }

  const expected = options.expected || [200, 201];
  const key = endpointKey(method, requestPath);

  if (!expected.includes(response.status)) {
    throw new Error(
      `${key} expected ${expected.join('/')} but received ${response.status}: ${text}`,
    );
  }

  if (response.ok && payload?.success === false) {
    throw new Error(`${key} returned success=false: ${text}`);
  }

  covered.add(key);
  results.push({ key, status: response.status });

  return payload?.data ?? payload;
}

function id(value) {
  const result = Number(value?.id ?? value);

  if (!Number.isInteger(result) || result < 1) {
    throw new Error(`Invalid resource id: ${JSON.stringify(value)}`);
  }

  return result;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const swagger = await fetch(new URL('/api/docs-json', baseUrl)).then((response) =>
  response.json(),
);
const required = new Set(
  Object.entries(swagger.paths).flatMap(([requestPath, methods]) =>
    Object.keys(methods).map(
      (method) => `${method.toUpperCase()} ${requestPath}`,
    ),
  ),
);

await request(
  'POST',
  '/api/auth/login',
  { username, password },
  { auth: false, captureCookie: true },
);
await request('GET', '/api/auth/me');
await request('GET', '/api/dashboard');

await request('GET', '/api/collections?pageNum=1&pageSize=10');
const collection = await request('POST', '/api/collections/save', {
  name: `API测试集合-${runId}`,
  type: 'custom',
  source: '全接口自动回归',
  description: '临时隔离数据库数据',
  created_at: 'should-be-ignored',
});
const collectionId = id(collection);
await request('POST', '/api/collections/save', {
  collectionId,
  name: `API测试集合-${runId}-编辑`,
  type: 'custom',
  source: '全接口自动回归',
  description: '编辑分支已验证',
  deleted_at: 'should-be-ignored',
});
await request('GET', `/api/collections?collectionId=${collectionId}`);

await request('GET', '/api/tags?pageNum=1&pageSize=10');
const tag = await request('POST', '/api/tags/save', {
  name: `API标签-${runId}`,
  color: '#FDE68A',
  updated_at: 'should-be-ignored',
});
const tagId = id(tag);
await request('POST', '/api/tags/save', {
  tagId,
  name: `API标签-${runId}-编辑`,
  color: '#FDBA74',
});
await request('GET', `/api/tags?tagId=${tagId}`);

await request('GET', '/api/parts-of-speech?pageNum=1&pageSize=10');
const partOfSpeech = await request('POST', '/api/parts-of-speech/save', {
  code: `api_${runId}`,
  name: `API词性-${runId}`,
  enabled: true,
  sort_order: 999999,
});
const partOfSpeechId = id(partOfSpeech);
await request('POST', '/api/parts-of-speech/save', {
  partOfSpeechId,
  name: `API词性-${runId}-编辑`,
  enabled: false,
  code: 'ignored-on-edit',
});
await request(
  'GET',
  `/api/parts-of-speech?partOfSpeechId=${partOfSpeechId}`,
);

const vocabularies = [];

for (let index = 1; index <= 10; index += 1) {
  const vocabulary = await request('POST', '/api/vocabularies/save', {
    word: index === 1 ? '融通' : `API語彙${index}-${runId}`,
    reading: index === 1 ? 'ゆうずう' : `えーぴーあい${index}`,
    translation:
      index === 1 ? '通融，灵活处理；借贷' : `API 测试词汇 ${index}`,
    notes: '',
    collectionIds: [collectionId],
    posIds: [partOfSpeechId],
    tagIds: [tagId],
    grammarIds: [],
    sentenceIds: [],
    created_at: 'should-be-ignored',
  });

  vocabularies.push(vocabulary);
}

const vocabularyId = id(vocabularies[0]);
await request(
  'GET',
  `/api/vocabularies?pageNum=1&pageSize=10&q=${encodeURIComponent(`API語彙-${runId}`)}`,
);
const vocabularyDetail = await request(
  'GET',
  `/api/vocabularies?wordId=${vocabularyId}`,
);
assert(vocabularyDetail.collections.length === 1, 'Collection relation missing');
assert(
  vocabularyDetail.partsOfSpeech.length === 1,
  'Part-of-speech relation missing',
);
assert(vocabularyDetail.tags.length === 1, 'Tag relation missing');

const grammar = await request('POST', '/api/grammars/save', {
  pattern: `API文法-${runId}`,
  reading: 'えーぴーあいぶんぽう',
  meaning: 'API 测试语法',
  notes: '',
  tagIds: [tagId],
  vocabularyIds: [vocabularyId],
  sentenceIds: [],
});
const grammarId = id(grammar);
await request('GET', '/api/grammars?pageNum=1&pageSize=10');
await request('GET', `/api/grammars?grammarId=${grammarId}`);

const sentence = await request('POST', '/api/sentences/save', {
  japanese: `API例文です-${runId}`,
  reading: 'えーぴーあいれいぶんです',
  translation: '这是 API 测试例句',
  notes: '',
  tagIds: [tagId],
  vocabularyIds: [vocabularyId],
  grammarIds: [grammarId],
});
const sentenceId = id(sentence);
await request('GET', '/api/sentences?pageNum=1&pageSize=10');
await request('GET', `/api/sentences?sentenceId=${sentenceId}`);

await request('POST', '/api/vocabularies/save', {
  wordId: vocabularyId,
  word: `API語彙1-${runId}-編集`,
  reading: 'えーぴーあい1',
  translation: 'API 测试词汇编辑',
  notes: '编辑分支',
  collectionIds: [collectionId],
  posIds: [partOfSpeechId],
  tagIds: [tagId],
  grammarIds: [grammarId],
  sentenceIds: [sentenceId],
});
await request('POST', '/api/grammars/save', {
  grammarId,
  pattern: `API文法-${runId}-編集`,
  reading: 'えーぴーあいぶんぽう',
  meaning: 'API 测试语法编辑',
  notes: '编辑分支',
  tagIds: [tagId],
  vocabularyIds: [vocabularyId],
  sentenceIds: [sentenceId],
});
await request('POST', '/api/sentences/save', {
  sentenceId,
  japanese: `API例文を編集します-${runId}`,
  reading: 'えーぴーあいれいぶんをへんしゅうします',
  translation: '编辑 API 测试例句',
  notes: '编辑分支',
  tagIds: [tagId],
  vocabularyIds: [vocabularyId],
  grammarIds: [grammarId],
});

await request(
  'POST',
  '/api/vocabularies/relations/save',
  { wordId: vocabularyId, targetResource: 'grammars', targetId: grammarId },
);
const vocabularyRelations = await request(
  'GET',
  `/api/vocabularies/relations?wordId=${vocabularyId}&targetResource=grammars`,
);
assert(
  vocabularyRelations.some((item) => id(item) === grammarId),
  'Vocabulary relation was not returned',
);
await request(
  'POST',
  '/api/vocabularies/relations/delete',
  { wordId: vocabularyId, targetResource: 'grammars', targetId: grammarId },
);

await request(
  'POST',
  '/api/grammars/relations/save',
  { grammarId, targetResource: 'sentences', targetId: sentenceId },
);
const grammarRelations = await request(
  'GET',
  `/api/grammars/relations?grammarId=${grammarId}&targetResource=sentences`,
);
assert(
  grammarRelations.some((item) => id(item) === sentenceId),
  'Grammar relation was not returned',
);
await request(
  'POST',
  '/api/grammars/relations/delete',
  { grammarId, targetResource: 'sentences', targetId: sentenceId },
);

await request(
  'POST',
  '/api/sentences/relations/save',
  { sentenceId, targetResource: 'vocabularies', targetId: vocabularyId },
);
const sentenceRelations = await request(
  'GET',
  `/api/sentences/relations?sentenceId=${sentenceId}&targetResource=vocabularies`,
);
assert(
  sentenceRelations.some((item) => id(item) === vocabularyId),
  'Sentence relation was not returned',
);
await request(
  'POST',
  '/api/sentences/relations/delete',
  { sentenceId, targetResource: 'vocabularies', targetId: vocabularyId },
);

const members = await request(
  'GET',
  `/api/study/collection-members?collectionId=${collectionId}`,
);
assert(members.length === 10, `Expected 10 collection members, got ${members.length}`);
const questions = await request(
  'GET',
  `/api/study/test?collectionId=${collectionId}`,
);
assert(questions.length === 10, `Expected 10 questions, got ${questions.length}`);
await request('POST', '/api/study/record', {
  vocabularyId,
  eventType: 'learn',
});
await request('POST', '/api/study/record', {
  vocabularyId,
  eventType: 'review',
});
await request('POST', '/api/study/test-answer', {
  vocabularyId,
  correct: false,
});
await request('POST', '/api/study/test-answer', {
  vocabularyId,
  correct: true,
});
await request('GET', '/api/study/review?mode=errors');
await request('GET', '/api/study/review?mode=mastered');
await request('GET', '/api/study/review?mode=favorites');

await request('GET', '/api/settings');
await request('POST', '/api/settings/save', {
  key: 'pagination_defaults',
  value: {
    vocabularies: 10,
    collections: 20,
    grammars: 30,
    sentences: 50,
    tags: 100,
  },
  unknown: 'should-be-ignored',
});

await request('GET', '/api/imports?pageNum=1&pageSize=10');
await request('POST', '/api/imports/create', {
  filename: `api-${runId}.csv`,
  candidates: [
    {
      word: `API取込-${runId}`,
      reading: 'えーぴーあいとりこみ',
      translation: 'API 导入测试',
      created_at: 'should-be-ignored',
    },
  ],
});
const importList = await request(
  'GET',
  `/api/imports?pageNum=1&pageSize=10&q=${encodeURIComponent(`API取込-${runId}`)}`,
);
assert(importList.data.length === 1, 'Import candidate was not listed');
await request('POST', '/api/imports/review', {
  candidateId: id(importList.data[0]),
  decision: 'reject',
});

for (const vocabulary of vocabularies) {
  await request('POST', '/api/vocabularies/delete', {
    wordId: id(vocabulary),
  });
}

await request('POST', '/api/grammars/delete', { grammarId });
await request('POST', '/api/sentences/delete', { sentenceId });
await request('POST', '/api/tags/delete', { tagId });
await request('POST', '/api/collections/delete', { collectionId });
await request('POST', '/api/auth/logout');
await request('GET', '/api/auth/me', undefined, { expected: [401] });

const missing = [...required].filter((key) => !covered.has(key));

if (missing.length) {
  throw new Error(`Swagger operations not covered: ${missing.join(', ')}`);
}

for (const result of results) {
  console.log(`PASS ${result.status} ${result.key}`);
}

console.log(
  `ALL_API_TESTS_PASSED operations=${required.size} requests=${results.length}`,
);
