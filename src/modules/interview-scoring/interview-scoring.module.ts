import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InterviewScoringController } from './interview-scoring.controller';
import { InterviewScoringService } from './services/interview-scoring.service';
import { GeminiAiService } from './services/gemini-ai.service';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { InterviewAiEvaluation } from 'src/database/entities/interview-ai-evaluation/interview-ai-evaluation.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CandidateInterview,
      InterviewAnswer,
      InterviewAiEvaluation,
      Interview,
      InterviewQuestion,
    ]),
  ],
  controllers: [InterviewScoringController],
  providers: [InterviewScoringService, GeminiAiService],
  exports: [InterviewScoringService],
})
export class InterviewScoringModule {}
