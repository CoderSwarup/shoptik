import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// Types for gRPC messages
export interface DeliveryZone {
  id: string;
  pincode: string;
  city: string;
  state: string;
  is_serviceable: boolean;
  eta_days: number;
  delivery_charge: number;
  created_at: string;
}

export interface ListDeliveryZonesRequest {
  page: number;
  limit: number;
}

export interface ListDeliveryZonesResponse {
  delivery_zones: DeliveryZone[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateDeliveryZoneRequest {
  pincode: string;
  city: string;
  state: string;
  is_serviceable: boolean;
  eta_days: number;
  delivery_charge: number;
}

export interface CreateDeliveryZoneResponse {
  delivery_zone: DeliveryZone;
}

export interface GetDeliveryZoneRequest {
  id: string;
}

export interface GetDeliveryZoneResponse {
  delivery_zone: DeliveryZone;
}

export interface GetDeliveryZoneByPincodeRequest {
  pincode: string;
}

export interface UpdateDeliveryZoneRequest {
  id: string;
  pincode?: string;
  city?: string;
  state?: string;
  is_serviceable?: boolean;
  eta_days?: number;
  delivery_charge?: number;
}

export interface UpdateDeliveryZoneResponse {
  delivery_zone: DeliveryZone;
}

export interface DeleteDeliveryZoneRequest {
  id: string;
}

export interface DeleteDeliveryZoneResponse {
  success: boolean;
}

// gRPC Service Client interface (callback-based)
interface GrpcDeliveryZoneService {
  createDeliveryZone(
    request: CreateDeliveryZoneRequest,
    callback: (error: grpc.ServiceError | null, response: CreateDeliveryZoneResponse) => void
  ): void;

  getDeliveryZone(
    request: GetDeliveryZoneRequest,
    callback: (error: grpc.ServiceError | null, response: GetDeliveryZoneResponse) => void
  ): void;

  getDeliveryZoneByPincode(
    request: GetDeliveryZoneByPincodeRequest,
    callback: (error: grpc.ServiceError | null, response: GetDeliveryZoneResponse) => void
  ): void;

  listDeliveryZones(
    request: ListDeliveryZonesRequest,
    callback: (error: grpc.ServiceError | null, response: ListDeliveryZonesResponse) => void
  ): void;

  updateDeliveryZone(
    request: UpdateDeliveryZoneRequest,
    callback: (error: grpc.ServiceError | null, response: UpdateDeliveryZoneResponse) => void
  ): void;

  deleteDeliveryZone(
    request: DeleteDeliveryZoneRequest,
    callback: (error: grpc.ServiceError | null, response: DeleteDeliveryZoneResponse) => void
  ): void;
}

@Injectable()
export class GrpcClientService implements OnModuleInit, OnModuleDestroy {
  private client: GrpcDeliveryZoneService | null = null;
  private grpcClient: grpc.Client | null = null;

  async onModuleInit() {
    const PROTO_PATH = join(process.cwd(), '..', '..', 'packages', 'proto', 'delivery_zone.proto');

    console.log('[GrpcClient] Loading proto from:', PROTO_PATH);

    const packageDefinition = await protoLoader.load(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as {
      shoptik: {
        DeliveryZoneService: new (
          address: string,
          credentials: grpc.ChannelCredentials
        ) => grpc.Client & GrpcDeliveryZoneService;
      };
    };

    const grpcUrl = process.env.GRPC_SERVICE_URL || 'localhost:5003';
    this.grpcClient = new proto.shoptik.DeliveryZoneService(
      grpcUrl,
      grpc.credentials.createInsecure()
    );

    this.client = this.grpcClient as unknown as GrpcDeliveryZoneService;
    console.log(`[GrpcClient] Connected to gRPC service at ${grpcUrl}`);
  }

  onModuleDestroy() {
    if (this.grpcClient) {
      this.grpcClient.close();
    }
  }

  // Promisified wrapper methods with logging
  async createDeliveryZone(request: CreateDeliveryZoneRequest): Promise<CreateDeliveryZoneResponse> {
    console.log('[GrpcClient] createDeliveryZone request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.createDeliveryZone(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] createDeliveryZone error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] createDeliveryZone response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }

  async getDeliveryZone(request: GetDeliveryZoneRequest): Promise<GetDeliveryZoneResponse> {
    console.log('[GrpcClient] getDeliveryZone request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.getDeliveryZone(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] getDeliveryZone error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] getDeliveryZone response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }

  async getDeliveryZoneByPincode(request: GetDeliveryZoneByPincodeRequest): Promise<GetDeliveryZoneResponse> {
    console.log('[GrpcClient] getDeliveryZoneByPincode request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.getDeliveryZoneByPincode(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] getDeliveryZoneByPincode error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] getDeliveryZoneByPincode response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }

  async listDeliveryZones(request: ListDeliveryZonesRequest): Promise<ListDeliveryZonesResponse> {
    console.log('[GrpcClient] listDeliveryZones request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.listDeliveryZones(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] listDeliveryZones error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] listDeliveryZones response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }

  async updateDeliveryZone(request: UpdateDeliveryZoneRequest): Promise<UpdateDeliveryZoneResponse> {
    console.log('[GrpcClient] updateDeliveryZone request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.updateDeliveryZone(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] updateDeliveryZone error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] updateDeliveryZone response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }

  async deleteDeliveryZone(request: DeleteDeliveryZoneRequest): Promise<DeleteDeliveryZoneResponse> {
    console.log('[GrpcClient] deleteDeliveryZone request:', JSON.stringify(request));
    return new Promise((resolve, reject) => {
      this.client!.deleteDeliveryZone(request, (error, response) => {
        if (error) {
          console.error('[GrpcClient] deleteDeliveryZone error:', error.message);
          reject(error);
        } else {
          console.log('[GrpcClient] deleteDeliveryZone response:', JSON.stringify(response));
          resolve(response);
        }
      });
    });
  }
}
