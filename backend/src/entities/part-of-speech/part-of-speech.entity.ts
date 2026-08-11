import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartOfSpeechEntityConfig } from './part-of-speech.config';

/** 系统固定词性实体。 */
@Entity({ name: PartOfSpeechEntityConfig.dbName, comment: '固定词性' })
export class PartOfSpeechEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    type: 'varchar',
    length: 64,
    unique: true,
    comment: '稳定枚举代码',
  })
  code: string;

  @Column({ type: 'varchar', length: 64, comment: '词性名称' })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  enabled: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    comment: '更新时间',
  })
  updatedAt: Date;
}
