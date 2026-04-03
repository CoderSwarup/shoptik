import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { Roles, RolesGuard } from '../common/guards/roles.guard.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /orders - Get user's orders
  @Get()
  async findAll(@Headers('x-user-id') userId: string) {
    return this.ordersService.findAll(userId);
  }

  // GET /orders/all - Get all orders (Admin)
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  // GET /orders/:id - Get single order
  @Get(':id')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(userId, id);
  }

  // POST /orders - Create order
  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, dto);
  }

  // POST /orders/:id/pay - Process payment
  @Post(':id/pay')
  async processPayment(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('method') method: 'UPI' | 'CARD' | 'COD',
  ) {
    return this.ordersService.processPayment(userId, id, method);
  }

  // POST /orders/:id/cancel - Cancel order
  @Post(':id/cancel')
  async cancel(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancel(userId, id);
  }

  // PUT /orders/:id/status - Update order status (Admin)
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
