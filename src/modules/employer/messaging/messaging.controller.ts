import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { SendEmailToUserDto } from './dto/send-email.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Employer Messaging')
@ApiBearerAuth()
@Controller('employer/messaging')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employer')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send-email')
  @ApiOperation({ 
    summary: 'Gửi email từ employer đến user',
    description: 'Cho phép nhà tuyển dụng gửi email thông báo đến ứng viên'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi email thành công',
    schema: {
      example: {
        message: 'Gửi email thành công',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dữ liệu' })
  async sendEmailToUser(
    @Request() req,
    @Body() sendEmailDto: SendEmailToUserDto,
  ) {
    return this.messagingService.sendEmailToUser(
      req.user.employer_id,
      sendEmailDto,
    );
  }
}
