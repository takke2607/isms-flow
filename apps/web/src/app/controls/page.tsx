'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ControlDetailDrawer from '@/components/ui/ControlDetailDrawer'
import { Control, PaginatedControls, API_BASE } from '@/lib/api'

const CATEGORIES = ['Organizational', 'People', 'Physical', 'Technological']
const STATUSES = ['not_started', 'in_progress', 'implemented']

export default function ControlsPage() {
  const [data, setData] = useState<PaginatedControls | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Control | null>(null)

  const fetchControls = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), page_size: '20' })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (status) params.set('status', status)

      const res = await fetch(`${API_BASE}/api/v1/controls?${params}&t=${Date.now()}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, category, status])

  useEffect(() => {
    const timer = setTimeout(fetchControls, 300)
    return () => clearTimeout(timer)
  }, [fetchControls])

  const totalPages = data ? Math.ceil(data.total / 20) : 0

  const catClass = (cat: string) => cat.toLowerCase().replace(/\s+/g, '')
  const statusLabel = (s: string) =>
    s === 'not_started' ? 'Not Started' : s === 'in_progress' ? 'In Progress' : 'Implemented'

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Annex Controls" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">Annex Controls Catalog</h2>
            <p className="page-desc">
              Browse and implement the 93 security controls organized in 4 domains.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search controls by ID or title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            <select
              className="filter-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            >
              <option value="">All Domains</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              className="filter-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>

            {(search || category || status) && (
              <button className="filter-btn active" onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1) }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Category quick filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-btn ${category === c ? 'active' : ''}`}
                onClick={() => { setCategory(category === c ? '' : c); setPage(1) }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Controls List */}
          {loading ? (
            <div className="controls-grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '68px' }} />
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🔍</div>
              <div className="empty-title">No controls found</div>
              <div className="empty-desc">Try adjusting your filters or make sure the API is running.</div>
            </div>
          ) : (
            <>
              <div className="controls-grid">
                {data.items.map((ctrl) => (
                  <div
                    key={ctrl.id}
                    className="control-row"
                    onClick={() => setSelected(ctrl)}
                  >
                    <span className="control-id-badge">{ctrl.control_id}</span>
                    <div className="control-info">
                      <div className="control-title">{ctrl.title}</div>
                      <div className="control-desc">{ctrl.description}</div>
                    </div>
                    <span className={`category-pill ${catClass(ctrl.category)}`}>{ctrl.category}</span>
                    <span className={`status-badge ${ctrl.status}`}>{statusLabel(ctrl.status)}</span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total} controls
                </div>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = Math.max(1, page - 2) + i
                    if (p > totalPages) return null
                    return (
                      <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    )
                  })}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <ControlDetailDrawer
          control={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={(id, status) => {
            setData(d => d ? {
              ...d,
              items: d.items.map(c => c.id === id ? { ...c, status } : c)
            } : d)
          }}
        />
      )}
    </div>
  )
}
