import { Module } from '@nestjs/common';
import { JobPostModule } from './job-post/job-post.module';
import { ProfileModule } from './profile/profile.module';
import { ApplicationManagerModule } from './application-manager/application-manager.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';
import { JobSeekerModule } from './job-seeker/job-seeker.module';
import { InterviewsModule } from './interviews/interviews.module';

@Module({
  imports: [
    JobPostModule,
    ProfileModule,
    ApplicationManagerModule,
    CompanyModule,
    ApplicationModule,
    JobSeekerModule,
    InterviewsModule,
  ],
  controllers: [],
  providers: [],
})
export class EmployerModule {}
