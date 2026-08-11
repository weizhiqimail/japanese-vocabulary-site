import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ImportBatchEntity,
  ImportCandidateEntity,
  VocabularyEntity,
} from '@/entities';

interface CandidateInput {
  word: string;
  reading?: string;
  translation: string;
}
@Injectable()
export class ImportsService {
  constructor(private readonly dataSource: DataSource) {}

  create(filename: string, candidates: CandidateInput[]) {
    return this.dataSource.transaction(async (manager) => {
      const batches = manager.getRepository(ImportBatchEntity);
      const candidateRepository = manager.getRepository(ImportCandidateEntity);
      const vocabularies = manager.getRepository(VocabularyEntity);
      const batch = await batches.save(
        batches.create({
          name: 'CSV 导入',
          originalFilename: filename.trim(),
          status: 'reviewing',
        }),
      );
      let accepted = 0;
      for (const input of candidates) {
        const word = input.word.trim();
        const reading = input.reading?.trim() || null;
        const translation = input.translation.trim();
        if (!word || !translation) continue;
        const duplicate = await vocabularies
          .createQueryBuilder('vocabulary')
          .select('vocabulary.id')
          .where('vocabulary.word = :word', { word })
          .andWhere(
            "COALESCE(vocabulary.reading, '') = COALESCE(:reading, '')",
            {
              reading,
            },
          )
          .andWhere('vocabulary.deletedAt IS NULL')
          .getOne();
        await candidateRepository.save(
          candidateRepository.create({
            batchId: batch.id,
            word,
            reading,
            translation,
            status: duplicate ? 'not_needed' : 'pending',
            duplicateVocabularyId: duplicate?.id || null,
            approvedVocabularyId: null,
            reviewedAt: null,
          }),
        );
        accepted += 1;
      }
      if (!accepted) throw new BadRequestException('CSV 中没有有效数据');
      return { batchId: batch.id, candidateCount: accepted };
    });
  }

  review(id: number, decision: 'approve' | 'reject' | 'not_needed') {
    return this.dataSource.transaction(async (manager) => {
      const candidate = await manager
        .getRepository(ImportCandidateEntity)
        .createQueryBuilder('candidate')
        .setLock('pessimistic_write')
        .where('candidate.id=:id', { id })
        .getOne();
      if (!candidate || candidate.status !== 'pending')
        throw new BadRequestException('审核项不存在或已经处理');
      if (decision === 'approve') {
        const saved = await manager.getRepository(VocabularyEntity).save(
          manager.getRepository(VocabularyEntity).create({
            word: candidate.word,
            reading: candidate.reading,
            translation: candidate.translation,
          }),
        );
        candidate.status = 'approved';
        candidate.approvedVocabularyId = saved.id;
      } else
        candidate.status = decision === 'reject' ? 'rejected' : 'not_needed';
      candidate.reviewedAt = new Date();
      await manager.getRepository(ImportCandidateEntity).save(candidate);
      return { id };
    });
  }
}
