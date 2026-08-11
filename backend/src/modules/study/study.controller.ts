import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestAnswerDto } from './dto/test-answer.dto';
import { StudyService } from './study.service';
@ApiTags('学习与复习')
@ApiCookieAuth('jvs_session')
@Controller()
export class StudyController {
  constructor(private readonly study: StudyService) {}
  @Get('collections/:id/members')
  @ApiOperation({ summary: '集合成员' })
  members(@Param('id', ParseIntPipe) id: number) {
    return this.study.collectionMembers(id);
  }
  @Post('vocabularies/:id/learn') @ApiOperation({ summary: '记录学习' }) learn(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.study.record(id, 'learn');
  }
  @Post('vocabularies/:id/review')
  @ApiOperation({ summary: '记录复习' })
  review(@Param('id', ParseIntPipe) id: number) {
    return this.study.record(id, 'review');
  }
  @Post('test-answers') @ApiOperation({ summary: '提交测试答案' }) answer(
    @Body() dto: TestAnswerDto,
  ) {
    return this.study.submitAnswer(dto.vocabularyId, dto.correct);
  }
  @Get('review/:mode') @ApiOperation({ summary: '复习列表' }) reviewList(
    @Param('mode') mode: string,
  ) {
    return this.study.reviewList(mode);
  }
}
