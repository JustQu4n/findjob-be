import { IsOptional, IsString, IsIn, IsInt, IsUUID, IsDateString } from 'class-validator';

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  total_time_minutes?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsUUID()
  job_post_id?: string;

  @IsOptional()
  @IsIn(['draft', 'open', 'closed', 'archived'])
  status?: string;
}
