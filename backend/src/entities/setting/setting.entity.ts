import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SettingEntityConfig } from './setting.config';

/** 系统设置实体。 */
@Entity({ name: SettingEntityConfig.dbName, comment: '系统设置' })
export class SettingEntity {
  @PrimaryColumn({
    name: 'setting_key',
    type: 'varchar',
    length: 100,
    comment: '配置键',
  })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'json', comment: '配置值' })
  settingValue: Record<string, unknown>;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    comment: '更新时间',
  })
  updatedAt: Date;
}
