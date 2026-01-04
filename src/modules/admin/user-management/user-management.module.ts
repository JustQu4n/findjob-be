import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { User } from 'src/database/entities/user/user.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, JobSeeker, Employer])],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
