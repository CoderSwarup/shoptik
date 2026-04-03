import { Controller, Get, Query, Param } from '@nestjs/common';
import { OrderLogsService } from './order-logs.service.js';

@Controller('order-logs')
export class OrderLogsController {
  constructor(private readonly orderLogsService: OrderLogsService) {}

  @Get()
  async getAllOrderLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('eventType') eventType?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.orderLogsService.getAllOrderLogs(pageNum, limitNum, eventType);
  }

  @Get('recent')
  async getRecentLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.orderLogsService.getRecentLogs(limitNum);
  }

  @Get('order/:orderId')
  async getOrderLogs(
    @Param('orderId') orderId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.orderLogsService.getOrderLogs(orderId, pageNum, limitNum);
  }
}
