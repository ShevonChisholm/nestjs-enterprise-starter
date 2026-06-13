import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../constants/permissions.constants';

export const PERMISSIONS_KEY = 'required_permissions';
export const Permissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
