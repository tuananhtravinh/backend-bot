// src/modules/tidb/tidb.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // ✅ Import chuẩn

@Injectable()
export class TidbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // ✅ Constructor rỗng, không truyền adapter hay config
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}