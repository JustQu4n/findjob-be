import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';
import { UserStatus } from 'src/common/utils/enums';

export class QueryUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  role?: string; // 'job_seeker', 'employer', 'admin'
}
