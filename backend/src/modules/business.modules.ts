import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { ImportsModule } from '@/modules/imports/imports.module';
import { ResourcesModule } from '@/modules/resources/resources.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { StudyModule } from '@/modules/study/study.module';
import { HttpLoggerMiddleware } from '@/middlewares/logging/http-logger.middleware';
@Module({
  imports: [
    AuthModule,
    DashboardModule,
    ResourcesModule,
    StudyModule,
    SettingsModule,
    ImportsModule,
  ],
})
export class BusinessModules implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
