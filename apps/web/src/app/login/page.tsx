'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Seed default users if none exist in localStorage
  useEffect(() => {
    const existing = localStorage.getItem('isms_users')
    if (!existing) {
      const defaultUsers = [
        { username: 'admin', email: 'admin@example.com', password: 'admin@123', role: 'global_admin' },
        { username: 'monitor', email: 'monitor@example.com', password: 'password', role: 'monitor' }
      ]
      localStorage.setItem('isms_users', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Please enter both username and password.')
      return
    }

    // Retrieve users list
    const usersStr = localStorage.getItem('isms_users')
    const users = usersStr ? JSON.parse(usersStr) : []

    // Check credentials matching username (case-insensitive) and password
    const matchedUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )

    if (!matchedUser) {
      setError('Invalid username or password.')
      return
    }

    const session = {
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role
    }

    localStorage.setItem('isms_user_session', JSON.stringify(session))
    
    // Trigger custom header refresh event
    window.dispatchEvent(new Event('isms_refresh_header'))
    
    router.push('/')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(4, 13, 33) 0%, rgb(20, 24, 33) 90%)',
      fontFamily: 'Share Tech Mono, monospace',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '32px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            letterSpacing: '2px',
            marginBottom: '4px'
          }}>
            ISO 27001 Compliance Portal
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            margin: 0,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ISMS-FLOW AUTH
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button type="submit" style={{
            background: 'var(--color-accent)',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '8px',
            transition: 'opacity 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Authenticate Session
          </button>
        </form>
      </div>
    </div>
  )
}
