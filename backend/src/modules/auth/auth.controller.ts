import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginAttemptService } from '@/modules/auth/login-attempt.service';

@ApiTags('登录认证')
@Controller(['auth', 'account'])
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly loginAttempts: LoginAttemptService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    this.loginAttempts.assertAllowed(ip, dto.username);
    let result: Awaited<ReturnType<AuthService['login']>>;
    try {
      result = await this.auth.login(dto);
    } catch (error) {
      this.loginAttempts.recordFailure(ip, dto.username);
      throw error;
    }
    this.loginAttempts.recordSuccess(ip, dto.username);
    response.cookie(this.auth.cookieName, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.auth.secureCookie,
      expires: result.expiresAt,
      path: '/',
    });

    return result.user;
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, string> | undefined;
    await this.auth.logout(cookies?.[this.auth.cookieName]);
    response.clearCookie(this.auth.cookieName, { path: '/' });

    return { ok: true };
  }

  @Get('me')
  @ApiOperation({ summary: '当前登录用户' })
  me(@Req() request: Request & { user?: unknown }) {
    return request.user;
  }
}
