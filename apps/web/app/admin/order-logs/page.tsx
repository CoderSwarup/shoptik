'use client'

import { useEffect, useState, useRef } from 'react'
import { Terminal, RefreshCw, Filter, Clock, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { config } from '@/config/index'

interface OrderLog {
  id: string
  orderId: string
  userId: string
  eventType: string
  title: string
  message: string
  metadata: Record<string, string>
  timestamp: string
  createdAt: string
}

const EVENT_COLORS: Record<string, string> = {
  ORDER_CREATED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PAYMENT_PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  PAYMENT_SUCCESS: 'text-green-400 bg-green-500/10 border-green-500/20',
  PAYMENT_FAILED: 'text-red-400 bg-red-500/10 border-red-500/20',
  STATUS_CHANGED: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  ORDER_CANCELLED: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  ADDRESS_VALIDATED: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  ORDER_CREATED: <Terminal className="h-3 w-3" />,
  PAYMENT_PENDING: <Clock className="h-3 w-3" />,
  PAYMENT_SUCCESS: <AlertCircle className="h-3 w-3" />,
  PAYMENT_FAILED: <AlertCircle className="h-3 w-3" />,
  STATUS_CHANGED: <RefreshCw className="h-3 w-3" />,
  ORDER_CANCELLED: <AlertCircle className="h-3 w-3" />,
  ADDRESS_VALIDATED: <Filter className="h-3 w-3" />,
}

export default function OrderLogsPage() {
  const [logs, setLogs] = useState<OrderLog[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [connected, setConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Initialize SSE connection
  useEffect(() => {
    if (!autoRefresh) {
      eventSourceRef.current?.close()
      return
    }

    console.log('[SSE] Connecting to order logs stream...')
    const eventSource = new EventSource(`${config.apiUrl}/sse/order-logs`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('[SSE] Connected to', `${config.apiUrl}/sse/order-logs`)
      setConnected(true)
    }

    let logsReceived = 0

    eventSource.addEventListener('log', (event) => {
      console.log('[SSE] Raw event data:', event.data)
      logsReceived++

      try {
        const parsed = JSON.parse(event.data)
        console.log('[SSE] Parsed event:', parsed)
        
        const data = parsed.data

        // Convert snake_case to camelCase for compatibility
        const log: OrderLog = {
          id: data.id,
          orderId: data.order_id || data.orderId,
          userId: data.user_id || data.userId,
          eventType: data.event_type || data.eventType,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          timestamp: data.timestamp,
          createdAt: data.created_at || data.createdAt,
        }

        console.log(`[SSE] Log #${logsReceived} converted:`, log.eventType, log.orderId)

        setLogs((prev) => {
          // Avoid duplicates
          const exists = prev.some(l => l.id === log.id)
          if (exists) {
            console.log('[SSE] Duplicate log ignored:', log.id)
            return prev
          }
          const newLogs = [log, ...prev].slice(0, 200)
          console.log(`[SSE] Added log, new total: ${newLogs.length}`)
          return newLogs
        })

        // Set loading false after first log arrives
        setLoading(false)
      } catch (err) {
        console.error('[SSE] Error parsing log:', err)
        setLoading(false)
      }
    })

    eventSource.addEventListener('connected', (event) => {
      const msg = JSON.parse(event.data)
      console.log('[SSE]', msg.message)
      // Don't set loading false here - wait for actual logs
    })

    eventSource.onerror = (err) => {
      console.error('[SSE] Error:', err)
      setConnected(false)
      setLoading(false)
      eventSource.close()

      // Reconnect after 3 seconds
      setTimeout(() => {
        console.log('[SSE] Reconnecting...')
      }, 3000)
    }

    return () => {
      eventSource.close()
    }
  }, [autoRefresh])

  // Debug: Log when logs state updates
  useEffect(() => {
    console.log('[REACT] Logs state updated, count:', logs.length)
  }, [logs])

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.eventType === filter)

  const eventTypes = ['all', ...new Set(logs.map(l => l.eventType))]

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <DashboardLayout title="Order Logs" subtitle="Real-time order event audit trail" role="ADMIN">
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${connected
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh && connected ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
            <div className="flex items-center gap-1 ml-2">
              {eventTypes.slice(0, 5).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${filter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Force reconnection of SSE
              eventSourceRef.current?.close()
              setAutoRefresh(false)
              setTimeout(() => setAutoRefresh(true), 100)
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reconnect
          </Button>
        </div>

        {/* Terminal Window */}
        <Card className="flex-1 overflow-hidden bg-black/95 border-border/40">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/40">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              shoptik@go-service:~/order-logs$ tail -f /var/log/orders.log
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
          </div>

          <div
            ref={scrollRef}
            className="h-[600px] overflow-y-auto p-4 font-mono text-xs space-y-1.5 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {loading ? (
              <div className="text-muted-foreground">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-muted-foreground">No logs found</div>
            ) : (
              filteredLogs.map((log) => {
                const colorClass = EVENT_COLORS[log.eventType] || 'text-gray-400 bg-gray-500/10'
                const icon = EVENT_ICONS[log.eventType] || <Terminal className="h-3 w-3" />

                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2.5 p-2 rounded border ${colorClass} hover:bg-white/5 transition-colors`}
                  >
                    <span className="mt-0.5 shrink-0 opacity-70">{icon}</span>
                    <span className="shrink-0 text-muted-foreground/60 select-none">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="font-semibold shrink-0 min-w-[140px]">
                      [{log.eventType}]
                    </span>
                    <span className="flex-1 break-all">
                      {log.message}
                      {Object.keys(log.metadata || {}).length > 0 && (
                        <span className="ml-2 opacity-60">
                          {JSON.stringify(log.metadata)}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-muted-foreground/50 text-[10px]">
                      #{log.orderId.slice(0, 8)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total: <strong className="text-foreground">{logs.length}</strong></span>
            <span>Filtered: <strong className="text-foreground">{filteredLogs.length}</strong></span>
            <span>Events: <strong className="text-foreground">{new Set(logs.map(l => l.eventType)).size}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                SSE Stream Active
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Reconnecting...
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
