import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost } from '@/database/entities/job-post/job-post.entity';
import { SavedJob } from '@/database/entities/saved-job/saved-job.entity';
import { JobSeeker } from '@/database/entities/job-seeker/job-seeker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, SavedJob, JobSeeker])],
  controllers: [JobPostsController],
  providers: [JobPostsService],
  exports: [JobPostsService],
})
export class JobPostsModule {}
