import { IsUUID } from 'class-validator';

export class ScoreInterviewDto {
  @IsUUID()
  candidateInterviewId: string;
}
