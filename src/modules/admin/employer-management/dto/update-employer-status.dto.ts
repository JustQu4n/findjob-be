import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from 'src/common/utils/enums';

export class UpdateEmployerStatusDto {
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status: UserStatus;
}
