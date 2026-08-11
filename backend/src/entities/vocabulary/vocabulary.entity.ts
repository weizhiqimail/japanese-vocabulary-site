import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VocabularyEntityConfig } from './vocabulary.config';
@Entity(VocabularyEntityConfig.dbName)
export class VocabularyEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ type: 'varchar', length: 255 }) word: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) reading:
    string | null;
  @Column({ type: 'text' }) translation: string;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @Column({ name: 'favorite_count', type: 'int', unsigned: true, default: 0 })
  favoriteCount: number;
  @Column({
    name: 'learned_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  learnedAt: Date | null;
  @Column({ name: 'review_count', type: 'int', unsigned: true, default: 0 })
  reviewCount: number;
  @Column({
    name: 'last_reviewed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  lastReviewedAt: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt: Date | null;
}
