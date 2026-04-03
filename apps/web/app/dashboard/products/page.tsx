'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Package, Filter, X, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productsService, type Product, type Category } from '@/services/api'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 12

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'name'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, inStockOnly, sortBy, sortOrder, page])

  async function loadCategories() {
    try {
      const data = await productsService.getCategories()
      setCategories(data)
    } catch (err) {
      // Silently fail - categories are optional
    }
  }

  async function loadProducts() {
    try {
      setLoading(true)
      setError('')

      const result = await productsService.getAll({
        category: selectedCategory ?? undefined,
        inStock: inStockOnly || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
        limit: ITEMS_PER_PAGE,
        offset: page * ITEMS_PER_PAGE,
      })

      setProducts(result.data)
      setTotal(result.pagination.total)
      setHasMore(result.pagination.hasMore)
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    loadProducts()
  }

  function clearFilters() {
    setSearch('')
    setSelectedCategory(null)
    setInStockOnly(false)
    setSortBy('createdAt')
    setSortOrder('desc')
    setPage(0)
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const hasActiveFilters = search || selectedCategory || inStockOnly

  return (
    <DashboardLayout title="Products" subtitle="Browse our catalog" role="USER">
      <div className="space-y-6">

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && 'bg-muted')}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={selectedCategory ?? ''}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value || null)
                      setPage(0)
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* In Stock Only */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Availability</label>
                  <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked)
                        setPage(0)
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
              {error}
            </div>
            <Button variant="outline" size="sm" onClick={loadProducts}>
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Check back later for new products'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart()
  const [added, setAdded] = useState(false)
  
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price)
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(product.compareAtPrice!) - parseFloat(product.price)) / parseFloat(product.compareAtPrice!)) * 100)
    : 0
  
  const inCart = isInCart(product.id)
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock > 0) {
      addItem(product, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <Link href={`/dashboard/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.stock === 0 && (
              <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                Out of Stock
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${parseFloat(product.compareAtPrice!).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Only {product.stock} left in stock
            </p>
          )}
          
          {/* Add to Cart Button */}
          {product.stock > 0 && (
            <Button
              size="sm"
              className="w-full mt-3"
              variant={inCart ? "outline" : "default"}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added!
                </>
              ) : inCart ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add More
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
