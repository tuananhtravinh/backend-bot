// src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  
  // Enable CORS để cho phép request từ domain khác
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Railway sẽ tự động gán biến môi trường PORT (thường là 8080)
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Listen trên '0.0.0.0' để chấp nhận kết nối từ bên ngoài (bắt buộc cho Railway/Docker)
  await app.listen(port, '0.0.0.0');
  
  Logger.log(`🚀 Server started at port ${port}`, 'Bootstrap');
  Logger.log(`🌐 Application is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();