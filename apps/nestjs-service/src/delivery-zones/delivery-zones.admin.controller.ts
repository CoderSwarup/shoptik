import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeliveryZonesService } from './delivery-zones.service.js';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@Controller('admin/delivery-zones')
@AdminGuard()
export class DeliveryZonesAdminController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @Post()
  create(@Body() createDto: CreateDeliveryZoneDto) {
    console.log('[DeliveryZonesAdminController] create called');
    console.log('[DeliveryZonesAdminController] createDto:', JSON.stringify(createDto));
    console.log('[DeliveryZonesAdminController] createDto fields:', {
      pincode: createDto.pincode,
      city: createDto.city,
      state: createDto.state,
      isServiceable: createDto.isServiceable,
      etaDays: createDto.etaDays,
      deliveryCharge: createDto.deliveryCharge,
    });
    return this.deliveryZonesService.create(createDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    console.log('[DeliveryZonesAdminController] findAll page:', page, 'limit:', limit);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.deliveryZonesService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('[DeliveryZonesAdminController] findOne id:', id);
    return this.deliveryZonesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDeliveryZoneDto) {
    console.log('[DeliveryZonesAdminController] update id:', id, 'dto:', JSON.stringify(updateDto));
    return this.deliveryZonesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    console.log('[DeliveryZonesAdminController] remove id:', id);
    await this.deliveryZonesService.remove(id);
  }
}
