'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    section: '01 - Overview',
    items: [
      { href: '/', icon: '⬡', label: 'Overview' },
      { href: '/journey', icon: '↗', label: 'ISMS Journey' },
    ],
  },
  {
    section: '02 - Foundation',
    items: [
      { href: '/clauses', icon: '§', label: 'Clauses 4-10' },
      { href: '/documents', icon: '⊡', label: 'Doc Gen' },
    ],
  },
  {
    section: '03 - Catalog',
    items: [
      { href: '/controls', icon: '▦', label: 'Annex Controls' },
      { href: '/soa', icon: '◎', label: 'SoA Builder' },
    ],
  },
  {
    section: '04 - Registries',
    items: [
      { href: '/risks', icon: '⚠', label: 'Risk Register' },
      { href: '/evidence', icon: '⊞', label: 'Evidence Map' },
    ],
  },
  {
    section: '05 - Audits',
    items: [
      { href: '/audit', icon: '✓', label: 'Audit & CAPAs' },
    ],
  },
  {
    section: '06 - Assistant',
    items: [
      { href: '/copilot', icon: '✦', label: 'AI Copilot' },
    ],
  },
  {
    section: '07 - Control Panel',
    items: [
      { href: '/settings', icon: '⚙', label: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo Section matching reference image */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-text">ISMS Flow</div>
        </div>
        <button className="sidebar-logo-toggle">☰</button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button className={`nav-item${active ? ' active' : ''}`}>
                    <span className="nav-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Connected status footer matching reference image */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-status-dot">
            <span className="status-dot"></span> Connected
          </div>
          <button className="sidebar-logo-toggle" style={{ width: '18px', height: '18px', fontSize: '9px' }}>↻</button>
        </div>
      </div>
    </aside>
  )
}
