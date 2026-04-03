'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, Heart, Share2, Check, ChevronRight } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { productsService, type Product } from '@/services/api'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [addedToCart, setAddedToCart] = useState(false)
  
  const { addItem, isInCart } = useCart()

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    try {
      setLoading(true)
      setError('')
      const data = await productsService.getById(productId)
      setProduct(data)

      // Load related products from same category
      if (data.category) {
        try {
          const related = await productsService.getByCategory(data.category, 4)
          setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 3))
        } catch {
          // Ignore related products error
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('Product not found')
        } else {
          setError(err.response?.data?.message ?? 'Failed to load product')
        }
      } else {
        setError('Failed to load product')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleQuantityChange(delta: number) {
    if (!product) return
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty)
    }
  }

  function handleAddToCart() {
    if (!product) return
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading..." role="USER">
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !product) {
    return (
      <DashboardLayout title="Error" role="USER">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            {error || 'Product not found'}
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price)
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(product.compareAtPrice!) - parseFloat(product.price)) / parseFloat(product.compareAtPrice!)) * 100)
    : 0

  return (
    <DashboardLayout title={product.name} subtitle="Product Details" role="USER">
      <div className="space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/products')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/40" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.stock === 0 && (
                    <span className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white">
                      Out of Stock
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-medium text-white">
                      Save {discountPercent}%
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
            )}

            {/* Name */}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">${parseFloat(product.price).toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ${parseFloat(product.compareAtPrice!).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    In Stock
                  </span>
                  {product.stock <= 10 && (
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      - Only {product.stock} left
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-lg font-semibold">
                      Total: ${(parseFloat(product.price) * quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button 
                      size="lg" 
                      className="flex-1 gap-2" 
                      onClick={handleAddToCart}
                      disabled={addedToCart}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-5 w-5" />
                          Added to Cart!
                        </>
                      ) : isInCart(product.id) ? (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add More to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2" asChild>
                      <Link href="/dashboard/cart">
                        <ShoppingCart className="h-5 w-5" />
                        View Cart
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">Product Information</h3>
                <div className="grid gap-2 text-sm">
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU</span>
                      <span className="font-mono">{product.sku}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="capitalize">{product.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className={product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Related Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/dashboard/products/${p.id}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    <div className="flex gap-4 p-4">
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium line-clamp-1 group-hover:text-primary">
                          {p.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                        <p className="mt-1 font-semibold">${parseFloat(p.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
