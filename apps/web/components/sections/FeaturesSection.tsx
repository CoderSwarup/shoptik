import { Zap, Server, Gauge, Layers } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FeatureCard {
  icon: LucideIcon
  title: string
  description: string
  badge: string
}

const features: FeatureCard[] = [
  {
    icon: Zap,
    title: "Real-time Notifications",
    description:
      "Push live order updates, inventory alerts, and system events to every connected client instantly via persistent WebSocket connections.",
    badge: "WebSocket",
  },
  {
    icon: Server,
    title: "Background Processing",
    description:
      "Offload heavy tasks like email delivery, report generation, and payment processing to resilient BullMQ job queues backed by Redis.",
    badge: "BullMQ",
  },
  {
    icon: Gauge,
    title: "Fast APIs",
    description:
      "Type-safe end-to-end APIs with tRPC for the frontend and high-throughput binary RPC between microservices via gRPC Protocol Buffers.",
    badge: "tRPC + gRPC",
  },
  {
    icon: Layers,
    title: "Scalable Architecture",
    description:
      "Each service scales independently. Deploy NestJS and Go containers behind a load balancer with zero-downtime rolling updates.",
    badge: "Microservices",
  },
]

export function FeaturesSection() {
  return (
    <section
      className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
            Platform Features
          </p>
          <h2 id="features-heading" className="mb-4 text-3xl sm:text-4xl">
            Everything you need to scale
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            Purpose-built primitives for high-traffic commerce — from the first request to
            millions of concurrent users.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Badge */}
                <span className="w-fit rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {feature.badge}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* Hover accent line */}
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
