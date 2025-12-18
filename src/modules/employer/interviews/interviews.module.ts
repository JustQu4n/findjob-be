import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { Application } from 'src/database/entities/application/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewQuestion, CandidateInterview, InterviewAnswer, Interview, Employer, Application])],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
