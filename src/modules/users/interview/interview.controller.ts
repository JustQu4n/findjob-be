import {
  Controller,
  Get,
  Param,
  Post as HttpPost,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersInterviewService } from './interview.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Controller('jobseeker/interviews')
export class UsersInterviewController {
  constructor(private readonly service: UsersInterviewService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@GetUser('user_id') userId: string) {
    return this.service.listForUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string, @GetUser('user_id') userId: string) {
    return this.service.getAssignment(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @HttpPost(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string, @GetUser('user_id') userId: string) {
    return this.service.startAssignment(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @HttpPost(':id/submit')
  @HttpCode(HttpStatus.CREATED)
  async submit(@Param('id') id: string, @GetUser('user_id') userId: string, @Body() dto: SubmitAnswersDto) {
    return this.service.submitAnswers(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get(':id/answers')
  @HttpCode(HttpStatus.OK)
  async listAnswers(@Param('id') id: string, @GetUser('user_id') userId: string) {
    return this.service.listAnswers(id, userId);
  }
}
