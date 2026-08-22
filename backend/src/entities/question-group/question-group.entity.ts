import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'question_groups', comment: '题库大小组' })
export class QuestionGroupEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'parent_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '父分组ID',
  })
  parentId: string | null;

  @Column({ type: 'varchar', length: 100, comment: '稳定分组代码' })
  code: string;

  @Column({ type: 'varchar', length: 255, comment: '分组名称' }) name: string;

  @Column({
    name: 'group_level',
    type: 'enum',
    enum: ['provider', 'certification'],
    comment: '分组层级',
  })
  groupLevel: 'provider' | 'certification';

  @Column({ type: 'text', nullable: true, comment: '分组说明' }) description:
    string | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '排序',
  })
  sortOrder: number;

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
