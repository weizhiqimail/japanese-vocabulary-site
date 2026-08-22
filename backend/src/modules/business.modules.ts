import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccountModule } from '@/modules/account/account.module';
import { HttpLoggerMiddleware } from '@/middlewares/logging/http-logger.middleware';
import { QuestionsModule } from '@/modules/questions/questions.module';
import { WordsModule } from '@/modules/words/words.module';

@Module({
  imports: [AccountModule, WordsModule, QuestionsModule],
})
export class BusinessModules implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('{*path}');
  }
}
