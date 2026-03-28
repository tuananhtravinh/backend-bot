import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// Sử dụng factory pattern chính xác
export const databaseProviders = [
  {
    provide: 'PRISMA_CLIENT',
    useFactory: (configService: ConfigService): PrismaClient => {
      return new PrismaClient({
        datasources: {
          db: {
            url: configService.get<string>('DATABASE_URL'),
          },
        },
        log: ['info', 'warn', 'error'], // Bỏ query để tăng tốc
      });
    },
    inject: [ConfigService],
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// Sử dụng factory pattern chính xác
export const databaseProviders = [
  {
    provide: 'PRISMA_CLIENT',
    useFactory: (configService: ConfigService): PrismaClient => {
      return new PrismaClient({
        datasources: {
          db: {
            url: configService.get<string>('DATABASE_URL'),
          },
        },
        log: ['info', 'warn', 'error'], // Bỏ query để tăng tốc
      });
    },
    inject: [ConfigService],
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}