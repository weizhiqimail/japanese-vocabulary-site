import { Injectable } from '@nestjs/common';
import { COLLECTION_RESOURCE_NAME } from '@/modules/knowledge-resources/collections/config/collection.config';
import type { SaveCollectionDto } from '@/modules/knowledge-resources/collections/dto/save-collection.dto';
import { ResourceCrudService } from '@/modules/knowledge-resources/shared/resource-crud.service';
import type { ResourceQueryDto } from '@/modules/knowledge-resources/shared/dto/resource-query.dto';

/** 集合模块业务入口。 */
@Injectable()
export class CollectionsService {
  constructor(private readonly resources: ResourceCrudService) {}

  list(query: ResourceQueryDto) {
    return this.resources.list(COLLECTION_RESOURCE_NAME, query);
  }

  detail(id: number) {
    return this.resources.detail(COLLECTION_RESOURCE_NAME, id);
  }

  save(dto: SaveCollectionDto) {
    return this.resources.save(COLLECTION_RESOURCE_NAME, {
      ...dto,
      id: dto.collectionId,
    });
  }

  remove(id: number) {
    return this.resources.remove(COLLECTION_RESOURCE_NAME, id);
  }
}
