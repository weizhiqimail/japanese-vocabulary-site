import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudyEventEntityConfig } from './study-event.config';
@Entity(StudyEventEntityConfig.dbName)
export class StudyEventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ['vocabulary', 'grammar'],
  })
  entityType: string;
  @Column({ name: 'entity_id', type: 'bigint', unsigned: true })
  entityId: string;
  @Column({
    name: 'collection_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  collectionId: string | null;
  @Column({
    name: 'event_type',
    type: 'enum',
    enum: ['learn', 'review', 'master'],
  })
  eventType: string;
  @Column({ name: 'session_key', type: 'varchar', length: 64, nullable: true })
  sessionKey: string | null;
  @Column({ name: 'occurred_at', type: 'datetime', precision: 3 })
  occurredAt: Date;
  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt: Date | null;
}
