import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { CreateJobPostDto, UpdateJobPostDto, QueryJobPostDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('employer/job-posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employer')
export class JobPostController {
  constructor(private readonly jobPostService: JobPostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('user_id') userId: string,
    @Body() createJobPostDto: CreateJobPostDto,
  ) {
    return this.jobPostService.create(userId, createJobPostDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @GetUser('user_id') userId: string,
    @Query() query: QueryJobPostDto,
  ) {
    return this.jobPostService.findAll(userId, query);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics(@GetUser('user_id') userId: string) {
    return this.jobPostService.getStatistics(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @GetUser('user_id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobPostService.findOne(userId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @GetUser('user_id') userId: string,
    @Param('id') id: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
  ) {
    return this.jobPostService.update(userId, id, updateJobPostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @GetUser('user_id') userId: string,
    @Param('id') id: string,
  ) {
    return this.jobPostService.remove(userId, id);
  }
}
