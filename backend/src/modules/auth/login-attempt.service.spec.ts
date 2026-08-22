import { HttpException } from '@nestjs/common';
import { LoginAttemptService } from './login-attempt.service';

describe('LoginAttemptService', () => {
  it('blocks an IP and username pair after five failures', () => {
    const service = new LoginAttemptService();
    for (let index = 0; index < 5; index += 1) {
      service.assertAllowed('203.0.113.1', 'admin');
      service.recordFailure('203.0.113.1', 'admin');
    }
    expect(() => service.assertAllowed('203.0.113.1', 'admin')).toThrow(
      HttpException,
    );
    expect(() => service.assertAllowed('203.0.113.2', 'admin')).not.toThrow();
  });

  it('clears failures after a successful login', () => {
    const service = new LoginAttemptService();
    service.recordFailure('203.0.113.1', 'admin');
    service.recordSuccess('203.0.113.1', 'admin');
    expect(() => service.assertAllowed('203.0.113.1', 'admin')).not.toThrow();
  });
});
