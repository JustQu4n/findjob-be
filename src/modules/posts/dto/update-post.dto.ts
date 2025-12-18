import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  media_urls?: string[];
}
