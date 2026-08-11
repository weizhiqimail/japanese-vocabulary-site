import { Module } from '@nestjs/common';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';
import { SentencesController } from '@/modules/knowledge-resources/sentences/sentences.controller';
import { SentencesService } from '@/modules/knowledge-resources/sentences/sentences.service';

/** 句子独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [SentencesController],
  providers: [SentencesService],
  exports: [SentencesService],
})
export class SentencesModule {}
