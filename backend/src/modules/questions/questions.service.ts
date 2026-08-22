import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, type QueryRunner } from 'typeorm';
import type { AnswerQuestionDto } from './dto/answer-question.dto';
import type {
  CurrentQuestionQueryDto,
  QuestionAttemptsQueryDto,
  QuestionBanksQueryDto,
  QuestionGroupsQueryDto,
  QuestionItemsQueryDto,
} from './dto/question-queries.dto';
import type { SaveQuestionStateDto } from './dto/save-question-state.dto';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

const parseJson = <T>(value: unknown): T =>
  typeof value === 'string' ? (JSON.parse(value) as T) : (value as T);
const normalizeKeys = (keys: string[]) =>
  [
    ...new Set(keys.map((key) => key.toUpperCase().trim()).filter(Boolean)),
  ].sort();
const normalizeLocalized = (value: unknown): Record<string, string> => {
  const parsed = parseJson<unknown>(value);
  if (typeof parsed === 'string') return parsed.trim() ? { en: parsed } : {};
  if (!parsed || typeof parsed !== 'object') return {};

  return Object.fromEntries(
    Object.entries(parsed).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && Boolean(entry[1].trim()),
    ),
  );
};

@Injectable()
export class QuestionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
  ) {}

  groups(query: QuestionGroupsQueryDto) {
    const clauses = ['deleted_at IS NULL', 'enabled=1'];
    const values: unknown[] = [];
    if (query.parentId) {
      clauses.push('parent_id=?');
      values.push(query.parentId);
    } else if (query.level === 'provider') clauses.push('parent_id IS NULL');
    if (query.level) {
      clauses.push('group_level=?');
      values.push(query.level);
    }

    return this.dataSource.query(
      `SELECT id,parent_id AS parentId,code,name,group_level AS groupLevel,description,sort_order AS sortOrder FROM question_groups WHERE ${clauses.join(' AND ')} ORDER BY sort_order,id`,
      values,
    );
  }

  async banks(userId: string, query: QuestionBanksQueryDto) {
    const skip = (query.pageNum - 1) * query.pageSize;
    const clauses = ['b.deleted_at IS NULL', 'b.enabled=1'];
    const values: unknown[] = [userId];
    if (query.subgroupId) {
      clauses.push('b.group_id=?');
      values.push(query.subgroupId);
    } else if (query.groupId) {
      clauses.push('sg.parent_id=?');
      values.push(query.groupId);
    }
    if (query.q) {
      clauses.push('(b.name LIKE ? OR b.code LIKE ?)');
      values.push(`%${query.q}%`, `%${query.q}%`);
    }
    const from = `FROM question_banks b JOIN question_groups sg ON sg.id=b.group_id LEFT JOIN question_groups pg ON pg.id=sg.parent_id LEFT JOIN question_progress p ON p.bank_id=b.id AND p.user_id=? WHERE ${clauses.join(' AND ')}`;
    const rows = await this.dataSource.query(
      `SELECT b.id,b.code,b.name,b.description,b.content_version AS contentVersion,b.supported_languages AS supportedLanguages,b.default_language AS defaultLanguage,b.question_count AS questionCount,sg.id AS subgroupId,sg.code AS subgroupCode,sg.name AS subgroupName,pg.id AS groupId,pg.code AS groupCode,pg.name AS groupName,COALESCE(p.status,'not_started') AS status,COALESCE(p.answered_count,0) AS answeredCount,COALESCE(p.correct_count,0) AS correctCount,COALESCE(p.current_position,1) AS currentPosition,p.last_answered_at AS lastAnsweredAt,(SELECT COUNT(*) FROM question_states qs JOIN questions q ON q.id=qs.question_id WHERE qs.user_id=? AND qs.is_in_error_book=1 AND q.bank_id=b.id AND q.enabled=1) AS errorCount,(SELECT COUNT(*) FROM question_states qs JOIN questions q ON q.id=qs.question_id WHERE qs.user_id=? AND qs.is_favorite=1 AND q.bank_id=b.id AND q.enabled=1) AS favoriteCount ${from} ORDER BY pg.sort_order,sg.sort_order,b.name LIMIT ? OFFSET ?`,
      [userId, userId, ...values, query.pageSize, skip],
    );
    const totals = await this.dataSource.query(
      `SELECT COUNT(*) AS total ${from}`,
      values,
    );

    return {
      data: rows.map((row: Record<string, unknown>) => ({
        ...row,
        supportedLanguages: parseJson(row.supportedLanguages),
      })),
      pagination: {
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        total: Number(totals[0].total),
      },
    };
  }

  async detail(userId: string, bankId: number) {
    const direct = await this.dataSource.query(
      `SELECT b.id,b.code,b.name,b.description,b.question_count AS questionCount,b.supported_languages AS supportedLanguages,b.default_language AS defaultLanguage,sg.code AS subgroupCode,sg.name AS subgroupName,pg.code AS groupCode,pg.name AS groupName,COALESCE(p.status,'not_started') AS status,COALESCE(p.answered_count,0) AS answeredCount,COALESCE(p.correct_count,0) AS correctCount,COALESCE(p.current_position,1) AS currentPosition,(SELECT COUNT(*) FROM question_states qs JOIN questions q ON q.id=qs.question_id WHERE qs.user_id=? AND qs.is_in_error_book=1 AND q.bank_id=b.id) AS errorCount,(SELECT COUNT(*) FROM question_states qs JOIN questions q ON q.id=qs.question_id WHERE qs.user_id=? AND qs.is_favorite=1 AND q.bank_id=b.id) AS favoriteCount FROM question_banks b JOIN question_groups sg ON sg.id=b.group_id LEFT JOIN question_groups pg ON pg.id=sg.parent_id LEFT JOIN question_progress p ON p.bank_id=b.id AND p.user_id=? WHERE b.id=? AND b.deleted_at IS NULL`,
      [userId, userId, userId, bankId],
    );
    if (!direct[0]) throw new NotFoundException('题库不存在');

    return {
      ...direct[0],
      supportedLanguages: parseJson(direct[0].supportedLanguages),
    };
  }

  async current(userId: string, query: CurrentQuestionQueryDto) {
    let questionId: string | undefined;
    if (query.mode === 'sequential') {
      const progress = await this.ensureProgress(userId, query.bankId);
      if (progress.status === 'completed' || !progress.currentQuestionId)
        return { completed: true };
      questionId = progress.currentQuestionId;
    } else {
      const stateField =
        query.mode === 'error_review' ? 'is_in_error_book' : 'is_favorite';
      const rows = await this.dataSource.query(
        `SELECT q.id FROM questions q JOIN question_states s ON s.question_id=q.id AND s.user_id=? WHERE q.bank_id=? AND q.enabled=1 AND q.deleted_at IS NULL AND s.${stateField}=1 ORDER BY q.sort_order LIMIT 1`,
        [userId, query.bankId],
      );
      questionId = rows[0]?.id;
      if (!questionId) return { completed: true };
    }

    return this.questionPayload(userId, questionId!, query.mode);
  }

  async items(userId: string, query: QuestionItemsQueryDto) {
    const field = query.scope === 'errors' ? 'is_in_error_book' : 'is_favorite';
    const skip = (query.pageNum - 1) * query.pageSize;
    const values: unknown[] = [userId, query.bankId];
    const search = query.q ? ' AND CAST(q.question_texts AS CHAR) LIKE ?' : '';
    if (query.q) values.push(`%${query.q}%`);
    const from = `FROM questions q JOIN question_states s ON s.question_id=q.id AND s.user_id=? WHERE q.bank_id=? AND q.enabled=1 AND q.deleted_at IS NULL AND s.${field}=1${search}`;
    const rows = await this.dataSource.query(
      `SELECT q.id,q.external_key AS externalKey,q.sort_order AS sortOrder,q.question_type AS questionType,q.question_texts AS questionTexts,s.wrong_count AS wrongCount,s.is_favorite AS isFavorite,s.is_in_error_book AS isInErrorBook ${from} ORDER BY q.sort_order LIMIT ? OFFSET ?`,
      [...values, query.pageSize, skip],
    );
    const totals = await this.dataSource.query(
      `SELECT COUNT(*) AS total ${from}`,
      values,
    );

    return {
      data: rows,
      pagination: {
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        total: Number(totals[0].total),
      },
    };
  }

  async attempts(userId: string, query: QuestionAttemptsQueryDto) {
    const skip = (query.pageNum - 1) * query.pageSize;
    const rows = await this.dataSource.query(
      'SELECT a.id,a.question_id AS questionId,q.external_key AS externalKey,a.mode,a.selected_option_keys AS selectedOptionKeys,a.correct_option_keys AS correctOptionKeys,a.is_correct AS isCorrect,a.duration_ms AS durationMs,a.answered_at AS answeredAt FROM question_attempts a JOIN questions q ON q.id=a.question_id WHERE a.user_id=? AND a.bank_id=? ORDER BY a.answered_at DESC LIMIT ? OFFSET ?',
      [userId, query.bankId, query.pageSize, skip],
    );
    const totals = await this.dataSource.query(
      'SELECT COUNT(*) AS total FROM question_attempts WHERE user_id=? AND bank_id=?',
      [userId, query.bankId],
    );

    return {
      data: rows.map((row: Record<string, unknown>) => ({
        ...row,
        selectedOptionKeys: parseJson(row.selectedOptionKeys),
        correctOptionKeys: parseJson(row.correctOptionKeys),
      })),
      pagination: {
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        total: Number(totals[0].total),
      },
    };
  }

  async answer(userId: string, dto: AnswerQuestionDto) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const existing = await runner.query(
        'SELECT * FROM question_attempts WHERE request_key=? AND user_id=? LIMIT 1',
        [dto.requestKey, userId],
      );
      if (existing[0]) {
        await runner.commitTransaction();
        const detail = await this.questionPayload(
          userId,
          String(existing[0].question_id),
          String(existing[0].mode),
          true,
        );

        return {
          ...this.attemptResult(existing[0]),
          explanationTexts: detail.explanationTexts,
          state: detail.state,
        };
      }
      const questions = await runner.query(
        'SELECT id,bank_id AS bankId FROM questions WHERE id=? AND bank_id=? AND enabled=1 AND deleted_at IS NULL LIMIT 1',
        [dto.questionId, dto.bankId],
      );
      if (!questions[0]) throw new NotFoundException('题目不存在');
      if (dto.mode === 'sequential') {
        await this.ensureProgress(userId, dto.bankId, runner);
        const progress = (
          await runner.query(
            'SELECT * FROM question_progress WHERE user_id=? AND bank_id=? FOR UPDATE',
            [userId, dto.bankId],
          )
        )[0];
        if (String(progress.current_question_id) !== String(dto.questionId))
          throw new ConflictException('答题进度已变化，请刷新后继续');
      }
      const options = await runner.query(
        'SELECT option_key AS optionKey,is_correct AS isCorrect FROM question_options WHERE question_id=? ORDER BY sort_order',
        [dto.questionId],
      );
      const validKeys = options.map(
        (option: { optionKey: string }) => option.optionKey,
      );
      const selected = normalizeKeys(dto.selectedOptionKeys);
      if (!selected.length || selected.some((key) => !validKeys.includes(key)))
        throw new BadRequestException('所选答案无效');
      const correctKeys = normalizeKeys(
        options
          .filter((option: { isCorrect: boolean }) => option.isCorrect)
          .map((option: { optionKey: string }) => option.optionKey),
      );
      const correct = JSON.stringify(selected) === JSON.stringify(correctKeys);
      await runner.query(
        'INSERT INTO question_attempts(request_key,user_id,bank_id,question_id,mode,selected_option_keys,correct_option_keys,is_correct,duration_ms) VALUES(?,?,?,?,?,?,?,?,?)',
        [
          dto.requestKey,
          userId,
          dto.bankId,
          dto.questionId,
          dto.mode,
          JSON.stringify(selected),
          JSON.stringify(correctKeys),
          correct ? 1 : 0,
          dto.durationMs ?? null,
        ],
      );
      await runner.query(
        `INSERT INTO question_states(user_id,question_id,attempt_count,correct_count,wrong_count,last_is_correct,first_wrong_at,last_wrong_at,is_in_error_book,last_answered_at) VALUES(?,?,1,?,?,?,${correct ? 'NULL,NULL,0' : 'CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3),1'},CURRENT_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE attempt_count=attempt_count+1,correct_count=correct_count+VALUES(correct_count),wrong_count=wrong_count+VALUES(wrong_count),last_is_correct=VALUES(last_is_correct),first_wrong_at=COALESCE(first_wrong_at,VALUES(first_wrong_at)),last_wrong_at=IF(VALUES(wrong_count)>0,CURRENT_TIMESTAMP(3),last_wrong_at),is_in_error_book=IF(VALUES(wrong_count)>0,1,is_in_error_book),last_answered_at=CURRENT_TIMESTAMP(3)`,
        [
          userId,
          dto.questionId,
          correct ? 1 : 0,
          correct ? 0 : 1,
          correct ? 1 : 0,
        ],
      );
      if (dto.mode === 'sequential') {
        const next = await runner.query(
          'SELECT id,sort_order AS sortOrder FROM questions WHERE bank_id=? AND enabled=1 AND deleted_at IS NULL AND sort_order>(SELECT sort_order FROM questions WHERE id=?) ORDER BY sort_order LIMIT 1',
          [dto.bankId, dto.questionId],
        );
        await runner.query(
          `UPDATE question_progress SET status=?,current_question_id=?,current_position=?,answered_count=answered_count+1,correct_count=correct_count+?,last_answered_at=CURRENT_TIMESTAMP(3),completed_at=? WHERE user_id=? AND bank_id=?`,
          [
            next[0] ? 'in_progress' : 'completed',
            next[0]?.id ?? null,
            next[0]?.sortOrder ?? (await this.bankCount(dto.bankId, runner)),
            correct ? 1 : 0,
            next[0] ? null : new Date(),
            userId,
            dto.bankId,
          ],
        );
      }
      await runner.commitTransaction();
      this.logger.business('Question answered', {
        bankId: dto.bankId,
        questionId: dto.questionId,
        mode: dto.mode,
        correct,
        userId,
      });
      const detail = await this.questionPayload(
        userId,
        String(dto.questionId),
        dto.mode,
        true,
      );

      return {
        requestKey: dto.requestKey,
        correct,
        correctOptionKeys: correctKeys,
        explanationTexts: detail.explanationTexts,
        state: detail.state,
      };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async saveState(userId: string, dto: SaveQuestionStateDto) {
    if (dto.isFavorite === undefined && dto.isInErrorBook === undefined)
      throw new BadRequestException('没有需要保存的状态');
    const rows = await this.dataSource.query(
      'SELECT id FROM questions WHERE id=? AND enabled=1 AND deleted_at IS NULL',
      [dto.questionId],
    );
    if (!rows[0]) throw new NotFoundException('题目不存在');
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'INSERT IGNORE INTO question_states(user_id,question_id) VALUES(?,?)',
        [userId, dto.questionId],
      );
      if (dto.isFavorite !== undefined)
        await manager.query(
          'UPDATE question_states SET is_favorite=?,favorited_at=? WHERE user_id=? AND question_id=?',
          [
            dto.isFavorite ? 1 : 0,
            dto.isFavorite ? new Date() : null,
            userId,
            dto.questionId,
          ],
        );
      if (dto.isInErrorBook !== undefined)
        await manager.query(
          'UPDATE question_states SET is_in_error_book=?,error_resolved_at=? WHERE user_id=? AND question_id=?',
          [
            dto.isInErrorBook ? 1 : 0,
            dto.isInErrorBook ? null : new Date(),
            userId,
            dto.questionId,
          ],
        );
    });

    return {
      questionId: dto.questionId,
      isFavorite: dto.isFavorite,
      isInErrorBook: dto.isInErrorBook,
    };
  }

  private async ensureProgress(
    userId: string,
    bankId: number,
    existingRunner?: QueryRunner,
  ) {
    const runner = existingRunner || this.dataSource.createQueryRunner();
    const ownsRunner = !existingRunner;
    if (ownsRunner) await runner.connect();
    try {
      const existing = await runner.query(
        'SELECT id,status,current_question_id AS currentQuestionId,current_position AS currentPosition,answered_count AS answeredCount FROM question_progress WHERE user_id=? AND bank_id=? LIMIT 1',
        [userId, bankId],
      );
      if (existing[0]) return existing[0];
      const first = await runner.query(
        'SELECT id,sort_order AS sortOrder FROM questions WHERE bank_id=? AND enabled=1 AND deleted_at IS NULL ORDER BY sort_order LIMIT 1',
        [bankId],
      );
      if (!first[0]) throw new NotFoundException('题库不存在或没有有效题目');
      await runner.query(
        "INSERT IGNORE INTO question_progress(user_id,bank_id,status,current_question_id,current_position,started_at) VALUES(?,?,'in_progress',?,?,CURRENT_TIMESTAMP(3))",
        [userId, bankId, first[0].id, first[0].sortOrder],
      );

      return (
        await runner.query(
          'SELECT id,status,current_question_id AS currentQuestionId,current_position AS currentPosition,answered_count AS answeredCount FROM question_progress WHERE user_id=? AND bank_id=? LIMIT 1',
          [userId, bankId],
        )
      )[0];
    } finally {
      if (ownsRunner) await runner.release();
    }
  }

  private async questionPayload(
    userId: string,
    questionId: string,
    mode: string,
    reveal = false,
  ) {
    const rows = await this.dataSource.query(
      'SELECT q.*,b.question_count AS questionCount,s.is_favorite AS isFavorite,s.is_in_error_book AS isInErrorBook,s.wrong_count AS wrongCount FROM questions q JOIN question_banks b ON b.id=q.bank_id LEFT JOIN question_states s ON s.question_id=q.id AND s.user_id=? WHERE q.id=? LIMIT 1',
      [userId, questionId],
    );
    if (!rows[0]) throw new NotFoundException('题目不存在');
    const row = rows[0];
    const texts = normalizeLocalized(row.question_texts);
    const options = await this.dataSource.query(
      'SELECT option_key AS optionKey,content_texts AS contentTexts,is_correct AS isCorrect FROM question_options WHERE question_id=? ORDER BY sort_order',
      [questionId],
    );

    return {
      id: row.id,
      bankId: row.bank_id,
      externalKey: row.external_key,
      position: row.sort_order,
      questionCount: Number(row.questionCount),
      questionType: row.question_type,
      questionTexts: texts,
      options: options.map((option: Record<string, unknown>) => {
        const content = normalizeLocalized(option.contentTexts);

        return {
          key: option.optionKey,
          contentTexts: content,
          ...(reveal ? { isCorrect: Boolean(option.isCorrect) } : {}),
        };
      }),
      mode,
      explanationTexts: reveal
        ? normalizeLocalized(row.rationale_texts)
        : undefined,
      communityConflict: Boolean(row.community_conflict),
      state: {
        isFavorite: Boolean(row.isFavorite),
        isInErrorBook: Boolean(row.isInErrorBook),
        wrongCount: Number(row.wrongCount || 0),
      },
    };
  }

  private attemptResult(row: Record<string, unknown>) {
    return {
      requestKey: row.request_key,
      correct: Boolean(row.is_correct),
      correctOptionKeys: parseJson(row.correct_option_keys),
    };
  }

  private async bankCount(
    bankId: number,
    runner: { query: (sql: string, params?: unknown[]) => Promise<unknown[]> },
  ) {
    const rows = (await runner.query(
      'SELECT question_count AS total FROM question_banks WHERE id=?',
      [bankId],
    )) as Array<{ total: number }>;

    return Number(rows[0].total);
  }
}
