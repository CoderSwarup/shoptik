import { IsEnum } from 'class-validator';
import { orderStatusEnum } from '../../db/schemas/orders.js';

export class UpdateOrderStatusDto {
  @IsEnum(orderStatusEnum.enumValues)
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
