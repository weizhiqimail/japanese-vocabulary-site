import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TagEntityConfig } from './tag.config';

/** 统一属性标签实体。 */
@Entity({ name: TagEntityConfig.dbName, comment: '词汇标签' })
export class TagEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: '标签名' })
  name: string;

  @Column({
    type: 'varchar',
    length: 24,
    default: '#FDE68A',
    comment: '固定浅色背景色',
  })
  color: string;

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

  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '逻辑删除时间',
  })
  deletedAt: Date | null;
}
