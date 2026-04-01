import { apiClient } from '@/lib/api-client'

export interface Product {
  id: string
  name: string
  description: string | null
  price: string
  stock: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock: number
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products')
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  async create(input: CreateProductInput): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', input)
    return data
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, input)
    return data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },
}
