import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import {
  CollectionEntity,
  CollectionVocabularyEntity,
  VocabularyEntity,
} from '@/entities';
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(VocabularyEntity)
    private readonly vocabularies: Repository<VocabularyEntity>,
    @InjectRepository(CollectionEntity)
    private readonly collections: Repository<CollectionEntity>,
    @InjectRepository(CollectionVocabularyEntity)
    private readonly members: Repository<CollectionVocabularyEntity>,
  ) {}
  async getStats() {
    const [vocabularies, collections, learned, errors] = await Promise.all([
      this.vocabularies.count({ where: { deletedAt: IsNull() } }),
      this.collections.count({ where: { deletedAt: IsNull() } }),
      this.vocabularies.count({
        where: { deletedAt: IsNull(), learnedAt: MoreThan(new Date(0)) },
      }),
      this.members
        .createQueryBuilder('member')
        .innerJoin(
          VocabularyEntity,
          'v',
          'v.id=member.vocabularyId AND v.deletedAt IS NULL',
        )
        .where('member.errorCount > 0')
        .select('COUNT(DISTINCT member.vocabularyId)', 'count')
        .getRawOne<{ count: string }>(),
    ]);
    return {
      vocabularies,
      collections,
      learned,
      errors: Number(errors?.count || 0),
    };
  }
}
