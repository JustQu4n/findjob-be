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
import { UserManagementService } from './user-management.service';
import { QueryUserDto, UpdateUserStatusDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userManagementService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.userManagementService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    return this.userManagementService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userManagementService.remove(id);
  }
}
