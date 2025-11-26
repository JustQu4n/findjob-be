import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JobSeekerService } from './job-seeker.service';

@Controller('employer/job-seeker')
export class JobSeekerController {
  constructor(private readonly jobSeekerService: JobSeekerService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Param('id') id: string) {
    return this.jobSeekerService.findProfileByUserId(id);
  }
}
