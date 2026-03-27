import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../modules/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private redisService: RedisService) {}

  @Get('redis')
  async checkRedis() {
    const startTime = Date.now();

    // Test write
    await this.redisService.set('health:check', 'ok', 10);

    // Test read
    const value = await this.redisService.get('health:check');

    // Test delete
    await this.redisService.del('health:check');

    const responseTime = Date.now() - startTime;

    return {
      status: 'ok',
      redis: value === 'ok' ? 'connected' : 'error',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  }
}