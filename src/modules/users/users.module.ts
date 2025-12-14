import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { ApplicationsModule } from './applications/applications.module';
import { JobPostsModule } from './job-posts/job-posts.module';
import { CompanyModule } from './company/company.module';
import { UsersInterviewModule } from './interview/interview.module';

@Module({
  imports: [
    ProfileModule,
    ApplicationsModule,
    JobPostsModule,
    CompanyModule,
    UsersInterviewModule,
  ],
  controllers: [],
  providers: [],
})
export class UsersModule {}
