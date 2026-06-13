import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../constants/roles.constants';

export const ROLES_KEY = 'required_roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
