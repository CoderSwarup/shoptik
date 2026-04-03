'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingBag,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Users,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  UserCircle,
  MapPin,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'

interface SidebarProps {
  role: 'USER' | 'ADMIN'
  collapsed: boolean
  onToggle: () => void
}

const userNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/products', label: 'Products', icon: ShoppingBag },
  { href: '/dashboard/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/dashboard/addresses', label: 'Addresses', icon: MapPin },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/delivery-zones', label: 'Delivery Zones', icon: MapPin },
  { href: '/admin/order-logs', label: 'Order Logs', icon: Package },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = role === 'ADMIN' ? adminNavItems : userNavItems
  const isAdmin = role === 'ADMIN'

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo + toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold">
              Shop<span className="text-primary">tik</span>
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2',
            isAdmin ? 'bg-primary/10' : 'bg-muted'
          )}>
            <ShieldCheck className={cn('h-4 w-4 shrink-0', isAdmin ? 'text-primary' : 'text-muted-foreground')} />
            <span className={cn('text-xs font-medium', isAdmin ? 'text-primary' : 'text-muted-foreground')}>
              {isAdmin ? 'Admin Portal' : 'User Portal'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {!collapsed && (
          <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn(
                'h-[18px] w-[18px] shrink-0 transition-transform duration-150',
                !isActive && 'group-hover:scale-110'
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="shrink-0 border-t border-border p-2">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
