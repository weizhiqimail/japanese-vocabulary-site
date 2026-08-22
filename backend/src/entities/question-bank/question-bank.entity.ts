import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'question_banks', comment: '固定题库' })
export class QuestionBankEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'group_id',
    type: 'bigint',
    unsigned: true,
    comment: '所属分组ID',
  })
  groupId: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '稳定题库代码',
  })
  code: string;

  @Column({ type: 'varchar', length: 255, comment: '题库名称' }) name: string;

  @Column({ type: 'text', nullable: true, comment: '题库说明' }) description:
    string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '来源说明' })
  source: string | null;

  @Column({
    name: 'content_version',
    type: 'varchar',
    length: 64,
    comment: '内容版本',
  })
  contentVersion: string;

  @Column({ name: 'supported_languages', type: 'json', comment: '支持语言' })
  supportedLanguages: string[];

  @Column({
    name: 'default_language',
    type: 'varchar',
    length: 10,
    default: 'zh',
    comment: '默认语言',
  })
  defaultLanguage: string;

  @Column({
    name: 'question_count',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '有效题数',
  })
  questionCount: number;

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
