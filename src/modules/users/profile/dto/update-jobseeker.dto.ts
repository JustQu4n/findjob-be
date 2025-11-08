import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateJobSeekerDto {
  @IsOptional()
  @IsUrl({}, { message: 'Resume URL must be a valid URL' })
  @MaxLength(2048)
  resume_url?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  education?: string;
}
