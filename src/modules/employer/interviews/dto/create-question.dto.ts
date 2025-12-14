import { IsNotEmpty, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  question_text: string;

  @IsOptional()
  @IsInt()
  time_limit_seconds?: number;

  @IsOptional()
  @IsNumber()
  max_score?: number;
}
