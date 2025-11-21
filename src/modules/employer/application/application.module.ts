import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Application } from 'src/database/entities/application/application.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { JobPost } from 'src/database/entities/job-post/job-post.entity';
import { EmailModule } from 'src/modules/email/email.module';
import { MinioModule } from 'src/modules/minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Employer, JobPost]), EmailModule, MinioModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
