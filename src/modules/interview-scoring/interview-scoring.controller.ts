import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewScoringService } from './services/interview-scoring.service';
import { ScoreInterviewDto, AiEvaluationResultDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Interview Scoring')
@Controller('interview-scoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InterviewScoringController {
  constructor(private readonly interviewScoringService: InterviewScoringService) {}

  @Post('score')
  @Roles('employer', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger AI scoring for a candidate interview' })
  @ApiResponse({
    status: 200,
    description: 'Interview scored successfully',
    type: AiEvaluationResultDto,
  })
  @ApiResponse({ status: 404, description: 'Candidate interview not found' })
  @ApiResponse({ status: 400, description: 'Interview not submitted or no answers found' })
  async scoreInterview(@Body() dto: ScoreInterviewDto): Promise<AiEvaluationResultDto> {
    return await this.interviewScoringService.scoreInterview(dto.candidateInterviewId);
  }

  @Get('evaluation/:candidateInterviewId')
  @Roles('employer', 'admin')
  @ApiOperation({ summary: 'Get AI evaluation for a candidate interview' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation retrieved successfully',
    type: AiEvaluationResultDto,
  })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  async getEvaluation(
    @Param('candidateInterviewId') candidateInterviewId: string,
  ): Promise<AiEvaluationResultDto> {
    return await this.interviewScoringService.getEvaluation(candidateInterviewId);
  }

  @Get('employer/evaluations')
  @Roles('employer', 'admin')
  @ApiOperation({ summary: 'Get all AI evaluations for employer' })
  @ApiResponse({
    status: 200,
    description: 'Evaluations retrieved successfully',
    type: [AiEvaluationResultDto],
  })
  async getEmployerEvaluations(@GetUser() user: any): Promise<AiEvaluationResultDto[]> {
    return await this.interviewScoringService.getAllEvaluationsByEmployer(user.user_id);
  }
}
