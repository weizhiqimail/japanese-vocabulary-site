import { VocabularyEntity } from '@/entities/vocabulary/vocabulary.entity';
import { CollectionEntity } from '@/entities/collection/collection.entity';
import { GrammarEntity } from '@/entities/grammar/grammar.entity';
import { SentenceEntity } from '@/entities/sentence/sentence.entity';
import { TagEntity } from '@/entities/tag/tag.entity';
import { PartOfSpeechEntity } from '@/entities/part-of-speech/part-of-speech.entity';
import { SettingEntity } from '@/entities/setting/setting.entity';
import { CollectionVocabularyEntity } from '@/entities/collection-vocabulary/collection-vocabulary.entity';
import { StudyEventEntity } from '@/entities/study-event/study-event.entity';
import { ImportCandidateEntity } from '@/entities/import-candidate/import-candidate.entity';
import { ImportBatchEntity } from '@/entities/import-batch/import-batch.entity';
import { AppUserEntity } from '@/entities/app-user/app-user.entity';
import { AuthSessionEntity } from '@/entities/auth-session/auth-session.entity';
import { QuestionGroupEntity } from '@/entities/question-group/question-group.entity';
import { QuestionBankEntity } from '@/entities/question-bank/question-bank.entity';
import { QuestionEntity } from '@/entities/question/question.entity';
import { QuestionOptionEntity } from '@/entities/question-option/question-option.entity';
import { QuestionProgressEntity } from '@/entities/question-progress/question-progress.entity';
import { QuestionAttemptEntity } from '@/entities/question-attempt/question-attempt.entity';
import { QuestionStateEntity } from '@/entities/question-state/question-state.entity';
import { QuestionImportBatchEntity } from '@/entities/question-import-batch/question-import-batch.entity';

export * from '@/entities/vocabulary/vocabulary.entity';
export * from '@/entities/collection/collection.entity';
export * from '@/entities/grammar/grammar.entity';
export * from '@/entities/sentence/sentence.entity';
export * from '@/entities/tag/tag.entity';
export * from '@/entities/part-of-speech/part-of-speech.entity';
export * from '@/entities/setting/setting.entity';
export * from '@/entities/collection-vocabulary/collection-vocabulary.entity';
export * from '@/entities/study-event/study-event.entity';
export * from '@/entities/import-candidate/import-candidate.entity';
export * from '@/entities/import-batch/import-batch.entity';
export * from '@/entities/app-user/app-user.entity';
export * from '@/entities/auth-session/auth-session.entity';
export * from '@/entities/question-group/question-group.entity';
export * from '@/entities/question-bank/question-bank.entity';
export * from '@/entities/question/question.entity';
export * from '@/entities/question-option/question-option.entity';
export * from '@/entities/question-progress/question-progress.entity';
export * from '@/entities/question-attempt/question-attempt.entity';
export * from '@/entities/question-state/question-state.entity';
export * from '@/entities/question-import-batch/question-import-batch.entity';
export const ALL_ENTITIES = [
  VocabularyEntity,
  CollectionEntity,
  GrammarEntity,
  SentenceEntity,
  TagEntity,
  PartOfSpeechEntity,
  SettingEntity,
  CollectionVocabularyEntity,
  StudyEventEntity,
  ImportCandidateEntity,
  ImportBatchEntity,
  AppUserEntity,
  AuthSessionEntity,
  QuestionGroupEntity,
  QuestionBankEntity,
  QuestionEntity,
  QuestionOptionEntity,
  QuestionProgressEntity,
  QuestionAttemptEntity,
  QuestionStateEntity,
  QuestionImportBatchEntity,
];
