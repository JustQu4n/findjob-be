import { IsNotEmpty, IsUUID } from 'class-validator';

export class SaveJobDto {
  @IsNotEmpty()
  @IsUUID()
  job_post_id: string;
}
