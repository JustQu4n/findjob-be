import {
  Controller,
  Post as HttpPost,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Controller('employer/interviews')
export class InterviewsController {
  constructor(private readonly service: InterviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get()
  @HttpCode(HttpStatus.OK)
  async listInterviews(@GetUser('user_id') userId: string) {
    return this.service.listInterviews(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId')
  @HttpCode(HttpStatus.OK)
  async getInterview(@GetUser('user_id') userId: string, @Param('interviewId') interviewId: string) {
    return this.service.getInterviewDetails(userId, interviewId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  async createInterview(@GetUser('user_id') userId: string, @Body() dto: CreateInterviewDto) {
    return this.service.createInterview(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Patch(':interviewId')
  @HttpCode(HttpStatus.OK)
  async updateInterview(@GetUser('user_id') userId: string, @Param('interviewId') interviewId: string, @Body() dto: UpdateInterviewDto) {
    return this.service.updateInterview(userId, interviewId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Delete(':interviewId')
  @HttpCode(HttpStatus.OK)
  async deleteInterview(@GetUser('user_id') userId: string, @Param('interviewId') interviewId: string) {
    return this.service.deleteInterview(userId, interviewId);
  }

  // Questions CRUD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @HttpPost(':interviewId/questions')
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Param('interviewId') interviewId: string, @Body() dto: CreateQuestionDto) {
    return this.service.createQuestion(interviewId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId/questions')
  @HttpCode(HttpStatus.OK)
  async listQuestions(@Param('interviewId') interviewId: string) {
    return this.service.listQuestions(interviewId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  async getQuestion(@Param('questionId') questionId: string) {
    return this.service.getQuestion(questionId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Patch(':interviewId/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  async updateQuestion(@Param('questionId') questionId: string, @Body() dto: UpdateQuestionDto) {
    return this.service.updateQuestion(questionId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Delete(':interviewId/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  async deleteQuestion(@Param('questionId') questionId: string) {
    return this.service.deleteQuestion(questionId);
  }

  // Candidate interviews / answers
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId/candidates')
  @HttpCode(HttpStatus.OK)
  async listCandidateInterviews(@Param('interviewId') interviewId: string) {
    return this.service.listCandidateInterviews(interviewId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId/candidates/:candidateInterviewId/answers')
  @HttpCode(HttpStatus.OK)
  async listAnswers(@Param('candidateInterviewId') candidateInterviewId: string) {
    return this.service.listAnswers(candidateInterviewId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':interviewId/candidates/:candidateInterviewId/answers/:answerId')
  @HttpCode(HttpStatus.OK)
  async getAnswer(@Param('answerId') answerId: string) {
    return this.service.getAnswer(answerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Patch(':interviewId/candidates/:candidateInterviewId/answers/:answerId/grade')
  @HttpCode(HttpStatus.OK)
  async gradeAnswer(@GetUser('user_id') userId: string, @Param('answerId') answerId: string, @Body() dto: GradeAnswerDto) {
    return this.service.gradeAnswer(answerId, userId, dto);
  }
}
