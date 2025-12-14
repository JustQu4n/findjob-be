import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { MinioModule } from '../minio/minio.module';

import { User } from 'src/database/entities/user/user.entity';
import { Role } from 'src/database/entities/role/role.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Admin } from 'src/database/entities/admin/admin.entity';
import { Company } from 'src/database/entities/company/company.entity';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, JobSeeker, Employer, Admin, Company]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'careervibe-secret-key-2024',
      signOptions: { expiresIn: '15m' },
    }),
    EmailModule,
    MinioModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, LocalStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
