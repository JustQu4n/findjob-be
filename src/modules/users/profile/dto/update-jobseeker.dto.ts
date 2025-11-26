import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateJobSeekerDto {
  @IsOptional()
  @IsString()
  bio?: string;

  // User fields
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
