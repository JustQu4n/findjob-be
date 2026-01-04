import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'src/database/entities/user/user.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Company } from 'src/database/entities/company/company.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Category } from 'src/database/entities/category/category.entity';
import { Notification } from 'src/database/entities/notification/notification.entity';
import { Post } from 'src/database/entities/post/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      JobSeeker,
      Employer,
      Company,
      JobPost,
      Application,
      Category,
      Notification,
      Post,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
