import { IsArray, ValidateNested, IsUUID, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { BehaviorLogDto } from './behavior-log.dto';

class AnswerItem {
  @IsUUID()
  question_id: string;

  @IsOptional()
  answer_text?: string;

  @IsOptional()
  @IsInt()
  elapsed_seconds?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BehaviorLogDto)
  behavior_logs?: BehaviorLogDto[];
}

export class SubmitAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  answers: AnswerItem[];
}
