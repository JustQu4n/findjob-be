import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/database/entities/notification/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

export interface NotificationPayload {
  user_id: string;
  type: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private logger = new Logger('NotificationsService');

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  // Create notification in DB and emit realtime event to user
  async createNotification(payload: NotificationPayload) {
    const notif = this.notificationRepository.create({
      user_id: payload.user_id,
      type: payload.type,
      message: payload.message,
      metadata: payload.metadata || null,
      is_read: false, // Explicitly set as boolean false
      created_at: new Date(), // Explicitly set created_at
    });

    const saved = await this.notificationRepository.save(notif);

    try {
      const room = this.gateway.userRoom(payload.user_id);
      this.gateway.server.to(room).emit('notification', saved);
      this.logger.log(`Emitted notification to ${room}`);
    } catch (err) {
      this.logger.error('Failed to emit notification', err?.message || err);
    }

    return saved;
  }

  // Public API to send a realtime notification (creates in DB and emits)
  async sendToUser(userId: string, payload: Omit<NotificationPayload, 'user_id'>) {
    return this.createNotification({ user_id: userId, ...payload });
  }

  // Optional: mark as read
  async markAsRead(notificationId: string) {
    const notif = await this.notificationRepository.findOne({ where: { id: notificationId } });
    if (!notif) return null;
    notif.is_read = true;
    return this.notificationRepository.save(notif);
  }

  // Mark as read only if the notification belongs to the given user
  async markAsReadByUser(notificationId: string, userId: string) {
    const notif = await this.notificationRepository.findOne({ where: { id: notificationId } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    if (notif.user_id !== userId) {
      throw new ForbiddenException('Not allowed to modify this notification');
    }
    if (!notif.is_read) {
      notif.is_read = true;
      return this.notificationRepository.save(notif);
    }
    return notif;
  }

  // List notifications for a user with simple pagination
  async listForUser(userId: string, page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [data, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    return { data, total, page, limit: take };
  }

  // Count unread notifications for a user
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
    return { message: 'All notifications marked as read' };
  }
}
