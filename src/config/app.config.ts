import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  environment: process.env.NODE_ENV as 'development' | 'test' | 'production',
  port: Number(process.env.PORT ?? 3000),
}));
