import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';

/** CSV 导入批次与审核独立模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
