// src/modules/user/user.controller.ts
import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    return this.userService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user đã được cung cấp bởi JwtAuthGuard
    return req.user;
  }
}