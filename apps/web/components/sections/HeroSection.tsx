import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

import { Button } from "@/components/ui/button"

const techBadges = ["gRPC", "BullMQ", "WebSocket", "tRPC", "NestJS", "Go"]

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40"
      aria-labelledby="hero-heading"
    >
      {/* Background mesh gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        {/* Top-left orb */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        {/* Top-right orb */}
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        {/* Center subtle glow */}
        <div className="absolute left-1/2 top-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.5398 0.2285 286.75) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Beta badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          Now in Beta · Built for Scale
        </div>

        {/* Main heading */}
        <h1
          id="hero-heading"
          className="mb-6 text-4xl leading-tight sm:text-5xl lg:text-6xl"
        >
          Modern Commerce,{" "}
          <span className="relative">
            <span className="relative z-10 text-primary">Powered by</span>
            <span
              className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-primary/15"
              aria-hidden="true"
            />
          </span>{" "}
          Distributed Systems
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Shoptik delivers real-time notifications via{" "}
          <strong className="text-foreground">WebSocket</strong>, asynchronous job processing
          through <strong className="text-foreground">BullMQ</strong>, and lightning-fast
          inter-service communication with{" "}
          <strong className="text-foreground">gRPC</strong> — all orchestrated across NestJS and
          Go microservices.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/signup">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
            <Link href="/demo">
              <Play className="h-4 w-4" />
              View Demo
            </Link>
          </Button>
        </div>

        {/* Tech badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Powered by</span>
          {techBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
