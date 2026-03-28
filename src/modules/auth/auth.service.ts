// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async register(registerDto: any): Promise<any> {
    const { username, email, password, role } = registerDto;

    // Kiểm tra trùng email
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already exists');

    // Hash password
    const hashed = await hash(password, 10);

    // Tạo user
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role,
      },
    });

    return { 
      message: 'Register Success', 
      user: { id: user.id, username, email, role } 
    };
  }

  async login(loginDto: any): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Cache user info in Redis
    const cacheKey = `user:${user.id}`;
    await this.redis.set(cacheKey, { ...user, password: undefined }, 3600);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async validateUser(email: string, password: string): Promise<any | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await compare(password, user.password)) {
      return { ...user, password: undefined };
    }
    return null;
  }
}