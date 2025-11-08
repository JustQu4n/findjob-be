import { Module } from '@nestjs/common';
import { JobPostModule } from './job-post/job-post.module';

@Module({
  imports: [JobPostModule],
  controllers: [],
  providers: [],
})
export class EmployerModule {}
