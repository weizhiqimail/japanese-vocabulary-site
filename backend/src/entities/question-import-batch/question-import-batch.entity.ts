import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'question_import_batches', comment: '题库导入审计' })
export class QuestionImportBatchEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'bank_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '题库ID',
  })
  bankId: string | null;

  @Column({
    name: 'content_version',
    type: 'varchar',
    length: 64,
    comment: '内容版本',
  })
  contentVersion: string;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    comment: '原文件名',
  })
  originalFilename: string;

  @Column({
    name: 'file_hash',
    type: 'char',
    length: 64,
    comment: '文件SHA-256',
  })
  fileHash: string;

  @Column({
    name: 'question_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '题数',
  })
  questionCount: number;

  @Column({
    type: 'enum',
    enum: ['validating', 'completed', 'failed'],
    default: 'validating',
    comment: '导入状态',
  })
  status: 'validating' | 'completed' | 'failed';

  @Column({
    name: 'summary_json',
    type: 'json',
    nullable: true,
    comment: '校验与差异摘要',
  })
  summaryJson: Record<string, unknown> | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;

  @Column({
    name: 'completed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '完成时间',
  })
  completedAt: Date | null;
}
