import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ALL_ENTITIES } from '@/entities';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
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
          logging: ['error'] as ('error' | 'warn')[],
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
