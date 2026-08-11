import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '@/entities';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';
import type { PaginationDefaultsDto } from '@/modules/settings/dto/save-setting.dto';

/** 系统学习和测试设置业务。 */
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: Repository<SettingEntity>,
    private readonly logger: AppLoggerService,
  ) {}

  async getAll() {
    const rows = await this.settings.find();

    return Object.fromEntries(
      rows.map((row) => [row.settingKey, row.settingValue]),
    );
  }

  async save(key: string, value: PaginationDefaultsDto) {
    await this.settings
      .createQueryBuilder()
      .insert()
      .values({
        settingKey: key,
        settingValue: () => 'CAST(:settingValue AS JSON)',
      })
      .setParameter('settingValue', JSON.stringify(value))
      .orUpdate(['setting_value'], ['setting_key'])
      .execute();

    this.logger.business('Setting saved', { key });

    return { key, value };
  }
}
