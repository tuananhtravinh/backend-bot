// src/app.module.ts

import { Module } from '@nestjs/common';

// Import module chính của TiDB (chứa PrismaService đã cấu hình)
import { TidbModule } from './modules/tidb/tidb.module';

// Import ConfigModule từ @nestjs/config để quản lý biến môi trường (.env)
import { ConfigModule } from '@nestjs/config';

// Import RedisModule để tích hợp Redis vào ứng dụng
// ⚠️ Lưu ý: Kiểm tra kỹ đường dẫn import để tránh lỗi "Cannot find module"
import { RedisModule } from './modules/redis/redis.module';

// Import AppController và AppService mặc định của NestJS
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  // imports: Danh sách các module sẽ được NestJS khởi tạo khi ứng dụng chạy
  imports: [
    
    /**
     * ConfigModule.forRoot(): Cấu hình để NestJS đọc và sử dụng file .env
     */
    ConfigModule.forRoot({
      isGlobal: true,           // ✅ QUAN TRỌNG: Biến ConfigModule thành global
      
      envFilePath: '.env',      // Chỉ định đường dẫn file cấu hình (mặc định là '.env' ở root)
                      
    }),

    /**
     * RedisModule: Module quản lý kết nối Redis
     * - Sau khi import ở đây, bạn có thể inject RedisService vào các service khác
     * - Dùng cho: Cache, session, queue, rate-limiting...
     */
    RedisModule,

    /**
     * TidbModule: Module quản lý kết nối TiDB (sử dụng Prisma ORM)
     * - Chứa PrismaService đã được wrapper với OnModuleInit/OnModuleDestroy
     * - Đảm bảo kết nối database được mở khi app start và đóng khi app stop
     */
    TidbModule,

    /**
     * 📌 Nơi bạn sẽ import các module nghiệp vụ khác trong tương lai:
     * Ví dụ:
     *   - UserModule: Quản lý người dùng
     *   - AuthModule: Xác thực, phân quyền
     *   - ProductModule: Quản lý sản phẩm
     *   - OrderModule: Xử lý đơn hàng
     *   - NotificationModule: Gửi thông báo...
     */
    // UserModule,
    // AuthModule,
    // ProductModule,
    
  ],

  // controllers: Danh sách các Controller thuộc AppModule
  // AppController thường chứa các endpoint cơ bản như health check, root route...
  controllers: [AppController],

  // providers: Danh sách các Service/Provider thuộc AppModule
  // AppService thường chứa logic nghiệp vụ chung hoặc ví dụ demo
  providers: [AppService],

  // exports: (Không có ở đây vì AppModule thường không cần export gì ra ngoài)
  // Nếu bạn muốn chia sẻ AppService sang module khác, thêm nó vào mảng exports
  // exports: [AppService],
})
export class AppModule {}