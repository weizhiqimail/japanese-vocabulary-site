import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartOfSpeechEntityConfig } from './part-of-speech.config';
@Entity(PartOfSpeechEntityConfig.dbName)
export class PartOfSpeechEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ type: 'varchar', length: 64, unique: true }) code: string;
  @Column({ type: 'varchar', length: 64 }) name: string;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  @Column({ type: 'boolean', default: true }) enabled: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
}
