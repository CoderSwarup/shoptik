import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// ========== Delivery Zone Types ==========
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

// ========== Notification Types ==========
export interface Notification {
  id: string;
  user_id: string;
  role: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, string>;
  is_read: boolean;
  priority: string;
  created_at: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  role: string;
  type: string;
  title: string;
  message: string;
  payload: Record<string, string>;
  priority: string;
}

export interface CreateNotificationResponse {
  notification: Notification;
}

export interface ListUserNotificationsRequest {
  user_id: string;
  page: number;
  limit: number;
}

export interface ListUserNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unread_count: number;
}

export interface GetUnreadCountRequest {
  user_id: string;
}

export interface GetUnreadCountResponse {
  count: number;
}

export interface MarkAsReadRequest {
  user_id: string;
  notification_id: string;
}

export interface MarkAsReadResponse {
  success: boolean;
}

export interface MarkAllAsReadRequest {
  user_id: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  marked_count: number;
}

// ========== Order Log Types ==========
export interface OrderLog {
  id: string;
  order_id: string;
  user_id: string;
  event_type: string;
  title: string;
  message: string;
  metadata: Record<string, string>;
  timestamp: string;
  created_at: string;
}

export interface GetOrderLogsRequest {
  order_id: string;
  page: number;
  limit: number;
}

