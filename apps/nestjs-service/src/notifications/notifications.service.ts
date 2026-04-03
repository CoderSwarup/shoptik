import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { GrpcClientService } from '../grpc/grpc-client.service.js';

export interface NotificationPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
  type: 'ORDER_UPDATE' | 'PAYMENT' | 'PROMO' | 'SYSTEM';
  title: string;
  message: string;
  payload?: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
}

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private redisPub: Redis;
  private redisSub: Redis;

  constructor(private readonly grpcClient: GrpcClientService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisPub = new Redis(redisUrl);
    this.redisSub = new Redis(redisUrl);
  }

  async onModuleInit() {
    console.log('[NotificationsService] Connected to Redis Pub/Sub');
  }

  async onModuleDestroy() {
    await this.redisPub.quit();
    await this.redisSub.quit();
  }

  // Publish notification to Redis (Go service will subscribe and broadcast via WebSocket)
  async publish(notification: NotificationPayload): Promise<void> {
    console.log('[NotificationsService] Publishing notification:', JSON.stringify(notification));

    const message = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString(),
    });

    // Publish to channel based on role
    if (notification.role === 'ADMIN') {
      await this.redisPub.publish('notifications:admin', message);
    } else {
      await this.redisPub.publish(`notifications:user:${notification.userId}`, message);
      await this.redisPub.publish('notifications:all', message);
    }

    // Also store in Go service via gRPC for persistence
    try {
      await this.grpcClient.createNotification({
        user_id: notification.userId,
        role: notification.role,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        payload: notification.payload || {},
        priority: notification.priority || 'NORMAL',
      });
    } catch (error) {
      console.error('[NotificationsService] Failed to persist notification:', error);
    }
  }

  // Get notifications for user via gRPC
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    console.log('[NotificationsService] Getting notifications for user:', userId);
    return this.grpcClient.listUserNotifications({ user_id: userId, page, limit });
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    return this.grpcClient.getUnreadCount({ user_id: userId });
  }

  // Mark as read
  async markAsRead(userId: string, notificationId: string) {
    return this.grpcClient.markAsRead({ user_id: userId, notification_id: notificationId });
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    return this.grpcClient.markAllAsRead({ user_id: userId });
  }

  // Send order status update notification
  async sendOrderUpdate(userId: string, orderId: string, status: string, message: string) {
    await this.publish({
      userId,
      role: 'USER',
      type: 'ORDER_UPDATE',
      title: `Order ${status}`,
      message,
      payload: { orderId, status },
      priority: 'NORMAL',
    });
  }

  // Send payment notification
  async sendPaymentNotification(userId: string, orderId: string, status: 'SUCCESS' | 'FAILED', amount: number) {
    await this.publish({
      userId,
      role: 'USER',
      type: 'PAYMENT',
      title: status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed',
      message: status === 'SUCCESS'
        ? `Your payment of $${amount} for order #${orderId} was successful.`
        : `Your payment for order #${orderId} failed. Please try again.`,
      payload: { orderId, status, amount },
      priority: status === 'FAILED' ? 'HIGH' : 'NORMAL',
    });
  }

  // Send admin notification
  async sendAdminNotification(title: string, message: string, payload?: Record<string, any>) {
    await this.publish({
      userId: 'all',
      role: 'ADMIN',
      type: 'SYSTEM',
      title,
      message,
      payload,
      priority: 'NORMAL',
    });
  }
}
