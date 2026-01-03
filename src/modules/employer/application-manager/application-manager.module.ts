import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Application } from 'src/database/entities/application/application.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';

import { ApplicationManagerService } from './application-manager.service';
import { ApplicationManagerController } from './application-manager.controller';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Employer, JobPost]),
    NotificationsModule,
  ],
  controllers: [ApplicationManagerController],
  providers: [ApplicationManagerService],
  exports: [ApplicationManagerService],
})
export class ApplicationManagerModule {}
