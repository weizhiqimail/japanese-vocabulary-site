import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthSessionEntityConfig } from './auth-session.config';
@Entity(AuthSessionEntityConfig.dbName)
export class AuthSessionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id: string;
  @Column({ name: 'user_id', type: 'bigint', unsigned: true }) userId: string;
  @Column({ name: 'token_hash', type: 'char', length: 64, unique: true })
  tokenHash: string;
  @Column({ name: 'expires_at', type: 'datetime', precision: 3 })
  expiresAt: Date;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;
  @Column({
    name: 'revoked_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  revokedAt: Date | null;
}
