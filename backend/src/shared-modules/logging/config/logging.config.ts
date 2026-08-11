import { basename, dirname, resolve } from 'node:path';

/** 日志模块统一分类，避免在业务代码中散落字符串。 */
export const LOG_CATEGORY = {
  business: 'BUSINESS',
  database: 'DB',
  exception: 'EXCEPTION',
  http: 'HTTP',
  startup: 'STARTUP',
  system: 'SYSTEM',
} as const;

export const LOG_FILE_PREFIX = 'jvs';

/**
 * npm --prefix 运行后端时 cwd 是 backend；直接从仓库根目录运行时 cwd 是仓库根目录。
 * 两种方式都把日志稳定写入仓库根目录的 logs。
 */
export function resolveProjectRoot() {
  const currentDirectory = resolve(process.cwd());

  return basename(currentDirectory).toLowerCase() === 'backend'
    ? dirname(currentDirectory)
    : currentDirectory;
}
