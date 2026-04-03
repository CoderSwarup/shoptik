import { apiClient } from '@/lib/api-client'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: string
  product?: {
    id: string
    name: string
    imageUrl: string | null
  }
}

export interface Order {
  id: string
  userId: string
  addressId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: string
  createdAt: string
  updatedAt: string | null
  items?: OrderItem[]
  address?: {
    fullName: string
    phone: string
    addressLine: string
    city: string
    state: string
    pincode: string
  }
  payment?: {
    id: string
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    method: 'UPI' | 'CARD' | 'COD'
    transactionId: string | null
  }
}

export interface CreateOrderInput {
  addressId: string
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  paymentMethod: 'UPI' | 'CARD' | 'COD'
}

export interface PaymentInput {
  orderId: string
  method: 'UPI' | 'CARD' | 'COD'
}

export const ordersService = {
  async getAll(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders')
    return data
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`)
    return data
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', input)
    return data
  },

  async processPayment(orderId: string, method: 'UPI' | 'CARD' | 'COD'): Promise<{ success: boolean; transactionId?: string }> {
    const { data } = await apiClient.post<{ success: boolean; transactionId?: string }>(`/orders/${orderId}/pay`, { method })
    return data
  },

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post<Order>(`/orders/${id}/cancel`)
    return data
  },

  // Admin only
  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${id}/status`, { status })
    return data
  },

  async getAllOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders/all')
    return data
  },
}
