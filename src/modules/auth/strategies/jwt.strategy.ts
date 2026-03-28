// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../shared/redis/redis.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET') || 'fallback-access-secret-key',
    });
  }

  async validate(payload: TokenPayload) {
    // Check if token is blacklisted
    if (payload.jti) {
      const blacklisted = await this.redisService.exists(
        AUTH_CONSTANTS.BLACKLISTED_TOKEN_KEY(payload.jti)
      );
      if (blacklisted > 0) {
        throw new ForbiddenException('Access token has been revoked');
      }
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}