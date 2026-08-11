import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ImportBatchEntityConfig } from './import-batch.config';

@Entity(ImportBatchEntityConfig.dbName)
export class ImportBatchEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ type: 'varchar', length: 255 }) name: string;
  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  originalFilename: string | null;
  @Column({ type: 'enum', enum: ['pending', 'reviewing', 'completed'] })
  status: 'pending' | 'reviewing' | 'completed';
  @Column({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @Column({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
}
