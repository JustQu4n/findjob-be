import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyManagementController } from './company-management.controller';
import { CompanyManagementService } from './company-management.service';
import { Company } from 'src/database/entities/company/company.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { FollowedCompany } from 'src/database/entities/followed-company/followed-company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, JobPost, Employer, FollowedCompany]),
  ],
  controllers: [CompanyManagementController],
  providers: [CompanyManagementService],
  exports: [CompanyManagementService],
})
export class CompanyManagementModule {}
