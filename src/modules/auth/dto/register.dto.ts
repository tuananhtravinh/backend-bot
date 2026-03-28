// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['buyer', 'seller'])
  role: 'buyer' | 'seller';
}