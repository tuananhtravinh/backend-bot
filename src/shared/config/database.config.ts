// src/shared/config/database.config.ts
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

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