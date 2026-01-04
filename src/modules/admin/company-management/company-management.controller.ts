import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CompanyManagementService } from './company-management.service';
import { QueryCompanyDto, CreateCompanyDto, UpdateCompanyDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CompanyManagementController {
  constructor(
    private readonly companyManagementService: CompanyManagementService,
  ) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyManagementService.create(createCompanyDto);
  }

  @Get()
  findAll(@Query() query: QueryCompanyDto) {
    return this.companyManagementService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.companyManagementService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyManagementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyManagementService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyManagementService.remove(id);
  }
}
