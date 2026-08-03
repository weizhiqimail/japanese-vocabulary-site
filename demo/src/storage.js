export const DEMO_STORAGE_KEY = 'japanese-vocabulary-v2-demo-db';
export const DEMO_SCHEMA_VERSION = 3;

const clone = value => JSON.parse(JSON.stringify(value));

export function loadDemoDatabase(seed) {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return { version: DEMO_SCHEMA_VERSION, ...clone(seed) };
    const parsed = JSON.parse(raw);
    if (parsed.version !== DEMO_SCHEMA_VERSION) return { version: DEMO_SCHEMA_VERSION, ...clone(seed) };
    return parsed;
  } catch {
    return { version: DEMO_SCHEMA_VERSION, ...clone(seed) };
  }
}

export function saveDemoDatabase(database) {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(database));
}

export function resetDemoDatabase(seed) {
  const database = { version: DEMO_SCHEMA_VERSION, ...clone(seed) };
  saveDemoDatabase(database);
  return database;
}
