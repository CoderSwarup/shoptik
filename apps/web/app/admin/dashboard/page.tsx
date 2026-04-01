'use client'

import {
  Users, ShoppingBag, DollarSign, Activity,
  ArrowUpRight, Package, CreditCard, Radio,
  ShoppingCart, AlertTriangle,
} from 'lucide-react'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const stats = [
  {
    label: 'Total Revenue',
    value: '$45,231',
    change: '+20.1% vs last month',
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    label: 'Total Orders',
    value: '2,350',
    change: '+15.3% vs last month',
    icon: ShoppingCart,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    label: 'Active Users',
    value: '1,234',
    change: '+8.2% vs last month',
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    label: 'Uptime',
    value: '99.9%',
    change: 'All systems operational',
    icon: Activity,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-green-200 dark:border-green-800',
  },
]

const recentActivity = [
  { time: '2 min ago',  event: 'New order #ORD-8821 placed by user:4491', type: 'order',   icon: ShoppingBag },
  { time: '5 min ago',  event: 'User john@example.com registered',          type: 'user',    icon: Users },
  { time: '12 min ago', event: 'Payment received for #ORD-8819 — $245.00', type: 'payment', icon: CreditCard },
  { time: '18 min ago', event: 'Low stock alert: SKU-992 (12 units left)',  type: 'warning', icon: AlertTriangle },
  { time: '25 min ago', event: 'Order #ORD-8817 shipped via FedEx',         type: 'order',   icon: Package },
  { time: '31 min ago', event: 'SSE stream reconnected — go-service',       type: 'system',  icon: Radio },
]

const activityConfig: Record<string, { dot: string; badge: string }> = {
  order:   { dot: 'bg-blue-500',   badge: 'text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300' },
  user:    { dot: 'bg-violet-500', badge: 'text-violet-700 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300' },
  payment: { dot: 'bg-emerald-500',badge: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' },
  warning: { dot: 'bg-amber-500',  badge: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300' },
  system:  { dot: 'bg-slate-400',  badge: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
}

const quickStats = [
  { label: 'Orders Today',     value: '127', icon: ShoppingCart },
  { label: 'Revenue Today',    value: '$3,847', icon: DollarSign },
  { label: 'Pending Orders',   value: '23', icon: Package },
  { label: 'Active Sessions',  value: '89', icon: Users },
]

export default function AdminDashboardPage() {
  return (
    <DashboardLayout title="Admin Overview" subtitle="System-wide statistics" role="ADMIN">
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

        <div className="grid gap-6 lg:grid-cols-5">

          {/* Recent Activity — wider */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pb-2">
              {recentActivity.map((item, i) => {
                const cfg = activityConfig[item.type]
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/40">
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {item.type}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Quick Stats — narrower */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickStats.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      {s.label}
                    </div>
                    <span className="text-base font-bold">{s.value}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
