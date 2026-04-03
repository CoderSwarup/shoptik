'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, ShoppingBag } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, totalAmount, itemCount } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = (productId: string) => {
    setRemovingId(productId)
    setTimeout(() => {
      removeItem(productId)
      setRemovingId(null)
    }, 200)
  }

  if (items.length === 0) {
    return (
      <DashboardLayout title="Shopping Cart" subtitle="Your cart is empty" role="USER">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">
            Looks like you haven't added anything to your cart yet. Browse our products and find something you like!
          </p>
          <Button size="lg" onClick={() => router.push('/dashboard/products')}>
            <ShoppingBag className="h-5 w-5 mr-2" />
            Browse Products
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Shopping Cart" subtitle={`${itemCount} item${itemCount !== 1 ? 's' : ''}`} role="USER">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card
              key={item.product.id}
              className={cn(
                'overflow-hidden transition-all duration-200',
                removingId === item.product.id && 'opacity-0 scale-95'
              )}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-muted overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/products/${item.product.id}`}
                      className="font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.product.category || 'General'}
                    </p>
                    <p className="text-lg font-bold mt-1">
                      ${parseFloat(item.product.price).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.product.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push('/dashboard/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard/products')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
