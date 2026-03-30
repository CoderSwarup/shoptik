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
      "The primary REST/tRPC API layer built with TypeScript and NestJS. Handles authentication, orders, and product management with a strongly-typed PostgreSQL schema via Prisma.",
    pills: ["TypeScript", "NestJS", "PostgreSQL", "Prisma", "JWT"],
  },
  {
    icon: Globe,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Go + MongoDB",
    subtitle: "Analytics & Catalog Service",
    description:
      "A high-throughput Go microservice for catalog search and analytics. MongoDB's flexible document model handles product variants and event logs with minimal schema overhead.",
    pills: ["Go", "MongoDB", "Fiber", "Atlas Search"],
  },
  {
    icon: Network,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    title: "Queue + gRPC",
    subtitle: "Messaging Backbone",
    description:
      "BullMQ queues handle async workflows — emails, webhooks, report generation. Services communicate synchronously via gRPC Protocol Buffers for sub-millisecond RPC latency.",
    pills: ["BullMQ", "Redis", "gRPC", "Protobuf", "SSE"],
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
            Distributed by design
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            Three independent services, each optimized for its domain, communicating through
            a shared messaging backbone.
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
          {["Next.js Client", "→", "NestJS API", "⇄", "gRPC", "⇄", "Go Service", "↕", "BullMQ / Redis"].map(
            (node, i) => (
              <span
                key={i}
                className={
                  ["→", "⇄", "↕"].includes(node)
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
