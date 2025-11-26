import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

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
  @MaxLength(255, { message: 'Địa điểm không được vượt quá 255 ký tự' })
  location?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website phải là URL hợp lệ' })
  @MaxLength(255, { message: 'Website không được vượt quá 255 ký tự' })
  website?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL phải là URL hợp lệ' })
  @MaxLength(500, { message: 'Logo URL không được vượt quá 500 ký tự' })
  logo_url?: string;
}
