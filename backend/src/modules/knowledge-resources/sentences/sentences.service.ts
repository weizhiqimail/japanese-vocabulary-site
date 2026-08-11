import { Injectable } from '@nestjs/common';
import { SENTENCE_RESOURCE_NAME } from '@/modules/knowledge-resources/sentences/config/sentence.config';
import type { SaveSentenceDto } from '@/modules/knowledge-resources/sentences/dto/save-sentence.dto';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';

/** 句子模块业务入口。 */
@Injectable()
export class SentencesService {
  constructor(private readonly resources: ResourceCrudService) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(SENTENCE_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(SENTENCE_RESOURCE_NAME, id);
  }

  save(dto: SaveSentenceDto) {
    return this.resources.save(SENTENCE_RESOURCE_NAME, {
      ...dto,
      id: dto.sentenceId,
    });
  }

  remove(id: number) {
    return this.resources.remove(SENTENCE_RESOURCE_NAME, id);
  }

  linkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.linkRelation(
      SENTENCE_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  unlinkRelation(id: number, targetResource: string, targetId: number) {
    return this.resources.unlinkRelation(
      SENTENCE_RESOURCE_NAME,
      id,
      targetResource,
      targetId,
    );
  }

  relations(id: number, targetResource: string) {
    return this.resources.listRelations(
      SENTENCE_RESOURCE_NAME,
      id,
      targetResource,
    );
  }
}
