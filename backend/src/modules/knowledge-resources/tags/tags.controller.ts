import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TAG_RESOURCE_NAME } from '@/modules/knowledge-resources/tags/config/tag.config';
import { SaveTagDto } from '@/modules/knowledge-resources/tags/dto/save-tag.dto';
import { TagQueryDto } from '@/modules/knowledge-resources/tags/dto/tag-query.dto';
import { TagsService } from '@/modules/knowledge-resources/tags/tags.service';

/** 标签接口统一使用 GET 查询和 POST 变更。 */
@ApiTags('标签')
@ApiCookieAuth('jvs_session')
@Controller([TAG_RESOURCE_NAME, `words/${TAG_RESOURCE_NAME}`])
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  @ApiOperation({ summary: '查询标签列表或详情' })
  get(@Query() query: TagQueryDto) {
    return query.tagId ? this.tags.detail(query.tagId) : this.tags.list(query);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑标签' })
  save(@Body() dto: SaveTagDto) {
    return this.tags.save(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '逻辑删除标签' })
  remove(@Body('tagId', ParseIntPipe) tagId: number) {
    return this.tags.remove(tagId);
  }
}
