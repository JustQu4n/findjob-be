import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitApplicationDto {
  @IsUUID()
  @IsNotEmpty({ message: 'job_post_id không được để trống' })
  job_post_id: string;

  @IsOptional()
  @IsString()
  cover_letter?: string;
}
