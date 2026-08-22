import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'question_attempts', comment: '不可变题目作答流水' })
export class QuestionAttemptEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'request_key',
    type: 'char',
    length: 36,
    unique: true,
    comment: '幂等请求键',
  })
  requestKey: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
    comment: '用户ID',
  })
  userId: string;

  @Column({
    name: 'bank_id',
    type: 'bigint',
    unsigned: true,
    comment: '题库ID',
  })
  bankId: string;

  @Column({
    name: 'question_id',
    type: 'bigint',
    unsigned: true,
    comment: '题目ID',
  })
  questionId: string;

  @Column({
    type: 'enum',
    enum: ['sequential', 'error_review', 'favorite_review'],
    comment: '作答模式',
  })
  mode: 'sequential' | 'error_review' | 'favorite_review';

  @Column({
    name: 'selected_option_keys',
    type: 'json',
    comment: '用户选项键快照',
  })
  selectedOptionKeys: string[];

  @Column({
    name: 'correct_option_keys',
    type: 'json',
    comment: '标准答案键快照',
  })
  correctOptionKeys: string[];

  @Column({ name: 'is_correct', type: 'boolean', comment: '是否正确' })
  isCorrect: boolean;

  @Column({
    name: 'duration_ms',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '答题耗时毫秒',
  })
  durationMs: number | null;

  @CreateDateColumn({
    name: 'answered_at',
    type: 'datetime',
    precision: 3,
    comment: '作答时间',
  })
  answeredAt: Date;
}
