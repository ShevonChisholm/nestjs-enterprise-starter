import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { PermissionName } from '../constants/permissions.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../services/rbac.service';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionName[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (
      !user ||
      !(await this.rbacService.hasAllPermissions(user.id, requiredPermissions))
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
