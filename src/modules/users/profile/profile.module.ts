import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobSeeker } from 'src/database/entities/job-seeker/job-seeker.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { User } from 'src/database/entities/user/user.entity';
import { Experience } from 'src/database/entities/experience/experience.entity';
import { Education } from 'src/database/entities/education/education.entity';
import { Project } from 'src/database/entities/project/project.entity';
import { UserSkill } from 'src/database/entities/user-skill/user-skill.entity';
import { Skill } from 'src/database/entities/skill/skill.entity';
import { MinioModule } from 'src/modules/minio/minio.module';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobSeeker, Application, User, Experience, Education, Project, UserSkill, Skill]),
    MinioModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
