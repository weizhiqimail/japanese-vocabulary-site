import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 为 HTTP、数据库、业务与异常处理共享同一个文件日志实例。 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggingModule {}
