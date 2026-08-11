import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ImportCandidateEntityConfig } from './import-candidate.config';
@Entity(ImportCandidateEntityConfig.dbName)
export class ImportCandidateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ name: 'batch_id', type: 'bigint', unsigned: true }) batchId: string;
  @Column({ type: 'varchar', length: 255 }) word: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) reading:
    string | null;
  @Column({ type: 'text' }) translation: string;
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'not_needed'],
  })
  status: string;
  @Column({
    name: 'duplicate_vocabulary_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  duplicateVocabularyId: string | null;
  @Column({
    name: 'approved_vocabulary_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  approvedVocabularyId: string | null;
  @Column({
    name: 'reviewed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  reviewedAt: Date | null;
  @Column({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
}
