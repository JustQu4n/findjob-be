import { Module } from '@nestjs/common';
import { JobPostModule } from './job-post/job-post.module';
import { ProfileModule } from './profile/profile.module';
import { ApplicationManagerModule } from './application-manager/application-manager.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    JobPostModule,
    ProfileModule,
    ApplicationManagerModule,
    CompanyModule,
    ApplicationModule,
  ],
  controllers: [],
  providers: [],
})
export class EmployerModule {}
