import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { MoreThan, IsNull, Repository } from 'typeorm';
import { AppUserEntity, AuthSessionEntity } from '@/entities';
import type { LoginDto } from '@/modules/auth/dto/login.dto';
import { AppLoggerService } from '@/shared-modules/logging/app-logger.service';

/** 登录、会话创建与会话撤销业务。 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUserEntity)
    private readonly users: Repository<AppUserEntity>,
    @InjectRepository(AuthSessionEntity)
    private readonly sessions: Repository<AuthSessionEntity>,
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { username: dto.username, enabled: true },
    });
    if (!user || !(await this.verifyPassword(user.password, dto.password))) {
      this.logger.business(
        'Login rejected',
        { username: dto.username },
        'WARN',
      );

      throw new UnauthorizedException('用户名或密码错误');
    }

    // 兼容升级前的本地数据：首次成功登录后立即把旧明文替换为哈希。
    if (!this.isPasswordHash(user.password)) {
      user.password = await hash(dto.password, 12);
      await this.users.save(user);
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionDays * 86_400_000);
    await this.sessions.save(
      this.sessions.create({
        userId: user.id,
        tokenHash: this.hash(token),
        expiresAt,
        revokedAt: null,
      }),
    );

    this.logger.business('Login succeeded', {
      userId: user.id,
      username: user.username,
    });

    return { token, expiresAt, user: this.serializeUser(user) };
  }

  async authenticate(token?: string) {
    if (!token) {
      return null;
    }

    const session = await this.sessions.findOne({
      where: {
        tokenHash: this.hash(token),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!session) {
      return null;
    }

    const user = await this.users.findOne({
      where: { id: session.userId, enabled: true },
    });

    return user ? this.serializeUser(user) : null;
  }

  async logout(token?: string) {
    if (token) {
      await this.sessions.update(
        { tokenHash: this.hash(token), revokedAt: IsNull() },
        { revokedAt: new Date() },
      );

      this.logger.business('Session revoked');
    }

    return { ok: true };
  }

  get cookieName() {
    return this.config.get<string>('auth.cookieName', 'jvs_session');
  }

  get sessionDays() {
    return this.config.get<number>('auth.sessionDays', 30);
  }

  get secureCookie() {
    return this.config.get<boolean>('auth.secureCookie', false);
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private isPasswordHash(value: string) {
    return /^\$2[aby]\$\d{2}\$/.test(value);
  }

  private verifyPassword(stored: string, supplied: string) {
    return this.isPasswordHash(stored)
      ? compare(supplied, stored)
      : Promise.resolve(stored === supplied);
  }

  private serializeUser(user: AppUserEntity) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    };
  }
}
