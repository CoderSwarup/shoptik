import { Module } from '@nestjs/common';
import { OrderLogsQueue } from './order-logs.queue.js';
import { OrderLogsService } from './order-logs.service.js';
import { OrderLogsController } from './order-logs.controller.js';
import { OrderLogsGateway } from './order-logs.gateway.js';
import { GrpcModule } from '../grpc/grpc.module.js';

@Module({
  imports: [GrpcModule],
  controllers: [OrderLogsController, OrderLogsGateway],
  providers: [OrderLogsQueue, OrderLogsService],
  exports: [OrderLogsQueue, OrderLogsService],
})
export class OrderLogsModule {}
