import { Injectable } from '@nestjs/common';
import { GrpcClientService } from '../grpc/grpc-client.service.js';
import type { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto.js';
import type { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto.js';

@Injectable()
export class DeliveryZonesService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async create(dto: CreateDeliveryZoneDto) {
    console.log('[DeliveryZonesService] create DTO:', JSON.stringify(dto));

    const grpcRequest = {
      pincode: dto.pincode,
      city: dto.city,
      state: dto.state,
      is_serviceable: dto.isServiceable,
      eta_days: dto.etaDays,
      delivery_charge: dto.deliveryCharge,
    };

    console.log('[DeliveryZonesService] gRPC request:', JSON.stringify(grpcRequest));

    const response = await this.grpcClient.createDeliveryZone(grpcRequest);
    return this.mapToResponse(response.delivery_zone);
  }

  async findOne(id: string) {
    console.log('[DeliveryZonesService] findOne id:', id);
    const response = await this.grpcClient.getDeliveryZone({ id });
    return this.mapToResponse(response.delivery_zone);
  }

  async findByPincode(pincode: string) {
    console.log('[DeliveryZonesService] findByPincode pincode:', pincode);
    const response = await this.grpcClient.getDeliveryZoneByPincode({ pincode });
    return this.mapToResponse(response.delivery_zone);
  }

  async findAll(page = 1, limit = 10) {
    console.log('[DeliveryZonesService] findAll page:', page, 'limit:', limit);
    const response = await this.grpcClient.listDeliveryZones({ page, limit });
    return {
      data: response.delivery_zones.map((z) => this.mapToResponse(z)),
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    console.log('[DeliveryZonesService] update id:', id, 'DTO:', JSON.stringify(dto));

    const grpcRequest = {
      id,
      pincode: dto.pincode,
      city: dto.city,
      state: dto.state,
      is_serviceable: dto.isServiceable,
      eta_days: dto.etaDays,
      delivery_charge: dto.deliveryCharge,
    };

    console.log('[DeliveryZonesService] gRPC request:', JSON.stringify(grpcRequest));

    const response = await this.grpcClient.updateDeliveryZone(grpcRequest);
    return this.mapToResponse(response.delivery_zone);
  }

  async remove(id: string) {
    console.log('[DeliveryZonesService] remove id:', id);
    const response = await this.grpcClient.deleteDeliveryZone({ id });
    return { success: response.success };
  }

  private mapToResponse(zone: { id: string; pincode: string; city: string; state: string; is_serviceable: boolean; eta_days: number; delivery_charge: number; created_at: string }) {
    return {
      id: zone.id,
      pincode: zone.pincode,
      city: zone.city,
      state: zone.state,
      isServiceable: zone.is_serviceable,
      etaDays: zone.eta_days,
      deliveryCharge: zone.delivery_charge,
      createdAt: zone.created_at,
    };
  }
}
