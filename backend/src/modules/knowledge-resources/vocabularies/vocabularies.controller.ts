import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VOCABULARY_RESOURCE_NAME } from '@/modules/knowledge-resources/vocabularies/config/vocabulary.config';
import { SaveVocabularyDto } from '@/modules/knowledge-resources/vocabularies/dto/save-vocabulary.dto';
import { VocabularyQueryDto } from '@/modules/knowledge-resources/vocabularies/dto/vocabulary-query.dto';
import { VocabulariesService } from '@/modules/knowledge-resources/vocabularies/vocabularies.service';
import { LinkRelationDto } from '@/modules/knowledge-resources/shared/dto/link-relation.dto';

/** 词汇接口统一使用 GET 查询和 POST 变更，不把操作编码为 REST 路径。 */
@ApiTags('词汇')
@ApiCookieAuth('jvs_session')
@Controller(VOCABULARY_RESOURCE_NAME)
export class VocabulariesController {
  constructor(private readonly vocabularies: VocabulariesService) {}

  @Get()
  @ApiOperation({ summary: '查询词汇列表或详情' })
  get(@Query() query: VocabularyQueryDto) {
    return query.wordId
      ? this.vocabularies.detail(query.wordId)
      : this.vocabularies.list(query);
  }

  @Get('relations')
  @ApiOperation({ summary: '查询词汇知识关联' })
  relations(
    @Query('wordId', ParseIntPipe) wordId: number,
    @Query('targetResource') targetResource: string,
  ) {
    return this.vocabularies.relations(wordId, targetResource);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑词汇' })
  save(@Body() dto: SaveVocabularyDto) {
    return this.vocabularies.save(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '逻辑删除词汇' })
  remove(@Body('wordId', ParseIntPipe) wordId: number) {
    return this.vocabularies.remove(wordId);
  }

  @Post('relations/save')
  @ApiOperation({ summary: '新增词汇知识关联' })
  linkRelation(
    @Body('wordId', ParseIntPipe) wordId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.vocabularies.linkRelation(
      wordId,
      dto.targetResource,
      dto.targetId,
    );
  }

  @Post('relations/delete')
  @ApiOperation({ summary: '移除词汇知识关联' })
  unlinkRelation(
    @Body('wordId', ParseIntPipe) wordId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.vocabularies.unlinkRelation(
      wordId,
      dto.targetResource,
      dto.targetId,
    );
  }
}
