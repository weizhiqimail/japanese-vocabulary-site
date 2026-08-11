import { Module } from '@nestjs/common';
import { GrammarsController } from '@/modules/knowledge-resources/grammars/grammars.controller';
import { GrammarsService } from '@/modules/knowledge-resources/grammars/grammars.service';
import { KnowledgeResourceSharedModule } from '@/modules/knowledge-resources/shared/knowledge-resource-shared.module';

/** 语法独立子模块。 */
@Module({
  imports: [KnowledgeResourceSharedModule],
  controllers: [GrammarsController],
  providers: [GrammarsService],
  exports: [GrammarsService],
})
export class GrammarsModule {}
