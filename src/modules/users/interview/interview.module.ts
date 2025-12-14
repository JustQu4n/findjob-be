import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersInterviewController } from './interview.controller';
import { UsersInterviewService } from './interview.service';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateInterview, InterviewQuestion, InterviewAnswer])],
  controllers: [UsersInterviewController],
  providers: [UsersInterviewService],
  exports: [UsersInterviewService],
})
export class UsersInterviewModule {}
