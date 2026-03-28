// src/modules/auth/strategies/refresh.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../shared/redis/redis.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private logger = new Logger(RefreshTokenStrategy.name);

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      // Sử dụng từ header, có thể tùy chỉnh
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET') || 'fallback-refresh-token-secret',
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    // Khi validate một refresh token, chắc chắn nó đang trong Redis
    if (!payload.jti) {
      throw new UnauthorizedException('Refresh token malformed');
    }

    const refreshTokenInRedis = await this.redisService.get(
      AUTH_CONSTANTS.USER_REFRESH_TOKEN_KEY(payload.jti)
    );

    if (!refreshTokenInRedis) {
      // Token không tồn tại trong cache -> có thể đã bị rotate hoặc bị hack
      this.logger.warn({ sessionId: payload.jti }, 'Refresh token not found in cache');
      throw new UnauthorizedException('Refresh token is invalid or has been rotated');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti
    };
  }
}