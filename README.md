# FindJob Backend API<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>

Backend API cho hệ thống tìm kiếm việc làm (Job Portal System) được xây dựng với NestJS, TypeScript, PostgreSQL và TypeORM.</p>



## 📋 Mục lục[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

- [Tổng quan](#tổng-quan)

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)    <p align="center">

- [Cài đặt](#cài-đặt)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

- [Cấu hình](#cấu-hình)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

- [Chạy ứng dụng](#chạy-ứng-dụng)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

- [Database Migration](#database-migration)<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

- [Cấu trúc project](#cấu-trúc-project)<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

- [API Documentation](#api-documentation)<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

- [Testing](#testing)<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

- [Docker](#docker)  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

## 🎯 Tổng quan  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

</p>

FindJob Backend là REST API cung cấp các chức năng cho hệ thống tìm kiếm việc làm, bao gồm:  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

- **Quản lý người dùng**: Admin, Employer (Nhà tuyển dụng), Job Seeker (Người tìm việc)

- **Quản lý công ty**: Thông tin công ty, hồ sơ doanh nghiệp## Description

- **Quản lý tin tuyển dụng**: Đăng tin, tìm kiếm, lọc việc làm

- **Quản lý ứng tuyển**: Gửi CV, theo dõi trạng thái ứng tuyển[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

- **Phân quyền**: Role-based access control (RBAC)

- **Xác thực**: JWT Authentication## Project setup



## 🚀 Công nghệ sử dụng```bash

$ npm install

- **Framework**: [NestJS](https://nestjs.com/) 11.x```

- **Language**: TypeScript 5.x

- **Database**: PostgreSQL 15## Compile and run the project

- **ORM**: TypeORM 0.3.x

- **Validation**: class-validator, class-transformer```bash

- **Testing**: Jest# development

- **Code Quality**: ESLint, Prettier$ npm run start

- **Containerization**: Docker & Docker Compose

# watch mode

## 📦 Yêu cầu hệ thống$ npm run start:dev



Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:# production mode

$ npm run start:prod

- **Node.js**: >= 18.x (khuyến nghị 20.x)```

- **npm**: >= 9.x hoặc **yarn**: >= 1.22.x

- **PostgreSQL**: >= 15.x (hoặc dùng Docker)## Run tests

- **Docker Desktop** (tùy chọn): Nếu muốn chạy database trong container

```bash

## 🔧 Cài đặt# unit tests

$ npm run test

### 1. Clone repository

# e2e tests

```bash$ npm run test:e2e

git clone https://github.com/JustQu4n/findjob-be.git

cd findjob-be# test coverage

```$ npm run test:cov

```

### 2. Cài đặt dependencies

## Deployment

```bash

npm installWhen you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

```

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

## ⚙️ Cấu hình

```bash

### 1. Tạo file môi trường$ npm install -g @nestjs/mau

$ mau deploy

Tạo file `.env` trong thư mục gốc của project:```



```bashWith Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

# Copy từ .env.example (nếu có)

cp .env.example .env## Resources

```

Check out a few resources that may come in handy when working with NestJS:

### 2. Cấu hình biến môi trường

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

Chỉnh sửa file `.env` với nội dung sau:- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).

```env- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

# Application- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

NODE_ENV=development- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

PORT=3000- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

API_PREFIX=api- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).



# Database## Support

DB_HOST=localhost

DB_PORT=5432Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

DB_USERNAME=careervibe

DB_PASSWORD=Careervibe@123## Stay in touch

DB_DATABASE=careervibe_db

DB_LOGGING=true- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)

- Website - [https://nestjs.com](https://nestjs.com/)

# PostgreSQL (for Docker Compose)- Twitter - [@nestframework](https://twitter.com/nestframework)

POSTGRES_USER=careervibe

POSTGRES_PASSWORD=Careervibe@123## License

POSTGRES_DB=careervibe_db

POSTGRES_PORT=5432Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# findjob-be

# pgAdmin (for Docker Compose)
PGADMIN_EMAIL=admin@careervibe.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050

# JWT (nếu có)
# JWT_SECRET=your-secret-key-here
# JWT_EXPIRATION=1d
```

## 🏃 Chạy ứng dụng

### Option 1: Chạy với Database local

Đảm bảo PostgreSQL đã được cài đặt và đang chạy, sau đó:

```bash
# Development mode với auto-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Option 2: Chạy với Docker (khuyến nghị)

#### Bước 1: Start PostgreSQL và pgAdmin

```bash
docker-compose up -d
```

Services sẽ chạy trên:
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050`

#### Bước 2: Chạy migrations

```bash
npm run migration:run
```

#### Bước 3: Start ứng dụng

```bash
npm run start:dev
```

### Truy cập ứng dụng

Sau khi start thành công, API sẽ chạy tại: **http://localhost:3000/api**

## 🗄️ Database Migration

### Chạy migrations

```bash
# Chạy tất cả migrations chưa được thực thi
npm run migration:run
```

### Tạo migration mới

```bash
# Tự động generate migration từ entities
npm run migration:generate -- src/database/migrations/MigrationName

# Tạo migration rỗng
npm run migration:create -- src/database/migrations/MigrationName
```

### Revert migration

```bash
# Rollback migration gần nhất
npm run migration:revert
```

### Các lệnh khác

```bash
# Drop toàn bộ schema (CẢNH BÁO: Xóa tất cả dữ liệu)
npm run schema:drop

# Sync schema (chỉ dùng cho development)
npm run schema:sync
```

## 📁 Cấu trúc project

```
be/
├── src/
│   ├── common/                 # Shared modules
│   │   ├── decorators/        # Custom decorators
│   │   ├── exceptions/        # Custom exceptions
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   ├── interceptors/      # Interceptors
│   │   └── utils/             # Utility functions
│   │       └── enums/         # Enums (Application status, Employment type, etc.)
│   │
│   ├── config/                # Configuration modules
│   │   └── database.config.ts
│   │
│   ├── database/              # Database layer
│   │   ├── entities/          # TypeORM entities
│   │   │   ├── admin/
│   │   │   ├── application/
│   │   │   ├── company/
│   │   │   ├── employer/
│   │   │   ├── job-post/
│   │   │   ├── job-seeker/
│   │   │   ├── permission/
│   │   │   ├── role/
│   │   │   ├── role-permission/
│   │   │   ├── user/
│   │   │   └── user-role/
│   │   └── migrations/        # Database migrations
│   │
│   ├── modules/               # Feature modules
│   │   ├── admin/            # Admin management
│   │   ├── auth/             # Authentication & Authorization
│   │   ├── employer/         # Employer management
│   │   └── users/            # User management
│   │
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
│
├── test/                     # E2E tests
├── docker-compose.yml        # Docker configuration
├── data-source.ts           # TypeORM DataSource
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

#### Users
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật thông tin
- `DELETE /api/users/:id` - Xóa người dùng

#### Admin
- `GET /api/admin/dashboard` - Dashboard
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/employers` - Quản lý employers

#### Employer
- `GET /api/employer/profile` - Thông tin employer
- `POST /api/employer/job-posts` - Đăng tin tuyển dụng
- `GET /api/employer/applications` - Xem ứng tuyển

*Chi tiết API endpoints sẽ được cập nhật với Swagger/OpenAPI*

## 🧪 Testing

### Unit Tests

```bash
# Chạy tất cả unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### E2E Tests

```bash
# Chạy end-to-end tests
npm run test:e2e
```

## 🐳 Docker

### Chạy PostgreSQL & pgAdmin

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Access pgAdmin

1. Truy cập: http://localhost:5050
2. Đăng nhập với:
   - Email: `admin@careervibe.com`
   - Password: `admin`
3. Thêm server mới:
   - Host: `postgres`
   - Port: `5432`
   - Database: `careervibe_db`
   - Username: `careervibe`
   - Password: `Careervibe@123`

## 📝 Code Style

### Chạy linter

```bash
# Kiểm tra code style
npm run lint

# Tự động fix
npm run lint -- --fix
```

### Format code

```bash
npm run format
```

## 🔐 Environment Variables

Danh sách các biến môi trường quan trọng:

| Biến | Mô tả | Giá trị mặc định |
|------|-------|------------------|
| `NODE_ENV` | Môi trường chạy | `development` |
| `PORT` | Port của API | `3000` |
| `API_PREFIX` | Prefix cho API routes | `api` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `careervibe` |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | `careervibe_db` |
| `DB_LOGGING` | Enable SQL logging | `true` |

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

UNLICENSED - Dự án graduation project

## 👥 Tác giả

- **Repository**: [findjob-be](https://github.com/JustQu4n/findjob-be)
- **Owner**: JustQu4n

## 📞 Liên hệ & Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository.

---

Built with ❤️ using [NestJS](https://nestjs.com/)
