import { Controller, Get, Query, UseGuards, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * GET /notifications/list
   * Query params: page, limit
   */
  @Get('list')
  async list(
    @GetUser('user_id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    return this.notificationsService.listForUser(userId, p, l);
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read for the current user
   */
  @Patch(':id/read')
  async markRead(
    @GetUser('user_id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsReadByUser(id, userId);
  }
}
