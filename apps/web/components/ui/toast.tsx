"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, description?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const toastConfig: Record<ToastType, { icon: React.ElementType; className: string }> = {
  success: {
    icon: CheckCircle,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, description }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type]
          const Icon = config.icon
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full",
                config.className
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
