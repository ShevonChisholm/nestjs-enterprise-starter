import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { configuration } from './config/configuration';
import { environmentValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Global configuration provides one validated runtime contract to every feature module.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, configuration],
      validationSchema: environmentValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    DatabaseModule,
    AuthModule,
    RbacModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
