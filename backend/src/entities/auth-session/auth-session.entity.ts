import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthSessionEntityConfig } from './auth-session.config';

/** 登录会话实体。 */
@Entity({ name: AuthSessionEntityConfig.dbName, comment: '登录会话' })
export class AuthSessionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键' })
  id: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
    comment: '用户ID',
  })
  userId: string;

  @Column({
    name: 'token_hash',
    type: 'char',
    length: 64,
    unique: true,
    comment: '会话令牌SHA-256',
  })
  tokenHash: string;

  @Column({
    name: 'expires_at',
    type: 'datetime',
    precision: 3,
    comment: '过期时间',
  })
  expiresAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 3,
    comment: '创建时间',
  })
  createdAt: Date;

  @Column({
    name: 'revoked_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
    comment: '撤销时间',
  })
  revokedAt: Date | null;
}
