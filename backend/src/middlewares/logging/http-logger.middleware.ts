import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 记录每个 HTTP 请求的进入、完成状态、耗时和请求标识。 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.header('x-request-id') || randomUUID();
    const startedAt = Date.now();

    res.setHeader('x-request-id', requestId);
    this.logger.http('Request started', {
      ip: req.ip,
      method: req.method,
      requestId,
      url: req.originalUrl,
      userAgent: req.header('user-agent'),
    });

    res.on('finish', () => {
      this.logger.http('Request completed', {
        durationMs: Date.now() - startedAt,
        method: req.method,
        requestId,
        statusCode: res.statusCode,
        url: req.originalUrl,
      });
    });

    next();
  }
}
