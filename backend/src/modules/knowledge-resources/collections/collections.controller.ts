import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { COLLECTION_RESOURCE_NAME } from '@/modules/knowledge-resources/collections/config/collection.config';
import { SaveCollectionDto } from '@/modules/knowledge-resources/collections/dto/save-collection.dto';
import { CollectionQueryDto } from '@/modules/knowledge-resources/collections/dto/collection-query.dto';
import { CollectionsService } from '@/modules/knowledge-resources/collections/collections.service';

/** 集合接口统一使用 GET 查询和 POST 变更。 */
@ApiTags('集合')
@ApiCookieAuth('jvs_session')
@Controller([COLLECTION_RESOURCE_NAME, `words/${COLLECTION_RESOURCE_NAME}`])
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: '查询集合列表或详情' })
  get(@Query() query: CollectionQueryDto) {
    return query.collectionId
      ? this.collections.detail(query.collectionId)
      : this.collections.list(query);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑集合' })
  save(@Body() dto: SaveCollectionDto) {
    return this.collections.save(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '逻辑删除集合' })
  remove(@Body('collectionId', ParseIntPipe) collectionId: number) {
    return this.collections.remove(collectionId);
  }
}
