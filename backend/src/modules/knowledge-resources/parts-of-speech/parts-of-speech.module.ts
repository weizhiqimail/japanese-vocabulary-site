import { Module } from '@nestjs/common';
import { PartsOfSpeechController } from '@/modules/knowledge-resources/parts-of-speech/parts-of-speech.controller';
import { PartsOfSpeechService } from '@/modules/knowledge-resources/parts-of-speech/parts-of-speech.service';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';

/** 固定词性独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [PartsOfSpeechController],
  providers: [PartsOfSpeechService],
  exports: [PartsOfSpeechService],
})
export class PartsOfSpeechModule {}
