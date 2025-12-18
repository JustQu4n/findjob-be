import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Application } from 'src/database/entities/application/application.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { EmailService } from 'src/modules/email/email.service';
import { NotificationType } from '@/common/utils/enums/notification-type.enum';

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
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  async listForUser(userId: string) {
    const assignments = await this.candidateInterviewRepo.find({
      where: { candidate_id: userId },
      relations: ['interview', 'application', 'application.jobPost', 'application.jobPost.company'],
      order: { assigned_at: 'DESC' },
    });

    return assignments;
  }

  async getInterviewHistory(userId: string) {
    const completedInterviews = await this.candidateInterviewRepo.find({
      where: {
        candidate_id: userId,
        status: In(['submitted', 'timeout']),
      },
      relations: ['interview', 'application', 'application.jobPost', 'application.jobPost.company'],
      order: { completed_at: 'DESC' },
    });

    // Get answers with scores and feedback for each interview
    const historyWithDetails = await Promise.all(
      completedInterviews.map(async (ci) => {
        const answers = await this.answerRepo.find({
          where: { candidate_interview_id: ci.candidate_interview_id },
          relations: ['question'],
          order: { created_at: 'ASC' },
        });

        const totalScore = answers.reduce((sum, ans) => sum + (Number(ans.score) || 0), 0);
        const maxScore = answers.reduce((sum, ans) => sum + (Number(ans.question?.max_score) || 0), 0);
        const averageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        return {
          candidate_interview_id: ci.candidate_interview_id,
          interview: {
            interview_id: (ci as any).interview?.interview_id,
            title: (ci as any).interview?.title,
            description: (ci as any).interview?.description,
          },
          jobPost: (ci as any).application?.jobPost ? {
            job_post_id: (ci as any).application.jobPost.job_post_id,
            title: (ci as any).application.jobPost.title,
            company: (ci as any).application.jobPost.company,
          } : null,
          status: ci.status,
          assigned_at: ci.assigned_at,
          started_at: ci.started_at,
          completed_at: ci.completed_at,
          deadline_at: ci.deadline_at,
          total_score: totalScore,
          max_score: maxScore,
          percentage: averageScore.toFixed(2),
          result: ci.result,
          answers: answers.map(ans => ({
            question_id: ans.question_id,
            question_text: ans.question?.question_text,
            answer_text: ans.answer_text,
            score: ans.score,
            max_score: ans.question?.max_score,
            feedback: ans.feedback,
            graded_at: ans.graded_at,
            elapsed_seconds: ans.elapsed_seconds,
          })),
        };
      })
    );

    return historyWithDetails;
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
    const application = await this.applicationRepo.findOne({ 
      where: { application_id: dto.application_id }, 
      relations: ['jobSeeker', 'jobSeeker.user'] 
    });
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

    const result = await this.candidateInterviewRepo.save(ci);
    const savedCi = Array.isArray(result) ? result[0] : result;

    // Send notification and email
    try {
      const user = application.jobSeeker?.user;
      if (user) {
        await this.notificationsService.sendToUser(userId, {
          type: NotificationType.INTERVIEW_ASSIGNED,
          message: `Bạn đã chấp nhận tham gia bài interview "${interview.title}"${deadlineAt ? `. Hạn chót: ${deadlineAt.toLocaleString('vi-VN')}` : ''}`,
          metadata: {
            candidate_interview_id: savedCi.candidate_interview_id,
            interview_id: interviewId,
            deadline_at: deadlineAt,
          },
        });

        if (user.email && deadlineAt) {
          await this.emailService['mailerService'].sendMail({
            to: user.email,
            subject: `Xác nhận tham gia bài interview "${interview.title}"`,
            html: `
              <h2>Xác nhận tham gia bài Interview</h2>
              <p>Xin chào ${user.full_name || 'bạn'},</p>
              <p>Bạn đã chấp nhận tham gia bài interview:</p>
              <ul>
                <li><strong>Tên bài:</strong> ${interview.title}</li>
                <li><strong>Mô tả:</strong> ${interview.description || 'N/A'}</li>
                <li><strong>Hạn chót:</strong> ${deadlineAt.toLocaleString('vi-VN')}</li>
                <li><strong>Thời gian làm bài:</strong> ${interview.total_time_minutes} phút</li>
              </ul>
              <p>Vui lòng hoàn thành bài interview trước khi hết hạn.</p>
              <p>Chúc bạn may mắn!</p>
              <p>Trân trọng,<br/>Đội ngũ tuyển dụng</p>
            `,
          });
        }
      }
    } catch (error) {
      console.error('Failed to send interview assignment notification:', error);
    }

    return savedCi;
  }

  async sendDeadlineReminders() {
    // Find interviews that are due within 24 hours and haven't been completed
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const upcomingDeadlines = await this.candidateInterviewRepo.find({
      where: {
        status: In(['assigned', 'in_progress']),
        deadline_at: LessThan(tomorrow),
      },
      relations: ['interview', 'application', 'application.jobSeeker', 'application.jobSeeker.user'],
    });

    for (const ci of upcomingDeadlines) {
      const user = (ci as any).application?.jobSeeker?.user;
      if (!user || !ci.deadline_at) continue;

      const hoursLeft = Math.floor((ci.deadline_at.getTime() - Date.now()) / (1000 * 60 * 60));
      
      if (hoursLeft > 0 && hoursLeft <= 24) {
        // Send notification
        try {
          await this.notificationsService.sendToUser(user.user_id, {
            type: NotificationType.INTERVIEW_REMINDER,
            message: `Nhắc nhở: Bạn còn ${hoursLeft} giờ để hoàn thành bài interview "${(ci as any).interview?.title}"`,
            metadata: {
              candidate_interview_id: ci.candidate_interview_id,
              interview_id: ci.interview_id,
              deadline_at: ci.deadline_at,
            },
          });

          // Send email
          if (user.email) {
            await this.emailService['mailerService'].sendMail({
              to: user.email,
              subject: `Nhắc nhở: Hạn chót làm bài interview "${(ci as any).interview?.title}"`,
              html: `
                <h2>Nhắc nhở hoàn thành bài Interview</h2>
                <p>Xin chào ${user.full_name || 'bạn'},</p>
                <p>Bạn còn <strong>${hoursLeft} giờ</strong> để hoàn thành bài interview:</p>
                <ul>
                  <li><strong>Tên bài:</strong> ${(ci as any).interview?.title}</li>
                  <li><strong>Mô tả:</strong> ${(ci as any).interview?.description || 'N/A'}</li>
                  <li><strong>Hạn chót:</strong> ${ci.deadline_at.toLocaleString('vi-VN')}</li>
                  <li><strong>Thời gian làm bài:</strong> ${(ci as any).interview?.total_time_minutes} phút</li>
                </ul>
                <p>Vui lòng hoàn thành bài interview trước khi hết hạn.</p>
                <p>Trân trọng,<br/>Đội ngũ tuyển dụng</p>
              `,
            });
          }
        } catch (error) {
          console.error('Failed to send reminder for candidate_interview_id:', ci.candidate_interview_id, error);
        }
      }
    }

    return { sent: upcomingDeadlines.length };
  }
}
