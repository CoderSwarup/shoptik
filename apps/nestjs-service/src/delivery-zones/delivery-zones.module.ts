import { Module } from '@nestjs/common';
import { DeliveryZonesService } from './delivery-zones.service.js';
import { DeliveryZonesController } from './delivery-zones.controller.js';
import { DeliveryZonesAdminController } from './delivery-zones.admin.controller.js';
import { GrpcModule } from '../grpc/grpc.module.js';

@Module({
  imports: [GrpcModule],
  controllers: [DeliveryZonesController, DeliveryZonesAdminController],
  providers: [DeliveryZonesService],
  exports: [DeliveryZonesService],
})
export class DeliveryZonesModule {}
