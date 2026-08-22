import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type Attempt = { failures: number; blockedUntil: number; touchedAt: number };

/** 单实例登录失败限流；边缘 WAF 仍应作为公网环境的第一层限流。 */
@Injectable()
export class LoginAttemptService {
  private readonly attempts = new Map<string, Attempt>();

  private readonly maximumFailures = 5;

  private readonly blockMilliseconds = 15 * 60 * 1000;

  assertAllowed(ip: string, username: string) {
    this.cleanup();
    const attempt = this.attempts.get(this.key(ip, username));
    if (attempt && attempt.blockedUntil > Date.now()) {
      throw new HttpException(
        '登录失败次数过多，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(ip: string, username: string) {
    const key = this.key(ip, username);
    const previous = this.attempts.get(key);
    const failures = (previous?.failures ?? 0) + 1;
    const now = Date.now();
    this.attempts.set(key, {
      failures,
      blockedUntil:
        failures >= this.maximumFailures ? now + this.blockMilliseconds : 0,
      touchedAt: now,
    });
  }

  recordSuccess(ip: string, username: string) {
    this.attempts.delete(this.key(ip, username));
  }

  private key(ip: string, username: string) {
    return `${ip.trim().toLowerCase()}\u0000${username.trim().toLowerCase()}`;
  }

  private cleanup() {
    const expiry = Date.now() - this.blockMilliseconds * 2;
    for (const [key, attempt] of this.attempts) {
      if (attempt.touchedAt < expiry && attempt.blockedUntil < Date.now()) {
        this.attempts.delete(key);
      }
    }
  }
}
