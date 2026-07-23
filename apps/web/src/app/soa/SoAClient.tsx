'use client'

import { useState, useMemo } from 'react'

interface ControlSummary {
  id: number
  controlId: string
  title: string
  category: string
  mandatory: boolean
  status: string
  completionPercentage: number
  relatedRisks: string[]
}

interface SoAEntry {
  applicable: boolean
}

const CATEGORIES = ['All', 'Organizational', 'People', 'Physical', 'Technological']

export default function SoAClient({
  controls,
  allRisks
}: {
  controls: ControlSummary[]
  allRisks: { id: number; riskId: string; title: string }[]
}) {
  const [entries, setEntries] = useState<Record<string, SoAEntry>>(() => {
    const initial: Record<string, SoAEntry> = {}
    controls.forEach(c => {
      initial[c.controlId] = { applicable: true }
    })
    return initial
  })

  const [filterCat, setFilterCat] = useState('All')
  const [filterApp, setFilterApp] = useState<'all' | 'applicable' | 'excluded'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => controls.filter(c => {
    if (filterCat !== 'All' && c.category !== filterCat) return false
    if (filterApp === 'applicable' && !entries[c.controlId]?.applicable) return false
    if (filterApp === 'excluded' && entries[c.controlId]?.applicable) return false
    if (search && !c.controlId.toLowerCase().includes(search.toLowerCase()) &&
        !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [controls, filterCat, filterApp, search, entries])

  const stats = {
    total: controls.length,
    applicable: Object.values(entries).filter(e => e.applicable).length,
    excluded: Object.values(entries).filter(e => !e.applicable).length,
    implemented: controls.filter(c => c.status === 'implemented').length,
  }

  const setApplicable = (controlId: string, val: boolean) => {
    setEntries(e => ({ ...e, [controlId]: { ...e[controlId], applicable: val } }))
  }

  const catClass = (cat: string) => cat.toLowerCase().replace(/\s+/g, '')

  return (
    <main className="page-body">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="page-title">Statement of Applicability (SoA)</h2>
            <p className="page-desc">
              Declare applicability for all 93 Annex A controls. Mapped Risk IDs are dynamically pulled from the Risk Register.
            </p>
          </div>
          <button
            onClick={() => {
              const rows = controls.map(c => {
                const e = entries[c.controlId]
                const mappedR = c.relatedRisks || []
                return `${c.controlId}\t${c.title}\t${c.category}\t${e?.applicable ? 'Applicable' : 'Excluded'}\t${mappedR.join(', ')}`
              }).join('\n')
              const blob = new Blob([`Control ID\tTitle\tCategory\tApplicability\tMapped Risk IDs\n${rows}`], { type: 'text/tab-separated-values' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = 'SoA.tsv'; a.click()
            }}
            style={{
              background: '#000', color: '#fff', border: 'none',
              padding: '10px 18px', fontSize: '12px', fontFamily: 'Share Tech Mono', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            ↓ Export SoA
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Controls', value: stats.total, color: '#374151', bg: '#f3f4f6' },
          { label: 'Applicable', value: stats.applicable, color: '#166534', bg: '#dcfce7' },
          { label: 'Excluded', value: stats.excluded, color: '#b91c1c', bg: '#fee2e2' },
          { label: 'Implemented', value: stats.implemented, color: '#1e40af', bg: '#dbeafe' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search controls..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{
                padding: '6px 10px', fontSize: '10px', fontFamily: 'Share Tech Mono', border: '1.5px solid #000',
                background: filterCat === c ? '#000' : '#fff', color: filterCat === c ? '#fff' : '#000', cursor: 'pointer'
              }}>
              {c}
            </button>
          ))}
        </div>
        <select value={filterApp} onChange={e => setFilterApp(e.target.value as any)}
          style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}>
          <option value="all">All</option>
          <option value="applicable">Applicable Only</option>
          <option value="excluded">Excluded Only</option>
        </select>
      </div>

      {/* SoA Table */}
      <div className="card" style={{ padding: 0 }}>
        {/* Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 120px 120px 1.8fr',
          gap: '8px', padding: '10px 16px', borderBottom: '2px solid #000',
          background: '#f9fafb', fontSize: '10px', fontFamily: 'Share Tech Mono',
          fontWeight: 700, textTransform: 'uppercase', color: '#374151'
        }}>
          <span>Control</span>
          <span>Title</span>
          <span>Domain</span>
          <span>Applicability</span>
          <span>Mapped Risks (Risk Register)</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>
            No controls match your filters.
          </div>
        ) : (
          filtered.map(ctrl => {
            const entry = entries[ctrl.controlId] || { applicable: true }
            const mappedRisks = ctrl.relatedRisks || []
            return (
              <div key={ctrl.controlId} style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 120px 120px 1.8fr',
                gap: '8px', padding: '10px 16px', borderBottom: '1px solid #e5e7eb',
                alignItems: 'center', opacity: entry.applicable ? 1 : 0.5,
                transition: 'opacity 0.15s'
              }}>
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '11px', fontWeight: 700, color: '#374151' }}>
                  {ctrl.controlId}
                </span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{ctrl.title}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Share Tech Mono', marginTop: '1px' }}>
                    {ctrl.status === 'implemented' ? '✓ Implemented' : ctrl.status === 'in_progress' ? '⟳ In Progress' : '○ Not Started'}
                  </div>
                </div>
                <span className={`category-pill ${catClass(ctrl.category)}`} style={{ fontSize: '9px', justifySelf: 'start' }}>
                  {ctrl.category}
                </span>
                <div>
                  <select
                    value={entry.applicable ? 'true' : 'false'}
                    onChange={e => setApplicable(ctrl.controlId, e.target.value === 'true')}
                    style={{
                      border: '1.5px solid #000', padding: '4px 6px', fontSize: '10px',
                      fontFamily: 'Share Tech Mono', fontWeight: 700, background: entry.applicable ? '#dcfce7' : '#fee2e2',
                      color: entry.applicable ? '#166534' : '#b91c1c', cursor: 'pointer'
                    }}
                  >
                    <option value="true">APPLICABLE</option>
                    <option value="false">EXCLUDED</option>
                  </select>
                </div>
                <div>
                  {mappedRisks.length === 0 ? (
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>—</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {mappedRisks.map((rId, index) => (
                        <span key={rId} style={{ fontSize: '11px', fontFamily: 'Share Tech Mono' }}>
                          <a
                            href={`/risks#risk-${rId}`}
                            style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontWeight: 700 }}
                          >
                            {rId}
                          </a>
                          {index < mappedRisks.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
