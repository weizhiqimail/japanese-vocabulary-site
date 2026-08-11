import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import type { ApiResponse } from '@/types/http-response.types';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 包装成功响应，同时记录控制器级业务调用的开始、成功和失败。 */
@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const operation = `${controller}.${handler}`;
    const startedAt = Date.now();

    this.logger.business('Operation started', { operation });

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.business('Operation completed', {
            durationMs: Date.now() - startedAt,
            operation,
          }),
        error: (error: unknown) =>
          this.logger.business(
            'Operation failed',
            {
              durationMs: Date.now() - startedAt,
              error: error instanceof Error ? error.message : String(error),
              operation,
            },
            'ERROR',
          ),
      }),
      map((data) => ({ success: true, data, message: '操作成功' })),
    );
  }
}
