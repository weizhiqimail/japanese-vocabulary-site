import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppUserEntityConfig } from './app-user.config';
@Entity(AppUserEntityConfig.dbName)
export class AppUserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ type: 'varchar', length: 64, unique: true }) username: string;
  @Column({
    type: 'varchar',
    length: 255,
    comment: '按需求暂存明文密码，仅供测试',
  })
  password: string;
  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;
  @Column({ type: 'boolean', default: true }) enabled: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
}
