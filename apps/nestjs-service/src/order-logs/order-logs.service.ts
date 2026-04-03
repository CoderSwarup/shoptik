import { Injectable } from '@nestjs/common';
import { GrpcClientService } from '../grpc/grpc-client.service.js';

@Injectable()
export class OrderLogsService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async getOrderLogs(orderId: string, page = 1, limit = 20) {
    return this.grpcClient.getOrderLogs({ order_id: orderId, page, limit });
  }

  async getAllOrderLogs(page = 1, limit = 50, eventType?: string) {
    return this.grpcClient.getAllOrderLogs({ page, limit, event_type: eventType });
  }

  async getRecentLogs(limit = 50) {
    return this.grpcClient.getRecentLogs({ limit });
  }
}
