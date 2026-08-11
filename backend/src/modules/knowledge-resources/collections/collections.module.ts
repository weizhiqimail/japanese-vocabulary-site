import { Module } from '@nestjs/common';
import { CollectionsController } from '@/modules/knowledge-resources/collections/collections.controller';
import { CollectionsService } from '@/modules/knowledge-resources/collections/collections.service';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';

/** 词汇集合独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
