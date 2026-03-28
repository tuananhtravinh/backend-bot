// src/shared/redis/redis.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: RedisClientType;
  private logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL'); // ví dụ: redis://...
    
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (attempts) => Math.min(attempts * 100, 3000),
      },
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.on('ready', () => this.logger.log('Redis Connected'));

    this.client.connect().catch(err => this.logger.error('Redis Connect Error', err));
  }

  async set(key: string, value: any, ttlSeconds: number = 300) {
    try {
      if (!this.client.isReady) return; // Bỏ qua nếu chưa ready
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (!this.client.isReady) return null;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key: string) {
    try {
      if (!this.client.isReady) return;
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client.isReady) await this.client.quit();
  }
}