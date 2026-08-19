import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import {
  BankIdQueryDto,
  CurrentQuestionQueryDto,
  QuestionAttemptsQueryDto,
  QuestionBanksQueryDto,
  QuestionGroupsQueryDto,
  QuestionItemsQueryDto,
} from './dto/question-queries.dto';
import { SaveQuestionStateDto } from './dto/save-question-state.dto';
import { QuestionsService } from './questions.service';

type AuthRequest = Request & { user: { id: string } };
@ApiTags('固定题库')
@ApiCookieAuth('jvs_session')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}
  @Get('groups') @ApiOperation({ summary: '查询题库大小组' }) groups(
    @Query() query: QuestionGroupsQueryDto,
  ) {
    return this.questions.groups(query);
  }
  @Get('banks') @ApiOperation({ summary: '查询题库及用户进度' }) banks(
    @Req() req: AuthRequest,
    @Query() query: QuestionBanksQueryDto,
  ) {
    return this.questions.banks(req.user.id, query);
  }
  @Get('banks/detail') @ApiOperation({ summary: '查询题库详情' }) detail(
    @Req() req: AuthRequest,
    @Query() query: BankIdQueryDto,
  ) {
    return this.questions.detail(req.user.id, query.bankId);
  }
  @Get('practice/current') @ApiOperation({ summary: '查询当前练习题' }) current(
    @Req() req: AuthRequest,
    @Query() query: CurrentQuestionQueryDto,
  ) {
    return this.questions.current(req.user.id, query);
  }
  @Get('items') @ApiOperation({ summary: '查询错题或收藏题' }) items(
    @Req() req: AuthRequest,
    @Query() query: QuestionItemsQueryDto,
  ) {
    return this.questions.items(req.user.id, query);
  }
  @Get('attempts') @ApiOperation({ summary: '查询作答历史' }) attempts(
    @Req() req: AuthRequest,
    @Query() query: QuestionAttemptsQueryDto,
  ) {
    return this.questions.attempts(req.user.id, query);
  }
  @Post('attempts/answer')
  @ApiOperation({ summary: '提交答案并推进进度' })
  answer(@Req() req: AuthRequest, @Body() dto: AnswerQuestionDto) {
    return this.questions.answer(req.user.id, dto);
  }
  @Post('states/save')
  @ApiOperation({ summary: '保存收藏或错题状态' })
  saveState(@Req() req: AuthRequest, @Body() dto: SaveQuestionStateDto) {
    return this.questions.saveState(req.user.id, dto);
  }
}
