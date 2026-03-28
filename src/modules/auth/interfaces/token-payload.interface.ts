// src/modules/auth/interfaces/token-payload.interface.ts
export interface TokenPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID for refresh token tracking
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}