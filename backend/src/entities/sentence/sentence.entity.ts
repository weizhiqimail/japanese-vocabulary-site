import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SentenceEntityConfig } from './sentence.config';

/** 日语例句实体。 */
@Entity({ name: SentenceEntityConfig.dbName, comment: '句子库' })
export class SentenceEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'text', comment: '日语句子' })
  japanese: string;

  @Column({ type: 'text', nullable: true, comment: '注音' })
  reading: string | null;

  @Column({ type: 'text', comment: '中文翻译' })
  translation: string;

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
