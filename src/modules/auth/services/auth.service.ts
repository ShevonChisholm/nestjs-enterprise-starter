import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { SignOptions } from 'jsonwebtoken';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UsersService } from '../../users/services/users.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenResponseDto } from '../dto/token-response.dto';
import { JwtPayload } from '../types/authenticated-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(registerDto.password, {
      type: argon2.argon2id,
    });

    try {
      const user = await this.usersService.create({
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      const tokens = await this.issueAndStoreTokens(user);

      return {
        user: this.usersService.toResponse(user),
        tokens,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (
      !user ||
      user.deletedAt ||
      !(await argon2.verify(user.passwordHash, loginDto.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: this.usersService.toResponse(user),
      tokens: await this.issueAndStoreTokens(user),
    };
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.usersService.findById(userId);

    if (
      !user?.refreshTokenHash ||
      !(await argon2.verify(user.refreshTokenHash, refreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueAndStoreTokens(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.usersService.toResponse(user);
  }

  private async issueAndStoreTokens(user: User): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(user);

    // Refresh tokens are stored as hashes so leaked database records cannot be used as active credentials.
    const refreshTokenHash = await argon2.hash(tokens.refreshToken, {
      type: argon2.argon2id,
    });
    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const refreshPayload: JwtPayload = {
      ...payload,
      // A unique token identifier guarantees each rotation produces a distinct refresh credential.
      jti: randomUUID(),
    };

    const accessSecret = this.configService.getOrThrow<string>('jwt.secret');
    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    const accessExpiresIn = this.configService.getOrThrow<string>(
      'jwt.expiresIn',
    ) as SignOptions['expiresIn'];
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    ) as SignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
