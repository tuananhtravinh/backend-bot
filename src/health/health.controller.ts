// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../shared/redis/redis.service'; // Sửa lại đường dẫn

@Controller('health')
export class HealthController {
  constructor(private redisService: RedisService) {}

  @Get()
  async health() {
    try {
      await this.redisService.client.ping();
      return { status: 'OK', redis: 'connected' };
    } catch (error) {
      return { status: 'ERROR', redis: 'disconnected' };
    }
  }
}