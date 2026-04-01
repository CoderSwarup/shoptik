'use client'

import { UserCircle, Mail, ShieldCheck, Calendar, Hash, Pencil } from 'lucide-react'

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

export default function UserProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <DashboardLayout title="My Profile" subtitle="Your account details" role="USER">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Avatar card */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 sm:flex-row sm:gap-6 sm:px-8 sm:py-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
              </span>
            </div>
            <button className="ml-auto hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={UserCircle} label="Full Name"    value={user.name} />
            <InfoRow icon={Mail}       label="Email Address" value={user.email} />
            <InfoRow icon={ShieldCheck} label="Role"         value={user.role === 'ADMIN' ? 'Administrator' : 'Customer'} />
            <InfoRow icon={Hash}       label="User ID"       value={user.id} />
            <InfoRow icon={Calendar}   label="Member Since"  value={joinedDate} />
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
              </div>
              <button className="rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                Delete Account
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
