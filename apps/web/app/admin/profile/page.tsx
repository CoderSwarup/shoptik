'use client'

import { UserCircle, Mail, ShieldCheck, Calendar, Hash, Activity, Users, ShoppingCart, DollarSign } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 px-5 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

const adminStats = [
  { label: 'Users Managed',   value: '1,234', icon: Users },
  { label: 'Orders Handled',  value: '2,350', icon: ShoppingCart },
  { label: 'Revenue Tracked', value: '$45,231', icon: DollarSign },
  { label: 'Uptime',          value: '99.9%', icon: Activity },
]

export default function AdminProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <DashboardLayout title="Admin Profile" subtitle="Your administrator account" role="ADMIN">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Avatar card */}
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 py-10 sm:flex-row sm:gap-6 sm:px-8 sm:py-8">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Administrator
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {adminStats.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label}>
                <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Account info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={UserCircle}  label="Full Name"      value={user.name} />
            <InfoRow icon={Mail}        label="Email Address"  value={user.email} />
            <InfoRow icon={ShieldCheck} label="Role"           value="Administrator" />
            <InfoRow icon={Hash}        label="Admin ID"       value={user.id} />
            <InfoRow icon={Calendar}    label="Member Since"   value={joinedDate} />
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
