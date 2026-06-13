import { PrismaClient } from '@prisma/client';
import {
  PERMISSIONS,
  PermissionName,
} from '../src/modules/rbac/constants/permissions.constants';
import { ROLES, RoleName } from '../src/modules/rbac/constants/roles.constants';

const prisma = new PrismaClient();

const rolePermissions: Record<RoleName, PermissionName[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.PERMISSIONS_READ,
  ],
  [ROLES.USER]: [],
};

async function main() {
  const permissions = await Promise.all(
    Object.values(PERMISSIONS).map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: { deletedAt: null },
        create: { name },
      }),
    ),
  );
  const permissionByName = new Map(
    permissions.map((permission) => [permission.name, permission]),
  );

  const roleEntries = Object.entries(rolePermissions) as [
    RoleName,
    PermissionName[],
  ][];

  for (const [name, assignedPermissions] of roleEntries) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { deletedAt: null },
      create: { name },
    });

    // Reconciliation keeps repeated seeds deterministic when the fixed role mapping changes.
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: assignedPermissions.map((permissionName) => {
        const permission = permissionByName.get(permissionName);

        if (!permission) {
          throw new Error(`Seed permission not found: ${permissionName}`);
        }

        return {
          roleId: role.id,
          permissionId: permission.id,
        };
      }),
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
