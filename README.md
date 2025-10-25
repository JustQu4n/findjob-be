# FindJob Backend API - CareerVibe# FindJob Backend API<p align="center">



Backend API cho hệ thống tìm kiếm việc làm (Job Portal System) được xây dựng với NestJS, TypeScript, PostgreSQL và TypeORM.  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>



## 📋 Mục lụcBackend API cho hệ thống tìm kiếm việc làm (Job Portal System) được xây dựng với NestJS, TypeScript, PostgreSQL và TypeORM.</p>



- [Tổng quan](#tổng-quan)

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)## 📋 Mục lục[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

- [Cài đặt](#cài-đặt)

- [Cấu hình](#cấu-hình)[circleci-url]: https://circleci.com/gh/nestjs/nest

- [Chạy ứng dụng](#chạy-ứng-dụng)

- [Authentication System](#authentication-system)- [Tổng quan](#tổng-quan)

- [Database Migration](#database-migration)

- [Cấu trúc project](#cấu-trúc-project)- [Công nghệ sử dụng](#công-nghệ-sử-dụng)  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- [API Documentation](#api-documentation)

- [Testing](#testing)- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)    <p align="center">

- [Docker](#docker)

- [Cài đặt](#cài-đặt)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

## 🎯 Tổng quan

- [Cấu hình](#cấu-hình)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

FindJob Backend là REST API cung cấp các chức năng cho hệ thống tìm kiếm việc làm, bao gồm:

- [Chạy ứng dụng](#chạy-ứng-dụng)<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

- **🔐 Authentication & Authorization**: JWT-based auth với email verification

- **👥 Quản lý người dùng**: Admin, Employer (Nhà tuyển dụng), Job Seeker (Người tìm việc)- [Database Migration](#database-migration)<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

- **🏢 Quản lý công ty**: Thông tin công ty, hồ sơ doanh nghiệp

- **📝 Quản lý tin tuyển dụng**: Đăng tin, tìm kiếm, lọc việc làm- [Cấu trúc project](#cấu-trúc-project)<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

- **📄 Quản lý ứng tuyển**: Gửi CV, theo dõi trạng thái ứng tuyển

- **🛡️ Phân quyền**: Role-based access control (RBAC)- [API Documentation](#api-documentation)<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

- **📧 Email Service**: Verification, password reset, notifications

- [Testing](#testing)<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

## 🚀 Công nghệ sử dụng

- [Docker](#docker)  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

- **Framework**: [NestJS](https://nestjs.com/) 11.x

- **Language**: TypeScript 5.x    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

- **Database**: PostgreSQL 15

- **ORM**: TypeORM 0.3.x## 🎯 Tổng quan  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

- **Authentication**: JWT, Passport.js

- **Password Hashing**: bcrypt</p>

- **Email**: Nodemailer + Mailer Module

- **Validation**: class-validator, class-transformerFindJob Backend là REST API cung cấp các chức năng cho hệ thống tìm kiếm việc làm, bao gồm:  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

- **Testing**: Jest

- **Code Quality**: ESLint, Prettier  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

- **Containerization**: Docker & Docker Compose

- **Quản lý người dùng**: Admin, Employer (Nhà tuyển dụng), Job Seeker (Người tìm việc)

## 📦 Yêu cầu hệ thống

- **Quản lý công ty**: Thông tin công ty, hồ sơ doanh nghiệp## Description

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Quản lý tin tuyển dụng**: Đăng tin, tìm kiếm, lọc việc làm

- **Node.js**: >= 18.x (khuyến nghị 20.x)

- **npm**: >= 9.x hoặc **yarn**: >= 1.22.x- **Quản lý ứng tuyển**: Gửi CV, theo dõi trạng thái ứng tuyển[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

- **PostgreSQL**: >= 15.x (hoặc dùng Docker)

- **Docker Desktop** (tùy chọn): Nếu muốn chạy database trong container- **Phân quyền**: Role-based access control (RBAC)



## 🔧 Cài đặt- **Xác thực**: JWT Authentication## Project setup



### 1. Clone repository



```bash## 🚀 Công nghệ sử dụng```bash

git clone https://github.com/JustQu4n/findjob-be.git

cd findjob-be$ npm install

```

- **Framework**: [NestJS](https://nestjs.com/) 11.x```

### 2. Cài đặt dependencies

- **Language**: TypeScript 5.x

```bash

npm install- **Database**: PostgreSQL 15## Compile and run the project

```

- **ORM**: TypeORM 0.3.x

## ⚙️ Cấu hình

- **Validation**: class-validator, class-transformer```bash

### 1. Tạo file môi trường

- **Testing**: Jest# development

Tạo file `.env` trong thư mục gốc của project:

- **Code Quality**: ESLint, Prettier$ npm run start

```bash

# Copy từ .env.example- **Containerization**: Docker & Docker Compose

cp .env.example .env

```# watch mode



### 2. Cấu hình biến môi trường## 📦 Yêu cầu hệ thống$ npm run start:dev



Chỉnh sửa file `.env` với nội dung sau:



```envTrước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:# production mode

# Application

NODE_ENV=development$ npm run start:prod

PORT=3000

API_PREFIX=api- **Node.js**: >= 18.x (khuyến nghị 20.x)```



# Database- **npm**: >= 9.x hoặc **yarn**: >= 1.22.x

DB_HOST=localhost

DB_PORT=5432- **PostgreSQL**: >= 15.x (hoặc dùng Docker)## Run tests

DB_USERNAME=careervibe

DB_PASSWORD=Careervibe@123- **Docker Desktop** (tùy chọn): Nếu muốn chạy database trong container

DB_DATABASE=careervibe_db

DB_LOGGING=true```bash



# PostgreSQL (for Docker Compose)## 🔧 Cài đặt# unit tests

POSTGRES_USER=careervibe

POSTGRES_PASSWORD=Careervibe@123$ npm run test

POSTGRES_DB=careervibe_db

POSTGRES_PORT=5432### 1. Clone repository



# pgAdmin (for Docker Compose)# e2e tests

PGADMIN_EMAIL=admin@careervibe.com

PGADMIN_PASSWORD=admin```bash$ npm run test:e2e

PGADMIN_PORT=5050

git clone https://github.com/JustQu4n/findjob-be.git

# JWT Authentication

JWT_SECRET=careervibe-secret-key-2024-change-this-in-productioncd findjob-be# test coverage

JWT_EXPIRATION=15m

JWT_REFRESH_SECRET=careervibe-refresh-secret-2024-change-this-in-production```$ npm run test:cov

JWT_REFRESH_EXPIRATION=7d

```

# Email Configuration (Gmail)

MAIL_HOST=smtp.gmail.com### 2. Cài đặt dependencies

MAIL_PORT=587

MAIL_USER=your-email@gmail.com## Deployment

MAIL_PASSWORD=your-gmail-app-password

MAIL_FROM=noreply@careervibe.com```bash



# Frontend URLnpm installWhen you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

FRONTEND_URL=http://localhost:5173

``````



### 3. Cấu hình Gmail để gửi EmailIf you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:



1. Truy cập Google Account: https://myaccount.google.com/## ⚙️ Cấu hình

2. Bật **2-Step Verification**

3. Tạo **App Password**:```bash

   - Vào: https://myaccount.google.com/apppasswords

   - Chọn "Mail" và "Other (Custom name)" → đặt tên "CareerVibe"### 1. Tạo file môi trường$ npm install -g @nestjs/mau

   - Copy password và paste vào `MAIL_PASSWORD` trong file `.env`

$ mau deploy

## 🏃 Chạy ứng dụng

Tạo file `.env` trong thư mục gốc của project:```

### Option 1: Chạy với Database local



Đảm bảo PostgreSQL đã được cài đặt và đang chạy, sau đó:

```bashWith Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

```bash

# Development mode với auto-reload# Copy từ .env.example (nếu có)

npm run start:dev

cp .env.example .env## Resources

# Production mode

npm run build```

npm run start:prod

```Check out a few resources that may come in handy when working with NestJS:



### Option 2: Chạy với Docker (khuyến nghị)### 2. Cấu hình biến môi trường



#### Bước 1: Start PostgreSQL và pgAdmin- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.



```bashChỉnh sửa file `.env` với nội dung sau:- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

docker-compose up -d

```- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).



Services sẽ chạy trên:```env- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

- **PostgreSQL**: `localhost:5432`

- **pgAdmin**: `http://localhost:5050`# Application- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).



#### Bước 2: Chạy migrationsNODE_ENV=development- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).



```bashPORT=3000- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

npm run migration:run

```API_PREFIX=api- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).



#### Bước 3: Start ứng dụng



```bash# Database## Support

npm run start:dev

```DB_HOST=localhost



### Truy cập ứng dụngDB_PORT=5432Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).



Sau khi start thành công, API sẽ chạy tại: **http://localhost:3000/api**DB_USERNAME=careervibe



## 🔐 Authentication SystemDB_PASSWORD=Careervibe@123## Stay in touch



Hệ thống authentication hoàn chỉnh với các tính năng:DB_DATABASE=careervibe_db



### ✨ Tính năngDB_LOGGING=true- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)



- ✅ **Đăng ký tài khoản** với 3 roles: Admin, Employer, Job Seeker- Website - [https://nestjs.com](https://nestjs.com/)

- ✅ **Xác thực Email** bắt buộc trước khi đăng nhập

- ✅ **Đăng nhập** với JWT tokens (Access + Refresh)# PostgreSQL (for Docker Compose)- Twitter - [@nestframework](https://twitter.com/nestframework)

- ✅ **Refresh Token** rotation để renew access token

- ✅ **Quên mật khẩu** với email reset linkPOSTGRES_USER=careervibe

- ✅ **Đặt lại mật khẩu** an toàn

- ✅ **Email Templates** đẹp mắt với HTMLPOSTGRES_PASSWORD=Careervibe@123## License

- ✅ **Role-based Access Control** (RBAC)

POSTGRES_DB=careervibe_db

### 📚 Chi tiết Documentation

POSTGRES_PORT=5432Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

- **[Authentication Guide](docs/AUTHENTICATION.md)** - Hướng dẫn sử dụng API

- **[Architecture Document](docs/AUTH_ARCHITECTURE.md)** - Kiến trúc hệ thống chi tiết# findjob-be



### 🔑 Quick Start Authentication# pgAdmin (for Docker Compose)

PGADMIN_EMAIL=admin@careervibe.com

#### 1. Đăng ký tài khoảnPGADMIN_PASSWORD=admin

PGADMIN_PORT=5050

```bash

POST /api/auth/register# JWT (nếu có)

{# JWT_SECRET=your-secret-key-here

  "full_name": "Nguyễn Văn A",# JWT_EXPIRATION=1d

  "email": "nguyenvana@example.com",```

  "password": "Password@123",

  "phone": "0123456789",## 🏃 Chạy ứng dụng

  "role": "job_seeker"

}### Option 1: Chạy với Database local

```

Đảm bảo PostgreSQL đã được cài đặt và đang chạy, sau đó:

#### 2. Xác thực Email

```bash

Check email và click vào link verification, hoặc:# Development mode với auto-reload

npm run start:dev

```bash

POST /api/auth/verify-email# Production mode

{npm run build

  "token": "uuid-token-from-email"npm run start:prod

}```

```

### Option 2: Chạy với Docker (khuyến nghị)

#### 3. Đăng nhập

#### Bước 1: Start PostgreSQL và pgAdmin

```bash

POST /api/auth/login```bash

{docker-compose up -d

  "email": "nguyenvana@example.com",```

  "password": "Password@123"

}Services sẽ chạy trên:

```- **PostgreSQL**: `localhost:5432`

- **pgAdmin**: `http://localhost:5050`

Response sẽ trả về `accessToken` và `refreshToken`.

#### Bước 2: Chạy migrations

#### 4. Sử dụng Protected Routes

```bash

```bashnpm run migration:run

GET /api/auth/me```

Authorization: Bearer {accessToken}

```#### Bước 3: Start ứng dụng



## 🗄️ Database Migration```bash

npm run start:dev

### Chạy migrations```



```bash### Truy cập ứng dụng

# Chạy tất cả migrations chưa được thực thi

npm run migration:runSau khi start thành công, API sẽ chạy tại: **http://localhost:3000/api**

```

## 🗄️ Database Migration

### Tạo migration mới

### Chạy migrations

```bash

# Tự động generate migration từ entities```bash

npm run migration:generate -- src/database/migrations/MigrationName# Chạy tất cả migrations chưa được thực thi

npm run migration:run

# Tạo migration rỗng```

npm run migration:create -- src/database/migrations/MigrationName

```### Tạo migration mới



### Revert migration```bash

# Tự động generate migration từ entities

```bashnpm run migration:generate -- src/database/migrations/MigrationName

# Rollback migration gần nhất

npm run migration:revert# Tạo migration rỗng

```npm run migration:create -- src/database/migrations/MigrationName

```

### Các lệnh khác

### Revert migration

```bash

# Drop toàn bộ schema (CẢNH BÁO: Xóa tất cả dữ liệu)```bash

npm run schema:drop# Rollback migration gần nhất

npm run migration:revert

# Sync schema (chỉ dùng cho development)```

npm run schema:sync

```### Các lệnh khác



## 📁 Cấu trúc project```bash

# Drop toàn bộ schema (CẢNH BÁO: Xóa tất cả dữ liệu)

```npm run schema:drop

be/

├── src/# Sync schema (chỉ dùng cho development)

│   ├── common/                 # Shared modulesnpm run schema:sync

│   │   ├── decorators/        # Custom decorators (@GetUser, @Roles, @Public)```

│   │   ├── exceptions/        # Custom exceptions

│   │   ├── filters/           # Exception filters## 📁 Cấu trúc project

│   │   ├── guards/            # Auth guards (JWT, Roles, etc.)

│   │   ├── interceptors/      # Interceptors```

│   │   └── utils/             # Utility functions & enumsbe/

│   │├── src/

│   ├── config/                # Configuration modules│   ├── common/                 # Shared modules

│   │   └── database.config.ts│   │   ├── decorators/        # Custom decorators

│   ││   │   ├── exceptions/        # Custom exceptions

│   ├── database/              # Database layer│   │   ├── filters/           # Exception filters

│   │   ├── entities/          # TypeORM entities│   │   ├── guards/            # Auth guards

│   │   │   ├── admin/│   │   ├── interceptors/      # Interceptors

│   │   │   ├── application/│   │   └── utils/             # Utility functions

│   │   │   ├── company/│   │       └── enums/         # Enums (Application status, Employment type, etc.)

│   │   │   ├── employer/│   │

│   │   │   ├── job-post/│   ├── config/                # Configuration modules

│   │   │   ├── job-seeker/│   │   └── database.config.ts

│   │   │   ├── permission/│   │

│   │   │   ├── role/│   ├── database/              # Database layer

│   │   │   ├── role-permission/│   │   ├── entities/          # TypeORM entities

│   │   │   ├── user/         # User entity with auth fields│   │   │   ├── admin/

│   │   │   └── user-role/│   │   │   ├── application/

│   │   └── migrations/        # Database migrations│   │   │   ├── company/

│   ││   │   │   ├── employer/

│   ├── modules/               # Feature modules│   │   │   ├── job-post/

│   │   ├── admin/            # Admin management│   │   │   ├── job-seeker/

│   │   ├── auth/             # 🔐 Authentication module (NEW!)│   │   │   ├── permission/

│   │   │   ├── dto/          # Data Transfer Objects│   │   │   ├── role/

│   │   │   ├── strategies/   # Passport strategies (JWT, Local)│   │   │   ├── role-permission/

│   │   │   ├── auth.controller.ts│   │   │   ├── user/

│   │   │   ├── auth.service.ts│   │   │   └── user-role/

│   │   │   ├── email.service.ts│   │   └── migrations/        # Database migrations

│   │   │   └── auth.module.ts│   │

│   │   ├── employer/         # Employer management│   ├── modules/               # Feature modules

│   │   └── users/            # User management│   │   ├── admin/            # Admin management

│   ││   │   ├── auth/             # Authentication & Authorization

│   ├── app.module.ts         # Root module│   │   ├── employer/         # Employer management

│   └── main.ts               # Application entry point│   │   └── users/            # User management

││   │

├── docs/                      # 📚 Documentation│   ├── app.module.ts         # Root module

│   ├── AUTHENTICATION.md      # Auth API guide│   └── main.ts               # Application entry point

│   └── AUTH_ARCHITECTURE.md   # System architecture│

│├── test/                     # E2E tests

├── test/                      # E2E tests├── docker-compose.yml        # Docker configuration

├── docker-compose.yml         # Docker configuration├── data-source.ts           # TypeORM DataSource

├── data-source.ts            # TypeORM DataSource├── tsconfig.json            # TypeScript configuration

├── .env.example              # Environment variables template└── package.json             # Dependencies

├── tsconfig.json             # TypeScript configuration```

└── package.json              # Dependencies

```## 📚 API Documentation



## 📚 API Documentation### Base URL

```

### Base URLhttp://localhost:3000/api

``````

http://localhost:3000/api

```### Main Endpoints



### Authentication Endpoints#### Authentication

- `POST /api/auth/login` - Đăng nhập

| Method | Endpoint | Description | Auth Required |- `POST /api/auth/register` - Đăng ký

|--------|----------|-------------|---------------|- `POST /api/auth/logout` - Đăng xuất

| POST | `/auth/register` | Đăng ký tài khoản | ❌ |

| POST | `/auth/verify-email` | Xác thực email | ❌ |#### Users

| POST | `/auth/resend-verification` | Gửi lại email xác thực | ❌ |- `GET /api/users` - Lấy danh sách người dùng

| POST | `/auth/login` | Đăng nhập | ❌ |- `GET /api/users/:id` - Lấy thông tin người dùng

| POST | `/auth/refresh` | Refresh access token | ❌ |- `PUT /api/users/:id` - Cập nhật thông tin

| POST | `/auth/logout` | Đăng xuất | ✅ |- `DELETE /api/users/:id` - Xóa người dùng

| POST | `/auth/forgot-password` | Quên mật khẩu | ❌ |

| POST | `/auth/reset-password` | Đặt lại mật khẩu | ❌ |#### Admin

| GET | `/auth/me` | Lấy thông tin user | ✅ |- `GET /api/admin/dashboard` - Dashboard

- `GET /api/admin/users` - Quản lý users

### Users Endpoints- `GET /api/admin/employers` - Quản lý employers



| Method | Endpoint | Description | Auth Required |#### Employer

|--------|----------|-------------|---------------|- `GET /api/employer/profile` - Thông tin employer

| GET | `/users` | Lấy danh sách người dùng | ✅ |- `POST /api/employer/job-posts` - Đăng tin tuyển dụng

| GET | `/users/:id` | Lấy thông tin người dùng | ✅ |- `GET /api/employer/applications` - Xem ứng tuyển

| PUT | `/users/:id` | Cập nhật thông tin | ✅ |

| DELETE | `/users/:id` | Xóa người dùng | ✅ Admin |*Chi tiết API endpoints sẽ được cập nhật với Swagger/OpenAPI*



### Admin Endpoints## 🧪 Testing



| Method | Endpoint | Description | Auth Required |### Unit Tests

|--------|----------|-------------|---------------|

| GET | `/admin/dashboard` | Dashboard | ✅ Admin |```bash

| GET | `/admin/users` | Quản lý users | ✅ Admin |# Chạy tất cả unit tests

npm run test

### Employer Endpoints

# Watch mode

| Method | Endpoint | Description | Auth Required |npm run test:watch

|--------|----------|-------------|---------------|

| GET | `/employer/profile` | Thông tin employer | ✅ Employer |# Coverage report

| POST | `/employer/job-posts` | Đăng tin tuyển dụng | ✅ Employer |npm run test:cov

```

*Chi tiết đầy đủ xem [AUTHENTICATION.md](docs/AUTHENTICATION.md)*

### E2E Tests

## 🧪 Testing

```bash

### Unit Tests# Chạy end-to-end tests

npm run test:e2e

```bash```

# Chạy tất cả unit tests

npm run test## 🐳 Docker



# Watch mode### Chạy PostgreSQL & pgAdmin

npm run test:watch

```bash

# Coverage report# Start services

npm run test:covdocker-compose up -d

```

# Stop services

### E2E Testsdocker-compose down



```bash# View logs

# Chạy end-to-end testsdocker-compose logs -f postgres

npm run test:e2e```

```

### Access pgAdmin

## 🐳 Docker

1. Truy cập: http://localhost:5050

### Chạy PostgreSQL & pgAdmin2. Đăng nhập với:

   - Email: `admin@careervibe.com`

```bash   - Password: `admin`

# Start services3. Thêm server mới:

docker-compose up -d   - Host: `postgres`

   - Port: `5432`

# Stop services   - Database: `careervibe_db`

docker-compose down   - Username: `careervibe`

   - Password: `Careervibe@123`

# View logs

docker-compose logs -f postgres## 📝 Code Style

```

### Chạy linter

### Access pgAdmin

```bash

1. Truy cập: http://localhost:5050# Kiểm tra code style

2. Đăng nhập với:npm run lint

   - Email: `admin@careervibe.com`

   - Password: `admin`# Tự động fix

3. Thêm server mới:npm run lint -- --fix

   - Host: `postgres````

   - Port: `5432`

   - Database: `careervibe_db`### Format code

   - Username: `careervibe`

   - Password: `Careervibe@123````bash

npm run format

## 📝 Code Style```



### Chạy linter## 🔐 Environment Variables



```bashDanh sách các biến môi trường quan trọng:

# Kiểm tra code style

npm run lint| Biến | Mô tả | Giá trị mặc định |

|------|-------|------------------|

# Tự động fix| `NODE_ENV` | Môi trường chạy | `development` |

npm run lint -- --fix| `PORT` | Port của API | `3000` |

```| `API_PREFIX` | Prefix cho API routes | `api` |

| `DB_HOST` | Database host | `localhost` |

### Format code| `DB_PORT` | Database port | `5432` |

| `DB_USERNAME` | Database username | `careervibe` |

```bash| `DB_PASSWORD` | Database password | - |

npm run format| `DB_DATABASE` | Database name | `careervibe_db` |

```| `DB_LOGGING` | Enable SQL logging | `true` |



## 🔐 Environment Variables## 🤝 Đóng góp



Danh sách các biến môi trường quan trọng:1. Fork repository

2. Tạo branch mới: `git checkout -b feature/AmazingFeature`

| Biến | Mô tả | Giá trị mặc định |3. Commit changes: `git commit -m 'Add some AmazingFeature'`

|------|-------|------------------|4. Push to branch: `git push origin feature/AmazingFeature`

| `NODE_ENV` | Môi trường chạy | `development` |5. Tạo Pull Request

| `PORT` | Port của API | `3000` |

| `API_PREFIX` | Prefix cho API routes | `api` |## 📄 License

| `DB_HOST` | Database host | `localhost` |

| `DB_PORT` | Database port | `5432` |UNLICENSED - Dự án graduation project

| `DB_USERNAME` | Database username | `careervibe` |

| `DB_PASSWORD` | Database password | - |## 👥 Tác giả

| `DB_DATABASE` | Database name | `careervibe_db` |

| `JWT_SECRET` | JWT secret key | - |- **Repository**: [findjob-be](https://github.com/JustQu4n/findjob-be)

| `JWT_EXPIRATION` | Access token expiry | `15m` |- **Owner**: JustQu4n

| `JWT_REFRESH_SECRET` | Refresh token secret | - |

| `JWT_REFRESH_EXPIRATION` | Refresh token expiry | `7d` |## 📞 Liên hệ & Hỗ trợ

| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |

| `MAIL_PORT` | SMTP port | `587` |Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository.

| `MAIL_USER` | Email username | - |

| `MAIL_PASSWORD` | Email password/app password | - |---

| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |

Built with ❤️ using [NestJS](https://nestjs.com/)

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

## 📖 Tài liệu bổ sung

- [Authentication Guide](docs/AUTHENTICATION.md) - Hướng dẫn sử dụng Authentication API
- [Authentication Architecture](docs/AUTH_ARCHITECTURE.md) - Kiến trúc hệ thống Authentication chi tiết

---

Built with ❤️ using [NestJS](https://nestjs.com/)
