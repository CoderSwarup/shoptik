import { IsString, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDeliveryZoneDto {
  @IsString()
  @IsNotEmpty()
  pincode!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsBoolean()
  isServiceable!: boolean;

  @IsNumber()
  etaDays!: number;

  @IsNumber()
  deliveryCharge!: number;
}
