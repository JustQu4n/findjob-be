import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from 'src/common/utils/enums';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
