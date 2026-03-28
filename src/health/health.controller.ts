// src/health/health.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  health(): any {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}