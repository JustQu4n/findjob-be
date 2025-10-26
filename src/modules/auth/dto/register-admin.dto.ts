import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class RegisterAdminDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  full_name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Phòng ban không được vượt quá 100 ký tự' })
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Chức vụ không được vượt quá 50 ký tự' })
  position?: string;
}
