import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { LocalizedText } from '@/entities/question/question.entity';

@Entity({ name: 'question_options', comment: '固定题目选项' })
export class QuestionOptionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'question_id',
    type: 'bigint',
    unsigned: true,
    comment: '题目ID',
  })
  questionId: string;

  @Column({
    name: 'option_key',
    type: 'varchar',
    length: 20,
    comment: '稳定选项键',
  })
  optionKey: string;

  @Column({ name: 'content_texts', type: 'json', comment: '多语言选项内容' })
  contentTexts: LocalizedText;

  @Column({
    name: 'is_correct',
    type: 'boolean',
    default: false,
    comment: '是否正确选项',
  })
  isCorrect: boolean;

  @Column({
    name: 'sort_order',
    type: 'int',
    unsigned: true,
    comment: '展示顺序',
  })
  sortOrder: number;
}
