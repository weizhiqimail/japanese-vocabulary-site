import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GRAMMAR_RESOURCE_NAME } from '@/modules/knowledge-resources/grammars/config/grammar.config';
import { SaveGrammarDto } from '@/modules/knowledge-resources/grammars/dto/save-grammar.dto';
import { GrammarQueryDto } from '@/modules/knowledge-resources/grammars/dto/grammar-query.dto';
import { GrammarsService } from '@/modules/knowledge-resources/grammars/grammars.service';
import { LinkRelationDto } from '@/modules/knowledge-resources/shared/dto/link-relation.dto';

/** 语法接口统一使用 GET 查询和 POST 变更。 */
@ApiTags('语法')
@ApiCookieAuth('jvs_session')
@Controller([GRAMMAR_RESOURCE_NAME, `words/${GRAMMAR_RESOURCE_NAME}`])
export class GrammarsController {
  constructor(private readonly grammars: GrammarsService) {}

  @Get()
  @ApiOperation({ summary: '查询语法列表或详情' })
  get(@Query() query: GrammarQueryDto) {
    return query.grammarId
      ? this.grammars.detail(query.grammarId)
      : this.grammars.list(query);
  }

  @Get('relations')
  @ApiOperation({ summary: '查询语法知识关联' })
  relations(
    @Query('grammarId', ParseIntPipe) grammarId: number,
    @Query('targetResource') targetResource: string,
  ) {
    return this.grammars.relations(grammarId, targetResource);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑语法' })
  save(@Body() dto: SaveGrammarDto) {
    return this.grammars.save(dto);
  }

  @Post('delete')
  @ApiOperation({ summary: '逻辑删除语法' })
  remove(@Body('grammarId', ParseIntPipe) grammarId: number) {
    return this.grammars.remove(grammarId);
  }

  @Post('relations/save')
  @ApiOperation({ summary: '新增语法知识关联' })
  linkRelation(
    @Body('grammarId', ParseIntPipe) grammarId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.grammars.linkRelation(
      grammarId,
      dto.targetResource,
      dto.targetId,
    );
  }

  @Post('relations/delete')
  @ApiOperation({ summary: '移除语法知识关联' })
  unlinkRelation(
    @Body('grammarId', ParseIntPipe) grammarId: number,
    @Body() dto: LinkRelationDto,
  ) {
    return this.grammars.unlinkRelation(
      grammarId,
      dto.targetResource,
      dto.targetId,
    );
  }
}
