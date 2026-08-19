import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SENTENCE_RESOURCE_NAME } from '@/modules/knowledge-resources/sentences/config/sentence.config';
import { SaveSentenceDto } from '@/modules/knowledge-resources/sentences/dto/save-sentence.dto';
import { SentenceQueryDto } from '@/modules/knowledge-resources/sentences/dto/sentence-query.dto';
import { SentencesService } from '@/modules/knowledge-resources/sentences/sentences.service';
import { LinkRelationDto } from '@/modules/knowledge-resources/shared/dto/link-relation.dto';

/** 句子接口统一使用 GET 查询和 POST 变更。 */
@ApiTags('句子')
@ApiCookieAuth('jvs_session')
@Controller([SENTENCE_RESOURCE_NAME, `words/${SENTENCE_RESOURCE_NAME}`])
export class SentencesController {
  constructor(private readonly sentences: SentencesService) {}

  @Get()
  @ApiOperation({ summary: '查询句子列表或详情' })
  get(@Query() query: SentenceQueryDto) {
    return query.sentenceId
      ? this.sentences.detail(query.sentenceId)
      : this.sentences.list(query);
  }

  @Get('relations')
  @ApiOperation({ summary: '查询句子知识关联' })
  relations(
    @Query('sentenceId', ParseIntPipe) sentenceId: number,
    @Query('targetResource') targetResource: string,
  ) {
    return this.sentences.relations(sentenceId, targetResource);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑句子' })
  save(@Body() dto: SaveSentenceDto) {
    return this.sentences.save(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '逻辑删除句子' })
  remove(@Body('sentenceId', ParseIntPipe) sentenceId: number) {
    return this.sentences.remove(sentenceId);
  }

  @Post('relations/save')
  @ApiOperation({ summary: '新增句子知识关联' })
  linkRelation(
    @Body('sentenceId', ParseIntPipe) sentenceId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.sentences.linkRelation(
      sentenceId,
      dto.targetResource,
      dto.targetId,
    );
  }

  @Post('relations/delete')
  @ApiOperation({ summary: '移除句子知识关联' })
  unlinkRelation(
    @Body('sentenceId', ParseIntPipe) sentenceId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.sentences.unlinkRelation(
      sentenceId,
      dto.targetResource,
      dto.targetId,
    );
  }
}
