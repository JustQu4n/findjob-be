import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateEmployerDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('employer/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Put()
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser('user_id') userId: string,
    @Body() updateDto: UpdateEmployerDto,
  ) {
    return this.profileService.update(userId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Delete()
  @HttpCode(HttpStatus.OK)
  async remove(@GetUser('user_id') userId: string) {
    return this.profileService.remove(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.profileService.findOneById(id);
  }
}
