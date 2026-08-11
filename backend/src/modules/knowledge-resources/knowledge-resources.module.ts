import { Module } from '@nestjs/common';
import { CollectionsModule } from '@/modules/knowledge-resources/collections/collections.module';
import { GrammarsModule } from '@/modules/knowledge-resources/grammars/grammars.module';
import { PartsOfSpeechModule } from '@/modules/knowledge-resources/parts-of-speech/parts-of-speech.module';
import { SentencesModule } from '@/modules/knowledge-resources/sentences/sentences.module';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';
import { TagsModule } from '@/modules/knowledge-resources/tags/tags.module';
import { VocabulariesModule } from '@/modules/knowledge-resources/vocabularies/vocabularies.module';

/** 聚合知识资源子模块，本模块不再承载通用控制器。 */
@Module({
  imports: [
    KnowledgeResourceSharedModule,
    VocabulariesModule,
    CollectionsModule,
    GrammarsModule,
    SentencesModule,
    TagsModule,
    PartsOfSpeechModule,
  ],
  exports: [
    VocabulariesModule,
    CollectionsModule,
    GrammarsModule,
    SentencesModule,
    TagsModule,
    PartsOfSpeechModule,
  ],
})
export class KnowledgeResourcesModule {}
