import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_current?: boolean;

  @IsOptional()
  @IsString()
  project_url?: string;

  @IsOptional()
  @IsString()
  repo_url?: string;

  @IsOptional()
  @IsString()
  company_name?: string;
}
