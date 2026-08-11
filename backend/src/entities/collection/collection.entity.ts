import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CollectionEntityConfig } from './collection.config';
@Entity(CollectionEntityConfig.dbName)
export class CollectionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({
    type: 'enum',
    enum: ['source', 'custom', 'favorite', 'error'],
    default: 'custom',
  })
  type: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) source:
    string | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt: Date | null;
}
