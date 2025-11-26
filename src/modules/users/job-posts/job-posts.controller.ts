import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JobPostsService } from './job-posts.service';
import { Public } from '@/common/decorators/public.decorator';
import { PaginationDto } from '@/common/dto';
import { SearchJobPostDto, SaveJobDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('jobseeker')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Public()
  @Get('job-posts')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.jobPostsService.findAll(paginationDto);
  }

  @Public()
  @Get('job-posts/search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() searchDto: SearchJobPostDto) {
    return this.jobPostsService.search(searchDto);
  }

  @Public()
  @Get('job-posts/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.jobPostsService.findOne(id);
  }

  // Saved Jobs endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('saved/save-job/:jobId')
  @HttpCode(HttpStatus.CREATED)
  async saveJob(
    @GetUser('user_id') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobPostsService.saveJob(userId, jobId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('saved/unsave-job/:jobId')
  @HttpCode(HttpStatus.OK)
  async unsaveJob(
    @GetUser('user_id') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobPostsService.unsaveJob(userId, jobId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('saved/jobs')
  @HttpCode(HttpStatus.OK)
  async getSavedJobs(
    @GetUser('user_id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.jobPostsService.getSavedJobs(userId, paginationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('saved/check/:jobId')
  @HttpCode(HttpStatus.OK)
  async checkJobSaved(
    @GetUser('user_id') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobPostsService.checkJobSaved(userId, jobId);
  }
}
