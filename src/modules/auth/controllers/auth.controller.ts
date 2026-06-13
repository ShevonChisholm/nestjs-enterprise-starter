import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenResponseDto } from '../dto/token-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services/auth.service';
import {
  AuthenticatedUser,
  RefreshAuthenticatedUser,
} from '../types/authenticated-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(
    @CurrentUser() user: RefreshAuthenticatedUser,
  ): Promise<TokenResponseDto> {
    return this.authService.refresh(user.id, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: AuthenticatedUser): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(user.id);
  }
}
