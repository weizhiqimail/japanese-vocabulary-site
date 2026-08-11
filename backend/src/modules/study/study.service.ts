import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {
  CollectionEntity,
  CollectionVocabularyEntity,
  StudyEventEntity,
  VocabularyEntity,
} from '@/entities';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 集合学习、复习记录和错题归集业务。 */
@Injectable()
export class StudyService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
  ) {}

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

  async testQuestions(collectionId: number) {
    const size = 10;
    const items = await this.dataSource
      .getRepository(VocabularyEntity)
      .createQueryBuilder('v')
      .innerJoin(CollectionVocabularyEntity, 'cv', 'cv.vocabularyId=v.id')
      .where('cv.collectionId=:collectionId', { collectionId })
      .andWhere('v.deletedAt IS NULL')
      .orderBy('RAND()')
      .take(size)
      .getMany();

    if (items.length < size) {
      throw new BadRequestException('集合至少需要 10 个词汇才能开始测试');
    }

    return items.map((item, index) => {
      const distractors = items
        .filter((candidate) => candidate.id !== item.id)
        .slice(index % Math.max(1, items.length - 1))
        .concat(items)
        .filter((candidate) => candidate.id !== item.id)
        .slice(0, 3)
        .map((candidate) => candidate.translation);
      const options = [...new Set([item.translation, ...distractors])].sort(
        () => Math.random() - 0.5,
      );

      return {
        id: item.id,
        word: item.word,
        reading: item.reading,
        translation: item.translation,
        options,
      };
    });
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
      if (!result.affected) {
        throw new NotFoundException('词汇不存在');
      }

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

    this.logger.business('Study event recorded', { type, vocabularyId });

    return { id: vocabularyId };
  }

  async submitAnswer(vocabularyId: number, correct: boolean) {
    if (correct) {
      this.logger.business('Test answer accepted', {
        correct,
        vocabularyId,
      });

      return { vocabularyId };
    }

    await this.dataSource.transaction(async (manager) => {
      const collection = await manager.getRepository(CollectionEntity).findOne({
        where: { type: 'error', isDefault: true, deletedAt: IsNull() },
      });
      if (!collection) {
        this.logger.business(
          'Error collection missing; answer not collected',
          { vocabularyId },
          'WARN',
        );

        return;
      }

      const repo = manager.getRepository(CollectionVocabularyEntity);
      const existing = await repo.findOne({
        where: {
          collectionId: collection.id,
          vocabularyId: String(vocabularyId),
        },
      });
      if (existing) {
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
      } else {
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
      }
    });

    this.logger.business('Incorrect answer collected', { vocabularyId });

    return { vocabularyId };
  }

  reviewList(mode: string) {
    const builder = this.dataSource
      .getRepository(VocabularyEntity)
      .createQueryBuilder('v')
      .where('v.deletedAt IS NULL');
    if (mode === 'mastered') {
      builder.andWhere('v.reviewCount > 0').orderBy('v.reviewCount', 'DESC');
    } else if (mode === 'favorites') {
      builder
        .andWhere('v.favoriteCount > 0')
        .orderBy('v.favoriteCount', 'DESC');
    } else {
      builder
        .andWhere(
          'EXISTS (SELECT 1 FROM collection_vocabularies cv WHERE cv.vocabulary_id = v.id AND cv.error_count > 0)',
        )
        .orderBy(
          '(SELECT MAX(cv.error_count) FROM collection_vocabularies cv WHERE cv.vocabulary_id = v.id)',
          'DESC',
        )
        .addOrderBy('v.id', 'ASC');
    }

    return builder.take(100).getMany();
  }
}
