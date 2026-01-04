import { IsOptional, IsDateString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
