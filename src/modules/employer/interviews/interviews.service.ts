import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewQuestion } from 'src/database/entities/interview-question/interview-question.entity';
import { CandidateInterview } from 'src/database/entities/candidate-interview/candidate-interview.entity';
import { InterviewAnswer } from 'src/database/entities/interview-answer/interview-answer.entity';
import { Interview } from 'src/database/entities/interview/interview.entity';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';
import { CandidateBehaviorLog } from 'src/database/entities/candidate-behavior-log/candidate-behavior-log.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/email/email.service';
import { AiAssistantService } from '@/modules/ai-assistant/ai-assistant.service';
import { ClassifyCriteriaResponseDto } from './dto/classify-criteria-response.dto';
import { calculateRiskScore, getBehaviorSummary, shouldFlagCandidate } from '@/common/utils/behavior-risk.util';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InterviewsService {
  private openai: OpenAI;

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
    @InjectRepository(CandidateBehaviorLog)
    private readonly behaviorLogRepo: Repository<CandidateBehaviorLog>,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly aiAssistantService: AiAssistantService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }
  
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
    return this.questionRepo.find({ where: { interview_id: interviewId }, order: { order_index: 'ASC' as const, created_at: 'ASC' as const } });
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
      this.questionRepo.find({ where: { interview_id: interviewId }, order: { order_index: 'ASC' as const, created_at: 'ASC' as const } }),
      this.candidateInterviewRepo.find({ where: { interview_id: interviewId }, order: { assigned_at: 'DESC' as const } }),
    ]);

    return { interview: iv, questions, assignments };
  }

  async listInterviews(userId: string) {
    const emp = await this.resolveEmployerUser(userId);
    return this.interviewRepo.find({ 
      where: { employer_id: emp.employer_id }, 
      relations: ['jobPost'],
      order: { created_at: 'DESC' as const } 
    });
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

  /**
   * Classify question criteria using AI
   */
  async classifyQuestionCriteria(questionId: string): Promise<ClassifyCriteriaResponseDto> {
    // Get the question
    const question = await this.getQuestion(questionId);

    // Define the available criteria
    const availableCriteria = [
      'Clarity of Expression',
      'Logical Thinking',
      'Learning Attitude & Growth Mindset',
      'Basic IT Awareness',
      'Professional Attitude & Honesty',
    ];

    // Detect language of the question (simple check for Vietnamese characters)
    const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(question.question_text);

    // Create prompt for AI based on language
    const prompt = isVietnamese
      ? `Bạn là một chuyên gia tuyển dụng. Phân tích câu hỏi phỏng vấn dưới đây và xác định tiêu chí nào sẽ được đánh giá dựa trên CÂU TRẢ LỜI của ứng viên.

Câu hỏi: "${question.question_text}"

**CÁC TIÊU CHÍ VÀ DẤU HIỆU NHẬN BIẾT:**

1. **Clarity of Expression** (Khả năng diễn đạt rõ ràng)
   Chọn tiêu chí này NẾU câu trả lời yêu cầu:
   - Giải thích, mô tả, trình bày ý tưởng/kế hoạch/quy trình
   - Sử dụng từ ngữ: "giải thích", "mô tả", "nói rõ", "trình bày", "bạn sẽ làm như thế nào"
   - Cần cấu trúc câu logic, rõ ràng, dễ hiểu
   - Đòi hỏi kỹ năng tổ chức thông tin và diễn đạt mạch lạc

2. **Logical Thinking** (Tư duy logic)
   Chọn tiêu chí này NẾU câu trả lời yêu cầu:
   - Phân tích vấn đề, tìm nguyên nhân - kết quả
   - Sắp xếp thứ tự ưu tiên, các bước thực hiện
   - Đưa ra lý do, luận điểm có căn cứ
   - Giải quyết tình huống, đưa ra quyết định có căn cứ logic
   - Từ khóa: "tại sao", "như thế nào", "phân tích", "giải quyết", "quyết định", "ưu tiên"

3. **Learning Attitude & Growth Mindset** (Thái độ học hỏi và phát triển)
   Chọn tiêu chí này NẾU câu hỏi liên quan đến:
   - Phản ứng khi gặp khó khăn/thất bại/sai lầm
   - Tiếp nhận phản hồi/góp ý/chỉ trích
   - Học hỏi kỹ năng/kiến thức mới
   - Thích ứng với thay đổi
   - Từ khóa: "học", "phát triển", "khó khăn", "thất bại", "sai lầm", "góp ý", "feedback", "thay đổi", "cải thiện"

4. **Basic IT Awareness** (Hiểu biết cơ bản về IT)
   Chọn tiêu chí này NẾU câu hỏi đề cập đến:
   - Công nghệ, phần mềm, ứng dụng, công cụ số
   - Internet, email, bảo mật thông tin
   - Kỹ năng sử dụng máy tính, thiết bị điện tử
   - Xu hướng công nghệ, chuyển đổi số
   - Từ khóa: "công nghệ", "phần mềm", "app", "website", "digital", "online", "tool", "AI", "automation"

5. **Professional Attitude & Honesty** (Thái độ chuyên nghiệp và trung thực)
   Chọn tiêu chí này NẾU câu hỏi liên quan đến:
   - Đạo đức nghề nghiệp, trách nhiệm, cam kết
   - Xử lý xung đột lợi ích
   - Tính trung thực, minh bạch
   - Cách ứng xử với đồng nghiệp, cấp trên, khách hàng
   - Từ khóa: "trung thực", "đạo đức", "trách nhiệm", "cam kết", "xung đột", "bí mật", "quy định", "nguyên tắc"

**HƯỚNG DẪN:**
- Một câu hỏi có thể đánh giá từ 1-5 tiêu chí
- Chọn tiêu chí dựa trên những gì câu trả lời SẼ TIẾT LỘ, không phải nội dung câu hỏi
- Trả về CHỈ danh sách tiêu chí bằng tiếng Anh, mỗi tiêu chí một dòng
- Không giải thích, không đánh số, chỉ tên tiêu chí

Ví dụ output:
Clarity of Expression
Logical Thinking`
      : `You are a recruitment expert. Analyze the interview question below and identify which criteria will be evaluated based on the candidate's ANSWER.

Question: "${question.question_text}"

**CRITERIA AND DETECTION SIGNALS:**

1. **Clarity of Expression**
   Select this IF the answer requires:
   - Explaining, describing, presenting ideas/plans/processes
   - Keywords: "explain", "describe", "tell me about", "how would you", "walk me through"
   - Needs logical structure, clear and understandable language
   - Requires information organization and coherent expression skills

2. **Logical Thinking**
   Select this IF the answer requires:
   - Problem analysis, identifying cause-effect relationships
   - Prioritization, step-by-step planning
   - Providing reasoned arguments with evidence
   - Solving situations, making decisions based on logic
   - Keywords: "why", "how", "analyze", "solve", "decide", "prioritize", "approach"

3. **Learning Attitude & Growth Mindset**
   Select this IF the question relates to:
   - Response to challenges/failures/mistakes
   - Receiving feedback/criticism
   - Learning new skills/knowledge
   - Adapting to change
   - Keywords: "learn", "develop", "challenge", "mistake", "feedback", "change", "improve", "grow"

4. **Basic IT Awareness**
   Select this IF the question mentions:
   - Technology, software, applications, digital tools
   - Internet, email, information security
   - Computer/device usage skills
   - Technology trends, digital transformation
   - Keywords: "technology", "software", "app", "website", "digital", "online", "tool", "AI", "automation"

5. **Professional Attitude & Honesty**
   Select this IF the question relates to:
   - Professional ethics, responsibility, commitment
   - Handling conflicts of interest
   - Honesty, transparency
   - Behavior with colleagues, superiors, clients
   - Keywords: "honest", "ethics", "responsibility", "commitment", "conflict", "confidential", "policy", "principle"

**INSTRUCTIONS:**
- One question can evaluate 1-5 criteria
- Select criteria based on what the answer WILL REVEAL, not the question content
- Return ONLY a list of criteria in English, one per line
- No explanations, no numbers, just criterion names

Example output:
Clarity of Expression
Logical Thinking`;

    try {
      // Call OpenAI service
      if (!this.openai) {
        throw new BadRequestException('OpenAI is not configured. Please set OPENAI_API_KEY in environment variables.');
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: isVietnamese 
              ? 'Bạn là chuyên gia tuyển dụng. Trả về CHỈ danh sách tiêu chí, mỗi tiêu chí một dòng, không có số thứ tự, không giải thích.'
              : 'You are a recruitment expert. Return ONLY a list of criteria, one per line, no numbers, no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const responseText = completion.choices[0].message.content?.trim() || '';
      const lines = responseText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Match criteria from response
      const matchedCriteria: string[] = [];
      for (const line of lines) {
        const matched = availableCriteria.find(c => 
          line.toLowerCase().includes(c.toLowerCase()) || 
          c.toLowerCase().includes(line.toLowerCase())
        );
        if (matched && !matchedCriteria.includes(matched)) {
          matchedCriteria.push(matched);
        }
      }

      // If no criteria matched, try to parse any valid criteria names
      if (matchedCriteria.length === 0) {
        for (const criterion of availableCriteria) {
          if (responseText.toLowerCase().includes(criterion.toLowerCase())) {
            matchedCriteria.push(criterion);
          }
        }
      }

      // Update question with criteria
      question.criteria = matchedCriteria.length > 0 ? matchedCriteria : null;
      await this.questionRepo.save(question);

      return {
        question_id: question.question_id,
        question_text: question.question_text,
        criteria: matchedCriteria,
        message: matchedCriteria.length > 0 
          ? (isVietnamese ? 'Phân loại thành công' : 'Classification successful')
          : (isVietnamese ? 'Không thể xác định tiêu chí phù hợp' : 'Unable to determine appropriate criteria'),
      };
    } catch (error) {
      const errorMessage = isVietnamese 
        ? `Lỗi khi phân loại câu hỏi: ${error.message}`
        : `Error classifying question: ${error.message}`;
      throw new BadRequestException(errorMessage);
    }
  }

  // Send congratulations email to candidate who passed the interview
  async sendCongratulationsEmail(userId: string, candidateInterviewId: string) {
    // Verify employer permissions
    const emp = await this.resolveEmployerUser(userId);
    
    // Get candidate interview with relations
    const candidateInterview = await this.candidateInterviewRepo.findOne({
      where: { candidate_interview_id: candidateInterviewId },
      relations: ['candidate', 'interview'],
    });

    if (!candidateInterview) {
      throw new NotFoundException('Candidate interview not found');
    }

    // Verify the interview belongs to the employer
    if (candidateInterview.interview.employer_id !== emp.employer_id) {
      throw new ForbiddenException('Not allowed to send email for this interview');
    }

    // Check if candidate passed (result should be 'passed' or similar)
    if (candidateInterview.result !== 'passed') {
      throw new BadRequestException('Candidate has not passed this interview');
    }

    const candidate = candidateInterview.candidate;
    if (!candidate || !candidate.email) {
      throw new NotFoundException('Candidate email not found');
    }

    const interview = candidateInterview.interview;
    
    // Load employer with company to get company name
    const employer = await this.employerRepo.findOne({
      where: { employer_id: interview.employer_id! },
      relations: ['company'],
    });
    
    const companyName = employer?.company?.name || 'Our Company';

    // Send congratulations email
    await this.emailService.sendInterviewCongratulationsEmail(
      candidate.email,
      candidate.full_name || 'Candidate',
      interview.title,
      companyName,
      candidateInterview.total_score ? Number(candidateInterview.total_score) : undefined,
    );

    // Send notification as well
    await this.notificationsService.sendToUser(candidate.user_id, {
      type: 'interview_passed',
      message: `Congratulations! You passed the interview "${interview.title}" from ${companyName}`,
      metadata: {
        candidate_interview_id: candidateInterviewId,
        interview_id: interview.interview_id,
        company_name: companyName,
      },
    });

    return { 
      success: true, 
      message: 'Congratulations email sent successfully',
      sentTo: candidate.email,
    };
  }

  // Get behavior logs for a specific candidate interview
  async getBehaviorLogs(userId: string, candidateInterviewId: string) {
    const emp = await this.resolveEmployerUser(userId);

    // Get candidate interview with relations
    const candidateInterview = await this.candidateInterviewRepo.findOne({
      where: { candidate_interview_id: candidateInterviewId },
      relations: ['candidate', 'interview'],
    });

    if (!candidateInterview) {
      throw new NotFoundException('Candidate interview not found');
    }

    // Verify the interview belongs to the employer
    if (candidateInterview.interview.employer_id !== emp.employer_id) {
      throw new ForbiddenException('Not allowed to view behavior logs for this interview');
    }

    // Get behavior logs with question information
    const logs = await this.behaviorLogRepo.find({
      where: { candidate_interview_id: candidateInterviewId },
      relations: ['question'],
      order: { timestamp: 'ASC' },
    });

    // Calculate risk metrics
    const behaviorSummary = getBehaviorSummary(logs);
    const riskScore = calculateRiskScore(logs);

    return {
      success: true,
      candidate_interview_id: candidateInterviewId,
      candidate_name: candidateInterview.candidate.full_name,
      candidate_email: candidateInterview.candidate.email,
      total_logs: logs.length,
      behavior_summary: behaviorSummary,
      risk_score: riskScore,
      logs: logs.map(log => ({
        behavior_log_id: log.behavior_log_id,
        question_id: log.question_id,
        question_text: log.question?.question_text || null,
        behavior_type: log.behavior_type,
        timestamp: log.timestamp,
        description: log.description,
        metadata: log.metadata,
      })),
    };
  }

  // Get behavior summary for all candidates in an interview
  async getBehaviorSummary(userId: string, interviewId: string) {
    const emp = await this.resolveEmployerUser(userId);
    const interview = await this.findInterview(interviewId);

    // Verify the interview belongs to the employer
    if (interview.employer_id !== emp.employer_id) {
      throw new ForbiddenException('Not allowed to view behavior summary for this interview');
    }

    // Get all candidate interviews for this interview
    const candidateInterviews = await this.candidateInterviewRepo.find({
      where: { interview_id: interviewId },
      relations: ['candidate'],
    });

    // Get all behavior logs for this interview
    const allLogs = await this.behaviorLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.candidateInterview', 'ci')
      .where('ci.interview_id = :interviewId', { interviewId })
      .getMany();

    // Calculate aggregated stats
    const aggregatedStats = getBehaviorSummary(allLogs);

    // Calculate stats for each candidate
    const candidatesData = await Promise.all(
      candidateInterviews.map(async (ci) => {
        const candidateLogs = allLogs.filter(
          log => log.candidate_interview_id === ci.candidate_interview_id
        );
        const summary = getBehaviorSummary(candidateLogs);
        const riskScore = calculateRiskScore(candidateLogs);
        const flagged = shouldFlagCandidate(summary, riskScore);

        return {
          candidate_interview_id: ci.candidate_interview_id,
          candidate_name: ci.candidate.full_name,
          total_score: ci.total_score,
          behavior_count: candidateLogs.length,
          risk_score: riskScore,
          flagged,
        };
      })
    );

    const candidatesWithSuspiciousBehavior = candidatesData.filter(c => c.flagged).length;

    return {
      success: true,
      interview_id: interviewId,
      interview_title: interview.title,
      total_candidates: candidateInterviews.length,
      candidates_with_suspicious_behavior: candidatesWithSuspiciousBehavior,
      aggregated_stats: aggregatedStats,
      candidates: candidatesData,
    };
  }
}