// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()  
  @IsOptional()
  lastName?: string;
}