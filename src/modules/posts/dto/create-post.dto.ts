import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  media_urls?: string[];
}
