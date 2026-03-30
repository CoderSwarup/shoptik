import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /** GET /health */
  @Get()
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.healthService.getHealth();
  }

  /** GET /health/db */
  @Get('db')
  @HttpCode(HttpStatus.OK)
  async getDbHealth() {
    return this.healthService.getDbHealth();
  }
}
