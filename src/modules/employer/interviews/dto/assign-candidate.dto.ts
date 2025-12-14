import { IsUUID, IsOptional } from 'class-validator';

export class AssignCandidateDto {
  @IsUUID()
  application_id: string;

  @IsOptional()
  @IsUUID()
  candidate_id?: string; // optional, can be derived from application
}
