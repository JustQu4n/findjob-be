import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  endorsement_count?: number;
}
