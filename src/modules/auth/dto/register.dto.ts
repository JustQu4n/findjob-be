import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  JOB_SEEKER = 'job_seeker',
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  full_name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt' }
  )
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;
}
