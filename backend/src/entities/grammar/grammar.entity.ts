import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GrammarEntityConfig } from './grammar.config';

/** 语法知识实体。 */
@Entity({ name: GrammarEntityConfig.dbName, comment: '语法库' })
export class GrammarEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '语法形式' })
  pattern: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '读法' })
  reading: string | null;

  @Column({ type: 'text', comment: '中文含义' })
  meaning: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string | null;

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
