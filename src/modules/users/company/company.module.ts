import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { FollowedCompany } from '@/database/entities/followed-company/followed-company.entity';
import { JobSeeker } from '@/database/entities/job-seeker/job-seeker.entity';
import { Company } from '@/database/entities/company/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowedCompany, JobSeeker, Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
