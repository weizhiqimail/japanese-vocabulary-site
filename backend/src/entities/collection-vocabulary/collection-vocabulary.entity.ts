import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CollectionVocabularyEntityConfig } from './collection-vocabulary.config';
@Entity(CollectionVocabularyEntityConfig.dbName)
export class CollectionVocabularyEntity {
  @PrimaryColumn({ name: 'collection_id', type: 'bigint', unsigned: true })
  collectionId: string;
  @PrimaryColumn({ name: 'vocabulary_id', type: 'bigint', unsigned: true })
  vocabularyId: string;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  @Column({ name: 'joined_at', type: 'datetime', precision: 3 }) joinedAt: Date;
  @Column({
    name: 'first_error_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  firstErrorAt: Date | null;
  @Column({
    name: 'last_error_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  lastErrorAt: Date | null;
  @Column({ name: 'error_count', type: 'int', unsigned: true, default: 0 })
  errorCount: number;
  @Column({ name: 'mastered_count', type: 'int', unsigned: true, default: 0 })
  masteredCount: number;
  @Column({
    name: 'last_mastered_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  lastMasteredAt: Date | null;
}
