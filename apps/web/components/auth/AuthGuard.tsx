'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/signin')
      return
    }

    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') return null

  return <>{children}</>
}
