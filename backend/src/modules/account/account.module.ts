import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';

/** 账户、登录和会话业务域；密码继续按项目要求以明文保存和比较。 */
@Module({ imports: [AuthModule] })
export class AccountModule {}
