import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PermissionName } from '../constants/permissions.constants';
import { RoleName } from '../constants/roles.constants';

@Injectable()
export class RbacService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prismaService.userRole.findMany({
      where: {
        userId,
        role: { deletedAt: null },
      },
      select: { role: { select: { name: true } } },
    });

    return userRoles.map(({ role }) => role.name);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    /*
     * Permissions are resolved from the database so access changes apply
     * immediately without issuing new JWTs.
     */
    const rolePermissions = await this.prismaService.rolePermission.findMany({
      where: {
        role: {
          deletedAt: null,
          users: { some: { userId } },
        },
        permission: { deletedAt: null },
      },
      select: { permission: { select: { name: true } } },
    });

    return [
      ...new Set(rolePermissions.map(({ permission }) => permission.name)),
    ];
  }

  async hasAnyRole(
    userId: string,
    requiredRoles: RoleName[],
  ): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return requiredRoles.some((role) => roles.includes(role));
  }

  async hasAllPermissions(
    userId: string,
    requiredPermissions: PermissionName[],
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  }
}
