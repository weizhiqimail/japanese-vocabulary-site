import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ImportCandidateEntityConfig } from './import-candidate.config';

/** CSV 导入候选词实体。 */
@Entity({ name: ImportCandidateEntityConfig.dbName, comment: '非正式词汇表' })
export class ImportCandidateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'batch_id',
    type: 'bigint',
    unsigned: true,
    comment: '批次ID',
  })
  batchId: string;

  @Column({ type: 'varchar', length: 255, comment: '候选词' })
  word: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '假名' })
  reading: string | null;

  @Column({ type: 'text', comment: '中文翻译' })
  translation: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'not_needed'],
    comment: '审核状态',
  })
  status: string;

  @Column({
    name: 'duplicate_vocabulary_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '重复正式词汇ID',
  })
  duplicateVocabularyId: string | null;

  @Column({
    name: 'approved_vocabulary_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '批准后正式词汇ID',
  })
  approvedVocabularyId: string | null;

  @Column({
    name: 'reviewed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '审核时间',
  })
  reviewedAt: Date | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;
}
