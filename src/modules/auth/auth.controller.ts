// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, UnauthorizedException as NestUnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Interface tạm thời nếu không dùng DTO riêng
interface RefreshTokenBody {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ 
    accessToken: string; 
    refreshToken: string; 
    expiresIn: number 
  }> {
    const { accessToken, refreshToken, expiresIn } = await this.authService.login(loginDto);
    
    if (process.env.SET_RT_COOKIE === 'true') {
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME || '2592000000'),
        sameSite: 'lax',
      });
    }

    return { accessToken, refreshToken, expiresIn };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    newRefreshToken?: string;
  }> {
    const { refreshToken } = body;

    if (!refreshToken) {
       throw new NestUnauthorizedException('Refresh token is required');
    }

    const updatedTokens = await this.authService.refreshTokens(refreshToken);

    // Nếu có newRefreshToken và dùng cookie, cập nhật
    if (updatedTokens.newRefreshToken && process.env.SET_RT_COOKIE === 'true') {
      response.cookie('refresh_token', updatedTokens.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME || '2592000000'),
        sameSite: 'lax',
      });
    }

    return {
      accessToken: updatedTokens.accessToken,
      expiresIn: updatedTokens.expiresIn,
      // newRefreshToken không cần trả về qua response body nếu đã update bằng cookie
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    // Lấy token từ header nếu cần để logout
    // ở đây mình giả định truyền token từ frontend như sau:
    const headerAuth = response.req.headers?.authorization as string;
    let token: string | undefined;
    
    if (headerAuth && headerAuth.startsWith('Bearer ')) {
      token = headerAuth.slice(7);
    }
    
    // Hoặc có thể dùng từ refresh token
    const refreshToken = (response.req as any).cookies?.['refresh_token'];
    if (refreshToken != token) {
      await this.authService.logout(token || refreshToken || '');
    }

    response.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }
}