'use client'

import { useRouter } from 'next/navigation'

interface StatCardProps {
  label: string
  value: number | string
  total?: number
  color?: string
  subText?: string
  route: string
}

function StatCard({ label, value, total, color, subText, route }: StatCardProps) {
  const router = useRouter()
  const percent = total ? Math.round((Number(value) / total) * 100) : 0
  return (
    <div className="stat-card" onClick={() => router.push(route)} style={{ cursor: 'pointer' }}>
      <div className="stat-header">
        <span className="stat-icon">{label}</span>
      </div>
      <div className="stat-value">
        {value} {total && <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {total}</span>}
      </div>
      {total ? (
        <div className="progress-bar-wrap" style={{ marginTop: '8px', height: '4px' }}>
          <div className="progress-bar-fill green" style={{ width: `${percent}%` }} />
        </div>
      ) : (
        subText && (
          <div style={{
            fontSize: '9px',
            fontFamily: 'Share Tech Mono',
            color: color === 'red' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginTop: '8px'
          }}>
            {color === 'red' ? '▲ ' : ''}{subText}
          </div>
        )
      )}
    </div>
  )
}

function GaugeDial({ pct }: { pct: number }) {
  return (
    <div className="progress-ring-container">
      <div style={{ position: 'relative', width: '160px', height: '90px', overflow: 'hidden' }}>
        <svg width="160" height="160" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="#f3f4f6" strokeWidth="8" strokeDasharray="220" strokeDashoffset="0" transform="rotate(-180 80 80)" />
          <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeDasharray="220" strokeDashoffset={220 - (pct / 100) * 220} transform="rotate(-180 80 80)" strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'Share Tech Mono, monospace',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{pct}%</div>
          <div style={{ fontSize: '8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certified Readiness</div>
        </div>
      </div>
    </div>
  )
}

interface DashboardClientProps {
  stats: {
    total_controls: number
    implemented: number
    in_progress: number
    not_started: number
    overall_completion: number
    total_clauses: number
    total_documents: number
    total_risks: number
    risk_high: number
    risk_medium: number
    risk_low: number
    evidence_mapped_pct: number
    trend: Array<{ month: string; value: number }>
  }
}

export default function DashboardClient({ stats: s }: DashboardClientProps) {
  const router = useRouter()

  // Exact mockup color grid for 5x5 Likelihood x Impact Risk Matrix
  const riskMatrix = [
    [ { val: '', color: '' }, { val: 'T-1', color: '' }, { val: 'T-2', color: '' }, { val: 'T-3', color: '' }, { val: 'T-4', color: '' }, { val: 'T-5', color: '' } ],
    [ { val: 'L-5', color: '' }, { val: '3', color: '#fff' }, { val: '10', color: '#fef3c7' }, { val: '15', color: '#fee2e2' }, { val: '20', color: '#fee2e2' }, { val: '25', color: '#fee2e2' } ],
    [ { val: 'L-4', color: '' }, { val: '4', color: '#fff' }, { val: '8', color: '#fef3c7' }, { val: '12', color: '#fef3c7' }, { val: '16', color: '#fee2e2' }, { val: '20', color: '#fee2e2' } ],
    [ { val: 'L-3', color: '' }, { val: '2', color: '#fff' }, { val: '6', color: '#fff' }, { val: '9', color: '#fef3c7' }, { val: '12', color: '#fef3c7' }, { val: '15', color: '#fee2e2' } ],
    [ { val: 'L-2', color: '' }, { val: '2', color: '#fff' }, { val: '4', color: '#fff' }, { val: '6', color: '#fff' }, { val: '8', color: '#fef3c7' }, { val: '10', color: '#fef3c7' } ],
    [ { val: 'L-1', color: '' }, { val: '1', color: '#fff' }, { val: '2', color: '#fff' }, { val: '3', color: '#eff6ff' }, { val: '4', color: '#fff' }, { val: '5', color: '#fff' } ]
  ]

  // Calculate dynamic coordinates for 6 points trend line
  const trendPoints = (s.trend || []).map((pt, i) => ({
    x: i * 100,
    y: 140 - (pt.value / 100) * 120
  }))

  const lineD = trendPoints.length > 0
    ? trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : 'M 0 140 L 500 140'

  const areaD = `${lineD} L 500 150 L 0 150 Z`

  return (
    <main className="page-body">
      {/* Top 4 Stats Row */}
      <div className="stats-grid">
        <StatCard label="Controls Implemented" value={s.implemented} total={s.total_controls} route="/controls" />
        <StatCard label="Active Risks Catalog" value={s.total_risks} color="red" subText="Mitigation Required" route="/risks" />
        <StatCard label="Evidence Mapped" value={`${s.evidence_mapped_pct}%`} total={100} route="/evidence" />
        <StatCard label="Core Policies Approved" value={s.total_documents} total={18} route="/documents" />
      </div>

      {/* Row 2: Dial + Trend */}
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Readiness Dial</div>
              <div className="card-subtitle">Stage 1 Audit</div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <GaugeDial pct={Math.round(s.overall_completion)} />
            <p style={{
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginTop: '12px',
              fontFamily: 'Share Tech Mono',
              lineHeight: 1.4
            }}>
              Perform a Management Review and run an Internal Audit checklist to unlock final Stage 1 checklist criteria.
            </p>
            <button className="road-milestone-btn" onClick={() => router.push('/journey')}>View Road Milestones</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Maturity Progress Trend</div>
              <div className="card-subtitle">Observed Metrics</div>
            </div>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', minHeight: '220px' }}>
            <div style={{ position: 'relative', width: '100%', height: '160px', marginTop: '10px' }}>
              <svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#curveGrad)" />
                <path d={lineD} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#d1d5db" strokeWidth="1" />
                <line x1="0" y1="20" x2="0" y2="150" stroke="#000" strokeWidth="1" />
              </svg>
              <div style={{ position: 'absolute', left: '-15px', top: '12px', fontSize: '9px', fontFamily: 'Share Tech Mono' }}>100%</div>
              <div style={{ position: 'absolute', left: '-15px', top: '42px', fontSize: '9px', fontFamily: 'Share Tech Mono' }}>75%</div>
              <div style={{ position: 'absolute', left: '-15px', top: '72px', fontSize: '9px', fontFamily: 'Share Tech Mono' }}>50%</div>
              <div style={{ position: 'absolute', left: '-15px', top: '102px', fontSize: '9px', fontFamily: 'Share Tech Mono' }}>25%</div>
              <div style={{ position: 'absolute', left: '-10px', top: '133px', fontSize: '9px', fontFamily: 'Share Tech Mono' }}>0%</div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              paddingLeft: '10px',
              fontFamily: 'Share Tech Mono',
              fontSize: '9px',
              color: 'var(--color-text-muted)'
            }}>
              {(s.trend || []).map(t => (
                <span key={t.month}>{t.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Matrix + Gaps */}
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" onClick={() => router.push('/risks')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Likelihood x Impact Risk Matrix</div>
              <div className="card-subtitle">Residual State</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', gap: '4px' }}>
              {riskMatrix.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: '50px repeat(5, 1fr)', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Share Tech Mono',
                        fontSize: cell.val.startsWith('L') || cell.val.startsWith('T') ? '10px' : '11px',
                        fontWeight: cell.val.startsWith('L') || cell.val.startsWith('T') ? 'bold' : 'normal',
                        border: cell.color ? '1px solid #000' : 'none',
                        background: cell.color || 'transparent',
                        color: cell.color ? '#000' : '#888'
                      }}
                    >
                      {cell.val}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Pending Internal Audit Gaps</div>
              <div className="card-subtitle">Audit Findings</div>
            </div>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '220px' }}>
            <div className="empty-state">
              <div className="empty-title" style={{ fontSize: '13px', color: '#9ca3af' }}>No Active Gaps Reported. Clear for Stage 1 Audit!</div>
            </div>
            <button className="road-milestone-btn" style={{ marginTop: 'auto' }} onClick={() => router.push('/audit')}>Explore Audit Assistant</button>
          </div>
        </div>
      </div>
    </main>
  )
}
