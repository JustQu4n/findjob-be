import { IsOptional, IsString } from 'class-validator';

export class ChatWithGeminiDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  model?: string; // default gemini-1.5-flash (free model)
}
