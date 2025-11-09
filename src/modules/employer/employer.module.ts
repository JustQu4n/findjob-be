import { Module } from '@nestjs/common';
import { JobPostModule } from './job-post/job-post.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [JobPostModule, ProfileModule],
  controllers: [],
  providers: [],
})
export class EmployerModule {}
