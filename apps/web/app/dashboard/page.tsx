'use client'

import { ShoppingBag, Package, CreditCard, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'

const stats = [
  {
    label: 'Total Orders',
    value: '12',
    change: '+2 this month',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    label: 'Active Orders',
    value: '3',
    change: 'In progress',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    label: 'Total Spent',
    value: '$1,234',
    change: '+$89 this month',
    icon: CreditCard,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    label: 'Reward Points',
    value: '2,450',
    change: '+120 this week',
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
]

const recentOrders = [
  { id: 'ORD-001', product: 'Wireless Headphones', date: 'Jan 15, 2024', status: 'Delivered', total: '$129.99' },
  { id: 'ORD-002', product: 'Mechanical Keyboard', date: 'Jan 14, 2024', status: 'Shipped', total: '$89.50' },
  { id: 'ORD-003', product: 'USB-C Hub', date: 'Jan 12, 2024', status: 'Processing', total: '$45.00' },
  { id: 'ORD-004', product: 'Mouse Pad XL', date: 'Jan 10, 2024', status: 'Delivered', total: '$27.25' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  Delivered: { label: 'Delivered', className: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' },
  Shipped:   { label: 'Shipped',   className: 'text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300' },
  Processing:{ label: 'Processing',className: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300' },
}

export default function UserDashboardPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle={`Welcome back, ${user?.name ?? 'there'}!`}
      role="USER"
    >
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className={`border ${stat.border}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`mt-1 text-xs font-medium ${stat.color}`}>{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Recent Orders
            </CardTitle>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Order</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => {
                    const status = statusConfig[order.status]
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-6 py-4 font-mono text-xs font-medium text-primary">{order.id}</td>
                        <td className="px-6 py-4 font-medium">{order.product}</td>
                        <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{order.total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border sm:hidden">
              {recentOrders.map((order) => {
                const status = statusConfig[order.status]
                return (
                  <div key={order.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-primary">{order.id}</p>
                      <p className="truncate text-sm font-medium">{order.product}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      <span className="font-semibold">{order.total}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
