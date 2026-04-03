'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, Truck, CheckCircle, XCircle, Loader2, ChevronDown, Filter, Eye, CreditCard } from 'lucide-react'
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

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')
      const data = await ordersService.getAllOrders()
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

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    try {
      await ordersService.updateStatus(orderId, newStatus as Order['status'])
      await loadOrders()
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter)

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  }

  if (loading) {
    return (
      <DashboardLayout title="Orders" subtitle="Manage all orders" role="ADMIN">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Orders" subtitle="Manage all orders" role="ADMIN">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Pending" value={stats.pending} color="text-amber-600" bg="bg-amber-50" />
          <StatCard label="Processing" value={stats.processing} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Shipped" value={stats.shipped} color="text-violet-600" bg="bg-violet-50" />
          <StatCard label="Delivered" value={stats.delivered} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard label="Cancelled" value={stats.cancelled} color="text-red-600" bg="bg-red-50" />
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by status:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="ALL">All Orders</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
                  {error}
                </div>
                <Button variant="outline" onClick={loadOrders}>Try Again</Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left">
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Order ID</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Items</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Status</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => {
                      const status = statusConfig[order.status]
                      const StatusIcon = status.icon

                      // Determine if status can be changed
                      const isPaymentPending = !order.payment || order.payment.status === 'PENDING'
                      const isOrderCancelled = order.status === 'CANCELLED'
                      const isOrderDelivered = order.status === 'DELIVERED'
                      const canChangeStatus = !isPaymentPending && !isOrderCancelled && !isOrderDelivered

                      // Get available status options based on current state
                      const getAvailableStatuses = () => {
                        if (isPaymentPending) return ['PENDING']
                        if (isOrderCancelled) return ['CANCELLED']
                        if (isOrderDelivered) return ['DELIVERED']
                        // Normal flow: PENDING -> PROCESSING -> SHIPPED -> DELIVERED
                        // Can also cancel from PENDING or PROCESSING
                        const currentIndex = statusOptions.indexOf(order.status)
                        const nextStatuses = statusOptions.slice(currentIndex)
                        return nextStatuses
                      }

                      return (
                        <tr key={order.id} className="hover:bg-muted/30">
                          <td className="px-6 py-4 font-mono">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {order.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{order.userId.slice(0, 8)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            ${(parseFloat(order.totalAmount) * 1.18).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {order.payment ? (
                              <span className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                order.payment.status === 'SUCCESS' && 'bg-emerald-50 text-emerald-600',
                                order.payment.status === 'FAILED' && 'bg-red-50 text-red-600',
                                order.payment.status === 'PENDING' && 'bg-amber-50 text-amber-600'
                              )}>
                                <CreditCard className="h-3 w-3" />
                                {order.payment.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                No Payment
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                disabled={updatingId === order.id || !canChangeStatus}
                                className={cn(
                                  "rounded-lg border border-input bg-background px-2 py-1 text-xs",
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
                              {updatingId === order.id && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2 ${bg}`}>
          <Package className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
