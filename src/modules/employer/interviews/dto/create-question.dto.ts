import { IsNotEmpty, IsOptional, IsInt, IsNumber, IsArray, IsString } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteria?: string[]; // AI-classified criteria: 'Clarity of Expression', 'Logical Thinking', 'Learning Attitude & Growth Mindset', 'Basic IT Awareness', 'Professional Attitude & Honesty'
}
