import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import databaseConfig from '@/config/database.config';
import authConfig from '@/config/auth.config';
import { SharedModules } from '@/shared-modules/shared.modules';
import { BusinessModules } from '@/modules/business.modules';
import { LoggingModule } from '@/shared-modules/logging/logging.module';

const runtimeEnvironment = process.env.NODE_ENV || 'local';
const staticHostingModules = process.env.VERCEL
  ? []
  : [
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), 'web'),
        exclude: ['/api/{*path}'],
        serveStaticOptions: { fallthrough: true },
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        runtimeEnvironment === 'production'
          ? ['.env.production', '.env']
          : [`.env.${runtimeEnvironment}`, '.env.local', '.env'],
      load: [databaseConfig, authConfig],
    }),
    LoggingModule,
    ...staticHostingModules,
    SharedModules,
    BusinessModules,
  ],
})
export class AppModule {}
