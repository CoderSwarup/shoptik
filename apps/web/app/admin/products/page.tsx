'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Hash, TrendingUp, Loader2, Eye, EyeOff, Star, Filter } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductModal } from '@/components/products/ProductModal'
import { productsService, type Product } from '@/services/api'
import { cn } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [error, setError] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      setError('')
      const result = await productsService.getAll({ limit: 100 })
      setProducts(result.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load products')
      } else {
        setError('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  async function handleSubmit(data: {
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
  }) {
    setModalLoading(true)
    try {
      if (editingProduct) {
        // Update existing product
        const updated = await productsService.update(editingProduct.id, data)
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        )
      } else {
        // Create new product
        const created = await productsService.create(data)
        setProducts((prev) => [created, ...prev])
      }
      setModalOpen(false)
      setEditingProduct(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Operation failed')
      } else {
        alert('Operation failed')
      }
    } finally {
      setModalLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    setDeletingId(id)
    try {
      await productsService.delete(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Failed to delete product')
      } else {
        alert('Failed to delete product')
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function toggleActive(product: Product) {
    try {
      const updated = await productsService.update(product.id, {
        isActive: !product.isActive,
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
    } catch (err) {
      alert('Failed to update product status')
    }
  }

  async function toggleFeatured(product: Product) {
    try {
      const updated = await productsService.update(product.id, {
        isFeatured: !product.isFeatured,
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
    } catch (err) {
      alert('Failed to update featured status')
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.sku?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const matchesCategory = !categoryFilter || p.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.stock, 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const activeProducts = products.filter((p) => p.isActive).length
  const featuredProducts = products.filter((p) => p.isFeatured).length

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  return (
    <DashboardLayout title="Products" subtitle="Manage your inventory" role="ADMIN">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Products"
            value={products.length.toString()}
            icon={Package}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950/50"
            border="border-blue-200 dark:border-blue-800"
          />
          <StatCard
            label="Active"
            value={activeProducts.toString()}
            icon={Eye}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950/50"
            border="border-emerald-200 dark:border-emerald-800"
          />
          <StatCard
            label="Total Value"
            value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="text-violet-600 dark:text-violet-400"
            bg="bg-violet-50 dark:bg-violet-950/50"
            border="border-violet-200 dark:border-violet-800"
          />
          <StatCard
            label="Low Stock"
            value={lowStock.toString()}
            icon={TrendingUp}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-950/50"
            border="border-amber-200 dark:border-amber-800"
          />
          <StatCard
            label="Out of Stock"
            value={outOfStock.toString()}
            icon={Hash}
            color="text-red-600 dark:text-red-400"
            bg="bg-red-50 dark:bg-red-950/50"
            border="border-red-200 dark:border-red-800"
          />
        </div>

        {/* Actions bar */}
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat!} value={cat!}>
                      {cat!.charAt(0).toUpperCase() + cat!.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Button onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>

        {/* Products table/cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inventory ({filtered.length} products)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
                  {error}
                </div>
                <Button variant="outline" size="sm" onClick={loadProducts}>
                  Try Again
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search || categoryFilter ? 'No products match your filters' : 'No products yet'}
                </p>
                {!search && !categoryFilter && (
                  <Button size="sm" className="mt-4" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4" />
                    Add your first product
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((product) => (
                        <tr key={product.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted overflow-hidden">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{product.name}</p>
                                  {product.isFeatured && (
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                  )}
                                </div>
                                {product.sku && (
                                  <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-muted-foreground">
                              {product.category || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold">${parseFloat(product.price).toFixed(2)}</p>
                              {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                                <p className="text-xs text-muted-foreground line-through">
                                  ${parseFloat(product.compareAtPrice).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-amber-600' : ''}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              <StatusBadge stock={product.stock} />
                              {!product.isActive && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => toggleFeatured(product)}
                                title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                className={product.isFeatured ? 'text-amber-500' : ''}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => toggleActive(product)}
                                title={product.isActive ? 'Hide product' : 'Show product'}
                              >
                                {product.isActive ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenEdit(product)}
                                title="Edit product"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                title="Delete product"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                {deletingId === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-border lg:hidden">
                  {filtered.map((product) => (
                    <div key={product.id} className="flex flex-col gap-3 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{product.name}</p>
                            {product.isFeatured && (
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{product.category || 'General'}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                            <StatusBadge stock={product.stock} />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleFeatured(product)}
                          className={product.isFeatured ? 'text-amber-500' : ''}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleActive(product)}
                        >
                          {product.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
        loading={modalLoading}
      />
    </DashboardLayout>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  border,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
}) {
  return (
    <Card className={border}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2 ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Status Badge Component
function StatusBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
        Out of Stock
      </span>
    )
  }
  if (stock < 10) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        Low Stock
      </span>
    )
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      In Stock
    </span>
  )
}
