import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TidbModule } from './modules/tidb/tidb.module';

// Import ConfigModule để đọc file .env
import { ConfigModule } from '@nestjs/config';

// Import RedisModule mà chúng ta vừa tạo
import { RedisModule } from './modules/redis/redis.module';   // ← Đường dẫn này rất quan trọng

@Module({
  imports: [
    // ConfigModule.forRoot() giúp NestJS đọc file .env và làm cho config global
    ConfigModule.forRoot({
      isGlobal: true,           // Cho phép dùng ConfigService ở mọi nơi mà không cần import lại
      envFilePath: '.env',      // Đường dẫn đến file .env (mặc định là .env)
    }),

    // Import RedisModule để có thể inject RedisService vào bất kỳ service nào
    RedisModule,
    TidbModule,                 // ← Đây là dòng quan trọng nhất

    // Các module khác của bạn sẽ import vào đây sau này
    // Ví dụ: UserModule, ProductModule, GroupModule, OrderModule...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}