'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, Loader2, MapPin, CreditCard, AlertCircle, User } from 'lucide-react'
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
    description: 'Order is pending payment or processing'
  },
  PROCESSING: {
    icon: Package,
    label: 'Processing',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: 'Order is being prepared'
  },
  SHIPPED: {
    icon: Truck,
    label: 'Shipped',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    description: 'Order is on the way'
  },
  DELIVERED: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    description: 'Order has been delivered'
  },
  CANCELLED: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-600',
    bg: 'bg-red-50',
    description: 'This order has been cancelled'
  },
}

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      setLoading(true)
      setError('')
      // Use getAllOrders and find the specific order since admin endpoint gets all
      const allOrders = await ordersService.getAllOrders()
      const foundOrder = allOrders.find(o => o.id === orderId)
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError('Order not found')
      }
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

  async function updateStatus(newStatus: string) {
    if (newStatus === order?.status) return

    setUpdating(true)
    try {
      await ordersService.updateStatus(orderId, newStatus as Order['status'])
      await loadOrder()
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Order Details" role="ADMIN">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Order Details" role="ADMIN">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            {error || 'Order not found'}
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  // Determine if status can be changed
  const isPaymentPending = !order.payment || order.payment.status === 'PENDING'
  const isOrderCancelled = order.status === 'CANCELLED'
  const isOrderDelivered = order.status === 'DELIVERED'
  const canChangeStatus = !isPaymentPending && !isOrderCancelled && !isOrderDelivered

  // Get available status options
  const getAvailableStatuses = () => {
    if (isPaymentPending) return ['PENDING']
    if (isOrderCancelled) return ['CANCELLED']
    if (isOrderDelivered) return ['DELIVERED']
    const currentIndex = statusOptions.indexOf(order.status)
    return statusOptions.slice(currentIndex)
  }

  return (
    <DashboardLayout title="Order Details" role="ADMIN">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
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

              {/* Status Update Control */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Update Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating || !canChangeStatus}
                  className={cn(
                    "rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    !canChangeStatus && "opacity-50 cursor-not-allowed"
                  )}
                  title={!canChangeStatus
                    ? isPaymentPending
                      ? "Payment pending - cannot change status"
                      : isOrderCancelled
                        ? "Order is cancelled"
                        : isOrderDelivered
                          ? "Order is delivered"
                          : "Cannot change status"
                    : "Change order status"
                  }
                >
                  {getAvailableStatuses().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>

            <div className={cn('mt-4 p-4 rounded-lg', status.bg)}>
              <p className={cn('text-sm', status.color)}>{status.description}</p>
            </div>

            {/* Payment Pending Warning */}
            {isPaymentPending && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800 font-medium">
                    Payment is pending. Order status cannot be updated until payment is completed.
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled/Delivered Notice */}
            {(isOrderCancelled || isOrderDelivered) && (
              <div className={cn(
                "mt-4 p-4 rounded-lg border",
                isOrderCancelled && "bg-red-50 border-red-200",
                isOrderDelivered && "bg-emerald-50 border-emerald-200"
              )}>
                <div className="flex items-center gap-2">
                  {isOrderCancelled ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                  <p className={cn(
                    "text-sm font-medium",
                    isOrderCancelled && "text-red-800",
                    isOrderDelivered && "text-emerald-800"
                  )}>
                    {isOrderCancelled
                      ? "This order has been cancelled. No further actions can be taken."
                      : "This order has been delivered. No further actions can be taken."}
                  </p>
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
                        <p className="font-semibold">{item.product?.name}</p>
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

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono">{order.userId}</p>
              </CardContent>
            </Card>
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
                    Payment Information
                  </h4>
                  {order.payment ? (
                    <div className="space-y-2 text-sm">
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
                    <p className="text-sm text-muted-foreground">No payment information available</p>
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
