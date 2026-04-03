'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Product } from '@/services/api'

const CATEGORIES = [
  'electronics',
  'clothing',
  'accessories',
  'home',
  'sports',
  'books',
  'toys',
  'general',
]

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    imageUrl: string
    category: string
    price: number
    compareAtPrice: number | undefined
    stock: number
    sku: string
    isActive: boolean
    isFeatured: boolean
  }) => Promise<void>
  product?: Product | null
  loading?: boolean
}

export function ProductModal({ open, onClose, onSubmit, product, loading }: ProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('general')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [stock, setStock] = useState('')
  const [sku, setSku] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description ?? '')
      setImageUrl(product.imageUrl ?? '')
      setCategory(product.category ?? 'general')
      setPrice(product.price)
      setCompareAtPrice(product.compareAtPrice ?? '')
      setStock(product.stock.toString())
      setSku(product.sku ?? '')
      setIsActive(product.isActive ?? true)
      setIsFeatured(product.isFeatured ?? false)
    } else {
      setName('')
      setDescription('')
      setImageUrl('')
      setCategory('general')
      setPrice('')
      setCompareAtPrice('')
      setStock('')
      setSku('')
      setIsActive(true)
      setIsFeatured(false)
    }
    setErrors({})
  }, [product, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!price) {
      newErrors.price = 'Price is required'
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Price must be a valid positive number'
    }

    if (compareAtPrice && (isNaN(parseFloat(compareAtPrice)) || parseFloat(compareAtPrice) < 0)) {
      newErrors.compareAtPrice = 'Compare at price must be a valid positive number'
    }

    if (!stock) {
      newErrors.stock = 'Stock is required'
    } else if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      newErrors.stock = 'Stock must be a valid non-negative integer'
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = 'Image URL must be a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      category,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      stock: parseInt(stock),
      sku: sku.trim(),
      isActive,
      isFeatured,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Wireless Headphones"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant={errors.name ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
              className="px-3 py-2"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              variant={errors.imageUrl ? 'error' : 'default'}
              disabled={loading}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Compare at Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                variant={errors.price ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                variant={errors.compareAtPrice ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.compareAtPrice && (
                <p className="text-xs text-destructive">{errors.compareAtPrice}</p>
              )}
            </div>
          </div>

          {/* Stock & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                variant={errors.stock ? 'error' : 'default'}
                disabled={loading}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                type="text"
                placeholder="SKU-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Active (visible to customers)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Featured (highlighted on homepage)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex gap-3 pt-4 border-t border-border bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
