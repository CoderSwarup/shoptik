import { Module } from '@nestjs/common';
import { GrpcClientService } from './grpc-client.service.js';

@Module({
  providers: [GrpcClientService],
  exports: [GrpcClientService],
})
export class GrpcModule {}
