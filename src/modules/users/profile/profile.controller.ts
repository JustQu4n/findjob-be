import {
  Controller,
  Get,
  Post,
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
import { UpdateJobSeekerDto, CreateExperienceDto, UpdateExperienceDto, CreateEducationDto, UpdateEducationDto, CreateProjectDto, UpdateProjectDto, AddSkillDto, UpdateSkillDto } from './dto';
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
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser('user_id') authenticatedUserId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateJobSeekerDto,
  ) {
    return this.jobSeekerService.update(id, updateDto, authenticatedUserId);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Patch('cover')
  @UseInterceptors(FileInterceptor('cover'))
  @HttpCode(HttpStatus.OK)
  async updateCover(
    @GetUser('user_id') userId: string,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    return this.jobSeekerService.updateCover(userId, cover);
  }

  @Public()
  @Get(':id/applications')
  @HttpCode(HttpStatus.OK)
  async getApplications(@Param('id') id: string) {
    return this.jobSeekerService.getApplicationsByJobSeekerId(id);
  }

  // ==================== EXPERIENCE ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('experiences')
  @HttpCode(HttpStatus.CREATED)
  async createExperience(
    @GetUser('user_id') userId: string,
    @Body() createDto: CreateExperienceDto,
  ) {
    return this.jobSeekerService.createExperience(userId, createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('experiences')
  @HttpCode(HttpStatus.OK)
  async getExperiences(@GetUser('user_id') userId: string) {
    return this.jobSeekerService.getExperiences(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('experiences/:experienceId')
  @HttpCode(HttpStatus.OK)
  async getExperienceById(
    @GetUser('user_id') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.jobSeekerService.getExperienceById(userId, experienceId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Put('experiences/:experienceId')
  @HttpCode(HttpStatus.OK)
  async updateExperience(
    @GetUser('user_id') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() updateDto: UpdateExperienceDto,
  ) {
    return this.jobSeekerService.updateExperience(userId, experienceId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('experiences/:experienceId')
  @HttpCode(HttpStatus.OK)
  async deleteExperience(
    @GetUser('user_id') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.jobSeekerService.deleteExperience(userId, experienceId);
  }

  // ==================== EDUCATION ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('educations')
  @HttpCode(HttpStatus.CREATED)
  async createEducation(
    @GetUser('user_id') userId: string,
    @Body() createDto: CreateEducationDto,
  ) {
    return this.jobSeekerService.createEducation(userId, createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('educations')
  @HttpCode(HttpStatus.OK)
  async getEducations(@GetUser('user_id') userId: string) {
    return this.jobSeekerService.getEducations(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('educations/:educationId')
  @HttpCode(HttpStatus.OK)
  async getEducationById(
    @GetUser('user_id') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.jobSeekerService.getEducationById(userId, educationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Put('educations/:educationId')
  @HttpCode(HttpStatus.OK)
  async updateEducation(
    @GetUser('user_id') userId: string,
    @Param('educationId') educationId: string,
    @Body() updateDto: UpdateEducationDto,
  ) {
    return this.jobSeekerService.updateEducation(userId, educationId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('educations/:educationId')
  @HttpCode(HttpStatus.OK)
  async deleteEducation(
    @GetUser('user_id') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.jobSeekerService.deleteEducation(userId, educationId);
  }

  // ==================== PROJECT ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('projects')
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @GetUser('user_id') userId: string,
    @Body() createDto: CreateProjectDto,
  ) {
    return this.jobSeekerService.createProject(userId, createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('projects')
  @HttpCode(HttpStatus.OK)
  async getProjects(@GetUser('user_id') userId: string) {
    return this.jobSeekerService.getProjects(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('projects/:projectId')
  @HttpCode(HttpStatus.OK)
  async getProjectById(
    @GetUser('user_id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.jobSeekerService.getProjectById(userId, projectId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Put('projects/:projectId')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @GetUser('user_id') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.jobSeekerService.updateProject(userId, projectId, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('projects/:projectId')
  @HttpCode(HttpStatus.OK)
  async deleteProject(
    @GetUser('user_id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.jobSeekerService.deleteProject(userId, projectId);
  }

  // ==================== SKILLS ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  async addSkill(
    @GetUser('user_id') userId: string,
    @Body() addDto: AddSkillDto,
  ) {
    return this.jobSeekerService.addSkill(userId, addDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('skills')
  @HttpCode(HttpStatus.OK)
  async getSkills(@GetUser('user_id') userId: string) {
    return this.jobSeekerService.getSkills(userId);
  }

  @Public()
  @Get('skills/available')
  @HttpCode(HttpStatus.OK)
  async getAllAvailableSkills() {
    return this.jobSeekerService.getAllAvailableSkills();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Get('skills/:skillId')
  @HttpCode(HttpStatus.OK)
  async getSkillById(
    @GetUser('user_id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.jobSeekerService.getSkillById(userId, parseInt(skillId));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Put('skills/:skillId')
  @HttpCode(HttpStatus.OK)
  async updateSkill(
    @GetUser('user_id') userId: string,
    @Param('skillId') skillId: string,
    @Body() updateDto: UpdateSkillDto,
  ) {
    return this.jobSeekerService.updateSkill(userId, parseInt(skillId), updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('jobseeker')
  @Delete('skills/:skillId')
  @HttpCode(HttpStatus.OK)
  async deleteSkill(
    @GetUser('user_id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.jobSeekerService.deleteSkill(userId, parseInt(skillId));
  }
}
