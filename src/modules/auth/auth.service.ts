// src/modules/auth/auth.service.ts (sửa hoàn chỉnh)
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/database/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload, AuthTokens } from './interfaces/token-payload.interface';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName, username } = registerDto; // Include username

    const existingUserByEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const existingUserByUsername = await this.prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      throw new UnauthorizedException('User with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        email,
        username, // Include username
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'BUYER',
      },
    });

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = this.generateSessionId();
    const result = await this.generateTokenPairAndStore(
      user.id.toString(), 
      user.email, 
      user.role, 
      sessionId
    );

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; expiresIn: number; newRefreshToken?: string }> {
    try {
      const decodedPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      }) as TokenPayload;

      const storedRefreshToken = await this.redisService.get(
        AUTH_CONSTANTS.USER_REFRESH_TOKEN_KEY(decodedPayload.jti!)
      );

      if (storedRefreshToken !== refreshToken) {
        await this.invalidateSession(decodedPayload.jti!);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const numericId = parseInt(decodedPayload.sub);
      if (isNaN(numericId)) {
        throw new UnauthorizedException('Invalid user ID in token');
      }

      const user = await this.prisma.user.findFirst({ where: { id: numericId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.invalidateSession(decodedPayload.jti!);

      const newSessionId = this.generateSessionId();
      const result = await this.generateTokenPairAndStore(
        user.id.toString(), 
        user.email, 
        user.role, 
        newSessionId
      );

      return {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        newRefreshToken: result.refreshToken,
      };
    } catch (error) {
      this.logger.warn('Token refresh failed', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      let sessionId: string | undefined;

      try {
        const decoded = this.jwtService.decode(refreshToken) as TokenPayload;
        if (decoded?.jti) {
          sessionId = decoded.jti;

          const accessTime = parseInt(this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME', '3600'));
          await this.redisService.set(
            AUTH_CONSTANTS.BLACKLISTED_TOKEN_KEY(decoded.jti),
            'true',
            accessTime * 2
          );
        }
      } catch (decodeError) {
        this.logger.warn('Unable to decode token during logout', decodeError.message);
      }

      if (sessionId) {
        await this.invalidateSession(sessionId);
      }

    } catch (error) {
      this.logger.warn('Logout process had issues', error.message);
    }
  }

  private async generateTokenPairAndStore(
    userId: string,
    email: string,
    role: string,
    sessionId: string,
  ): Promise<AuthTokens> {
    // Access token
    const accessTokenPayload: TokenPayload = {
      sub: userId,
      email,
      role,
      jti: `at_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`,
    };

    const accessSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET') || 'default_access_secret';
    const accessExpiryNum = parseInt(this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME', '3600'));

    // Đảm bảo không lỗi template literal type với nestjs v10
    const accessToken = this.jwtService.sign(
      accessTokenPayload,
      {
        secret: accessSecret,
        expiresIn: accessExpiryNum,
      }
    );

    // Refresh token
    const refreshTokenPayload: TokenPayload = {
      sub: userId,
      email,
      role,
      jti: sessionId,
    };

    const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET') || 'default_refresh_secret';
    const refreshExpiryNum = parseInt(this.configService.get<string>('REFRESH_TOKEN_EXPIRE_TIME', '2592000'));
    
    const refreshToken = this.jwtService.sign(
      refreshTokenPayload,
      {
        secret: refreshSecret,
        expiresIn: refreshExpiryNum,
      }
    );

    await this.redisService.set(
      AUTH_CONSTANTS.USER_REFRESH_TOKEN_KEY(sessionId),
      refreshToken,
      refreshExpiryNum,
    );

    await this.redisService.set(
      AUTH_CONSTANTS.SESSION_DATA_KEY(sessionId),
      { userId, createdAt: new Date().toISOString() },
      refreshExpiryNum,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiryNum,
    };
  }

  private async invalidateSession(sessionId: string): Promise<void> {
    await Promise.allSettled([
      this.redisService.del(AUTH_CONSTANTS.USER_REFRESH_TOKEN_KEY(sessionId)),
      this.redisService.del(AUTH_CONSTANTS.SESSION_DATA_KEY(sessionId)),
    ]);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}