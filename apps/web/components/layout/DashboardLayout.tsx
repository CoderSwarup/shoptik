'use client'

import { useState } from 'react'

import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  role: 'USER' | 'ADMIN'
}

export function DashboardLayout({ children, title, subtitle, role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AuthGuard requiredRole={role === 'ADMIN' ? 'ADMIN' : undefined}>
      <div className="flex h-screen overflow-hidden bg-background">

        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — fixed on mobile, static on desktop */}
        <div className={cn(
          'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <Sidebar
            role={role}
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
          />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
