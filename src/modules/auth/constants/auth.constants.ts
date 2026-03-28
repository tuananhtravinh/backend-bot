// src/modules/auth/constants/auth.constants.ts
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_SECRET_KEY: 'ACCESS_TOKEN_SECRET',
  ACCESS_TOKEN_EXPIRE_TIME: 'ACCESS_TOKEN_EXPIRE_TIME', // in seconds, default "3600" (1 hour)
  REFRESH_TOKEN_SECRET_KEY: 'REFRESH_TOKEN_SECRET',
  REFRESH_TOKEN_EXPIRE_TIME: 'REFRESH_TOKEN_EXPIRE_TIME', // in seconds, default "2592000" (30 days)
  JWT_FROM_COOKIE: 'JWT_FROM_COOKIE',
  
  // Redis keys format
  USER_ACCESS_TOKENS_KEY: (userId: string) => `user:${userId}:access_tokens`,
  USER_REFRESH_TOKEN_KEY: (sessionId: string) => `session:${sessionId}:refresh_token`,
  BLACKLISTED_TOKEN_KEY: (tokenId: string) => `blacklisted:token:${tokenId}`,
  SESSION_DATA_KEY: (sessionId: string) => `session:${sessionId}`,
};