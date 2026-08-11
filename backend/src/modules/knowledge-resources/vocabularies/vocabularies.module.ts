import { Module } from '@nestjs/common';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';
import { VocabulariesController } from '@/modules/knowledge-resources/vocabularies/vocabularies.controller';
import { VocabulariesService } from '@/modules/knowledge-resources/vocabularies/vocabularies.service';

/** 词汇独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [VocabulariesController],
  providers: [VocabulariesService],
  exports: [VocabulariesService],
})
export class VocabulariesModule {}
