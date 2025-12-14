import { IsArray, ValidateNested, IsUUID, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerItem {
  @IsUUID()
  question_id: string;

  @IsOptional()
  answer_text?: string;

  @IsOptional()
  @IsInt()
  elapsed_seconds?: number;
}

export class SubmitAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  answers: AnswerItem[];
}
