import { IsArray, IsString, IsNumber, IsInt, Min, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @IsString()
  addressId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(['UPI', 'CARD', 'COD'])
  paymentMethod: 'UPI' | 'CARD' | 'COD';
}
