import { IsNotEmpty, IsString } from 'class-validator';

export class SummarizeJdDto {
  @IsString()
  @IsNotEmpty()
  jobDescription: string;

}
