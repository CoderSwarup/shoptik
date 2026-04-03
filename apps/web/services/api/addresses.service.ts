import { apiClient } from '@/lib/api-client'

export interface Address {
  id: string
  userId: string | null
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  pincode: string
  isDefault: boolean | null
  createdAt: string | null
  deliveryInfo?: {
    etaDays: number
    deliveryCharge: number
  }
}

export interface PincodeValidation {
  valid: boolean
  serviceable: boolean
  city: string | null
  state: string | null
  etaDays: number | null
  deliveryCharge: number | null
}

export interface CreateAddressInput {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export type UpdateAddressInput = Partial<CreateAddressInput>

export const addressesService = {
  async getAll(): Promise<Address[]> {
    const { data } = await apiClient.get<Address[]>('/addresses')
    return data
  },

  async getById(id: string): Promise<Address> {
    const { data } = await apiClient.get<Address>(`/addresses/${id}`)
    return data
  },

  async getDefault(): Promise<Address | null> {
    const { data } = await apiClient.get<Address | null>('/addresses/default')
    return data
  },

  async validatePincode(pincode: string): Promise<PincodeValidation> {
    const { data } = await apiClient.get<PincodeValidation>(
      `/addresses/validate-pincode?pincode=${pincode}`
    )
    return data
  },

  async create(input: CreateAddressInput): Promise<Address> {
    const { data } = await apiClient.post<Address>('/addresses', input)
    return data
  },

  async update(id: string, input: UpdateAddressInput): Promise<Address> {
    const { data } = await apiClient.put<Address>(`/addresses/${id}`, input)
    return data
  },

  async setDefault(id: string): Promise<Address> {
    const { data } = await apiClient.put<Address>(`/addresses/${id}/default`)
    return data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`)
  },
}
