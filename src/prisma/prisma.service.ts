// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// @Injectable(): Đánh dấu class này là một Service có thể được inject vào nơi khác
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // OnModuleInit: Hook được gọi khi Module khởi động
  async onModuleInit() {
    // Thực hiện kết nối đến database khi ứng dụng NestJS bắt đầu chạy
    await this.$connect();
  }

  // OnModuleDestroy: Hook được gọi khi Module bị hủy (ứng dụng dừng)
  async onModuleDestroy() {
    // Ngắt kết nối database để giải phóng tài nguyên khi ứng dụng dừng
    await this.$disconnect();
  }
}