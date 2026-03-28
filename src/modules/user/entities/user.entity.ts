// src/modules/user/entities/user.entity.ts
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Thêm: SafeUserResponse không có password để dùng trong response
export interface SafeUserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}