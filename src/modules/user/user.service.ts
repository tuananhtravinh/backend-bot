// src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { SafeUserResponse } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.prisma.user.create({ data: userData });
  }
  
  async findOne(id: number): Promise<SafeUserResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}