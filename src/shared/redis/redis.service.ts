// src/shared/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      url: `redis://${this.configService.get<string>('REDIS_HOST')}:${this.configService.get<number>('REDIS_PORT')}`,
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.connect().catch(console.error);
  }

  async set(key: string, value: any, ttlSeconds: number = 300) {
    await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}