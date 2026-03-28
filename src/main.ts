// src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  
  app.enableCors(); // nếu cần

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Server started at port ${port}`, 'Bootstrap');
}
bootstrap();