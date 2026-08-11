import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { SessionAuthGuard } from '@/modules/auth/guards/session-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionAuthGuard,
    { provide: APP_GUARD, useClass: SessionAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
