import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudyEventEntityConfig } from './study-event.config';

/** 学习与复习行为事件实体。 */
@Entity({ name: StudyEventEntityConfig.dbName, comment: '学习事件' })
export class StudyEventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ['vocabulary', 'grammar'],
    comment: '对象类型',
  })
  entityType: string;

  @Column({
    name: 'entity_id',
    type: 'bigint',
    unsigned: true,
    comment: '对象ID',
  })
  entityId: string;

  @Column({
    name: 'collection_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '集合ID',
  })
  collectionId: string | null;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: ['learn', 'review', 'master'],
    comment: '事件类型',
  })
  eventType: string;

  @Column({
    name: 'session_key',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '会话标识',
  })
  sessionKey: string | null;

  @Column({
    name: 'occurred_at',
    type: 'datetime',
    precision: 3,
    comment: '发生时间',
  })
  occurredAt: Date;

  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '撤销时间',
  })
  deletedAt: Date | null;
}
