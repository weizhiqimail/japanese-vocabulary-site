import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewImportDto } from './dto/review-import.dto';
import { CreateImportBatchDto } from './dto/create-import-batch.dto';
import { ImportsService } from './imports.service';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('导入审核')
@ApiCookieAuth('jvs_session')
@Controller(['imports', 'words/imports'])
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Get()
  @ApiOperation({ summary: '分页查询导入审核项' })
  list(@Query() query: PaginationQueryDto) {
    return this.imports.list(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建 CSV 导入审核批次' })
  create(@Body() dto: CreateImportBatchDto) {
    return this.imports.create(dto.filename, dto.candidates);
  }

  @Post('review')
  @ApiOperation({ summary: '审核候选词' })
  review(@Body() dto: ReviewImportDto) {
    return this.imports.review(dto.candidateId, dto.decision);
  }
}
