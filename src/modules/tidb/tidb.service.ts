import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class TidbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TidbService.name);

  constructor() {
    // Parse DATABASE_URL để lấy các thông số riêng lẻ
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('❌ DATABASE_URL is not defined in .env');
    }

    const url = new URL(databaseUrl);

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 4000,        // TiDB thường dùng port 4000
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.slice(1) || 'test',             // Lấy tên database sau dấu /
      connectionLimit: 10,                                   // Giới hạn kết nối pool
      connectTimeout: 5000,                                  // 5 giây
    });

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],   // Bật log để debug
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ TiDB (Prisma + MariaDB Adapter) connected successfully');

      // Test query đơn giản
      const result = await this.$queryRaw`SELECT 1 as test_connection`;
      this.logger.log(`🚀 TiDB test query thành công: ${JSON.stringify(result)}`);

    } catch (error: any) {
      this.logger.error('❌ Failed to connect to TiDB:', error.message);
      // throw error;   // Comment tạm nếu muốn app vẫn chạy dù TiDB lỗi
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 TiDB connection closed');
  }
}