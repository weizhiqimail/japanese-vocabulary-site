import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PART_OF_SPEECH_RESOURCE_NAME } from '@/modules/knowledge-resources/parts-of-speech/config/part-of-speech.config';
import { SavePartOfSpeechDto } from '@/modules/knowledge-resources/parts-of-speech/dto/save-part-of-speech.dto';
import { PartOfSpeechQueryDto } from '@/modules/knowledge-resources/parts-of-speech/dto/part-of-speech-query.dto';
import { PartsOfSpeechService } from '@/modules/knowledge-resources/parts-of-speech/parts-of-speech.service';

/** 词性接口统一使用 GET 查询和 POST 保存。 */
@ApiTags('词性')
@ApiCookieAuth('jvs_session')
@Controller([
  PART_OF_SPEECH_RESOURCE_NAME,
  `words/${PART_OF_SPEECH_RESOURCE_NAME}`,
])
export class PartsOfSpeechController {
  constructor(private readonly partsOfSpeech: PartsOfSpeechService) {}

  @Get()
  @ApiOperation({ summary: '查询词性列表或详情' })
  get(@Query() query: PartOfSpeechQueryDto) {
    return query.partOfSpeechId
      ? this.partsOfSpeech.detail(query.partOfSpeechId)
      : this.partsOfSpeech.list(query);
  }

  @Post('save')
  @ApiOperation({ summary: '新增或编辑词性，序号由服务端维护' })
  save(@Body() dto: SavePartOfSpeechDto) {
    return this.partsOfSpeech.save(dto);
  }
}
