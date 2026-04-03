import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DeliveryZonesService } from './delivery-zones.service.js';

@Controller('delivery-zones')
export class DeliveryZonesController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @Get('pincode/:pincode')
  async findByPincode(@Param('pincode') pincode: string) {
    try {
      const zone = await this.deliveryZonesService.findByPincode(pincode);
      return {
        pincode: zone.pincode,
        city: zone.city,
        state: zone.state,
        isServiceable: zone.isServiceable,
        etaDays: zone.etaDays,
        deliveryCharge: zone.deliveryCharge,
      };
    } catch {
      throw new NotFoundException(`Delivery zone not found for pincode: ${pincode}`);
    }
  }
}
