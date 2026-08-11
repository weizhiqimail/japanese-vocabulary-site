import { Module } from '@nestjs/common';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';
import { TagsController } from '@/modules/knowledge-resources/tags/tags.controller';
import { TagsService } from '@/modules/knowledge-resources/tags/tags.service';

/** 标签独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
