import { apiClient } from '@/lib/api-client'

export interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
  price: string
  compareAtPrice: string | null
  stock: number
  sku: string | null
  isActive: boolean | null
  isFeatured: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

export interface ProductQueryParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  sortBy?: 'price' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ProductsResponse {
  data: Product[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface CreateProductInput {
  name: string
  description?: string
  imageUrl?: string
  category?: string
  price: number
  compareAtPrice?: number
  stock: number
  sku?: string
  isActive?: boolean
  isFeatured?: boolean
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface Category {
  name: string
  count: number
}

export const productsService = {
  async getAll(params?: ProductQueryParams): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.category) queryParams.append('category', params.category)
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString())
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
    if (params?.inStock) queryParams.append('inStock', 'true')
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const { data } = await apiClient.get<ProductsResponse>(`/products?${queryParams.toString()}`)
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  async getFeatured(limit?: number): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(`/products/featured${limit ? `?limit=${limit}` : ''}`)
    return data
  },

  async search(query: string, limit?: number): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`)
    return data
  },

  async getByCategory(category: string, limit?: number): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(`/products/category/${category}${limit ? `?limit=${limit}` : ''}`)
    return data
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/products/categories')
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
