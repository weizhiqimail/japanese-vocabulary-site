import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'question_states', comment: '用户题目汇总状态' })
export class QuestionStateEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
    comment: '用户ID',
  })
  userId: string;

  @PrimaryColumn({
    name: 'question_id',
    type: 'bigint',
    unsigned: true,
    comment: '题目ID',
  })
  questionId: string;

  @Column({
    name: 'attempt_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '累计作答次数',
  })
  attemptCount: number;

  @Column({
    name: 'correct_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '累计正确次数',
  })
  correctCount: number;

  @Column({
    name: 'wrong_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '累计错误次数',
  })
  wrongCount: number;

  @Column({
    name: 'last_is_correct',
    type: 'boolean',
    nullable: true,
    comment: '最近是否正确',
  })
  lastIsCorrect: boolean | null;

  @Column({
    name: 'first_wrong_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '首次错误时间',
  })
  firstWrongAt: Date | null;

  @Column({
    name: 'last_wrong_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近错误时间',
  })
  lastWrongAt: Date | null;

  @Column({
    name: 'is_in_error_book',
    type: 'boolean',
    default: false,
    comment: '当前是否在错题本',
  })
  isInErrorBook: boolean;

  @Column({
    name: 'error_resolved_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近移出错题时间',
  })
  errorResolvedAt: Date | null;

  @Column({
    name: 'is_favorite',
    type: 'boolean',
    default: false,
    comment: '是否收藏',
  })
  isFavorite: boolean;

  @Column({
    name: 'favorited_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '收藏时间',
  })
  favoritedAt: Date | null;

  @Column({
    name: 'last_answered_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近作答时间',
  })
  lastAnsweredAt: Date | null;
}
