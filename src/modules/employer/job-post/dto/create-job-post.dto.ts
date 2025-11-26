import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, JobLevel, Gender, JobStatus } from 'src/common/utils/enums';

export class CreateJobPostDto {
  @ApiProperty({
    description: 'User ID of the employer creating the job post',
    example: '3fcea9c2-3637-4286-8004-30717b409d15',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Company ID associated with the job post',
    example: '3ed21c52-217c-451e-8a5b-00f2cb958fdb',
  })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Backend Developer',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Industries/sectors (comma-separated or single value)',
    example: 'Information Technology, Software Development',
  })
  @IsString()
  @IsNotEmpty()
  industries: string;

  @ApiProperty({
    description: 'Detailed job description (HTML supported from CKEditor)',
    example: '<p>We are looking for an experienced backend developer...</p>',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Job requirements (HTML supported from CKEditor)',
    example: '<p>Requirements: Bachelor degree in Computer Science...</p>',
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({
    description: 'City/Location',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Full address',
    example: '123 Nguyen Van Linh, District 7, Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Required skills (array of skill names)',
    example: ['React', 'NodeJS', 'PostgreSQL', 'Docker'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  skills: string[];

  @ApiProperty({
    description: 'Required years of experience',
    example: '3-5 years',
  })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiProperty({
    description: 'Job level/seniority',
    enum: JobLevel,
    example: JobLevel.SENIOR,
  })
  @IsEnum(JobLevel)
  @IsNotEmpty()
  level: JobLevel;

  @ApiProperty({
    description: 'Salary range or amount',
    example: '$3000 - $5000',
  })
  @IsString()
  @IsNotEmpty()
  salary_range: string;

  @ApiPropertyOptional({
    description: 'Gender requirement',
    enum: Gender,
    default: Gender.ANY,
    example: Gender.ANY,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: 'Type of employment',
    enum: JobType,
    default: JobType.FULL_TIME,
    example: JobType.FULL_TIME,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  job_type: JobType;

  @ApiPropertyOptional({
    description: 'Job post status',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
    example: JobStatus.ACTIVE,
  })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiProperty({
    description: 'Expiration date of the job post (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  expires_at: string;

  @ApiPropertyOptional({
    description: 'Application deadline (ISO 8601 format)',
    example: '2024-12-30T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;
}
