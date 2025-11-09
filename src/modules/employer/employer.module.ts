import { Module } from '@nestjs/common';
import { JobPostModule } from './job-post/job-post.module';
import { ProfileModule } from './profile/profile.module';
import { ApplicationManagerModule } from './application-manager/application-manager.module';

@Module({
  imports: [JobPostModule, ProfileModule, ApplicationManagerModule],
  controllers: [],
  providers: [],
})
export class EmployerModule {}
