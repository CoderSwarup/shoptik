import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller.js';
import { AddressesService } from './addresses.service.js';
import { GrpcModule } from '../grpc/grpc.module.js';

@Module({
  imports: [GrpcModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
