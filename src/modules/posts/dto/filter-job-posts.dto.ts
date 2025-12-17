import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto';
import { JobType, JobLevel } from 'src/common/utils/enums';

export class FilterJobPostsDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search phải là chuỗi văn bản' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Location phải là chuỗi văn bản' })
  location?: string;

  @IsOptional()
  @IsEnum(JobType, { message: 'Job type không hợp lệ' })
  job_type?: JobType;

  @IsOptional()
  @IsString({ message: 'Category ID phải là chuỗi văn bản' })
  category_id?: string;

  @IsOptional()
  @IsEnum(JobLevel, { message: 'Job level không hợp lệ' })
  level?: JobLevel;

  @IsOptional()
  @IsString({ message: 'Experience phải là chuỗi văn bản' })
  experience?: string;

  @IsOptional()
  @IsString({ message: 'Salary range phải là chuỗi văn bản' })
  salary_range?: string;

  @IsOptional()
  @IsArray({ message: 'Skills phải là mảng' })
  @IsString({ each: true, message: 'Mỗi skill phải là chuỗi văn bản' })
  @Type(() => String)
  skills?: string[];

  @IsOptional()
  @IsString({ message: 'Company ID phải là chuỗi văn bản' })
  company_id?: string;

  @IsOptional()
  @IsEnum(['relevance', 'created_at', 'salary', 'views', 'title'], {
    message: 'Sort by phải là relevance, created_at, salary, views, hoặc title',
  })
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Sort order phải là ASC hoặc DESC',
  })
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}
