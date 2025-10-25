import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { EmploymentType } from 'src/common/utils/enums';

export class UpdateJobPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Tiêu đề không được vượt quá 150 ký tự' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Khoảng lương không được vượt quá 50 ký tự' })
  salary_range?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa điểm không được vượt quá 255 ký tự' })
  location?: string;

  @IsOptional()
  @IsEnum(EmploymentType, { message: 'Loại công việc không hợp lệ' })
  employment_type?: EmploymentType;

  @IsOptional()
  @IsDateString({}, { message: 'Deadline phải là ngày hợp lệ' })
  deadline?: string;
}
