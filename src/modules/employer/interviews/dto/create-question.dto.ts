import { IsNotEmpty, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  question_text: string;

  @IsOptional()
  @IsInt()
  time_limit_seconds?: number;

  @IsOptional()
  @IsInt()
  order_index?: number; // Thứ tự câu hỏi (1, 2, 3...)

  @IsOptional()
  @IsNumber()
  max_score?: number;
}
