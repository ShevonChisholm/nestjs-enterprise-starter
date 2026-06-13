import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { RoleName } from '../constants/roles.constants';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RbacService } from '../services/rbac.service';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !(await this.rbacService.hasAnyRole(user.id, requiredRoles))) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
