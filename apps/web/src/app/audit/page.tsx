'use client'

import { useState, useEffect, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useAuth } from '@/components/layout/AuthWrapper'

interface ChecklistItem {
  id: string
  clause: string
  requirement: string
  category: string
  status: 'pass' | 'fail' | 'partial' | 'na' | null
  notes: string
  // CAPA Specific fields
  rca?: string
  correctiveAction?: string
  owner?: string
  targetDate?: string
  capaStatus?: 'open' | 'in_progress' | 'closed'
}

const DEFAULT_AUDIT_CHECKLIST: ChecklistItem[] = [
  // Clause 4
  { id: '4.1', clause: '4.1', requirement: 'Has the organization determined its external and internal contexts relevant to its purpose?', category: 'Context', status: null, notes: '', capaStatus: 'open' },
  { id: '4.2', clause: '4.2', requirement: 'Have interested parties and their requirements relevant to information security been identified?', category: 'Context', status: null, notes: '', capaStatus: 'open' },
  { id: '4.3', clause: '4.3', requirement: 'Is the scope of the ISMS clearly documented, taking into account context and interested parties?', category: 'Context', status: null, notes: '', capaStatus: 'open' },
  // Clause 5
  { id: '5.1', clause: '5.1', requirement: 'Is leadership commitment demonstrated through policies, objectives, resources, and alignment?', category: 'Leadership', status: null, notes: '', capaStatus: 'open' },
  { id: '5.2', clause: '5.2', requirement: 'Is an approved Information Security Policy established and regularly reviewed?', category: 'Leadership', status: null, notes: '', capaStatus: 'open' },
  { id: '5.3', clause: '5.3', requirement: 'Are roles, responsibilities, and authorities for information security assigned and communicated?', category: 'Leadership', status: null, notes: '', capaStatus: 'open' },
  // Clause 6
  { id: '6.1.1', clause: '6.1.1', requirement: 'Have risks and opportunities been planned to ensure the ISMS achieves its outcomes?', category: 'Planning', status: null, notes: '', capaStatus: 'open' },
  { id: '6.1.2', clause: '6.1.2', requirement: 'Is a formal information security risk assessment process established and performed regularly?', category: 'Planning', status: null, notes: '', capaStatus: 'open' },
  { id: '6.1.3', clause: '6.1.3', requirement: 'Has a Statement of Applicability (SoA) been produced identifying applicable controls?', category: 'Planning', status: null, notes: '', capaStatus: 'open' },
  { id: '6.2', clause: '6.2', requirement: 'Are measurable information security objectives defined and updated as necessary?', category: 'Planning', status: null, notes: '', capaStatus: 'open' },
  // Clause 7
  { id: '7.2', clause: '7.2', requirement: 'Is employee competence determined and documented through credentials, training, or experience?', category: 'Support', status: null, notes: '', capaStatus: 'open' },
  { id: '7.3', clause: '7.3', requirement: 'Are employees and contractors aware of the security policy and their contributions?', category: 'Support', status: null, notes: '', capaStatus: 'open' },
  { id: '7.4', clause: '7.4', requirement: 'Has the organization planned the necessary internal and external security communications?', category: 'Support', status: null, notes: '', capaStatus: 'open' },
  { id: '7.5', clause: '7.5', requirement: 'Is documented information properly controlled, distributed, stored, and retained?', category: 'Support', status: null, notes: '', capaStatus: 'open' },
  // Clause 8
  { id: '8.1', clause: '8.1', requirement: 'Are operational processes planned, implemented, and controlled in accordance with clause 6?', category: 'Operation', status: null, notes: '', capaStatus: 'open' },
  { id: '8.2', clause: '8.2', requirement: 'Are information security risk assessments conducted at planned intervals?', category: 'Operation', status: null, notes: '', capaStatus: 'open' },
  { id: '8.3', clause: '8.3', requirement: 'Is the risk treatment plan implemented and verified?', category: 'Operation', status: null, notes: '', capaStatus: 'open' },
  // Clause 9
  { id: '9.1', clause: '9.1', requirement: 'Is performance monitored, measured, analyzed, and evaluated using defined metrics?', category: 'Evaluation', status: null, notes: '', capaStatus: 'open' },
  { id: '9.2', clause: '9.2', requirement: 'Are internal audits scheduled and conducted at planned intervals by independent auditors?', category: 'Evaluation', status: null, notes: '', capaStatus: 'open' },
  { id: '9.3', clause: '9.3', requirement: 'Does management review the ISMS at planned intervals to ensure effectiveness?', category: 'Evaluation', status: null, notes: '', capaStatus: 'open' },
  // Clause 10
  { id: '10.1', clause: '10.1', requirement: 'Are nonconformities logged and corrective actions taken to prevent recurrence?', category: 'Improvement', status: null, notes: '', capaStatus: 'open' },
  { id: '10.2', clause: '10.2', requirement: 'Is there active evidence of continual improvement of the ISMS?', category: 'Improvement', status: null, notes: '', capaStatus: 'open' },
]

