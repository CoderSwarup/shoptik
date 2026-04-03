'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<Notification['type'], string> = {
  ORDER_UPDATE: 'Order',
  PAYMENT: 'Payment',
  PROMO: 'Promo',
  SYSTEM: 'System',
}

const PRIORITY_COLORS: Record<Notification['priority'], string> = {
  LOW: 'bg-muted-foreground/20 text-muted-foreground',
  NORMAL: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  HIGH: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0">
        <span
          className={cn(
            'block h-2 w-2 rounded-full',
            notification.isRead ? 'bg-transparent' : 'bg-primary'
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium leading-tight">{notification.title}</p>
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
            {TYPE_LABELS[notification.type]}
          </span>
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-medium',
              PRIORITY_COLORS[notification.priority]
            )}
          >
            {notification.priority}
          </span>
        </div>
      </div>

      {!notification.isRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="mt-0.5 flex-shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
          aria-label="Mark as read"
          title="Mark as read"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="relative">
      {/* Bell trigger */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Connection indicator */}
        <span
          className={cn(
            'absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ring-1 ring-background',
            isConnected ? 'bg-green-500' : 'bg-muted-foreground'
          )}
        />
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Clear all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] divide-y divide-border/60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="group">
                  <NotificationItem notification={n} onMarkRead={markAsRead} />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-muted-foreground'
                )}
              />
              {isConnected ? 'Live' : 'Offline'}
            </span>
            <span className="text-xs text-muted-foreground">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
