import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LocalizedText = Partial<Record<'en' | 'zh' | 'ja', string>>;
@Entity({ name: 'questions', comment: '固定题目' })
export class QuestionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;
  @Column({
    name: 'bank_id',
    type: 'bigint',
    unsigned: true,
    comment: '题库ID',
  })
  bankId: string;
  @Column({
    name: 'external_key',
    type: 'varchar',
    length: 150,
    comment: '来源稳定题号',
  })
  externalKey: string;
  @Column({
    name: 'sort_order',
    type: 'int',
    unsigned: true,
    comment: '题库内顺序',
  })
  sortOrder: number;
  @Column({
    name: 'topic_code',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '来源主题代码',
  })
  topicCode: string | null;
  @Column({
    name: 'question_type',
    type: 'enum',
    enum: ['single_choice', 'multiple_choice', 'true_false'],
    comment: '题型',
  })
  questionType: 'single_choice' | 'multiple_choice' | 'true_false';
  @Column({ name: 'question_texts', type: 'json', comment: '多语言题干' })
  questionTexts: LocalizedText;
  @Column({ name: 'rationale_texts', type: 'json', comment: '多语言解析' })
  rationaleTexts: LocalizedText;
  @Column({
    name: 'source_explanation_texts',
    type: 'json',
    nullable: true,
    comment: '来源多语言解析',
  })
  sourceExplanationTexts: LocalizedText | null;
  @Column({
    name: 'source_answer',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '来源答案',
  })
  sourceAnswer: string | null;
  @Column({
    name: 'answer_confidence',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '答案置信度',
  })
  answerConfidence: string | null;
  @Column({
    name: 'community_conflict',
    type: 'boolean',
    default: false,
    comment: '社区答案是否存在争议',
  })
  communityConflict: boolean;
  @Column({
    name: 'rationale_note',
    type: 'text',
    nullable: true,
    comment: '解析来源说明',
  })
  rationaleNote: string | null;
  @Column({
    name: 'content_hash',
    type: 'char',
    length: 64,
    comment: '内容SHA-256',
  })
  contentHash: string;
  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  enabled: boolean;
  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    comment: '更新时间',
  })
  updatedAt: Date;
  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '逻辑删除时间',
  })
  deletedAt: Date | null;
}
