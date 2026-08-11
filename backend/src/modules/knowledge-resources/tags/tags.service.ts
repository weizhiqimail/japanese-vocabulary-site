import { Injectable } from '@nestjs/common';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';
import { TAG_RESOURCE_NAME } from '@/modules/knowledge-resources/tags/config/tag.config';
import type { SaveTagDto } from '@/modules/knowledge-resources/tags/dto/save-tag.dto';

/** 标签模块业务入口。 */
@Injectable()
export class TagsService {
  constructor(private readonly resources: ResourceCrudService) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(TAG_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(TAG_RESOURCE_NAME, id);
  }

  save(dto: SaveTagDto) {
    return this.resources.save(TAG_RESOURCE_NAME, {
      ...dto,
      id: dto.tagId,
    });
  }

  remove(id: number) {
    return this.resources.remove(TAG_RESOURCE_NAME, id);
  }
}
