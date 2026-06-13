import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Centralizing Prisma access keeps database lifecycle management and connection
 * behavior consistent across every current and future feature module.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      // Keeping the API available allows its health endpoint to report dependency failure and recovery.
      this.logger.error(
        'Initial PostgreSQL connection failed; database health checks will report the dependency as unavailable.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * A minimal query verifies that PostgreSQL can accept work without exposing
   * schema details or database errors to health-check consumers.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
