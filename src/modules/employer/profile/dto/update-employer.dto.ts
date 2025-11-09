import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateEmployerDto {
  @IsOptional()
  @IsUUID('4', { message: 'Company ID phải là UUID hợp lệ' })
  company_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Vị trí không được vượt quá 100 ký tự' })
  position?: string;
}
