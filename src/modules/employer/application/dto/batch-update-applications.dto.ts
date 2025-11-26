import { IsNotEmpty, IsArray, IsUUID, IsEnum } from 'class-validator';
import { ApplicationStatus } from 'src/common/utils/enums';

export class BatchUpdateApplicationsDto {
  @IsNotEmpty({ message: 'Danh sách application IDs không được để trống' })
  @IsArray({ message: 'Application IDs phải là một mảng' })
  @IsUUID('4', { each: true, message: 'Mỗi application ID phải là UUID hợp lệ' })
  application_ids: string[];

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(ApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  status: ApplicationStatus;
}
