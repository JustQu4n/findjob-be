import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployerManagementService } from './employer-management.service';
import { QueryEmployerDto, UpdateEmployerStatusDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/employers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmployerManagementController {
  constructor(
    private readonly employerManagementService: EmployerManagementService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryEmployerDto) {
    return this.employerManagementService.findAll(query);
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics() {
    return this.employerManagementService.getStatistics();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employerManagementService.findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateEmployerStatusDto,
  ) {
    return this.employerManagementService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employerManagementService.remove(id);
  }
}
