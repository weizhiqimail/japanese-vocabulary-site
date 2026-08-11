import type { Logger, QueryRunner } from 'typeorm';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 把 TypeORM 产生的最终 SQL 和数据库事件写入统一异步日志流。 */
export class TypeOrmFileLogger implements Logger {
  constructor(private readonly logger: AppLoggerService) {}

  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.database('SQL', {
      parameters: this.sanitizeParameters(query, parameters),
      query,
    });
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    this.logger.database(
      'SQL execution failed',
      {
        error: error instanceof Error ? error.message : error,
        parameters: this.sanitizeParameters(query, parameters),
        query,
      },
      'ERROR',
    );
  }

  logQuerySlow(
    duration: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    this.logger.database(
      'Slow SQL',
      {
        durationMs: duration,
        parameters: this.sanitizeParameters(query, parameters),
        query,
      },
      'WARN',
    );
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.logger.database('Schema build', { message });
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.database('Migration', { message });
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    _queryRunner?: QueryRunner,
  ) {
    this.logger.database(
      'TypeORM',
      { message },
      level === 'warn' ? 'WARN' : 'INFO',
    );
  }

  private sanitizeParameters(query: string, parameters?: unknown[]) {
    if (!parameters) {
      return [];
    }

    if (/insert|update/i.test(query) && /password|token_hash/i.test(query)) {
      return parameters.map(() => '[REDACTED]');
    }

    return parameters;
  }
}
