import { IsUUID, IsNotEmpty, IsOptional, IsIn, IsInt, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsOptional()
  @IsUUID()
  job_post_id?: string;

  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsInt()
  total_time_minutes?: number; // Tổng thời gian làm bài (phút)

  @IsOptional()
  @IsDateString()
  deadline?: string; // Hạn chót hoàn thành (timestamp)
}