const CATEGORIES = ['All', 'Context', 'Leadership', 'Planning', 'Support', 'Operation', 'Evaluation', 'Improvement']

const STATUS_OPTS: Array<{ val: ChecklistItem['status']; label: string; bg: string; color: string; border: string }> = [
  { val: 'pass', label: '✓ Pass', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  { val: 'partial', label: '⚡ Partial', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  { val: 'fail', label: '✕ Fail (CAPA)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  { val: 'na', label: '— N/A', bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
]

export default function AuditPage() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_AUDIT_CHECKLIST)
  const [activeTab, setActiveTab] = useState<'checklist' | 'capas' | 'report'>('checklist')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  // Audit Info state
  const [auditInfo, setAuditInfo] = useState({
    auditor: 'Lead Auditor',
    scope: 'All corporate IT infrastructures, software applications, and data systems.',
    date: new Date().toLocaleDateString(),
    status: 'In Progress'
  })

  // Load from localStorage
  useEffect(() => {
    try {
      const savedChecklist = localStorage.getItem('isms_audit_checklist')
      const savedInfo = localStorage.getItem('isms_audit_info')
      if (savedChecklist) {
        setItems(JSON.parse(savedChecklist))
      }
      if (savedInfo) {
        setAuditInfo(JSON.parse(savedInfo))
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoaded(true)
  }, [])

  // Save checklist and metadata to localStorage
  const saveToStorage = (updatedItems: ChecklistItem[]) => {
    setItems(updatedItems)
    localStorage.setItem('isms_audit_checklist', JSON.stringify(updatedItems))
  }

  const handleSetStatus = (id: string, status: ChecklistItem['status']) => {
    const next = items.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status,
          // Pre-populate CAPA status if fails
          ...(status === 'fail' && { capaStatus: i.capaStatus || 'open', rca: i.rca || '', correctiveAction: i.correctiveAction || '' })
        }
      }
      return i
    })
    saveToStorage(next)
  }

  const handleUpdateNotes = (id: string, notes: string) => {
    const next = items.map(i => i.id === id ? { ...i, notes } : i)
    saveToStorage(next)
  }

  const handleUpdateCapa = (id: string, fields: Partial<ChecklistItem>) => {
    const next = items.map(i => i.id === id ? { ...i, ...fields } : i)
    saveToStorage(next)
  }

  const handleUpdateAuditInfo = (fields: Partial<typeof auditInfo>) => {
    const next = { ...auditInfo, ...fields }
    setAuditInfo(next)
    localStorage.setItem('isms_audit_info', JSON.stringify(next))
  }

  const filtered = items.filter(i => {
    if (filterCat !== 'All' && i.category !== filterCat) return false
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    return true
  })

  const stats = useMemo(() => {
    const total = items.length
    const pass = items.filter(i => i.status === 'pass').length
    const partial = items.filter(i => i.status === 'partial').length
    const fail = items.filter(i => i.status === 'fail').length
    const na = items.filter(i => i.status === 'na').length
    const pending = items.filter(i => i.status === null).length
    const reviewed = total - pending
    const score = total - na > 0 ? Math.round((pass / (total - na)) * 100) : 0
    return { total, pass, partial, fail, na, pending, reviewed, score }
  }, [items])

  const capaItems = useMemo(() => {
    return items.filter(i => i.status === 'fail')
  }, [items])

  // Count invalid CAPA items (missing RCA or action plan)
  const invalidCapaCount = useMemo(() => {
    return capaItems.filter(i => !i.rca?.trim() || !i.correctiveAction?.trim()).length
  }, [capaItems])

  if (!isLoaded) return null

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Internal Audit & CAPA Hub" />
        <main className="page-body">
          <div className="page-header">
            <h2 className="page-title">Internal Audit & Corrective Actions (CAPA)</h2>
            <p className="page-desc">
              Prepare, validate, and track compliance against ISO 27001:2022 clauses. Manage CAPA findings for nonconformities.
            </p>
          </div>

          {/* Stats Summary Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Audit Score', value: `${stats.score}%`, color: '#1e40af', bg: '#dbeafe' },
              { label: 'Pass Items', value: stats.pass, color: '#166534', bg: '#dcfce7' },
              { label: 'Partial Conformity', value: stats.partial, color: '#92400e', bg: '#fef3c7' },
              { label: 'Failures (CAPA)', value: stats.fail, color: '#b91c1c', bg: '#fee2e2' },
              { label: 'Not Reviewed', value: stats.pending, color: '#374151', bg: '#f3f4f6' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}`, padding: '14px 16px' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Share Tech Mono', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', color: s.color, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '2.5px solid #000', marginBottom: '20px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('checklist')}
              style={{
                padding: '10px 16px', fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                background: activeTab === 'checklist' ? '#000' : 'transparent',
                color: activeTab === 'checklist' ? '#fff' : '#000',
                border: '1.5px solid #000', borderBottom: 'none', cursor: 'pointer', transition: '0.1s'
              }}
            >
              📋 01. Audit Checklist ({stats.reviewed}/{stats.total})
            </button>
            <button 
              onClick={() => setActiveTab('capas')}
              style={{
                padding: '10px 16px', fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                background: activeTab === 'capas' ? '#000' : 'transparent',
                color: activeTab === 'capas' ? '#fff' : '#000',
                border: '1.5px solid #000', borderBottom: 'none', cursor: 'pointer', position: 'relative', transition: '0.1s'
              }}
            >
              ⚠️ 02. CAPA Register ({capaItems.length})
              {invalidCapaCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px', background: '#b91c1c', color: '#fff',
                  fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '50%'
                }} title={`${invalidCapaCount} CAPAs require validation`}>
                  {invalidCapaCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              style={{
                padding: '10px 16px', fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                background: activeTab === 'report' ? '#000' : 'transparent',
                color: activeTab === 'report' ? '#fff' : '#000',
                border: '1.5px solid #000', borderBottom: 'none', cursor: 'pointer', transition: '0.1s'
              }}
            >
              📄 03. Internal Audit Report
            </button>
          </div>

          {/* TAB 1: AUDIT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCat(c)} style={{
                    padding: '6px 12px', fontSize: '10px', fontFamily: 'Share Tech Mono', border: '1.5px solid #000',
                    background: filterCat === c ? '#000' : '#fff', color: filterCat === c ? '#fff' : '#000', cursor: 'pointer'
                  }}>
                    {c}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ border: '1.5px solid #000', padding: '6px 12px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: '#fff' }}>
                    <option value="all">All Status</option>
                    <option value="pass">Pass Only</option>
                    <option value="partial">Partial Only</option>
                    <option value="fail">Fail Only</option>
                    <option value="na">N/A Only</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              {/* Checklist Items list */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 100px 240px',
                  gap: '8px', padding: '12px 16px', borderBottom: '2.5px solid #000',
                  background: '#f9fafb', fontSize: '10px', fontFamily: 'Share Tech Mono',
                  fontWeight: 700, textTransform: 'uppercase', color: '#374151'
                }}>
                  <span>Clause</span>
                  <span>Audit Requirement</span>
                  <span>Category</span>
                  <span>Result Evaluation</span>
                </div>
                {filtered.map(item => {
                  const isNotesMissing = item.status === 'pass' && !item.notes.trim()
                  return (
                    <div key={item.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      background: item.status === 'fail' ? '#fff5f5' : item.status === 'pass' ? '#f0fdf4' : 'transparent',
                      transition: 'background 0.15s'
                    }}>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '80px 1fr 100px 240px',
                        gap: '8px', padding: '14px 16px', alignItems: 'center'
                      }}>
                        <span style={{ fontFamily: 'Share Tech Mono', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                          Clause {item.clause}
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#111827', lineHeight: 1.4, fontWeight: 500 }}>
                            {item.requirement}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>
                              <strong>Evidence Ref:</strong> {item.notes}
                            </div>
                          )}
                          {isNotesMissing && (
                            <div style={{ fontSize: '9px', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
                              ⚠ Validation Notice: Documented evidence reference is highly recommended for Pass status.
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#6b7280', textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        
                        {/* Selector Buttons */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {STATUS_OPTS.map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => isAdmin && handleSetStatus(item.id, item.status === opt.val ? null : opt.val)}
                              style={{
                                padding: '4px 8px', fontSize: '10px', fontFamily: 'Share Tech Mono',
                                cursor: !isAdmin ? 'not-allowed' : 'pointer',
                                border: `1.5px solid ${item.status === opt.val ? opt.border : '#d1d5db'}`,
                                background: item.status === opt.val ? opt.bg : '#fff',
                                color: item.status === opt.val ? opt.color : '#9ca3af',
                                fontWeight: item.status === opt.val ? 700 : 400,
                                transition: 'all 0.1s'
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes / Evidence reference input */}
                      {item.status && (
                        <div style={{ padding: '0 16px 12px 104px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={e => handleUpdateNotes(item.id, e.target.value)}
                            disabled={!isAdmin}
                            placeholder={isAdmin ? "Add notes / reference (e.g. SharePoint link, policy section)..." : "Read-only mode."}
                            style={{
                              width: '100%', maxWidth: '650px', padding: '6px 10px',
                              border: '1.5px solid #000', fontSize: '11px', fontFamily: 'Inter',
                              background: !isAdmin ? '#f3f4f6' : '#fafafa',
                              cursor: !isAdmin ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CAPA REGISTER */}
          {activeTab === 'capas' && (
            <div>
              {capaItems.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>No Nonconformities Logged</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                    All reviewed requirements are compliant. If you identify any security gaps, mark checklist items as &quot;Fail (CAPA)&quot;.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {capaItems.map(capa => {
                    const isValidationFailed = !capa.rca?.trim() || !capa.correctiveAction?.trim()
                    return (
                      <div key={capa.id} className="card" style={{
                        padding: '20px',
                        border: '2.5px solid #000',
                        borderLeft: '5px solid #b91c1c',
                        background: isValidationFailed ? '#fff5f5' : '#fff'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1.5px solid #000', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontFamily: 'Share Tech Mono', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
                              Nonconformity finding — Clause {capa.clause}
                            </span>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                              {capa.requirement}
                            </div>
                          </div>
                          <select 
                            value={capa.capaStatus || 'open'} 
                            onChange={e => handleUpdateCapa(capa.id, { capaStatus: e.target.value as any })}
                            disabled={!isAdmin}
                            style={{
                              border: '1.5px solid #000', padding: '4px 8px', fontSize: '11px', fontWeight: 700,
                              fontFamily: 'Share Tech Mono', background: capa.capaStatus === 'closed' ? '#dcfce7' : '#fee2e2',
                              cursor: !isAdmin ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <option value="open">🔴 Open CAPA</option>
                            <option value="in_progress">🟡 In Progress</option>
                            <option value="closed">🟢 Closed / Resolved</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
                          {/* Left Column: RCA & Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Root Cause Analysis (RCA) *
                              </label>
                              <textarea
                                value={capa.rca || ''}
                                onChange={e => handleUpdateCapa(capa.id, { rca: e.target.value })}
                                disabled={!isAdmin}
                                placeholder={isAdmin ? "Explain why this nonconformity occurred..." : "Read-only mode."}
                                rows={3}
                                style={{
                                  width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Inter',
                                  background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Corrective Action Plan *
                              </label>
                              <textarea
                                value={capa.correctiveAction || ''}
                                onChange={e => handleUpdateCapa(capa.id, { correctiveAction: e.target.value })}
                                disabled={!isAdmin}
                                placeholder={isAdmin ? "Define exact steps to prevent recurrence..." : "Read-only mode."}
                                rows={3}
                                style={{
                                  width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Inter',
                                  background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                                }}
                              />
                            </div>
                          </div>

                          {/* Right Column: Execution */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Action Owner / Responsibility
                              </label>
                              <input
                                value={capa.owner || ''}
                                onChange={e => handleUpdateCapa(capa.id, { owner: e.target.value })}
                                disabled={!isAdmin}
                                placeholder={isAdmin ? "e.g. IT Security Lead" : "Read-only mode."}
                                style={{
                                  width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter',
                                  background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Target Mitigation Date
                              </label>
                              <input
                                type="date"
                                value={capa.targetDate || ''}
                                onChange={e => handleUpdateCapa(capa.id, { targetDate: e.target.value })}
                                disabled={!isAdmin}
                                style={{
                                  width: '100%', border: '1.5px solid #000', padding: '5px 10px', fontSize: '12px', fontFamily: 'Inter',
                                  background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'pointer'
                                }}
                              />
                            </div>
                            
                            {/* Validation warning */}
                            {isValidationFailed && (
                              <div style={{
                                marginTop: 'auto', background: '#fee2e2', border: '1px solid #fca5a5',
                                padding: '10px', fontSize: '10px', color: '#b91c1c', fontWeight: 600
                              }}>
                                ⚠ CAPA VALIDATION WARNING: Root Cause Analysis (RCA) and Corrective Action Plan are mandatory.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERNAL AUDIT REPORT */}
          {activeTab === 'report' && (
            <div className="card" style={{ padding: '24px', border: '2.5px solid #000' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2.5px solid #000', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>ISO 27001:2022 INTERNAL AUDIT REPORT</h3>
                <div style={{ fontSize: '11px', fontFamily: 'Share Tech Mono', color: '#4b5563', marginTop: '4px' }}>
                  Clause 9.2 Audit Summary & Sign-off Details
                </div>
              </div>

              {/* Audit Metadata Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Lead Auditor Name
                  </label>
                  <input
                    value={auditInfo.auditor}
                    onChange={e => handleUpdateAuditInfo({ auditor: e.target.value })}
                    disabled={!isAdmin}
                    style={{
                      width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter',
                      background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Audit Date
                  </label>
                  <input
                    value={auditInfo.date}
                    onChange={e => handleUpdateAuditInfo({ date: e.target.value })}
                    disabled={!isAdmin}
                    style={{
                      width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter',
                      background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Audit Scope Definition
                  </label>
                  <textarea
                    value={auditInfo.scope}
                    onChange={e => handleUpdateAuditInfo({ scope: e.target.value })}
                    disabled={!isAdmin}
                    rows={2}
                    style={{
                      width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '11px', fontFamily: 'Inter',
                      background: !isAdmin ? '#f3f4f6' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
              </div>

              {/* Summary Stats Table */}
              <h4 style={{ fontSize: '11px', fontFamily: 'Share Tech Mono', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '10px', fontWeight: 700 }}>
                Audit Results Executive Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12px', marginBottom: '24px' }}>
                <div style={{ border: '1.5px solid #e5e7eb', padding: '10px', background: '#fafafa' }}>
                  <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Conformity Rate</strong>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>{stats.score}%</span>
                </div>
                <div style={{ border: '1.5px solid #e5e7eb', padding: '10px', background: '#fafafa' }}>
                  <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Total Requirements</strong>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>{stats.total}</span>
                </div>
                <div style={{ border: '1.5px solid #e5e7eb', padding: '10px', background: '#fafafa' }}>
                  <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Nonconformities (CAPAs)</strong>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#b91c1c' }}>{stats.fail}</span>
                </div>
                <div style={{ border: '1.5px solid #e5e7eb', padding: '10px', background: '#fafafa' }}>
                  <strong style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Pending Review</strong>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#6b7280' }}>{stats.pending}</span>
                </div>
              </div>

              {/* Status Alert Banner */}
              {stats.pending > 0 ? (
                <div style={{ background: '#fef3c7', border: '1.5px solid #fcd34d', padding: '12px', fontSize: '11px', color: '#92400e', marginBottom: '20px', fontWeight: 600 }}>
                  ⚠️ AUDIT STATUS: INCOMPLETE. There are still {stats.pending} mandatory requirements left to evaluate.
                </div>
              ) : invalidCapaCount > 0 ? (
                <div style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', padding: '12px', fontSize: '11px', color: '#b91c1c', marginBottom: '20px', fontWeight: 600 }}>
                  ❌ AUDIT STATUS: NON-COMPLIANT. {invalidCapaCount} active nonconformities require RCA and corrective plans defined.
                </div>
              ) : (
                <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', padding: '12px', fontSize: '11px', color: '#166534', marginBottom: '20px', fontWeight: 600 }}>
                  ✅ AUDIT STATUS: COMPLETED. All clauses reviewed. {stats.fail} CAPA findings are successfully mapped and validated.
                </div>
              )}

              {/* Printable PDF button */}
              <button 
                onClick={() => window.print()}
                style={{
                  background: '#000', color: '#fff', border: 'none', padding: '10px 20px',
                  fontFamily: 'Share Tech Mono', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'block', margin: '0 auto'
                }}
              >
                🖨 Print / Save PDF Report
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
