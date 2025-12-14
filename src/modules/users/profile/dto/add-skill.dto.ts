import { IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class AddSkillDto {
  @IsNumber()
  @IsInt()
  skill_id: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  endorsement_count?: number;
}
