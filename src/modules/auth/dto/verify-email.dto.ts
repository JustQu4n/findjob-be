import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString()
  token: string;
}
