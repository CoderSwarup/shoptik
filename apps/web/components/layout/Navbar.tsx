"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, LayoutDashboard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notifications/NotificationBell"

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
] as const

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  const dashboardHref = user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"
  const dashboardLabel = user?.role === "ADMIN" ? "Admin Dashboard" : "Dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-sans text-xl font-medium transition-opacity hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <span>
            Shop<span className="text-primary">tik</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {publicNavLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <NotificationBell />
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardHref} className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <ul className="flex flex-col gap-1" role="list">
            {publicNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    {dashboardLabel}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => { setMobileOpen(false); logout() }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/signin" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
