import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'question_progress', comment: '用户题库主线进度' })
export class QuestionProgressEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

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
    type: 'enum',
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    comment: '主线状态',
  })
  status: 'not_started' | 'in_progress' | 'completed';

  @Column({
    name: 'current_question_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '下一道未完成题ID',
  })
  currentQuestionId: string | null;

  @Column({
    name: 'current_position',
    type: 'int',
    unsigned: true,
    default: 1,
    comment: '下一题展示位置',
  })
  currentPosition: number;

  @Column({
    name: 'answered_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '主线已答题数',
  })
  answeredCount: number;

  @Column({
    name: 'correct_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '主线正确题数',
  })
  correctCount: number;

  @Column({
    name: 'started_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '开始时间',
  })
  startedAt: Date | null;

  @Column({
    name: 'last_answered_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '最近作答时间',
  })
  lastAnsweredAt: Date | null;

  @Column({
    name: 'completed_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '完成时间',
  })
  completedAt: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    comment: '更新时间',
  })
  updatedAt: Date;
}
