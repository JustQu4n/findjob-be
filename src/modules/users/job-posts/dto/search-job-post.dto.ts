import { IsOptional, IsString, IsInt, Min, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JobType, JobLevel } from '@/common/utils/enums';

export class SearchJobPostDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(JobType, { message: 'Job type không hợp lệ' })
  job_type?: JobType;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsEnum(JobLevel, { message: 'Job level không hợp lệ' })
  level?: JobLevel;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  salary_range?: string;

  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return value;
  })
  @IsArray({ message: 'Skills phải là mảng' })
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(['created_at', 'views_count', 'saves_count', 'title', 'salary_range'], {
    message: 'Sort by phải là created_at, views_count, saves_count, title, hoặc salary_range',
  })
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Sort order phải là ASC hoặc DESC',
  })
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
