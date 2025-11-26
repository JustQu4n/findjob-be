import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('jobseeker/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('jobseeker')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('resume'))
  submitApplication(
    @GetUser('user_id') userId: string,
    @Body() dto: SubmitApplicationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.applicationsService.submitApplication(userId, dto, file);
  }


  @Get('history-applications/:job_seeker_id')
  getApplicationHistory(
    @GetUser('user_id') userId: string,
    @Param('job_seeker_id') jobSeekerId: string,
  ) {
    return this.applicationsService.getApplicationHistory(userId, jobSeekerId);
  }
}
