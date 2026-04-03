import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications - Get all notifications for user
  @Get()
  async findAll(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getUserNotifications(userId, pageNum, limitNum);
  }

  // GET /notifications/unread-count - Get unread count
  @Get('unread-count')
  async getUnreadCount(@Headers('x-user-id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  // PATCH /notifications/:id/read - Mark as read
  @Patch(':id/read')
  async markAsRead(
    @Headers('x-user-id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  // PATCH /notifications/read-all - Mark all as read
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Headers('x-user-id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
