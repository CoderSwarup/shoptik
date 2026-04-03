// DeliveryZone represents a serviceable delivery area
export interface DeliveryZone {
  id: string;
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  etaDays: number;
  deliveryCharge: number;
  createdAt: string;
}

// CreateDeliveryZoneRequest
export interface CreateDeliveryZoneRequest {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  etaDays: number;
  deliveryCharge: number;
}

// CreateDeliveryZoneResponse
export interface CreateDeliveryZoneResponse {
  deliveryZone: DeliveryZone;
}

// GetDeliveryZoneRequest
export interface GetDeliveryZoneRequest {
  id: string;
}

// GetDeliveryZoneResponse
export interface GetDeliveryZoneResponse {
  deliveryZone: DeliveryZone;
}

// GetDeliveryZoneByPincodeRequest
export interface GetDeliveryZoneByPincodeRequest {
  pincode: string;
}

// ListDeliveryZonesRequest
export interface ListDeliveryZonesRequest {
  page: number;
  limit: number;
}

// ListDeliveryZonesResponse
export interface ListDeliveryZonesResponse {
  deliveryZones: DeliveryZone[];
  total: number;
  page: number;
  limit: number;
}

// UpdateDeliveryZoneRequest
export interface UpdateDeliveryZoneRequest {
  id: string;
  pincode?: string;
  city?: string;
  state?: string;
  isServiceable?: boolean;
  etaDays?: number;
  deliveryCharge?: number;
}

// UpdateDeliveryZoneResponse
export interface UpdateDeliveryZoneResponse {
  deliveryZone: DeliveryZone;
}

// DeleteDeliveryZoneRequest
export interface DeleteDeliveryZoneRequest {
  id: string;
}

// DeleteDeliveryZoneResponse
export interface DeleteDeliveryZoneResponse {
  success: boolean;
}

// DeliveryZoneServiceClient interface
export interface DeliveryZoneServiceClient {
  createDeliveryZone(
    request: CreateDeliveryZoneRequest
  ): Promise<CreateDeliveryZoneResponse>;

  getDeliveryZone(request: GetDeliveryZoneRequest): Promise<GetDeliveryZoneResponse>;

  getDeliveryZoneByPincode(
    request: GetDeliveryZoneByPincodeRequest
  ): Promise<GetDeliveryZoneResponse>;

  listDeliveryZones(
    request: ListDeliveryZonesRequest
  ): Promise<ListDeliveryZonesResponse>;

  updateDeliveryZone(
    request: UpdateDeliveryZoneRequest
  ): Promise<UpdateDeliveryZoneResponse>;

  deleteDeliveryZone(
    request: DeleteDeliveryZoneRequest
  ): Promise<DeleteDeliveryZoneResponse>;
}
