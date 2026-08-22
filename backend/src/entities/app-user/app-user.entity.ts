import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppUserEntityConfig } from './app-user.config';

/** 单用户系统登录账号实体。 */
@Entity({ name: AppUserEntityConfig.dbName, comment: '应用登录用户' })
export class AppUserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: '登录名' })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'bcrypt 密码哈希',
  })
  password: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
    comment: '显示名',
  })
  displayName: string;

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
}
