import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsDateString,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, JobLevel, Gender, JobStatus } from 'src/common/utils/enums';

export class UpdateJobPostDto {
  @ApiPropertyOptional({
    description: 'Job title',
    example: 'Senior Backend Developer',
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Industries/sectors (comma-separated or single value)',
    example: 'Information Technology, Software Development',
  })
  @IsOptional()
  @IsString()
  industries?: string;

  @ApiPropertyOptional({
    description: 'Detailed job description (HTML supported from CKEditor)',
    example: '<p>We are looking for an experienced backend developer...</p>',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job requirements',
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({
    description: 'City/Location',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Full address',
    example: '123 Nguyen Van Linh, District 7, Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Required skills (array of skill names)',
    example: ['React', 'NodeJS', 'PostgreSQL', 'Docker'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Required years of experience',
    example: '3-5 years',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    description: 'Job level/seniority',
    enum: JobLevel,
    example: JobLevel.SENIOR,
  })
  @IsOptional()
  @IsEnum(JobLevel)
  level?: JobLevel;

  @ApiPropertyOptional({
    description: 'Salary range or amount',
    example: '$3000 - $5000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Salary range must not exceed 50 characters' })
  salary_range?: string;

  @ApiPropertyOptional({
    description: 'Gender requirement',
    enum: Gender,
    example: Gender.ANY,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Type of employment',
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({
    description: 'Job post status',
    enum: JobStatus,
    example: JobStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    description: 'Expiration date of the job post (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional({
    description: 'Deadline for application (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid date' })
  deadline?: string;
}
