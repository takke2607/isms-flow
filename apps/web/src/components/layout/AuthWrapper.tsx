'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UserSession {
  username: string
  email: string
  role: 'global_admin' | 'admin' | 'monitor'
}

interface AuthContextType {
  session: UserSession | null
  isAdmin: boolean
  isGlobalAdmin: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('isms_user_session')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserSession
          setSession(parsed)
          if (pathname === '/login') {
            router.push('/')
          }
        } catch (e) {
          localStorage.removeItem('isms_user_session')
          if (pathname !== '/login') {
            router.push('/login')
          }
        }
      } else {
        setSession(null)
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkSession()
    window.addEventListener('storage', checkSession)
    return () => window.removeEventListener('storage', checkSession)
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem('isms_user_session')
    setSession(null)
    router.push('/login')
  }

  const isAdmin = session?.role === 'global_admin' || session?.role === 'admin'
  const isGlobalAdmin = session?.role === 'global_admin'

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Share Tech Mono, monospace',
        background: '#fafafa',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Authenticating session...
      </div>
    )
  }

  if (!session && pathname !== '/login') {
    return null
  }

  return (
    <AuthContext.Provider value={{ session, isAdmin, isGlobalAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthWrapper')
  }
  return context
}
