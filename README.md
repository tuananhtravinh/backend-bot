<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<h1 align="center">Pinduoduo Clone - Backend</h1>

<p align="center">
  <strong>Nền tảng thương mại điện tử mua chung theo nhóm (Group Buying)</strong><br>
  Clone của Pinduoduo (Trung Quốc) với tính năng mua chung, Duoduo Maicai style và C2M nông sản.
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-v10+-E0234E.svg" alt="NestJS" />
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg" alt="TypeScript" />
  </a>
  <a href="https://www.prisma.io/" target="_blank">
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748.svg" alt="Prisma" />
  </a>
  <img src="https://img.shields.io/badge/TiDB_Cloud-Database-FF6A00.svg" alt="TiDB Cloud" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101.svg" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20FCM-FFCA28.svg" alt="Firebase" />
</p>

## ✨ Giới thiệu

Dự án là **backend** cho nền tảng thương mại điện tử mua chung theo nhóm, lấy cảm hứng từ **Pinduoduo (Trung Quốc)**. Hệ thống hỗ trợ mô hình **Group Buying (拼团)**, **Community Group Buying** (tương tự Duoduo Maicai), C2M nông sản, điểm tự lấy cộng đồng, và nhiều tính năng đặc trưng của thương mại điện tử giá rẻ + xã hội.

### Các vai trò chính
- **Buyer (Khách hàng)**: Mua hàng, tham gia nhóm mua chung, nhận hàng tại điểm tự lấy
- **Seller (Người bán / Nông dân / Nhà cung cấp)**: Đăng sản phẩm, quản lý cửa hàng
- **Admin**: Quản trị hệ thống, duyệt seller, quản lý trợ giá, báo cáo

## 🚀 Công nghệ sử dụng

- **Framework**: NestJS 10+
- **Ngôn ngữ**: TypeScript
- **Database**: TiDB Cloud (MySQL compatible) + Prisma ORM
- **Authentication**: JWT + Firebase Auth (tùy chọn)
- **Realtime**: Socket.io
- **Storage & Notification**: Firebase Storage & FCM
- **Validation**: class-validator + class-transformer
- **Testing**: Jest

## 📁 Cấu trúc dự án
src/
├── auth/              # Xác thực, đăng ký, đăng nhập (identifier: email hoặc phone)
├── common/            # Decorators, guards, interceptors, utils
├── core/              # Config, database, logger, firebase
├── modules/           # Các module business chính
│   ├── products/
│   ├── group-buying/      # Core: Mua chung theo nhóm
│   ├── orders/
│   ├── pickup-points/     # Điểm tự lấy cộng đồng
│   ├── logistics/
│   ├── sellers/
│   ├── admin/
│   └── notifications/
├── events/            # Socket.io gateways
├── jobs/              # Background jobs & cron
├── shared/            # DTOs, constants, interfaces
└── prisma/


## 🛠️ Project Setup

### 1. Clone repository
```bash
git clone <your-repo-url>
cd 
2. Cài đặt dependencies
Bashnpm install
3. Cấu hình môi trường
Sao chép file .env.example thành .env và điền thông tin:
Bashcp .env.example .env
Các biến quan trọng cần cấu hình:

Database (TiDB Cloud)
JWT_SECRET
Firebase credentials
Redis (nếu dùng BullMQ cho background jobs)

4. Khởi chạy dự án
Bash# Development mode (watch mode)
npm run start:dev

# Production mode
npm run start:prod
5. Seed dữ liệu (Admin đầu tiên)
Bash# Chạy seeder để tạo tài khoản Admin
npm run seed
Tài khoản Admin mặc định (sau khi seed):

Identifier: admin@yourapp.com
Password: Admin@123456 (Nên đổi ngay sau lần đầu đăng nhập)

📌 Tính năng chính

Đăng ký / Đăng nhập bằng email hoặc số điện thoại (tự động nhận diện)
Hệ thống Group Buying (拼团) đầy đủ
Community Pickup Points (Điểm tự lấy cộng đồng)
Quản lý sản phẩm C2M (nông sản, thực phẩm tươi)
Realtime notification & countdown nhóm mua chung (Socket.io)
Role-based Access Control (Admin - Buyer - Seller)
Hỗ trợ logistics & cold chain tracking (sắp triển khai)

📚 API Documentation
Sau khi chạy project, truy cập:

Swagger UI: http://localhost:3000/api

🧪 Testing
Bash# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
🚀 Deployment
Dự án sẵn sàng deploy lên:

Railway
Render
Vercel (Serverless)
AWS / DigitalOcean
TiDB Cloud + Docker

📄 License
This project is MIT licensed.
