import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateDeliveryZoneDto {
  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsBoolean()
  @IsOptional()
  isServiceable?: boolean;

  @IsNumber()
  @IsOptional()
  etaDays?: number;

  @IsNumber()
  @IsOptional()
  deliveryCharge?: number;
}
