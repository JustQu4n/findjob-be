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
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('employer/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Get(':company_id/job-posts')
  @HttpCode(HttpStatus.OK)
  async getJobPosts(@Param('company_id') companyId: string) {
    return this.companyService.getCompanyJobPosts(companyId);
  }

  @Public()
  @Get('detail-company/:user_id')
  @HttpCode(HttpStatus.OK)
  async getCompanyByUserId(@Param('user_id') userId: string) {
    return this.companyService.getCompanyByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Put(':company_id')
  @HttpCode(HttpStatus.OK)
  async updateCompany(
    @GetUser('user_id') userId: string,
    @Param('company_id') companyId: string,
    @Body() updateDto: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(userId, companyId, updateDto);
  }
}
