import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from 'src/database/entities/company/company.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Employer, JobPost])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
