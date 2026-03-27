// src/prisma/prisma.module.ts

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global(): Biến module này thành Global Module
// Giúp bạn không cần import PrismaModule vào từng module con (UserModule, AuthModule...)
// mà vẫn có thể inject PrismaService ở bất kỳ đâu.
@Global()
@Module({
  // providers: Danh sách các service được cung cấp bởi module này
  providers: [PrismaService],
  
  // exports: Danh sách các service được phép sử dụng bởi các module khác import module này
  exports: [PrismaService],
})
export class PrismaModule {}