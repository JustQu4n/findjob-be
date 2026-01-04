import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class QueryCompanyDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
