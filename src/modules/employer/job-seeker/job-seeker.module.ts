import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { User } from 'src/database/entities/user/user.entity';
import { JobSeekerController } from './job-seeker.controller';
import { JobSeekerService } from './job-seeker.service';
import { MinioService } from 'src/modules/minio/minio.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobSeeker, User])],
  controllers: [JobSeekerController],
  providers: [JobSeekerService, MinioService],
  exports: [JobSeekerService],
})
export class JobSeekerModule {}
