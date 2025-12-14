import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from 'src/common/utils/enums';

export class UpdateApplicationStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(ApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  status: ApplicationStatus;
}
