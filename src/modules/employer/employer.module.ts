import { Module } from '@nestjs/common';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';
import { JobPostModule } from './job-post/job-post.module';

@Module({
  imports: [JobPostModule],
  controllers: [EmployerController],
  providers: [EmployerService],
})
export class EmployerModule {}
