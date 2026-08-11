import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ImportBatchEntityConfig } from './import-batch.config';

/** CSV 导入批次实体。 */
@Entity({ name: ImportBatchEntityConfig.dbName, comment: '导入批次' })
export class ImportBatchEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '批次名称' })
  name: string;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '原始文件名',
  })
  originalFilename: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'reviewing', 'completed'],
    comment: '批次状态',
  })
  status: 'pending' | 'reviewing' | 'completed';

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    comment: '更新时间',
  })
  updatedAt: Date;
}
