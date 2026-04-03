'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, Loader2, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ordersService, type Order } from '@/services/api'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; description: string }> = {
  PENDING: { 
    icon: Clock, 
    label: 'Pending', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    description: 'Your order is being processed'
  },
  PROCESSING: { 
    icon: Package, 
    label: 'Processing', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    description: 'Your order is being prepared'
  },
  SHIPPED: { 
    icon: Truck, 
    label: 'Shipped', 
    color: 'text-violet-600', 
    bg: 'bg-violet-50',
    description: 'Your order is on the way'
  },
  DELIVERED: { 
    icon: CheckCircle, 
    label: 'Delivered', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    description: 'Your order has been delivered'
  },
  CANCELLED: { 
    icon: XCircle, 
    label: 'Cancelled', 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    description: 'This order has been cancelled'
  },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      setLoading(true)
      setError('')
      const data = await ordersService.getById(orderId)
      setOrder(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load order')
      } else {
        setError('Failed to load order')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    try {
      await ordersService.cancelOrder(orderId)
      await loadOrder()
    } catch (err) {
      alert('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Order Details" role="USER">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Order Details" role="USER">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            {error || 'Order not found'}
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon
  const canCancel = ['PENDING', 'PROCESSING'].includes(order.status)

  return (
    <DashboardLayout title="Order Details" role="USER">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/dashboard/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        {/* Order Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                  <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', status.bg, status.color)}>
                    <StatusIcon className="h-4 w-4" />
                    {status.label}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {canCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-destructive hover:bg-destructive/10"
                >
                  {cancelling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancel Order
                </Button>
              )}
            </div>

            <div className={cn('mt-4 p-4 rounded-lg', status.bg)}>
              <p className={cn('text-sm', status.color)}>{status.description}</p>
            </div>

            {/* Payment Alert */}
            {(!order.payment || order.payment.status === 'PENDING') && order.status !== 'CANCELLED' && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">Payment Pending</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Complete your payment to process this order.
                    </p>
                  </div>
                  <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
                    <Link href={`/dashboard/orders/${order.id}/pay`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items?.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden">
                        {item.product?.imageUrl ? (
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
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/products/${item.productId}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${parseFloat(item.price).toFixed(2)} each</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{order.address.fullName}</p>
                  <p className="text-muted-foreground">{order.address.phone}</p>
                  <p className="mt-2">{order.address.addressLine}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                </CardContent>
              </Card>
            )}
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
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span>${(parseFloat(order.totalAmount) * 0.18).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">${(parseFloat(order.totalAmount) * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </h4>
                  {order.payment ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span>{order.payment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className={cn(
                          'font-medium',
                          order.payment.status === 'SUCCESS' && 'text-emerald-600',
                          order.payment.status === 'FAILED' && 'text-red-600',
                          order.payment.status === 'PENDING' && 'text-amber-600',
                        )}>
                          {order.payment.status}
                        </span>
                      </div>
                      {order.payment.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transaction ID</span>
                          <span className="font-mono text-xs">{order.payment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payment information</p>
                  )}

                  {/* Complete Payment Button */}
                  {(!order.payment || order.payment.status === 'PENDING') && order.status !== 'CANCELLED' && (
                    <Button size="sm" asChild className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700">
                      <Link href={`/dashboard/orders/${order.id}/pay`}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Complete Payment
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
