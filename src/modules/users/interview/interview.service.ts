import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Injectable()
export class UsersInterviewService {
  constructor(
    @InjectRepository(CandidateInterview)
    private readonly candidateInterviewRepo: Repository<CandidateInterview>,
    @InjectRepository(InterviewQuestion)
    private readonly questionRepo: Repository<InterviewQuestion>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepo: Repository<InterviewAnswer>,
  ) {}

  async listForUser(userId: string) {
    return this.candidateInterviewRepo.find({ where: { candidate_id: userId } });
  }

  async getAssignment(id: string, userId: string) {
    const ci = await this.candidateInterviewRepo.findOne({ where: { candidate_interview_id: id } });
    if (!ci) throw new NotFoundException('Candidate interview not found');
    if (ci.candidate_id !== userId) throw new ForbiddenException('Not allowed');

    const questions = await this.questionRepo.find({ where: { interview_id: ci.interview_id }, order: { created_at: 'ASC' as const } });
    return { candidateInterview: ci, questions };
  }

  async startAssignment(id: string, userId: string) {
    const ci = await this.candidateInterviewRepo.findOne({ where: { candidate_interview_id: id } });
    if (!ci) throw new NotFoundException('Candidate interview not found');
    if (ci.candidate_id !== userId) throw new ForbiddenException('Not allowed');
    ci.started_at = new Date();
    ci.status = 'in_progress';
    await this.candidateInterviewRepo.save(ci);
    return ci;
  }

  async submitAnswers(id: string, userId: string, dto: SubmitAnswersDto) {
    const ci = await this.candidateInterviewRepo.findOne({ where: { candidate_interview_id: id } });
    if (!ci) throw new NotFoundException('Candidate interview not found');
    if (ci.candidate_id !== userId) throw new ForbiddenException('Not allowed');

    // Upsert answers
    for (const it of dto.answers) {
      const existing = await this.answerRepo.findOne({ where: { candidate_interview_id: id, question_id: it.question_id } });
      if (existing) {
        existing.answer_text = it.answer_text ?? existing.answer_text;
        existing.elapsed_seconds = it.elapsed_seconds ?? existing.elapsed_seconds;
        await this.answerRepo.save(existing);
      } else {
        const newA = this.answerRepo.create({
          candidate_interview_id: id,
          question_id: it.question_id,
          answer_text: it.answer_text ?? null,
          elapsed_seconds: it.elapsed_seconds ?? null,
        } as any);
        await this.answerRepo.save(newA);
      }
    }

    ci.completed_at = new Date();
    ci.status = 'submitted';
    await this.candidateInterviewRepo.save(ci);

    return { ok: true };
  }

  async listAnswers(id: string, userId: string) {
    const ci = await this.candidateInterviewRepo.findOne({ where: { candidate_interview_id: id } });
    if (!ci) throw new NotFoundException('Candidate interview not found');
    if (ci.candidate_id !== userId) throw new ForbiddenException('Not allowed');
    return this.answerRepo.find({ where: { candidate_interview_id: id } });
  }
}
