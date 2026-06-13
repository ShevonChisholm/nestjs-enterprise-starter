import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/app.config';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(appConfig.KEY)
    private readonly applicationConfig: ConfigType<typeof appConfig>,
  ) {}

  /**
   * Provides a lightweight availability signal for deployments, load balancers,
   * and monitoring systems without depending on future infrastructure.
   */
  @Get()
  getHealth() {
    return {
      status: 'ok',
      environment: this.applicationConfig.environment,
    };
  }
}
