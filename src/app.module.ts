import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './shared/database/database.module';
import { RedisModule } from './shared/redis/redis.module';

@Module({
  imports: [
    // Load Config trước, đảm bảo environment được load
    ConfigModule.forRoot({ 
      isGlobal: true,
      cache: true,           // Thêm cache để tăng performance
      envFilePath: ['.env', '.env.local'],  // Thêm file backup
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}