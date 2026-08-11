import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ALL_ENTITIES } from '@/entities';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';
import { LoggingModule } from '@/shared-modules/logging/logging.module';
import { TypeOrmFileLogger } from '@/shared-modules/logging/typeorm-file.logger';

@Module({
  imports: [
    LoggingModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, AppLoggerService],
      useFactory: (config: ConfigService, logger: AppLoggerService) => {
        const url = config.get<string>('database.url');
        const connection = url
          ? { url }
          : {
              host: config.getOrThrow<string>('database.host'),
              port: config.getOrThrow<number>('database.port'),
              database: config.getOrThrow<string>('database.database'),
              username: config.getOrThrow<string>('database.username'),
              password: config.get<string>('database.password', ''),
            };

        return {
          type: 'mysql' as const,
          ...connection,
          entities: ALL_ENTITIES,
          synchronize: false,
          logging: 'all' as const,
          logger: new TypeOrmFileLogger(logger),
          extra: {
            connectionLimit: config.get<number>('database.poolSize', 10),
            connectTimeout: config.get<number>('database.connectTimeout', 5000),
          },
        };
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class SharedDatabaseModule {}
