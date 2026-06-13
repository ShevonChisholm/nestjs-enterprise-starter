import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacModule } from '../rbac/rbac.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [DatabaseModule, RbacModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
