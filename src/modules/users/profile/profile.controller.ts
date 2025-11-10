import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UpdateJobSeekerDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('jobseeker/profile')
export class ProfileController {
  constructor(private readonly jobSeekerService: ProfileService) {}

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.jobSeekerService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Put()
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser('user_id') userId: string,
    @Body() updateDto: UpdateJobSeekerDto,
  ) {
    return this.jobSeekerService.update(userId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete()
  @HttpCode(HttpStatus.OK)
  async remove(@GetUser('user_id') userId: string) {
    return this.jobSeekerService.remove(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  async updateAvatar(
    @GetUser('user_id') userId: string,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.jobSeekerService.updateAvatar(userId, avatar);
  }

  @Public()
  @Get(':id/applications')
  @HttpCode(HttpStatus.OK)
  async getApplications(@Param('id') id: string) {
    return this.jobSeekerService.getApplicationsByJobSeekerId(id);
  }
}
