import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  cookieName: process.env.AUTH_COOKIE_NAME || 'jvs_session',
  sessionDays: Number(process.env.AUTH_SESSION_DAYS || 30),
  secureCookie: process.env.NODE_ENV === 'production',
}));
