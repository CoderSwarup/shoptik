"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Home, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

// Floating orb data (deterministic positions to avoid hydration mismatch)
const orbs = [
  { size: 80, top: "10%", left: "8%", delay: "0s", duration: "6s" },
  { size: 56, top: "20%", right: "12%", delay: "1s", duration: "5s" },
  { size: 40, top: "65%", left: "5%", delay: "2s", duration: "7s" },
  { size: 64, top: "70%", right: "6%", delay: "0.5s", duration: "5.5s" },
  { size: 32, top: "45%", left: "20%", delay: "1.5s", duration: "6.5s" },
  { size: 48, top: "40%", right: "22%", delay: "2.5s", duration: "4.5s" },
]

export default function NotFound() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* Background dot grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.5398 0.2285 286.75) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 rounded-full bg-primary/10 blur-2xl"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: "left" in orb ? orb.left : undefined,
            right: "right" in orb ? orb.right : undefined,
            animation: `float ${orb.duration} ease-in-out ${orb.delay} infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div
        className="flex flex-col items-center gap-6 text-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* 404 number */}
        <div className="relative select-none">
          <span
            className="animate-float block font-sans text-[9rem] font-medium leading-none tracking-tight text-primary/20 sm:text-[12rem]"
            aria-hidden="true"
          >
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center font-sans text-[9rem] font-medium leading-none tracking-tight text-primary sm:text-[12rem]"
            style={{ WebkitTextStroke: "2px", textShadow: "0 0 80px oklch(0.5398 0.2285 286.75 / 0.3)" }}
            aria-hidden="true"
          >
            404
          </span>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl">Page not found</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Looks like this route doesn&apos;t exist in our distributed system.
            The service might be offline, or you&apos;ve hit an unregistered endpoint.
          </p>
        </div>

        {/* Error code badge */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 font-mono text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          HTTP 404 · Route not registered
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
