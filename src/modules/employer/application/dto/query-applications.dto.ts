import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApplicationStatus } from 'src/common/utils/enums';
import { Type } from 'class-transformer';

export class QueryApplicationsDto {
  @IsOptional()
  @IsUUID('4', { message: 'Job Post ID phải là UUID hợp lệ' })
  job_post_id?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  status?: ApplicationStatus;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
