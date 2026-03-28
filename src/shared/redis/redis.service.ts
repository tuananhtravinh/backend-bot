// src/shared/redis/redis.service.ts (đã được cập nhật)
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: RedisClientType;
  private logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL'); 
    
    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.on('ready', () => this.logger.log('Redis Connected'));

    this.client.connect().catch(err => this.logger.error('Redis Connect Error', err));
  }

  async set(key: string, value: any, ttlSeconds: number = 3600) {
    if (!this.client.isReady) return;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.error('Redis SET error:', error.message);
    }
  }

  async get(key: string): Promise<any> {
    if (!this.client.isReady) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Redis GET error:', error.message);
      return null;
    }
  }

  async del(key: string) {
    if (!this.client.isReady) return 0;
    try {
      const result = await this.client.del(key);
      return result;
    } catch (error) {
      this.logger.error('Redis DEL error:', error.message);
      return 0;
    }
  }

  // NEW: Add exists method
  async exists(key: string): Promise<number> {
    if (!this.client.isReady) return 0;
    try {
      const result = await this.client.exists(key);
      return result;
    } catch (error) {
      this.logger.error('Redis EXISTS error:', error.message);
      return 0;
    }
  }

  async onModuleDestroy() {
    if (this.client.isReady) await this.client.quit();
  }
}