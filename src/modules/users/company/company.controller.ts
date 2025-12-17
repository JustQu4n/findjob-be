import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { PaginationDto } from '@/common/dto';

@Controller('jobseeker/company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
  ) {}

  @Public()
  @Get('detail/:companyId')
  @HttpCode(HttpStatus.OK)
  async getCompanyDetail(@Param('companyId') companyId: string) {
    return this.companyService.getCompanyDetail(companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('follow-company/:companyId')
  @HttpCode(HttpStatus.CREATED)
  async followCompany(
    @GetUser('user_id') userId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.companyService.followCompany(userId, companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('unfollow-company/:companyId')
  @HttpCode(HttpStatus.OK)
  async unfollowCompany(
    @GetUser('user_id') userId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.companyService.unfollowCompany(userId, companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('companies')
  @HttpCode(HttpStatus.OK)
  async getFollowedCompanies(
    @GetUser('user_id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.companyService.getFollowedCompanies(
      userId,
      paginationDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('check/:companyId')
  @HttpCode(HttpStatus.OK)
  async checkCompanyFollowed(
    @GetUser('user_id') userId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.companyService.checkCompanyFollowed(
      userId,
      companyId,
    );
  }

  @Public()
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchCompanies(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    return this.companyService.searchCompanies(keyword, paginationDto);
  }

  @Public()
  @Get('list')
  @HttpCode(HttpStatus.OK)
  async listCompanies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginationDto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    return this.companyService.getAllCompanies(paginationDto);
  }
}
