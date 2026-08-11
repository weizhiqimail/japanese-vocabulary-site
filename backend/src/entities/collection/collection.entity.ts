import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CollectionEntityConfig } from './collection.config';

/** 词汇集合实体。 */
@Entity({ name: CollectionEntityConfig.dbName, comment: '词汇集合' })
export class CollectionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '集合名' })
  name: string;

  @Column({
    type: 'enum',
    enum: ['source', 'custom', 'favorite', 'error'],
    default: 'custom',
    comment: '集合类型',
  })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '来源' })
  source: string | null;

  @Column({ type: 'text', nullable: true, comment: '说明' })
  description: string | null;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
    comment: '是否默认集合',
  })
  isDefault: boolean;

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
