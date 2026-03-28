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