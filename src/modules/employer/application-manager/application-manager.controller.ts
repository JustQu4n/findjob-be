import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApplicationManagerService } from './application-manager.service';
import { UpdateApplicationStatusDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('employer/manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employer')
export class ApplicationManagerController {
  constructor(
    private readonly applicationManagerService: ApplicationManagerService,
  ) {}

  @Get(':companyId/applications')
  @HttpCode(HttpStatus.OK)
  async getApplications(
    @GetUser('user_id') userId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.applicationManagerService.getApplicationsByCompany(
      userId,
      companyId,
    );
  }

  @Put('applications/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @GetUser('user_id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationManagerService.updateApplicationStatus(
      userId,
      id,
      updateDto,
    );
  }
}
