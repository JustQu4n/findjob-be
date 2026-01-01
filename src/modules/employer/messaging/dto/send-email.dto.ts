import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailToUserDto {
  @ApiProperty({
    description: 'ID của user nhận email',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'User ID là bắt buộc' })
  userId: string;

  @ApiProperty({
    description: 'Tiêu đề email',
    example: 'Thông báo về vị trí tuyển dụng',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề email là bắt buộc' })
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  subject: string;

  @ApiProperty({
    description: 'Nội dung email',
    example: 'Xin chào, chúng tôi muốn mời bạn tham gia phỏng vấn...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung email là bắt buộc' })
  message: string;
}
