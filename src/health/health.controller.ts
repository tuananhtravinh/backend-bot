import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../modules/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private redisService: RedisService) {}

  @Get()
  async check() {
    try {
      // Test Redis bằng cách set + get một key đơn giản
      const testKey = 'health:test:' + Date.now();
      await this.redisService.set(testKey, 'ok', 60); // TTL 60 giây

      const value = await this.redisService.get(testKey);

      return {
        status: 'ok',
        redis: 'connected',
        message: 'Redis hoạt động tốt',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        redis: 'failed',
        message: error.message,
      };
    }
  }
}