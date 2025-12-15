import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersInterviewController } from './interview.controller';
import { UsersInterviewService } from './interview.service';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateInterview, InterviewQuestion, InterviewAnswer, Application, Interview])],
  controllers: [UsersInterviewController],
  providers: [UsersInterviewService],
  exports: [UsersInterviewService],
})
export class UsersInterviewModule {}
