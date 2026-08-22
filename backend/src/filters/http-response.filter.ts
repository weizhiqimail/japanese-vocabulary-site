import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 统一转换异常响应，并把完整异常上下文写入 EXCEPTION 日志。 */
@Injectable()
@Catch()
export class HttpResponseFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : null;
    const internalMessage =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'message' in payload
          ? Array.isArray(payload.message)
            ? payload.message.join('；')
            : String(payload.message)
          : exception instanceof Error
            ? exception.message
            : '服务器内部错误';
    const message =
      status >= 500 && process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : internalMessage;

    this.logger.exception(internalMessage, {
      exceptionName:
        exception instanceof Error ? exception.name : 'UnknownException',
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
      statusCode: status,
      url: request.originalUrl,
    });

    response.status(status).json({ success: false, data: null, message });
  }
}
