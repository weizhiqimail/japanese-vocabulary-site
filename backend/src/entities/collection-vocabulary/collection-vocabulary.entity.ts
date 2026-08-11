import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CollectionVocabularyEntityConfig } from './collection-vocabulary.config';

/** 集合与词汇成员关系实体。 */
@Entity({
  name: CollectionVocabularyEntityConfig.dbName,
  comment: '集合词汇成员',
})
export class CollectionVocabularyEntity {
  @PrimaryColumn({
    name: 'collection_id',
    type: 'bigint',
    unsigned: true,
    comment: '集合ID',
  })
  collectionId: string;

  @PrimaryColumn({
    name: 'vocabulary_id',
    type: 'bigint',
    unsigned: true,
    comment: '词汇ID',
  })
  vocabularyId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '集合顺序' })
  sortOrder: number;

  @Column({
    name: 'joined_at',
    type: 'datetime',
    precision: 3,
    comment: '加入时间',
  })
  joinedAt: Date;

  @Column({
    name: 'first_error_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '首次错误时间',
  })
  firstErrorAt: Date | null;

  @Column({
    name: 'last_error_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近错误时间',
  })
  lastErrorAt: Date | null;

  @Column({
    name: 'error_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '错误次数',
  })
  errorCount: number;

  @Column({
    name: 'mastered_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '掌握次数',
  })
  masteredCount: number;

  @Column({
    name: 'last_mastered_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近掌握时间',
  })
  lastMasteredAt: Date | null;
}
