import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      db: this.configService.get<number>('REDIS_DB', 0),
      retryStrategy: (times) => Math.min(times * 50, 2000), // reconnect
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('✅ Redis connected'));
    this.client.on('error', (err) => this.logger.error('❌ Redis error', err));
    this.client.on('reconnecting', () => this.logger.warn('🔄 Redis reconnecting...'));
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis client closed');
  }

  // ============== Các method hay dùng cho group buying ==============
  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string | number | object, ttlSeconds?: number) {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    if (ttlSeconds) {
      return this.client.set(key, strValue, 'EX', ttlSeconds);
    }
    return this.client.set(key, strValue);
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

  async del(key: string) {
    return this.client.del(key);
  }

  // Atomic counter cho group buying (rất quan trọng)
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  // TTL cho group (hết hạn tự động)
  async expire(key: string, seconds: number) {
    return this.client.expire(key, seconds);
  }

  // Pub/Sub (real-time khi group đủ người)
  async publish(channel: string, message: string) {
    return this.client.publish(channel, message);
  }

  subscribe(channel: string, callback: (channel: string, message: string) => void) {
    this.client.subscribe(channel, (err) => {
      if (err) this.logger.error(err);
    });
    this.client.on('message', callback);
  }
}