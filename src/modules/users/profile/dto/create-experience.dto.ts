import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  company_name: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  location?: string;

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
  description?: string;
}
