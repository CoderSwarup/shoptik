'use client'

import { Search, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onMobileMenuToggle: () => void
}

export function DashboardHeader({ title, subtitle, onMobileMenuToggle }: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-base font-semibold leading-tight sm:text-lg">{title}</h1>
          {subtitle && (
            <p className="hidden text-xs text-muted-foreground sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search — hidden on small screens */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-48 pl-9 text-sm lg:w-64"
          />
        </div>

        {/* Notification bell */}
        <NotificationBell />

        {/* Avatar */}
        {user && (
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            user.role === 'ADMIN'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
