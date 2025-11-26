import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostService } from './job-post.service';
import { JobPostController } from './job-post.controller';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Skill } from 'src/database/entities/skill/skill.entity';
import { JobPostSkill } from 'src/database/entities/job-post-skill/job-post-skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, Employer, Skill, JobPostSkill]),
  ],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
