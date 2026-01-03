import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostService } from './job-post.service';
import { JobPostController } from './job-post.controller';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Skill } from 'src/database/entities/skill/skill.entity';
import { JobPostSkill } from 'src/database/entities/job-post-skill/job-post-skill.entity';
import { FollowedCompany } from 'src/database/entities/followed-company/followed-company.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, Employer, Skill, JobPostSkill, FollowedCompany]),
    NotificationsModule,
  ],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
