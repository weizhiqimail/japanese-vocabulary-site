import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '@/entities';
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: Repository<SettingEntity>,
  ) {}
  async getAll() {
    const rows = await this.settings.find();
    return Object.fromEntries(
      rows.map((row) => [row.settingKey, row.settingValue]),
    );
  }
  async save(key: string, value: Record<string, unknown>) {
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
    return { key, value };
  }
}
