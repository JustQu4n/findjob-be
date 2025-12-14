import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'open', 'closed', 'archived'])
  status?: string;
}
