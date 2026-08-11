import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import databaseConfig from '@/config/database.config';
import authConfig from '@/config/auth.config';
import { SharedModules } from '@/shared-modules/shared.modules';
import { BusinessModules } from '@/modules/business.modules';

const runtimeEnvironment = process.env.NODE_ENV || 'local';

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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'web'),
      exclude: ['/api/{*path}'],
      serveStaticOptions: { fallthrough: true },
    }),
    SharedModules,
    BusinessModules,
  ],
})
export class AppModule {}
