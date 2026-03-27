import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');

      if (redisUrl) {
        this.logger.log(`🔗 Connecting to Redis via URL...`);
        this.client = new Redis(redisUrl, {
          family: 0,                    // Hỗ trợ cả IPv4 và IPv6 - quan trọng cho Railway
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 150, 4000);
            this.logger.warn(`🔄 Redis reconnecting... (lần ${times})`);
            return delay;
          },
          maxRetriesPerRequest: 10,
          enableReadyCheck: true,
        });
      } else {
        // Fallback cho local
        this.client = new Redis({
          host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
          db: this.configService.get<number>('REDIS_DB', 0),
          family: 0,
          retryStrategy: (times: number) => Math.min(times * 150, 4000),
        });
      }

      this.client.on('connect', () => this.logger.log('✅ Redis connected successfully'));
      this.client.on('ready', () => this.logger.log('🚀 Redis is ready'));
      this.client.on('error', (err) => this.logger.error('❌ Redis error:', err.message));
      this.client.on('reconnecting', () => this.logger.warn('🔄 Redis reconnecting...'));

    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client closed');
    }
  }

  // ==================== Các method hay dùng cho Group Buying ====================
  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    if (ttlSeconds) {
      await this.client.set(key, strValue, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, strValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
}