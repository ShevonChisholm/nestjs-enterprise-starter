import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Provides an availability signal for deployments, load balancers, and
   * monitoring systems while verifying the API's essential database dependency.
   */
  @Get()
  async getHealth() {
    const environment =
      this.configService.getOrThrow<string>('app.environment');
    const databaseIsHealthy = await this.prismaService.isHealthy();

    if (!databaseIsHealthy) {
      throw new ServiceUnavailableException({
        status: 'error',
        environment,
        database: 'disconnected',
      });
    }

    return {
      status: 'ok',
      environment,
      database: 'connected',
    };
  }
}
