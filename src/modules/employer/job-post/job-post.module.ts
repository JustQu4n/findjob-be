import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostService } from './job-post.service';
import { JobPostController } from './job-post.controller';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, Employer])],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
