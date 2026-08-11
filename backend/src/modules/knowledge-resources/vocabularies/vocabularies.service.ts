import { Injectable } from '@nestjs/common';
import { VOCABULARY_RESOURCE_NAME } from '@/modules/knowledge-resources/vocabularies/config/vocabulary.config';
import type { SaveVocabularyDto } from '@/modules/knowledge-resources/vocabularies/dto/save-vocabulary.dto';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';

/** 词汇模块业务入口。 */
@Injectable()
export class VocabulariesService {
  constructor(private readonly resources: ResourceCrudService) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(VOCABULARY_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(VOCABULARY_RESOURCE_NAME, id);
  }

  save(dto: SaveVocabularyDto) {
    return this.resources.save(VOCABULARY_RESOURCE_NAME, {
      ...dto,
      id: dto.wordId,
    });
  }

  remove(id: number) {
    return this.resources.remove(VOCABULARY_RESOURCE_NAME, id);
  }

  linkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.linkRelation(
      VOCABULARY_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  unlinkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.unlinkRelation(
      VOCABULARY_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  relations(id: number, targetResource: string) {
    return this.resources.listRelations(
      VOCABULARY_RESOURCE_NAME,
      id,
      targetResource,
    );
  }
}
