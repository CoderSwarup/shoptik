import { Activity, Radio, Shield } from "lucide-react"

interface LogEntry {
  level: "INFO" | "WARN" | "ERROR"
  timestamp: string
  service: string
  message: string
  animClass: string
}

const logEntries: LogEntry[] = [
  {
    level: "INFO",
    timestamp: "10:42:01.112",
    service: "order-svc",
    message: "Order #ORD-8821 created — queuing fulfillment job",
    animClass: "animate-log-1",
  },
  {
    level: "INFO",
    timestamp: "10:42:01.334",
    service: "queue",
    message: "Job fulfillment:8821 added to BullMQ (priority: high)",
    animClass: "animate-log-2",
  },
  {
    level: "WARN",
    timestamp: "10:42:02.004",
    service: "inventory-svc",
    message: "Stock low for SKU-992 — threshold 12 units remaining",
    animClass: "animate-log-3",
  },
  {
    level: "INFO",
    timestamp: "10:42:02.890",
    service: "notify-svc",
    message: "WebSocket push sent to user:4491 — order confirmed",
    animClass: "animate-log-4",
  },
  {
    level: "ERROR",
    timestamp: "10:42:03.210",
    service: "payment-svc",
    message: "Stripe webhook retry #2 — status: pending",
    animClass: "animate-log-5",
  },
  {
    level: "INFO",
    timestamp: "10:42:04.001",
    service: "grpc",
    message: "catalog.GetProduct RPC resolved in 2.1ms",
    animClass: "animate-log-6",
  },
]

const levelStyles: Record<LogEntry["level"], string> = {
  INFO: "text-emerald-500",
  WARN: "text-amber-500",
  ERROR: "text-red-500",
}

export function AdminPreviewSection() {
  return (
    <section
      className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="admin-preview-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
                Admin Dashboard
              </p>
              <h2 id="admin-preview-heading" className="mb-4 text-3xl sm:text-4xl">
                Live system visibility
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Monitor every service in real-time. The admin dashboard streams structured logs
                directly from all microservices via Server-Sent Events (SSE), giving you instant
                visibility into orders, queues, and system health.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Radio,
                  title: "SSE Log Streaming",
                  desc: "Logs pushed from NestJS and Go services in real-time — no polling.",
                },
                {
                  icon: Activity,
                  title: "Queue Health Monitor",
                  desc: "Track BullMQ job throughput, failures, and retry rates live.",
                },
                {
                  icon: Shield,
                  title: "Role-based Access",
                  desc: "JWT-secured admin routes with fine-grained permission scopes.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal log preview */}
          <div className="relative">
            {/* Glow behind terminal */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-2xl bg-primary/5 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-xl dark:bg-zinc-900">
              {/* Terminal titlebar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-white/40">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  SSE Stream Active
                </div>
                <span className="font-mono text-xs text-white/30">shoptik-logs</span>
              </div>

              {/* Log lines */}
              <div className="flex flex-col gap-0.5 p-4 font-mono text-xs" role="log" aria-label="System log output" aria-live="polite">
                {logEntries.map((entry) => (
                  <div
                    key={entry.timestamp + entry.service}
                    className={`flex flex-wrap gap-x-2 gap-y-0.5 ${entry.animClass}`}
                  >
                    <span className="text-white/30">{entry.timestamp}</span>
                    <span className={`font-semibold ${levelStyles[entry.level]}`}>
                      [{entry.level}]
                    </span>
                    <span className="text-blue-300/80">{entry.service}</span>
                    <span className="text-white/70">{entry.message}</span>
                  </div>
                ))}

                {/* Blinking cursor */}
                <div className="mt-1 flex items-center gap-1 text-white/30">
                  <span>$</span>
                  <span className="inline-block h-3 w-1.5 animate-pulse bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
