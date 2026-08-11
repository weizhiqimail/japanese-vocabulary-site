import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewImportDto } from './dto/review-import.dto';
import { CreateImportBatchDto } from './dto/create-import-batch.dto';
import { ImportsService } from './imports.service';
@ApiTags('导入审核')
@ApiCookieAuth('jvs_session')
@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}
  @Post() @ApiOperation({ summary: '创建 CSV 导入审核批次' }) create(
    @Body() dto: CreateImportBatchDto,
  ) {
    return this.imports.create(dto.filename, dto.candidates);
  }
  @Post(':id/review') @ApiOperation({ summary: '审核候选词' }) review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewImportDto,
  ) {
    return this.imports.review(id, dto.decision);
  }
}
