import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from 'src/database/entities/application/application.entity';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, JobSeeker, JobPost, Interview]),
    CloudinaryModule,
    NotificationsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
