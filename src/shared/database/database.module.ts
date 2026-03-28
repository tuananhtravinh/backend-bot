// src/shared/database/database.module.ts
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

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