import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecordStudyDto } from '@/modules/study/dto/record-study.dto';
import { TestAnswerDto } from '@/modules/study/dto/test-answer.dto';
import { ReviewQueryDto } from '@/modules/study/dto/review-query.dto';
import { StudyService } from '@/modules/study/study.service';

@ApiTags('学习与复习')
@ApiCookieAuth('jvs_session')
@Controller('study')
export class StudyController {
  constructor(private readonly study: StudyService) {}

  @Get('collection-members')
  @ApiOperation({ summary: '查询集合词汇' })
  members(@Query('collectionId', ParseIntPipe) collectionId: number) {
    return this.study.collectionMembers(collectionId);
  }

  @Get('test')
  @ApiOperation({ summary: '生成一组十题词汇测试' })
  test(@Query('collectionId', ParseIntPipe) collectionId: number) {
    return this.study.testQuestions(collectionId);
  }

  @Post('record')
  @ApiOperation({ summary: '记录学习或复习' })
  record(@Body() dto: RecordStudyDto) {
    return this.study.record(dto.vocabularyId, dto.eventType);
  }

  @Post('test-answer')
  @ApiOperation({ summary: '提交测试答案并归集错题' })
  answer(@Body() dto: TestAnswerDto) {
    return this.study.submitAnswer(dto.vocabularyId, dto.correct);
  }

  @Get('review')
  @ApiOperation({ summary: '查询复习列表' })
  review(@Query() query: ReviewQueryDto) {
    return this.study.reviewList(query.mode);
  }
}
