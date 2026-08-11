import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SaveSettingDto } from './dto/save-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('设置')
@ApiCookieAuth('jvs_session')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get() @ApiOperation({ summary: '全部设置' }) getAll() {
    return this.settings.getAll();
  }

  @Post('save')
  @ApiOperation({ summary: '保存设置' })
  save(@Body() dto: SaveSettingDto) {
    return this.settings.save(dto.key, dto.value);
  }
}
