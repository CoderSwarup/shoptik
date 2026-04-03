'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Package, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ordersService, type Order } from '@/services/api'

export default function OrderSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  useEffect(() => {
    // Trigger confetti after order loads
    if (order && !loading) {
      setTimeout(() => setShowConfetti(true), 300)
    }
  }, [order, loading])

  async function loadOrder() {
    try {
      const data = await ordersService.getById(orderId)
      setOrder(data)
    } catch (err) {
      console.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      <div className="mx-auto max-w-2xl">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-50 duration-500">
              <Check className="h-12 w-12 text-emerald-600 animate-in zoom-in-50 duration-500 delay-200" />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          </div>

          <h1 className="text-3xl font-bold mb-2 animate-in slide-in-from-bottom-4 duration-500">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-100">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{order?.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {order?.status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Order Items</h3>
              {order?.items?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${parseFloat(order?.totalAmount || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (18% GST)</span>
                <span>${(parseFloat(order?.totalAmount || '0') * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${(parseFloat(order?.totalAmount || '0') * 1.18).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order?.payment?.method}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  order?.payment?.status === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : order?.payment?.status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {order?.payment?.status}
                </span>
              </div>
              {order?.payment?.transactionId && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{order.payment.transactionId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <Button asChild className="flex-1">
            <Link href="/dashboard/orders">
              <Package className="h-4 w-4 mr-2" />
              View All Orders
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/dashboard/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Confetti Animation Component
function ConfettiAnimation() {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}
