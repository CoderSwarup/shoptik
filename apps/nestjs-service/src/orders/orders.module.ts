import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { OrderLogsModule } from '../order-logs/order-logs.module.js';

@Module({
  imports: [NotificationsModule, OrderLogsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
