import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VocabularyEntityConfig } from './vocabulary.config';

/** 正式词汇实体。 */
@Entity({ name: VocabularyEntityConfig.dbName, comment: '正式核心词库' })
export class VocabularyEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '日语词汇' })
  word: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '假名' })
  reading: string | null;

  @Column({ type: 'text', comment: '中文翻译' })
  translation: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string | null;

  @Column({
    name: 'favorite_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '收藏次数',
  })
  favoriteCount: number;

  @Column({
    name: 'learned_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '首次学习时间',
  })
  learnedAt: Date | null;

  @Column({
    name: 'review_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '复习次数',
  })
  reviewCount: number;

  @Column({
    name: 'last_reviewed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近复习时间',
  })
  lastReviewedAt: Date | null;

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
