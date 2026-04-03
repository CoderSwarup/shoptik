import { Database, Globe, Network } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ArchCard {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  description: string
  pills: string[]
}

const archCards: ArchCard[] = [
  {
    icon: Database,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    title: "NestJS + PostgreSQL",
    subtitle: "Core API Service",
    description:
      "Primary REST API layer built with TypeScript and NestJS. Handles auth, orders, products, addresses with Drizzle ORM. Also runs SSE endpoint for real-time order logs streaming to admin dashboard.",
    pills: ["TypeScript", "NestJS", "PostgreSQL", "Drizzle", "JWT", "SSE"],
  },
  {
    icon: Globe,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Go + MongoDB",
    subtitle: "Events & Notifications",
    description:
      "Go microservice with gRPC servers for order logs and notifications. Stores logs in MongoDB via Redis Stream consumer. Provides WebSocket hub for real-time push notifications to clients.",
    pills: ["Go", "MongoDB", "Fiber", "gRPC", "WebSocket", "Redis"],
  },
  {
    icon: Network,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    title: "Redis + Streams",
    subtitle: "Messaging Backbone",
    description:
      "Redis powers async messaging via Pub/Sub for notifications and Streams for order logs. BullMQ-style consumer batches logs from stream to MongoDB. WebSocket hub subscribes to notification events.",
    pills: ["Redis", "Pub/Sub", "Streams", "BullMQ", "Protobuf", "SSE"],
  },
]

export function ArchitectureSection() {
  return (
    <section
      className="bg-muted/40 px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="architecture-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
            Under the Hood
          </p>
          <h2 id="architecture-heading" className="mb-4 text-3xl sm:text-4xl">
            Real-time by design
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            Four services communicate via gRPC, Redis Streams, Pub/Sub, and WebSocket for
            real-time order logs and notifications.
          </p>
        </div>

        {/* Architecture cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {archCards.map((card, index) => {
            const Icon = card.icon
            return (
              <article
                key={card.title}
                className="relative flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                {/* Step number */}
                <span className="absolute right-4 top-4 font-mono text-xs text-border">
                  0{index + 1}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
                </div>

                {/* Titles */}
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{card.subtitle}</p>
                  <h3 className="mt-0.5 text-lg font-medium">{card.title}</h3>
                </div>

                {/* Description */}
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>

                {/* Tech pills */}
                <div className="flex flex-wrap gap-1.5">
                  {card.pills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {/* Architecture flow diagram (text-based, visual) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {["Next.js", "→", "NestJS", "→", "Redis Stream", "→", "Go", "→", "MongoDB"].map(
            (node, i) => (
              <span
                key={i}
                className={
                  ["→"].includes(node)
                    ? "text-primary/60"
                    : "rounded-md border border-border bg-card px-2.5 py-1 font-mono"
                }
              >
                {node}
              </span>
            )
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {["Next.js", "↔", "WebSocket", "←", "Go Hub", "←", "Redis Pub/Sub", "←", "NestJS"].map(
            (node, i) => (
              <span
                key={i}
                className={
                  ["↔", "←"].includes(node)
                    ? "text-primary/60"
                    : "rounded-md border border-border bg-card px-2.5 py-1 font-mono"
                }
              >
                {node}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  )
}
