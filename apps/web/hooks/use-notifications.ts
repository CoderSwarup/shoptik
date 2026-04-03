'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/context/auth-context'
import { notificationsService } from '@/services/api/notifications.service'

export interface Notification {
  id: string
  userId: string
  role: 'USER' | 'ADMIN'
  type: 'ORDER_UPDATE' | 'PAYMENT' | 'PROMO' | 'SYSTEM'
  title: string
  message: string
  payload: Record<string, any>
  isRead: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  createdAt: string
}

interface WebSocketMessage {
  type: 'notification' | 'connected' | 'error'
  data?: Notification
  message?: string
  timestamp: number
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  // Track IDs already in state to prevent WebSocket duplicates
  const seenIdsRef = useRef<Set<string>>(new Set())

  // ── Fetch history from REST API on mount ──────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await notificationsService.getAll(1, 30)
      // Build the notifications list and seed the seen-IDs set
      const items: Notification[] = (res.notifications ?? []).map((n: any) => ({
        id:        n.id        ?? n._id ?? '',
        userId:    n.userId    ?? n.user_id ?? '',
        role:      n.role      ?? 'USER',
        type:      n.type      ?? 'SYSTEM',
        title:     n.title     ?? '',
        message:   n.message   ?? '',
        payload:   n.payload   ?? {},
        isRead:    n.isRead    ?? n.is_read ?? false,
        priority:  n.priority  ?? 'NORMAL',
        createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
      }))
      seenIdsRef.current = new Set(items.map((n) => n.id).filter(Boolean))
      setNotifications(items)
      setUnreadCount(items.filter((n) => !n.isRead).length)
    } catch (err) {
      console.error('[useNotifications] Failed to fetch history:', err)
    }
  }, [user?.id])

  // ── WebSocket connection ───────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!user?.id) return

    if (wsRef.current) {
      wsRef.current.close()
    }

    const wsUrl = `ws://localhost:5002/ws?userId=${user.id}&role=${user.role}`
    console.log('[WebSocket] Connecting to:', wsUrl)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WebSocket] Connected')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)

        if (message.type === 'notification' && message.data) {
          const n = message.data
          const id = n.id ?? (n as any)._id ?? ''

          // Deduplicate — skip if we already have this notification
          if (id && seenIdsRef.current.has(id)) {
            console.log('[WebSocket] Duplicate notification ignored:', id)
            return
          }
          if (id) seenIdsRef.current.add(id)

          const normalized: Notification = {
            id,
            userId:    n.userId    ?? (n as any).user_id ?? '',
            role:      n.role      ?? 'USER',
            type:      n.type      ?? 'SYSTEM',
            title:     n.title     ?? '',
            message:   n.message   ?? '',
            payload:   n.payload   ?? {},
            isRead:    false,
            priority:  n.priority  ?? 'NORMAL',
            createdAt: n.createdAt ?? new Date().toISOString(),
          }

          setNotifications((prev) => [normalized, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Browser push notification
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(normalized.title, {
              body: normalized.message,
              icon: '/favicon.ico',
            })
          }
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error)
      }
    }

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected')
      setIsConnected(false)
      wsRef.current = null

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[WebSocket] Reconnecting...')
        connect()
      }, 3000)
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
    }
  }, [user?.id, user?.role])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      await window.Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchHistory()   // load persisted notifications first
      connect()
      requestBrowserPermission()
    }
    return () => disconnect()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions that persist to backend ───────────────────────────────────────
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    // Persist
    try {
      await notificationsService.markAsRead(notificationId)
    } catch (err) {
      console.error('[useNotifications] markAsRead failed:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    // Persist
    try {
      await notificationsService.markAllAsRead()
    } catch (err) {
      console.error('[useNotifications] markAllAsRead failed:', err)
    }
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
    seenIdsRef.current.clear()
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    connect,
    disconnect,
  }
}
