// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RedisModule } from '../../shared/redis/redis.module';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const accessSecret = configService.get<string>('ACCESS_TOKEN_SECRET');
        const accessExpireTime = parseInt(configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME', '3600'));
        
        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: accessExpireTime, // Dùng number chứ không phải string với 's'
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}