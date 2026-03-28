// src/shared/redis/redis.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: RedisClientType;
  private logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    this.logger.log('Creating Redis client...');
    
    // Sử dụng redis url theo railway
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.logger.log(`Redis URL: ${redisUrl}`);

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err}`);
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.connect().catch(err => {
      this.logger.error(`Failed to connect to Redis: ${err}`);
    });
  }

  async set(key: string, value: any, ttlSeconds: number = 300) {
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Redis SET error: ${error.message}`);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Redis GET error: ${error.message}`);
      return null;
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL error: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.client.quit();
  }
}