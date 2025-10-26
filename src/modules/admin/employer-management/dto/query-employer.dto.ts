import { PaginationDto } from 'src/common/dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserStatus } from 'src/common/utils/enums';

export class QueryEmployerDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  company_name?: string;
}
