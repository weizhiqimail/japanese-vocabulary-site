import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SettingEntityConfig } from './setting.config';
@Entity(SettingEntityConfig.dbName)
export class SettingEntity {
  @PrimaryColumn({ name: 'setting_key', type: 'varchar', length: 100 })
  settingKey: string;
  @Column({ name: 'setting_value', type: 'json' }) settingValue: Record<
    string,
    unknown
  >;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
}
