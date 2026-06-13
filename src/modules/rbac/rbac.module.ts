import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { RbacService } from './services/rbac.service';

@Module({
  imports: [DatabaseModule],
  providers: [RbacService, RolesGuard, PermissionsGuard],
  exports: [RbacService, RolesGuard, PermissionsGuard],
})
export class RbacModule {}
