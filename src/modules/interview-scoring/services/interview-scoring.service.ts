import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { InterviewAiEvaluation } from 'src/database/entities/interview-ai-evaluation/interview-ai-evaluation.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { GeminiAiService, InterviewInput } from './gemini-ai.service';
import { AiEvaluationResultDto } from '../dto';

@Injectable()
export class InterviewScoringService {
  private readonly logger = new Logger(InterviewScoringService.name);

  constructor(
    @InjectRepository(CandidateInterview)
    private candidateInterviewRepository: Repository<CandidateInterview>,
    @InjectRepository(InterviewAnswer)
    private interviewAnswerRepository: Repository<InterviewAnswer>,
    @InjectRepository(InterviewAiEvaluation)
    private aiEvaluationRepository: Repository<InterviewAiEvaluation>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewQuestion)
    private interviewQuestionRepository: Repository<InterviewQuestion>,
    private geminiAiService: GeminiAiService,
  ) {}

  async scoreInterview(candidateInterviewId: string): Promise<AiEvaluationResultDto> {
    this.logger.log(`Starting AI scoring for candidate interview: ${candidateInterviewId}`);

    // 1. Check if candidate interview exists and is submitted
    const candidateInterview = await this.candidateInterviewRepository.findOne({
      where: { candidate_interview_id: candidateInterviewId },
      relations: ['interview', 'interview.jobPost'],
    });

    if (!candidateInterview) {
      throw new NotFoundException('Candidate interview not found');
    }

    if (candidateInterview.status !== 'submitted') {
      throw new BadRequestException('Interview must be submitted before scoring');
    }

    // Check if already scored
    const existingEvaluation = await this.aiEvaluationRepository.findOne({
      where: { candidate_interview_id: candidateInterviewId },
    });

    if (existingEvaluation) {
      this.logger.log(`AI evaluation already exists for interview: ${candidateInterviewId}`);
      return this.mapToDto(existingEvaluation);
    }

    // 2. Get all interview questions and answers
    const answers = await this.interviewAnswerRepository.find({
      where: { candidate_interview_id: candidateInterviewId },
      relations: ['question'],
    });

    if (!answers || answers.length === 0) {
      throw new BadRequestException('No answers found for this interview');
    }

    // 3. Prepare input for AI (without PII - following anti-bias principles)
    const jobTitle = candidateInterview.interview?.jobPost?.title || 
                     candidateInterview.interview?.title || 
                     'Position';

    const interviewInput: InterviewInput = {
      jobTitle,
      questions: answers.map(answer => ({
        question: answer.question.question_text,
        answer: answer.answer_text || '',
      })),
    };

    this.logger.debug(`Prepared interview input for AI: ${JSON.stringify({ jobTitle, questionCount: answers.length })}`);

    // 4. Call AI service
    const aiResult = await this.geminiAiService.scoreInterview(interviewInput);

    this.logger.log(`AI scoring completed. Total score: ${aiResult.totalScore}, Recommendation: ${aiResult.finalRecommendation}`);

    // 5. Save evaluation to database
    const evaluation = this.aiEvaluationRepository.create({
      candidate_interview_id: candidateInterviewId,
      total_score: aiResult.totalScore,
      recommendation: aiResult.finalRecommendation,
      criteria: aiResult.criteria,
      ai_summary: aiResult.summary,
      model_used: 'gemini-2.5-flash',
      detailed_feedback: aiResult.detailedFeedback,
    });

    const savedEvaluation = await this.aiEvaluationRepository.save(evaluation);

    // 6. Update candidate interview with total score
    await this.candidateInterviewRepository.update(
      { candidate_interview_id: candidateInterviewId },
      { total_score: aiResult.totalScore },
    );

    this.logger.log(`AI evaluation saved successfully for interview: ${candidateInterviewId}`);

    return this.mapToDto(savedEvaluation);
  }

  async getEvaluation(candidateInterviewId: string): Promise<AiEvaluationResultDto> {
    const evaluation = await this.aiEvaluationRepository.findOne({
      where: { candidate_interview_id: candidateInterviewId },
    });

    if (!evaluation) {
      throw new NotFoundException('AI evaluation not found for this interview');
    }

    return this.mapToDto(evaluation);
  }

  async getAllEvaluationsByEmployer(employerId: string): Promise<AiEvaluationResultDto[]> {
    const evaluations = await this.aiEvaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.candidateInterview', 'ci')
      .innerJoin('ci.interview', 'i')
      .where('i.employer_id = :employerId', { employerId })
      .getMany();

    return evaluations.map(evaluation => this.mapToDto(evaluation));
  }

  private mapToDto(evaluation: InterviewAiEvaluation): AiEvaluationResultDto {
    return {
      totalScore: Number(evaluation.total_score),
      recommendation: evaluation.recommendation,
      criteria: evaluation.criteria,
      summary: evaluation.ai_summary,
      detailedFeedback: evaluation.detailed_feedback,
      modelUsed: evaluation.model_used,
      createdAt: evaluation.created_at,
    };
  }
}
