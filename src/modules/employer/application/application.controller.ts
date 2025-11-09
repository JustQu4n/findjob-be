import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import {
  QueryApplicationsDto,
  UpdateApplicationStatusDto,
  BatchUpdateApplicationsDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('employer/application')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employer')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('job-posts/applications')
  findAll(@GetUser('user_id') userId: string, @Query() query: QueryApplicationsDto) {
    return this.applicationService.findAll(userId, query);
  }

  @Get('job-posts/:jobPostId/applications/statistics')
  getStatistics(
    @GetUser('user_id') userId: string,
    @Param('jobPostId') jobPostId: string,
  ) {
    return this.applicationService.getStatistics(userId, jobPostId);
  }


  @Get('detail-applications/:applicationId')
  findOne(
    @GetUser('user_id') userId: string,
    @Param('applicationId') applicationId: string,
  ) {
    return this.applicationService.findOne(userId, applicationId);
  }

  @Patch('applications/:applicationId/status')
  updateStatus(
    @GetUser('user_id') userId: string,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationService.updateStatus(userId, applicationId, dto);
  }

  @Patch('applications/batch-update')
  batchUpdate(
    @GetUser('user_id') userId: string,
    @Body() dto: BatchUpdateApplicationsDto,
  ) {
    return this.applicationService.batchUpdate(userId, dto);
  }
}
