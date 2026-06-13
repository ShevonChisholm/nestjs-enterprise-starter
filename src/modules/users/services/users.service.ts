import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
      },
      data: { refreshTokenHash: null },
    });
  }

  /**
   * API responses are mapped explicitly so credential hashes and future
   * internal-only fields can never leak through raw Prisma records.
   */
  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
