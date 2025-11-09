import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Application } from 'src/database/entities/application/application.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Employer, JobPost])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
