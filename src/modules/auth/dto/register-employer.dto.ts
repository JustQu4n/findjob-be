import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class RegisterEmployerDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  @MaxLength(150, { message: 'Họ và tên không được vượt quá 150 ký tự' })
  fullname: string;
    
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  @IsString()
  @MaxLength(150, { message: 'Tên công ty không được vượt quá 150 ký tự' })
  company_name: string;

  @IsNotEmpty({ message: 'Địa chỉ công ty không được để trống' })
  @IsString()
  @MaxLength(255, { message: 'Địa chỉ công ty không được vượt quá 255 ký tự' })
  company_address: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL không hợp lệ' })
  company_logo_url?: string;

  @IsOptional()
  @IsString()
  company_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Ngành nghề không được vượt quá 100 ký tự' })
  company_industry?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website URL không hợp lệ' })
  company_website?: string;
}
