import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { ApplicationsModule } from './applications/applications.module';
import { JobPostsModule } from './job-posts/job-posts.module';

@Module({
  imports: [ProfileModule, ApplicationsModule, JobPostsModule],
  controllers: [],
  providers: []
})
export class UsersModule {}
