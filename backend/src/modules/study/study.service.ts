import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {
  CollectionEntity,
  CollectionVocabularyEntity,
  StudyEventEntity,
  VocabularyEntity,
} from '@/entities';
@Injectable()
export class StudyService {
  constructor(private readonly dataSource: DataSource) {}
  collectionMembers(collectionId: number) {
    return this.dataSource
      .getRepository(VocabularyEntity)
      .createQueryBuilder('v')
      .innerJoin(CollectionVocabularyEntity, 'cv', 'cv.vocabularyId=v.id')
      .where('cv.collectionId=:collectionId', { collectionId })
      .andWhere('v.deletedAt IS NULL')
      .orderBy('cv.sortOrder', 'ASC')
      .addOrderBy('v.id', 'ASC')
      .getMany();
  }
  async record(vocabularyId: number, type: 'learn' | 'review') {
    await this.dataSource.transaction(async (manager) => {
      const result =
        type === 'learn'
          ? await manager
              .getRepository(VocabularyEntity)
              .createQueryBuilder()
              .update()
              .set({
                learnedAt: () => 'COALESCE(learned_at, CURRENT_TIMESTAMP(3))',
              })
              .where('id=:id AND deleted_at IS NULL', { id: vocabularyId })
              .execute()
          : await manager
              .getRepository(VocabularyEntity)
              .createQueryBuilder()
              .update()
              .set({
                reviewCount: () => 'review_count + 1',
                lastReviewedAt: () => 'CURRENT_TIMESTAMP(3)',
              })
              .where('id=:id AND deleted_at IS NULL', { id: vocabularyId })
              .execute();
      if (!result.affected) throw new NotFoundException('词汇不存在');
      await manager
        .getRepository(StudyEventEntity)
        .createQueryBuilder()
        .insert()
        .values({
          entityType: 'vocabulary',
          entityId: String(vocabularyId),
          eventType: type,
        })
        .execute();
    });
    return { id: vocabularyId };
  }
  async submitAnswer(vocabularyId: number, correct: boolean) {
    if (correct) return { vocabularyId };
    await this.dataSource.transaction(async (manager) => {
      const collection = await manager.getRepository(CollectionEntity).findOne({
        where: { type: 'error', isDefault: true, deletedAt: IsNull() },
      });
      if (!collection) return;
      const repo = manager.getRepository(CollectionVocabularyEntity);
      const existing = await repo.findOne({
        where: {
          collectionId: collection.id,
          vocabularyId: String(vocabularyId),
        },
      });
      if (existing)
        await repo
          .createQueryBuilder()
          .update()
          .set({
            errorCount: () => 'error_count + 1',
            lastErrorAt: () => 'CURRENT_TIMESTAMP(3)',
          })
          .where(
            'collection_id=:collectionId AND vocabulary_id=:vocabularyId',
            { collectionId: collection.id, vocabularyId },
          )
          .execute();
      else
        await repo
          .createQueryBuilder()
          .insert()
          .values({
            collectionId: collection.id,
            vocabularyId: String(vocabularyId),
            errorCount: 1,
            firstErrorAt: () => 'CURRENT_TIMESTAMP(3)',
            lastErrorAt: () => 'CURRENT_TIMESTAMP(3)',
          })
          .execute();
    });
    return { vocabularyId };
  }
  reviewList(mode: string) {
    const builder = this.dataSource
      .getRepository(VocabularyEntity)
      .createQueryBuilder('v')
      .where('v.deletedAt IS NULL');
    if (mode === 'mastered')
      builder.andWhere('v.reviewCount > 0').orderBy('v.reviewCount', 'DESC');
    else if (mode === 'favorites')
      builder
        .andWhere('v.favoriteCount > 0')
        .orderBy('v.favoriteCount', 'DESC');
    else
      builder
        .innerJoin(
          CollectionVocabularyEntity,
          'cv',
          'cv.vocabularyId=v.id AND cv.errorCount > 0',
        )
        .orderBy('cv.errorCount', 'DESC');
    return builder.take(100).getMany();
  }
}
