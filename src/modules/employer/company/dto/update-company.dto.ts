import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Tên công ty không được vượt quá 150 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Ngành nghề không được vượt quá 100 ký tự' })
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  innovation?: string;

  @IsOptional()
  @IsString()
  sustainability?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa điểm không được vượt quá 255 ký tự' })
  location?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website phải là URL hợp lệ' })
  @MaxLength(255, { message: 'Website không được vượt quá 255 ký tự' })
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Employees range không được vượt quá 50 ký tự' })
  employees_range?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày thành lập phải là định dạng ngày hợp lệ (YYYY-MM-DD)' })
  founded_at?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL phải là URL hợp lệ' })
  @MaxLength(500, { message: 'Logo URL không được vượt quá 500 ký tự' })
  logo_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Địa chỉ liên hệ không được vượt quá 500 ký tự' })
  contact_address?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email liên hệ phải hợp lệ' })
  @MaxLength(255, { message: 'Email liên hệ không được vượt quá 255 ký tự' })
  contact_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Số điện thoại không được vượt quá 50 ký tự' })
  contact_phone?: string;
}
