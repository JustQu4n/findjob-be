import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersInterviewController } from './interview.controller';
import { UsersInterviewService } from './interview.service';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { CandidateBehaviorLog } from 'src/database/entities/candidate-behavior-log/candidate-behavior-log.entity';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { EmailModule } from 'src/modules/email/email.module';
import { InterviewScoringModule } from 'src/modules/interview-scoring/interview-scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateInterview, InterviewQuestion, InterviewAnswer, Application, Interview, Employer, User, CandidateBehaviorLog]),
    NotificationsModule,
    EmailModule,
    InterviewScoringModule,
  ],
  controllers: [UsersInterviewController],
  providers: [UsersInterviewService],
  exports: [UsersInterviewService],
})
export class UsersInterviewModule {}
