import { IsEnum, IsNotEmpty, IsString, IsDateString, IsUUID, IsOptional, IsObject, MaxLength } from 'class-validator';
import { BehaviorType } from 'src/database/entities/candidate-behavior-log/behavior-type.enum';

export class BehaviorLogDto {
  @IsEnum(BehaviorType)
  @IsNotEmpty()
  type: BehaviorType;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @IsUUID()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
