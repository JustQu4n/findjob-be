import { IsUUID, IsNotEmpty } from 'class-validator';

export class AcceptInterviewDto {
  @IsNotEmpty()
  @IsUUID()
  application_id: string;
}
