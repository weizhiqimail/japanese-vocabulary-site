import { Global, Module } from '@nestjs/common';
import { SharedDatabaseModule } from '@/shared-modules/database/shared-database.module';
@Global()
@Module({ imports: [SharedDatabaseModule], exports: [SharedDatabaseModule] })
export class SharedModules {}
