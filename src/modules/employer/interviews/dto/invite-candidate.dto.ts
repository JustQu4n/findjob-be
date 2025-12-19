import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteCandidateDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsString()
  message?: string;
}
