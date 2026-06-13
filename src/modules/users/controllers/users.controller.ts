import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PERMISSIONS } from '../../rbac/constants/permissions.constants';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USERS_READ)
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
