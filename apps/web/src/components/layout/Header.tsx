'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthWrapper'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { session, logout } = useAuth()
  const [stats, setStats] = useState({ readiness: 0, activeRisks: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/dashboard')
        const data = await res.json()
        if (data) {
          setStats({
            readiness: Math.round(data.overall_completion) || 0,
            activeRisks: data.total_risks || 0
          })
        }
      } catch (e) {
        console.error('Error fetching header stats:', e)
      }
    }
    fetchStats()
    
    window.addEventListener('isms_refresh_header', fetchStats)
    return () => window.removeEventListener('isms_refresh_header', fetchStats)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <div className="header-badge-list">
          <div className="header-badge">
            Readiness Score: <span style={{ color: 'var(--color-accent)' }}>{stats.readiness}%</span>
          </div>
          <div className="header-badge">
            Active Risks: <span style={{ color: 'var(--color-accent)' }}>{stats.activeRisks}</span>
          </div>
        </div>
      </div>
      <div className="header-right">
        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: 'var(--color-bg-secondary)',
              border: '1.5px solid var(--color-border)',
              boxShadow: '2px 2px 0px rgba(0,0,0,1)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'var(--color-accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #000'
              }}>
                {session.email.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', fontFamily: 'Share Tech Mono, monospace' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  {session.role === 'global_admin' ? 'Global Admin' : session.role === 'admin' ? 'Admin' : 'Monitor'}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', lineHeight: '1.1', marginTop: '2px' }}>
                  {session.email}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: '#fff',
                border: '1.5px solid var(--color-border)',
                color: '#b91c1c',
                padding: '6px 12px',
                fontSize: '10px',
                fontFamily: 'Share Tech Mono, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '2px 2px 0px rgba(0,0,0,1)',
                transition: 'all 0.1s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(1px, 1px)'
                e.currentTarget.style.boxShadow = '1px 1px 0px rgba(0,0,0,1)'
                e.currentTarget.style.background = '#fef2f2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0,0,0,1)'
                e.currentTarget.style.background = '#fff'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
