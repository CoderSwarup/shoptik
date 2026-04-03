import { apiClient } from '@/lib/api-client'

export interface DeliveryZone {
  id: string
  pincode: string
  city: string
  state: string
  isServiceable: boolean
  etaDays: number
  deliveryCharge: number
  createdAt: string
}

export interface DeliveryZonesResponse {
  data: DeliveryZone[]
  total: number
  page: number
  limit: number
}

export interface CreateDeliveryZoneInput {
  pincode: string
  city: string
  state: string
  isServiceable: boolean
  etaDays: number
  deliveryCharge: number
}

export type UpdateDeliveryZoneInput = Partial<CreateDeliveryZoneInput>

export const deliveryZonesService = {
  async getAll(page = 1, limit = 10): Promise<DeliveryZonesResponse> {
    const { data } = await apiClient.get<DeliveryZonesResponse>(
      `/admin/delivery-zones?page=${page}&limit=${limit}`
    )
    return data
  },

  async getById(id: string): Promise<DeliveryZone> {
    const { data } = await apiClient.get<DeliveryZone>(`/admin/delivery-zones/${id}`)
    return data
  },

  async create(input: CreateDeliveryZoneInput): Promise<DeliveryZone> {
    const { data } = await apiClient.post<DeliveryZone>('/admin/delivery-zones', input)
    return data
  },

  async update(id: string, input: UpdateDeliveryZoneInput): Promise<DeliveryZone> {
    const { data } = await apiClient.patch<DeliveryZone>(`/admin/delivery-zones/${id}`, input)
    return data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/delivery-zones/${id}`)
  },
}
