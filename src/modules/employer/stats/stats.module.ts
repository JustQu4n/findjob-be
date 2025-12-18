import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Application } from 'src/database/entities/application/application.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Company } from 'src/database/entities/company/company.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, JobPost, Company, JobSeeker, CandidateInterview])],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