export interface GetOrderLogsResponse {
  logs: OrderLog[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAllOrderLogsRequest {
  page: number;
  limit: number;
  event_type?: string;
}

export interface GetAllOrderLogsResponse {
  logs: OrderLog[];
  total: number;
  page: number;
  limit: number;
}

export interface GetRecentLogsRequest {
  limit: number;
}

export interface GetRecentLogsResponse {
  logs: OrderLog[];
}

// ========== gRPC Service Interfaces ==========
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

interface GrpcNotificationService {
  createNotification(
    request: CreateNotificationRequest,
    callback: (error: grpc.ServiceError | null, response: CreateNotificationResponse) => void
  ): void;
  listUserNotifications(
    request: ListUserNotificationsRequest,
    callback: (error: grpc.ServiceError | null, response: ListUserNotificationsResponse) => void
  ): void;
  getUnreadCount(
    request: GetUnreadCountRequest,
    callback: (error: grpc.ServiceError | null, response: GetUnreadCountResponse) => void
  ): void;
  markAsRead(
    request: MarkAsReadRequest,
    callback: (error: grpc.ServiceError | null, response: MarkAsReadResponse) => void
  ): void;
  markAllAsRead(
    request: MarkAllAsReadRequest,
    callback: (error: grpc.ServiceError | null, response: MarkAllAsReadResponse) => void
  ): void;
}

interface GrpcOrderLogService {
  getOrderLogs(
    request: GetOrderLogsRequest,
    callback: (error: grpc.ServiceError | null, response: GetOrderLogsResponse) => void
  ): void;
  getAllOrderLogs(
    request: GetAllOrderLogsRequest,
    callback: (error: grpc.ServiceError | null, response: GetAllOrderLogsResponse) => void
  ): void;
  getRecentLogs(
    request: GetRecentLogsRequest,
    callback: (error: grpc.ServiceError | null, response: GetRecentLogsResponse) => void
  ): void;
}

@Injectable()
export class GrpcClientService implements OnModuleInit, OnModuleDestroy {
  private deliveryZoneClient: GrpcDeliveryZoneService | null = null;
  private notificationClient: GrpcNotificationService | null = null;
  private orderLogClient: GrpcOrderLogService | null = null;
  private grpcClient: grpc.Client | null = null;

  async onModuleInit() {
    const PROTO_PATH = join(process.cwd(), '..', '..', 'packages', 'proto', 'delivery_zone.proto');
    const NOTIFICATION_PROTO_PATH = join(process.cwd(), '..', '..', 'packages', 'proto', 'notification.proto');
    const ORDER_LOG_PROTO_PATH = join(process.cwd(), '..', '..', 'packages', 'proto', 'order_log.proto');

    console.log('[GrpcClient] Loading protos...');

    // Load delivery zone proto
    const packageDefinition = await protoLoader.load(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Load notification proto
    const notificationPackageDefinition = await protoLoader.load(NOTIFICATION_PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Load order log proto
    const orderLogPackageDefinition = await protoLoader.load(ORDER_LOG_PROTO_PATH, {
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

    const notificationProto = grpc.loadPackageDefinition(notificationPackageDefinition) as unknown as {
      shoptik: {
        NotificationService: new (
          address: string,
          credentials: grpc.ChannelCredentials
        ) => grpc.Client & GrpcNotificationService;
      };
    };

    const orderLogProto = grpc.loadPackageDefinition(orderLogPackageDefinition) as unknown as {
      shoptik: {
        OrderLogService: new (
          address: string,
          credentials: grpc.ChannelCredentials
        ) => grpc.Client & GrpcOrderLogService;
      };
    };

    const grpcUrl = process.env.GRPC_SERVICE_URL || 'localhost:5003';

    // Create clients for all services
    this.grpcClient = new proto.shoptik.DeliveryZoneService(
      grpcUrl,
      grpc.credentials.createInsecure()
    );
    this.deliveryZoneClient = this.grpcClient as unknown as GrpcDeliveryZoneService;

    const notificationGrpcClient = new notificationProto.shoptik.NotificationService(
      grpcUrl,
      grpc.credentials.createInsecure()
    );
    this.notificationClient = notificationGrpcClient as unknown as GrpcNotificationService;

    const orderLogGrpcClient = new orderLogProto.shoptik.OrderLogService(
      grpcUrl,
      grpc.credentials.createInsecure()
    );
    this.orderLogClient = orderLogGrpcClient as unknown as GrpcOrderLogService;

    console.log(`[GrpcClient] Connected to gRPC services at ${grpcUrl}`);
  }

  onModuleDestroy() {
    if (this.grpcClient) {
      this.grpcClient.close();
    }
  }

  // ========== Delivery Zone Methods ==========
  async createDeliveryZone(request: CreateDeliveryZoneRequest): Promise<CreateDeliveryZoneResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.createDeliveryZone(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getDeliveryZone(request: GetDeliveryZoneRequest): Promise<GetDeliveryZoneResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.getDeliveryZone(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getDeliveryZoneByPincode(request: GetDeliveryZoneByPincodeRequest): Promise<GetDeliveryZoneResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.getDeliveryZoneByPincode(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listDeliveryZones(request: ListDeliveryZonesRequest): Promise<ListDeliveryZonesResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.listDeliveryZones(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async updateDeliveryZone(request: UpdateDeliveryZoneRequest): Promise<UpdateDeliveryZoneResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.updateDeliveryZone(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async deleteDeliveryZone(request: DeleteDeliveryZoneRequest): Promise<DeleteDeliveryZoneResponse> {
    return new Promise((resolve, reject) => {
      this.deliveryZoneClient!.deleteDeliveryZone(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // ========== Notification Methods ==========
  async createNotification(request: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    return new Promise((resolve, reject) => {
      this.notificationClient!.createNotification(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listUserNotifications(request: ListUserNotificationsRequest): Promise<ListUserNotificationsResponse> {
    return new Promise((resolve, reject) => {
      this.notificationClient!.listUserNotifications(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getUnreadCount(request: GetUnreadCountRequest): Promise<GetUnreadCountResponse> {
    return new Promise((resolve, reject) => {
      this.notificationClient!.getUnreadCount(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    return new Promise((resolve, reject) => {
      this.notificationClient!.markAsRead(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async markAllAsRead(request: MarkAllAsReadRequest): Promise<MarkAllAsReadResponse> {
    return new Promise((resolve, reject) => {
      this.notificationClient!.markAllAsRead(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // ========== Order Log Methods ==========
  async getOrderLogs(request: GetOrderLogsRequest): Promise<GetOrderLogsResponse> {
    return new Promise((resolve, reject) => {
      this.orderLogClient!.getOrderLogs(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getAllOrderLogs(request: GetAllOrderLogsRequest): Promise<GetAllOrderLogsResponse> {
    return new Promise((resolve, reject) => {
      this.orderLogClient!.getAllOrderLogs(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getRecentLogs(request: GetRecentLogsRequest): Promise<GetRecentLogsResponse> {
    return new Promise((resolve, reject) => {
      this.orderLogClient!.getRecentLogs(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }
}
