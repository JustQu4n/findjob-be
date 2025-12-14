import { IsOptional, IsNumber, IsString } from 'class-validator';

export class GradeAnswerDto {
  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
