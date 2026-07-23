import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'


interface ClauseData {
  id: number
  clauseId: string
  title: string
  description: string
  objective: string | null
  mandatory: boolean
  responsibleRole: string | null
  reviewFrequency: string | null
  status: string
  completionPercentage: number
}

function ClauseCard({ clause }: { clause: ClauseData }) {
  const pct = clause.completionPercentage ?? 0
  const statusColor = pct === 100 ? '#000000' : pct > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)'

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{
        height: '3px',
        background: statusColor,
      }} />
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#000000',
            fontFamily: 'Share Tech Mono',
            flexShrink: 0,
          }}>
            {clause.clauseId}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
              {clause.title}
            </div>
            <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {clause.responsibleRole} · {clause.reviewFrequency}
            </div>
          </div>
          <div style={{
            fontSize: '16px', fontWeight: 700,
            fontFamily: 'Share Tech Mono',
            color: statusColor, minWidth: '40px', textAlign: 'right',
          }}>
            {pct}%
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
          {clause.description}
        </p>

        <div className="progress-bar-wrap" style={{ marginBottom: '12px', height: '6px' }}>
          <div className="progress-bar-fill indigo" style={{ width: `${pct}%`, background: statusColor }} />
        </div>

        {clause.objective && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px dashed var(--color-border)',
            padding: '8px 10px',
            fontSize: '11px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
          }}>
            <strong>Objective:</strong> {clause.objective}
          </div>
        )}

        <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
          <span style={{
            fontSize: '10px', fontFamily: 'Share Tech Mono', padding: '2px 8px',
            border: '1px solid #000', textTransform: 'uppercase',
            background: clause.status === 'implemented' ? '#000' : clause.status === 'in_progress' ? 'var(--color-accent-light)' : 'transparent',
            color: clause.status === 'implemented' ? '#fff' : clause.status === 'in_progress' ? 'var(--color-accent)' : '#9ca3af'
          }}>
            {clause.status === 'not_started' ? 'Not Started' : clause.status === 'in_progress' ? 'In Progress' : 'Implemented'}
          </span>
          {clause.mandatory && (
            <span style={{
              fontSize: '10px', fontFamily: 'Share Tech Mono', padding: '2px 8px',
              border: '1px solid #374151', textTransform: 'uppercase', color: '#374151'
            }}>
              Mandatory
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function ClausesPage() {
  let clauses: ClauseData[] = []
  try {
    const dbClauses = await prisma.clause.findMany()
    // Sort numerically in memory to prevent "10" from sorting before "4" (lexicographical sorting)
    clauses = dbClauses.sort((a, b) => {
      const numA = parseFloat(a.clauseId)
      const numB = parseFloat(b.clauseId)
      return numA - numB
    })
  } catch (e) {
    console.error('Failed to load clauses:', e)
  }

  const stats = {
    total: clauses.length,
    implemented: clauses.filter(c => c.status === 'implemented').length,
    in_progress: clauses.filter(c => c.status === 'in_progress').length,
    not_started: clauses.filter(c => c.status === 'not_started').length,
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Mandatory Clauses" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">Mandatory Clauses (4–10)</h2>
            <p className="page-desc">
              Seven mandatory clauses form the backbone of any ISO 27001 ISMS. All must be fully addressed for certification.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total Clauses', value: stats.total, color: '#1e40af', bg: '#dbeafe' },
              { label: 'Implemented', value: stats.implemented, color: '#166534', bg: '#dcfce7' },
              { label: 'In Progress', value: stats.in_progress, color: '#92400e', bg: '#fef3c7' },
              { label: 'Not Started', value: stats.not_started, color: '#374151', bg: '#f3f4f6' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {clauses.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '60px' }}>
              <div className="emoji">🔌</div>
              <div className="empty-title">No Clauses Found</div>
              <div className="empty-desc">
                The database may not be seeded yet. Run:{' '}
                <code style={{ background: '#f1f3f8', padding: '4px 8px', fontSize: '11px' }}>
                  npm run db:seed
                </code>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '18px' }}>
              {clauses.map((c) => <ClauseCard key={c.id} clause={c} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
