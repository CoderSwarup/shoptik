'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, Truck, CheckCircle, XCircle, Loader2, Eye, ChevronRight, CreditCard } from 'lucide-react'
import axios from 'axios'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ordersService, type Order } from '@/services/api'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  PENDING: { icon: Clock, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  PROCESSING: { icon: Package, label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50' },
  SHIPPED: { icon: Truck, label: 'Shipped', color: 'text-violet-600', bg: 'bg-violet-50' },
  DELIVERED: { icon: CheckCircle, label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to load orders')
      } else {
        setError('Failed to load orders')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="My Orders" role="USER">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="My Orders" role="USER">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            {error}
          </div>
          <Button variant="outline" onClick={loadOrders}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (orders.length === 0) {
    return (
      <DashboardLayout title="My Orders" subtitle="No orders yet" role="USER">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Button onClick={() => window.location.href = '/dashboard/products'}>
            Browse Products
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Orders" subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`} role="USER">
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const StatusIcon = status.icon
          const firstItem = order.items?.[0]
          const itemCount = order.items?.length || 0

          return (
            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Order Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full', status.bg)}>
                        <StatusIcon className={cn('h-4 w-4', status.color)} />
                        <span className={cn('text-sm font-medium', status.color)}>{status.label}</span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                        {firstItem?.product?.imageUrl ? (
                          <img
                            src={firstItem.product.imageUrl}
                            alt={firstItem.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {firstItem?.product?.name}
                          {itemCount > 1 && (
                            <span className="text-muted-foreground"> +{itemCount - 1} more</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 p-6 md:w-48 bg-muted/30 border-t md:border-t-0 md:border-l">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">${(parseFloat(order.totalAmount) * 1.18).toFixed(2)}</p>
                      {order.payment && (
                        <p className={cn(
                          'text-xs mt-1',
                          order.payment.status === 'SUCCESS' ? 'text-emerald-600' :
                          order.payment.status === 'FAILED' ? 'text-red-600' : 'text-amber-600'
                        )}>
                          Payment: {order.payment.status}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {(!order.payment || order.payment.status === 'PENDING') && order.status !== 'CANCELLED' && (
                        <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700">
                          <Link href={`/dashboard/orders/${order.id}/pay`}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Complete Payment
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
