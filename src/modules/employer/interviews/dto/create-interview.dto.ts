import { IsUUID, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateInterviewDto {
  @IsOptional()
  @IsUUID()
  job_post_id?: string;

  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'open', 'closed', 'archived'])
  status?: string;
}
