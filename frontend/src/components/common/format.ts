/** 所有页面统一使用本地时间的 YYYY-MM-DD HH:mm:ss 格式。 */
export function formatDateTime(value: unknown) {
  if (!value) {
    return '—';
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return String(value);
}

export function knowledgeName(item: Record<string, unknown>) {
  return displayValue(
    item.word || item.pattern || item.japanese || item.name || item.id,
  );
}
