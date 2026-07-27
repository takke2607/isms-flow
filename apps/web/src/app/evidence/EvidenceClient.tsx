'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/AuthWrapper'

interface MappedDoc {
  id: number
  title: string
  description: string
  url: string
}

interface EvidenceItem {
  id: string
  controlId: string
  controlTitle: string
  category: string
  evidenceType: string
  title: string
  description: string
  status: 'collected' | 'missing'
  controlStatus?: string
  linkedDocs: MappedDoc[]
}

interface EvidenceClientProps {
  initialEvidence: EvidenceItem[]
}

const CATEGORIES = ['All', 'Organizational', 'People', 'Physical', 'Technological']

function EvidenceTypePill({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Document: '#1e40af', Record: '#166534', Log: '#92400e', Configuration: '#374151',
    Register: '#7c3aed', Training: '#0891b2', Agreement: '#b91c1c', 'Photo/Log': '#374151'
  }
  return (
    <span style={{
      fontSize: '9px', fontFamily: 'Share Tech Mono', padding: '2px 6px', textTransform: 'uppercase',
      border: `1px solid ${colors[type] || '#374151'}`, color: colors[type] || '#374151', background: '#fff'
    }}>
      {type}
    </span>
  )
}

export default function EvidenceClient({ initialEvidence }: EvidenceClientProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  
  const [filterCat, setFilterCat] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isms_filter_ev_cat') || 'All'
    }
    return 'All'
  })
  const [filterStatus, setFilterStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isms_filter_ev_status') || 'all'
    }
    return 'all'
  })
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isms_filter_ev_search') || ''
    }
    return ''
  })

  useEffect(() => {
    sessionStorage.setItem('isms_filter_ev_cat', filterCat)
  }, [filterCat])

  useEffect(() => {
    sessionStorage.setItem('isms_filter_ev_status', filterStatus)
  }, [filterStatus])

  useEffect(() => {
    sessionStorage.setItem('isms_filter_ev_search', search)
  }, [search])

  const stats = useMemo(() => {
    const total = initialEvidence.length
    const collected = initialEvidence.filter(e => e.status === 'collected').length
    const missing = total - collected
    const pct = total > 0 ? Math.round((collected / total) * 100) : 0
    return { total, collected, missing, pct }
  }, [initialEvidence])

  const filtered = useMemo(() => {
    return initialEvidence.filter(i => {
      if (filterCat !== 'All' && i.category !== filterCat) return false
      if (filterStatus === 'collected' && i.status !== 'collected') return false
      if (filterStatus === 'missing' && i.status !== 'missing') return false
      if (search) {
        const query = search.toLowerCase()
        return i.controlId.toLowerCase().includes(query) || i.controlTitle.toLowerCase().includes(query)
      }
      return true
    })
  }, [initialEvidence, filterCat, filterStatus, search])

  const handleRemoveLink = async (docId: number) => {
    if (!confirm('Remove this document reference?')) return
    try {
      const res = await fetch(`/api/v1/documents/${docId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleExportExcel = () => {
    const headers = ['Sr. No', 'Annex Controls', 'Document Name / Evidence Required', 'Status']
    const rows = filtered.map((item, idx) => {
      let statusStr = 'Pending'
      if (item.linkedDocs.length > 0 || item.controlStatus === 'implemented') {
        statusStr = 'Completed'
      } else if (item.controlStatus === 'in_progress') {
        statusStr = 'In Progress'
      }

      return [
        idx + 1,
        `"${item.controlId} - ${item.controlTitle.replace(/"/g, '""')}"`,
        `"${item.title.replace(/"/g, '""')} (${item.evidenceType}): ${item.description.replace(/"/g, '""')}"`,
        statusStr
      ]
    })

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'isms_required_documents_tracker.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="page-body">
      <div className="page-header">
        <h2 className="page-title">Evidence Map (All 93 Annex Controls)</h2>
        <p className="page-desc">
          Map compliance evidence documents to any of the 93 controls. Link external SharePoint, Trust Portal, or Google Drive assets.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Overall Mapping Score', value: `${stats.pct}%`, color: '#1e40af', bg: '#dbeafe' },
          { label: 'Controls with Evidence', value: `${stats.collected} / ${stats.total}`, color: '#166534', bg: '#dcfce7' },
          { label: 'Missing Evidence', value: `${stats.missing} / ${stats.total}`, color: '#b91c1c', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ height: '8px', background: '#e5e7eb', border: '1px solid #000' }}>
          <div style={{
            height: '100%', background: 'var(--color-accent)',
            width: `${stats.pct}%`, transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search controls (e.g. 5.1)..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{
              padding: '6px 10px', fontSize: '10px', fontFamily: 'Share Tech Mono', border: '1.5px solid #000',
              background: filterCat === c ? '#000' : '#fff', color: filterCat === c ? '#fff' : '#000', cursor: 'pointer'
            }}>
              {c}
            </button>
          ))}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}>
          <option value="all">All Status</option>
          <option value="collected">Evidence Linked</option>
          <option value="missing">Missing Evidence</option>
        </select>
        <button onClick={handleExportExcel} style={{
          padding: '6px 12px', fontSize: '11px', fontFamily: 'Share Tech Mono', border: '1.5px solid #000',
          background: 'var(--color-accent)', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          fontWeight: 'bold', marginLeft: 'auto'
        }}>
          📥 Export Excel Tracker
        </button>
      </div>

      {/* Evidence Controls List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>
            No controls matched your filters.
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.controlId} className="card" style={{
              padding: '14px 16px',
              borderLeft: `4px solid ${item.status === 'collected' ? '#166534' : '#b91c1c'}`
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>
                  {item.status === 'collected' ? '🔗' : '❌'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      {item.controlId} — {item.controlTitle}
                    </span>
                    <EvidenceTypePill type={item.evidenceType} />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.4, marginBottom: item.linkedDocs.length > 0 ? '10px' : '0px' }}>
                    {item.description}
                  </p>

                  {/* Mapped Documents */}
                  {item.linkedDocs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f9fafb', padding: '10px', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', fontFamily: 'Share Tech Mono' }}>Linked Evidence:</span>
                      {item.linkedDocs.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', gap: '10px' }}>
                          <div style={{ minWidth: 0 }}>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontWeight: 600 }}>
                              {doc.title}
                            </a>
                            {doc.description && <span style={{ color: '#6b7280', marginLeft: '6px' }}>— {doc.description}</span>}
                          </div>
                          {isAdmin && (
                            <button onClick={() => handleRemoveLink(doc.id)} style={{
                              background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '10px', fontWeight: 700
                            }}>
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <button onClick={() => router.push(`/documents?add=true&controlId=${item.controlId}`)} style={{
                    fontSize: '10px', fontFamily: 'Share Tech Mono', padding: '5px 10px',
                    border: '1.5px solid #000', background: '#000', color: '#fff', cursor: 'pointer', flexShrink: 0
                  }}>
                    + Link Document
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
