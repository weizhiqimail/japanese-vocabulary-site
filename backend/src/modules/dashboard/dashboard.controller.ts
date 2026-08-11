import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
@ApiTags('首页')
@ApiCookieAuth('jvs_session')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}
  @Get() @ApiOperation({ summary: '首页统计' }) getStats() {
    return this.dashboard.getStats();
  }
}
