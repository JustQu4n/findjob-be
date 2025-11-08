import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { User } from 'src/database/entities/user/user.entity';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobSeeker, Application, User])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
