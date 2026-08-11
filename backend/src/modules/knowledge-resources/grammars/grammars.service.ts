import { Injectable } from '@nestjs/common';
import { GRAMMAR_RESOURCE_NAME } from '@/modules/knowledge-resources/grammars/config/grammar.config';
import type { SaveGrammarDto } from '@/modules/knowledge-resources/grammars/dto/save-grammar.dto';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';

/** 语法模块业务入口。 */
@Injectable()
export class GrammarsService {
  constructor(private readonly resources: ResourceCrudService) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(GRAMMAR_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(GRAMMAR_RESOURCE_NAME, id);
  }

  save(dto: SaveGrammarDto) {
    return this.resources.save(GRAMMAR_RESOURCE_NAME, {
      ...dto,
      id: dto.grammarId,
    });
  }

  remove(id: number) {
    return this.resources.remove(GRAMMAR_RESOURCE_NAME, id);
  }

  linkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.linkRelation(
      GRAMMAR_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  unlinkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.unlinkRelation(
      GRAMMAR_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  relations(id: number, targetResource: string) {
    return this.resources.listRelations(
      GRAMMAR_RESOURCE_NAME,
      id,
      targetResource,
    );
  }
}
