import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(InterviewQuestion)
    private readonly questionRepo: Repository<InterviewQuestion>,
    @InjectRepository(CandidateInterview)
    private readonly candidateInterviewRepo: Repository<CandidateInterview>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepo: Repository<InterviewAnswer>,
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Employer)
    private readonly employerRepo: Repository<Employer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}
  
  // Create interview session
  async createInterview(employerId: string, dto: import('./dto/create-interview.dto').CreateInterviewDto) {
    // employerId is the authenticated user's user_id; resolve to employer.employer_id
    const emp = await this.employerRepo.findOne({ where: { user_id: employerId } });
    if (!emp) throw new NotFoundException('Employer profile not found for current user');

    const iv = this.interviewRepo.create({
      job_post_id: dto.job_post_id || null,
      employer_id: emp.employer_id,
      title: dto.title,
      description: dto.description || null,
      status: dto.status || 'draft',
      total_time_minutes: dto.total_time_minutes || null,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    } as any);

    return this.interviewRepo.save(iv);
  }

  async findInterview(interviewId: string) {
    const iv = await this.interviewRepo.findOne({ where: { interview_id: interviewId } });
    if (!iv) throw new NotFoundException('Interview not found');
    return iv;
  }

  private async resolveEmployerUser(userId: string) {
    const emp = await this.employerRepo.findOne({ where: { user_id: userId } });
    if (!emp) throw new NotFoundException('Employer profile not found for current user');
    return emp;
  }

  async updateInterview(userId: string, interviewId: string, dto: import('./dto/update-interview.dto').UpdateInterviewDto) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');
    if (dto.title !== undefined) iv.title = dto.title;
    if (dto.description !== undefined) iv.description = dto.description;
    if (dto.status !== undefined) iv.status = dto.status;
    return this.interviewRepo.save(iv);
  }

  async deleteInterview(userId: string, interviewId: string) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');
    return this.interviewRepo.delete({ interview_id: interviewId });
  }
  // Questions CRUD
  async createQuestion(interviewId: string, dto: CreateQuestionDto) {
    const q = this.questionRepo.create({ ...dto, interview_id: interviewId });
    return this.questionRepo.save(q);
  }

  async listQuestions(interviewId: string) {
    return this.questionRepo.find({ where: { interview_id: interviewId }, order: { created_at: 'ASC' as const } });
  }

  async getQuestion(questionId: string) {
    const q = await this.questionRepo.findOne({ where: { question_id: questionId } });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const q = await this.getQuestion(questionId);
    Object.assign(q, dto);
    return this.questionRepo.save(q);
  }

  async deleteQuestion(questionId: string) {
    const q = await this.getQuestion(questionId);
    return this.questionRepo.delete(q.question_id);
  }

  // Candidate interviews / answers
  async listCandidateInterviews(interviewId: string) {
    const cis = await this.candidateInterviewRepo.find({
      where: { interview_id: interviewId },
      relations: ['candidate'],
      order: { assigned_at: 'DESC' as const },
    });

    return cis.map(ci => ({
      candidate_interview_id: ci.candidate_interview_id,
      interview_id: ci.interview_id,
      application_id: ci.application_id,
      candidate_id: ci.candidate_id,
      assigned_by: ci.assigned_by,
      assigned_at: ci.assigned_at,
      started_at: ci.started_at,
      completed_at: ci.completed_at,
      status: ci.status,
      total_score: ci.total_score,
      result: ci.result,
      metadata: ci.metadata,
      created_at: ci.created_at,
      updated_at: ci.updated_at,
      candidate: ci.candidate ? {
        user_id: ci.candidate.user_id,
        full_name: ci.candidate.full_name,
        email: ci.candidate.email,
        phone: ci.candidate.phone,
        avatar_url: ci.candidate.avatar_url,
      } : null,
    }));
  }

  async listAnswers(candidateInterviewId: string) {
    const answers = await this.answerRepo
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.question', 'question')
      .leftJoinAndSelect('answer.candidateInterview', 'ci')
      .leftJoinAndSelect('ci.candidate', 'candidate')
      .where('answer.candidate_interview_id = :candidateInterviewId', { candidateInterviewId })
      .getMany();
 return answers.map(answer => ({
      interview_answer_id: answer.interview_answer_id,
      candidate_interview_id: answer.candidate_interview_id,
      question_id: answer.question_id,
      question: answer.question?.question_text || null,
      answer_text: answer.answer_text,
      elapsed_seconds: answer.elapsed_seconds,
      score: answer.score,
      graded_by: answer.graded_by,
      graded_at: answer.graded_at,
      feedback: answer.feedback,
      created_at: answer.created_at,
      updated_at: answer.updated_at,
      candidate: answer.candidateInterview?.candidate ? {
        user_id: answer.candidateInterview.candidate.user_id,
        full_name: answer.candidateInterview.candidate.full_name,
        email: answer.candidateInterview.candidate.email,
        avatar_url: answer.candidateInterview.candidate.avatar_url,
      } : null,
    }));
  }
  async getAnswer(answerId: string) {
    const a = await this.answerRepo.findOne({ where: { interview_answer_id: answerId } });
    if (!a) throw new NotFoundException('Answer not found');
    return a;
  }

  async gradeAnswer(answerId: string, graderId: string, dto: GradeAnswerDto) {
    const a = await this.getAnswer(answerId);
    if (dto.score !== undefined) a.score = dto.score as any;
    if (dto.feedback !== undefined) a.feedback = dto.feedback as any;
    a.graded_by = graderId;
    a.graded_at = new Date();
    await this.answerRepo.save(a);

    // Optionally update candidate_interviews.total_score (simple sum)
    const answers = await this.answerRepo.find({ where: { candidate_interview_id: a.candidate_interview_id } });
    const total = answers.reduce((s, it) => s + (Number(it.score) || 0), 0);
    await this.candidateInterviewRepo.update(a.candidate_interview_id, { total_score: total });

    return a;
  }

  async getInterviewDetails(userId: string, interviewId: string) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');

    const [questions, assignments] = await Promise.all([
      this.questionRepo.find({ where: { interview_id: interviewId }, order: { created_at: 'ASC' as const } }),
      this.candidateInterviewRepo.find({ where: { interview_id: interviewId }, order: { assigned_at: 'DESC' as const } }),
    ]);

    return { interview: iv, questions, assignments };
  }

  async listInterviews(userId: string) {
    const emp = await this.resolveEmployerUser(userId);
    return this.interviewRepo.find({ where: { employer_id: emp.employer_id }, order: { created_at: 'DESC' as const } });
  }

  async attachInterviewToJobPost(userId: string, interviewId: string, jobPostId: string) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');
    
    iv.job_post_id = jobPostId;
    await this.interviewRepo.save(iv);
    return { message: 'Interview attached to job post successfully', interview: iv };
  }

  async detachInterviewFromJobPost(userId: string, interviewId: string) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');
    
    iv.job_post_id = null;
    await this.interviewRepo.save(iv);
    return { message: 'Interview detached from job post successfully', interview: iv };
  }
  async getInterviewStatistics(userId: string, interviewId: string) {
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');

    const assignments = await this.candidateInterviewRepo.find({ 
      where: { interview_id: interviewId },
      relations: ['candidate'],
    });

    const stats = {
      total: assignments.length,
      assigned: assignments.filter(a => a.status === 'assigned').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      timeout: assignments.filter(a => a.status === 'timeout').length,
      average_score: 0,
      candidates: assignments.map(a => ({
        candidate_interview_id: a.candidate_interview_id,
        candidate_name: a.candidate?.full_name || 'Unknown',
        candidate_email: a.candidate?.email || 'Unknown',
        candidate_avatar_url: a.candidate?.avatar_url || null,
        status: a.status,
        total_score: a.total_score,
        assigned_at: a.assigned_at,
        started_at: a.started_at,
        completed_at: a.completed_at,
      })),
    };

    const submittedScores = assignments.filter(a => a.status === 'submitted' && a.total_score != null).map(a => Number(a.total_score));
    if (submittedScores.length > 0) {
      stats.average_score = submittedScores.reduce((sum, s) => sum + s, 0) / submittedScores.length;
    }

    return stats;
  }

  async inviteCandidateToInterview(userId: string, interviewId: string, dto: InviteCandidateDto) {
    // Verify employer owns this interview
    const iv = await this.findInterview(interviewId);
    const emp = await this.resolveEmployerUser(userId);
    if (iv.employer_id !== emp.employer_id) throw new ForbiddenException('Not allowed');

    // Find user by email
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
    }

    // Check if already invited or applied
    const existing = await this.candidateInterviewRepo.findOne({
      where: { interview_id: interviewId, candidate_id: user.user_id },
    });
    if (existing) {
      throw new BadRequestException('User is already invited or has applied to this interview');
    }

    // Calculate deadline
    let deadlineAt: Date | null = null;
    if (iv.deadline) {
      deadlineAt = new Date();
      deadlineAt.setDate(deadlineAt.getDate() + Math.floor(iv.deadline.getTime() / (1000 * 60 * 60 * 24)));
    }

    // Create candidate interview record
    const candidateInterview = this.candidateInterviewRepo.create({
      interview_id: interviewId,
      application_id: null, // No application, direct invitation
      candidate_id: user.user_id,
      invitation_email: dto.email,
      assigned_by: userId,
      assigned_at: new Date(),
      deadline_at: deadlineAt,
      status: 'assigned',
      result: 'pending',
    } as any);

    const savedResult = await this.candidateInterviewRepo.save(candidateInterview);
    const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    // Send notification
    try {
      await this.notificationsService.sendToUser(user.user_id, {
        type: 'interview_invitation',
        message: `You have been invited to take the interview: ${iv.title}`,
        metadata: {
          interview_id: interviewId,
          interview_title: iv.title,
          candidate_interview_id: saved.candidate_interview_id,
          deadline_at: deadlineAt,
          custom_message: dto.message,
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Send email
    try {
      await this.emailService.sendInterviewInvitationEmail(
        user.email,
        user.full_name,
        iv.title,
        iv.description || '',
        saved.candidate_interview_id,
        deadlineAt,
        dto.message,
      );
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return {
      message: 'Candidate invited successfully',
      candidateInterview: {
        candidate_interview_id: saved.candidate_interview_id,
        interview_id: saved.interview_id,
        candidate_id: saved.candidate_id,
        invitation_email: saved.invitation_email,
        assigned_at: saved.assigned_at,
        deadline_at: saved.deadline_at,
        status: saved.status,
      },
      candidate: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    };
  }
}