import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
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
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
  ) {}

  async listForUser(userId: string) {
    return this.candidateInterviewRepo.find({ where: { candidate_id: userId } });
  }

  async getInterviewPreview(interviewId: string) {
    const interview = await this.interviewRepo.findOne({ where: { interview_id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');

    const questionCount = await this.questionRepo.count({ where: { interview_id: interviewId } });

    return {
      interview_id: interview.interview_id,
      title: interview.title,
      description: interview.description,
      total_time_minutes: interview.total_time_minutes,
      deadline: interview.deadline,
      status: interview.status,
      question_count: questionCount,
    };
  }

  async getAssignment(id: string, userId: string) {
    const ci = await this.candidateInterviewRepo.findOne({ where: { candidate_interview_id: id } });
    if (!ci) throw new NotFoundException('Candidate interview not found');
    if (ci.candidate_id !== userId) throw new ForbiddenException('Not allowed');

    // Check timeout
    if (ci.deadline_at && new Date() > ci.deadline_at && ci.status !== 'submitted' && ci.status !== 'timeout') {
      ci.status = 'timeout';
      await this.candidateInterviewRepo.save(ci);
    }

    const questions = await this.questionRepo.find({ 
      where: { interview_id: ci.interview_id }, 
      order: { order_index: 'ASC' as const, created_at: 'ASC' as const } 
    });
    
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

  async selfAssign(interviewId: string, userId: string, dto: { application_id: string }) {
    const interview = await this.interviewRepo.findOne({ where: { interview_id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');
    if (!['active', 'open'].includes(interview.status)) throw new ForbiddenException('Interview is not active');

    // validate application belongs to user
    const application = await this.applicationRepo.findOne({ where: { application_id: dto.application_id }, relations: ['jobSeeker'] });
    if (!application) throw new NotFoundException('Application not found');
    if (!application.jobSeeker || application.jobSeeker.user_id !== userId) {
      throw new ForbiddenException('Application does not belong to current user');
    }

    // if interview linked to a job post, ensure application belongs to same job post
    if (interview.job_post_id && application.job_post_id !== interview.job_post_id) {
      throw new ForbiddenException('Application does not belong to this interview\'s job post');
    }

    // avoid duplicate assignment
    const exists = await this.candidateInterviewRepo.findOne({ where: { interview_id: interviewId, application_id: dto.application_id } });
    if (exists) return exists;

    // Calculate deadline_at from assigned_at + interview.deadline (in hours)
    const now = new Date();
    let deadlineAt: Date | null = null;
    if (interview.deadline) {
      const deadlineDate = new Date(interview.deadline);
      // If deadline is a future timestamp, use it directly
      if (deadlineDate > now) {
        deadlineAt = deadlineDate;
      }
    }

    const ci = this.candidateInterviewRepo.create({
      interview_id: interviewId,
      application_id: dto.application_id,
      candidate_id: userId,
      assigned_by: userId,
      assigned_at: now,
      deadline_at: deadlineAt,
      status: 'assigned',
    } as any);

    return this.candidateInterviewRepo.save(ci);
  }
}
