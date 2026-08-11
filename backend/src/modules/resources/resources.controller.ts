import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RESOURCE_PATHS } from '@/modules/resources/config/resource.config';
import { ResourceQueryDto } from '@/modules/resources/dto/resource-query.dto';
import { LinkRelationDto } from '@/modules/resources/dto/link-relation.dto';
import { ResourcesService } from '@/modules/resources/resources.service';
const DETAIL_PATHS = RESOURCE_PATHS.map((value) => `${value}/:id`);
@ApiTags('知识资源')
@ApiCookieAuth('jvs_session')
@Controller()
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}
  @Get(RESOURCE_PATHS) @ApiOperation({ summary: '分页查询资源' }) list(
    @Req() request: Request,
    @Query() query: ResourceQueryDto,
  ) {
    return this.resources.list(this.pathResource(request), query);
  }
  @Get(DETAIL_PATHS) @ApiOperation({ summary: '查询资源详情' }) detail(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resources.detail(this.pathResource(request), id);
  }
  @Put(RESOURCE_PATHS) @ApiOperation({ summary: '新增或更新资源' }) save(
    @Req() request: Request,
    @Body() body: Record<string, unknown>,
  ) {
    return this.resources.save(this.pathResource(request), body);
  }
  @Delete(DETAIL_PATHS) @ApiOperation({ summary: '逻辑删除资源' }) remove(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resources.remove(this.pathResource(request), id);
  }
  @Post(':resource/:id/relations/:targetResource')
  @ApiOperation({ summary: '新增知识对象关联' })
  linkRelation(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('targetResource') targetResource: string,
    @Body() dto: LinkRelationDto,
  ) {
    return this.resources.linkRelation(
      resource,
      id,
      targetResource,
      dto.targetId,
    );
  }
  @Delete(':resource/:id/relations/:targetResource/:targetId')
  @ApiOperation({ summary: '移除知识对象关联' })
  unlinkRelation(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('targetResource') targetResource: string,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.resources.unlinkRelation(
      resource,
      id,
      targetResource,
      targetId,
    );
  }
  private pathResource(request: Request) {
    return (
      request.path
        .split('/')
        .filter(Boolean)
        .find((segment) => RESOURCE_PATHS.includes(segment as never)) || ''
    );
  }
}
