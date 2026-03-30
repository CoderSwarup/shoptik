"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="gap-2"
    >
      {isDark ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          Light Mode
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          Dark Mode
        </>
      )}
    </Button>
  )
}

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col gap-8 p-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Shoptik</h1>
        <ThemeToggleButton />
      </header>

      {/* Theme Showcase */}
      <main className="flex max-w-2xl flex-col gap-6">
        {/* Colors */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Notebook Theme</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Using the{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              tweakcn notebook
            </span>{" "}
            theme with <strong>Architects Daughter</strong> font. Press{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">
              D
            </kbd>{" "}
            to toggle dark mode.
          </p>
        </section>

        {/* Color swatches */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Colors
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Background",
                cls: "bg-background border border-border",
              },
              { label: "Primary", cls: "bg-primary" },
              { label: "Secondary", cls: "bg-secondary" },
              { label: "Accent", cls: "bg-accent" },
              { label: "Muted", cls: "bg-muted" },
              { label: "Card", cls: "bg-card border border-border" },
              { label: "Destructive", cls: "bg-destructive" },
              { label: "Border", cls: "bg-border" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className={`h-10 rounded-lg ${cls}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Buttons
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        {/* Typography */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Typography
          </h3>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
            <p className="font-sans text-base">
              Sans — Architects Daughter (body text)
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              Mono — Courier New (code blocks)
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
