import {
  ConsoleLogger,
  Injectable,
  type LoggerService,
  type OnApplicationShutdown,
} from '@nestjs/common';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  type WriteStream,
} from 'node:fs';
import { join } from 'node:path';
import {
  LOG_CATEGORY,
  LOG_FILE_PREFIX,
  resolveProjectRoot,
} from '@/shared-modules/logging/config/logging.config';

type LogLevel = 'DEBUG' | 'ERROR' | 'INFO' | 'VERBOSE' | 'WARN';
type LogMetadata = Record<string, unknown>;

/**
 * 应用统一日志服务。
 *
 * 文件写入使用 Node.js WriteStream 的异步缓冲，不在请求链路中执行同步磁盘写入。
 */
@Injectable()
export class AppLoggerService implements LoggerService, OnApplicationShutdown {
  private readonly consoleLogger = new ConsoleLogger('JVS');

  private readonly stream: WriteStream;

  readonly filePath: string;

  constructor() {
    const logDirectory = join(resolveProjectRoot(), 'logs');

    if (!existsSync(logDirectory)) {
      mkdirSync(logDirectory, { recursive: true });
    }

    this.filePath = this.createLogFilePath(logDirectory);
    this.stream = createWriteStream(this.filePath, {
      encoding: 'utf8',
      flags: 'a',
    });
  }

  log(message: unknown, ...optionalParameters: unknown[]) {
    const context = this.readContext(optionalParameters);

    this.write('INFO', LOG_CATEGORY.system, message, { context });
    if (context) {
      this.consoleLogger.log(message, context);
    } else {
      this.consoleLogger.log(message);
    }
  }

  error(message: unknown, ...optionalParameters: unknown[]) {
    const context = this.readContext(optionalParameters);
    const trace = optionalParameters.find(
      (parameter) => typeof parameter === 'string' && parameter !== context,
    );

    this.write('ERROR', LOG_CATEGORY.system, message, { context, trace });
    if (trace || context) {
      this.consoleLogger.error(message, trace, context);
    } else {
      this.consoleLogger.error(message);
    }
  }

  warn(message: unknown, ...optionalParameters: unknown[]) {
    const context = this.readContext(optionalParameters);

    this.write('WARN', LOG_CATEGORY.system, message, { context });
    if (context) {
      this.consoleLogger.warn(message, context);
    } else {
      this.consoleLogger.warn(message);
    }
  }

  debug(message: unknown, ...optionalParameters: unknown[]) {
    const context = this.readContext(optionalParameters);

    this.write('DEBUG', LOG_CATEGORY.system, message, { context });
    if (context) {
      this.consoleLogger.debug(message, context);
    } else {
      this.consoleLogger.debug(message);
    }
  }

  verbose(message: unknown, ...optionalParameters: unknown[]) {
    const context = this.readContext(optionalParameters);

    this.write('VERBOSE', LOG_CATEGORY.system, message, { context });
    if (context) {
      this.consoleLogger.verbose(message, context);
    } else {
      this.consoleLogger.verbose(message);
    }
  }

  http(message: string, metadata: LogMetadata = {}) {
    this.write('INFO', LOG_CATEGORY.http, message, metadata);
  }

  database(
    message: string,
    metadata: LogMetadata = {},
    level: LogLevel = 'INFO',
  ) {
    this.write(level, LOG_CATEGORY.database, message, metadata);
  }

  business(
    message: string,
    metadata: LogMetadata = {},
    level: LogLevel = 'INFO',
  ) {
    this.write(level, LOG_CATEGORY.business, message, metadata);
  }

  exception(message: string, metadata: LogMetadata = {}) {
    this.write('ERROR', LOG_CATEGORY.exception, message, metadata);
  }

  startup(message: string, metadata: LogMetadata = {}) {
    this.write('INFO', LOG_CATEGORY.startup, message, metadata);
    this.consoleLogger.log(message, LOG_CATEGORY.startup);
  }

  onApplicationShutdown() {
    this.stream.end();
  }

  private createLogFilePath(logDirectory: string) {
    const date = this.localDate();
    const expression = new RegExp(
      `^${LOG_FILE_PREFIX}-${date}-(\\d{3})\\.log$`,
    );
    const sequence =
      readdirSync(logDirectory).reduce((highest, filename) => {
        const match = filename.match(expression);

        return match ? Math.max(highest, Number(match[1])) : highest;
      }, 0) + 1;

    return join(
      logDirectory,
      `${LOG_FILE_PREFIX}-${date}-${String(sequence).padStart(3, '0')}.log`,
    );
  }

  private localDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private readContext(parameters: unknown[]) {
    const context = parameters.at(-1);

    return typeof context === 'string' ? context : undefined;
  }

  private write(
    level: LogLevel,
    category: string,
    message: unknown,
    metadata: LogMetadata,
  ) {
    const line = [
      new Date().toISOString(),
      `[${category}]`,
      `[${level}]`,
      this.stringify(message),
      this.stringifyMetadata(metadata),
    ]
      .filter(Boolean)
      .join(' ');

    queueMicrotask(() => this.stream.write(`${line}\n`));
  }

  private stringify(value: unknown) {
    if (value instanceof Error) {
      return value.message;
    }

    return typeof value === 'string' ? value : this.safeJson(value);
  }

  private stringifyMetadata(metadata: LogMetadata) {
    return Object.keys(metadata).length ? this.safeJson(metadata) : '';
  }

  private safeJson(value: unknown): string {
    try {
      return (
        JSON.stringify(value, (key: string, currentValue: unknown): unknown =>
          /password|token|cookie|authorization/i.test(key)
            ? '[REDACTED]'
            : currentValue,
        ) ?? String(value)
      );
    } catch {
      return String(value);
    }
  }
}
