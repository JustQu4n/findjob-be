import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobPostsService } from './job-posts.service';
import { Public } from '@/common/decorators/public.decorator';
import { PaginationDto } from '@/common/dto';
import { SearchJobPostDto } from './dto';

@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.jobPostsService.findAll(paginationDto);
  }

  @Public()
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() searchDto: SearchJobPostDto) {
    return this.jobPostsService.search(searchDto);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.jobPostsService.findOne(id);
  }
}
